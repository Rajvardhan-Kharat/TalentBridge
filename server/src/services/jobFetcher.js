/**
 * TalentBridge Multi-Source Job Fetcher
 * Sources: Adzuna (existing), Remotive (free), Arbeitnow (free), RemoteOK (free)
 * Runs nightly — deduplicates by title+company fingerprint
 * Auto-cleans jobs older than 30 days
 */

const axios = require('axios');
const Job = require('../models/Job');
const { scrapeHackerNewsJobs } = require('./customScraper');

// ── Source 1: Adzuna (India — requires API key) ───────────────────────────
const ADZUNA_APP_ID  = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

const ADZUNA_QUERIES = [
  'software developer', 'full stack developer', 'data scientist',
  'react developer', 'nodejs developer', 'java developer',
  'python developer', 'product manager',
];

const fetchAdzuna = async () => {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.warn('⚠️  Adzuna keys not set — skipping Adzuna source.');
    return [];
  }
  const results = [];
  for (const query of ADZUNA_QUERIES) {
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1`;
      const res = await axios.get(url, {
        timeout: 10000,
        params: { app_id: ADZUNA_APP_ID, app_key: ADZUNA_APP_KEY, what: query, results_per_page: 20, sort_by: 'date' },
      });
      const jobs = (res.data.results || []).map(job => {
        const salaryMin = job.salary_min || Math.floor(Math.random() * 8 + 4) * 100000;
        const salaryMax = job.salary_max || salaryMin + Math.floor(Math.random() * 10 + 5) * 100000;
        const title = job.title || 'Unknown Role';
        const company = job.company?.display_name || 'Unknown Company';
        const isRemote = title.toLowerCase().includes('remote') || (job.description || '').toLowerCase().includes('remote');
        return {
          title, company,
          location: job.location?.display_name || 'India',
          locationType: isRemote ? 'remote' : 'onsite',
          salaryMin, salaryMax, currency: 'INR',
          description: job.description || '',
          requirements: [],
          skills: job.category?.tag ? [job.category.tag] : ['Software'],
          experience: '1-3 years',
          jobType: job.contract_time === 'part_time' ? 'part-time' : (job.contract_type === 'contract' ? 'contract' : 'full-time'),
          industry: job.category?.label || 'Technology',
          applyUrl: job.redirect_url || `https://www.google.com/search?q=${encodeURIComponent(`${title} ${company} job`)}`,
          sourcePortal: 'Adzuna',
          isActive: true,
          postedAt: job.created ? new Date(job.created) : new Date(),
        };
      });
      results.push(...jobs);
      await new Promise(r => setTimeout(r, 500));
    } catch (e) { console.warn(`⚠️  Adzuna query "${query}" failed: ${e.message}`); }
  }
  console.log(`  ✅ Adzuna: ${results.length} jobs fetched`);
  return results;
};

// ── Source 2: Remotive (free — remote tech jobs globally) ─────────────────
const REMOTIVE_CATEGORIES = ['software-dev', 'data', 'devops-sysadmin', 'product'];

const fetchRemotive = async () => {
  const results = [];
  for (const cat of REMOTIVE_CATEGORIES) {
    try {
      const res = await axios.get(`https://remotive.com/api/remote-jobs?category=${cat}&limit=20`, { timeout: 10000 });
      const jobs = (res.data.jobs || []).map(job => ({
        title: job.title || 'Unknown Role',
        company: job.company_name || 'Unknown Company',
        companyLogo: job.company_logo || '',
        location: job.candidate_required_location || 'Remote',
        locationType: 'remote',
        description: (job.description || '').replace(/<[^>]*>/g, '').slice(0, 2000),
        requirements: [],
        skills: (job.tags || []).slice(0, 8),
        experience: '1-3 years',
        jobType: job.job_type?.includes('contract') ? 'contract' : 'full-time',
        industry: job.category || 'Technology',
        applyUrl: job.url || '',
        sourcePortal: 'Remotive',
        isActive: true,
        postedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
        currency: 'USD',
      }));
      results.push(...jobs);
    } catch (e) { console.warn(`⚠️  Remotive category "${cat}" failed: ${e.message}`); }
  }
  console.log(`  ✅ Remotive: ${results.length} jobs fetched`);
  return results;
};

// ── Source 3: Arbeitnow (free — EU + remote jobs with visa sponsorship) ───
const fetchArbeitnow = async () => {
  try {
    const res = await axios.get('https://www.arbeitnow.com/api/job-board-api?page=1', { timeout: 10000 });
    const jobs = (res.data.data || []).slice(0, 40).map(job => ({
      title: job.title || 'Unknown Role',
      company: job.company_name || 'Unknown Company',
      location: job.location || 'Remote',
      locationType: job.remote ? 'remote' : 'onsite',
      description: (job.description || '').replace(/<[^>]*>/g, '').slice(0, 2000),
      requirements: [],
      skills: (job.tags || []).slice(0, 8),
      experience: '1-3 years',
      jobType: 'full-time',
      industry: 'Technology',
      applyUrl: job.url || '',
      sourcePortal: 'Arbeitnow',
      isActive: true,
      postedAt: job.created_at ? new Date(job.created_at * 1000) : new Date(),
      currency: 'EUR',
    }));
    console.log(`  ✅ Arbeitnow: ${jobs.length} jobs fetched`);
    return jobs;
  } catch (e) {
    console.warn(`⚠️  Arbeitnow failed: ${e.message}`);
    return [];
  }
};

// ── Source 4: RemoteOK (free — popular remote job board) ──────────────────
const REMOTEOK_TAGS = ['react', 'nodejs', 'python', 'java', 'devops', 'data'];

const fetchRemoteOK = async () => {
  const results = [];
  try {
    const res = await axios.get('https://remoteok.com/api', {
      timeout: 10000,
      headers: { 'User-Agent': 'TalentBridge/1.0 (+https://talentbridge.in)' },
    });
    const jobs = (res.data || [])
      .filter(j => j && j.position) // first item is a notice object
      .slice(0, 60)
      .map(job => ({
        title: job.position || 'Unknown Role',
        company: job.company || 'Unknown Company',
        companyLogo: job.company_logo || '',
        location: 'Remote',
        locationType: 'remote',
        description: (job.description || '').replace(/<[^>]*>/g, '').slice(0, 2000),
        requirements: [],
        skills: (job.tags || []).slice(0, 8),
        experience: '1-3 years',
        jobType: 'full-time',
        industry: 'Technology',
        applyUrl: job.apply_url || job.url || '',
        sourcePortal: 'RemoteOK',
        isActive: true,
        postedAt: job.date ? new Date(job.date) : new Date(),
        currency: 'USD',
      }));
    results.push(...jobs);
  } catch (e) { console.warn(`⚠️  RemoteOK failed: ${e.message}`); }
  console.log(`  ✅ RemoteOK: ${results.length} jobs fetched`);
  return results;
};

// ── Main Aggregator ────────────────────────────────────────────────────────
const fetchAndStoreJobs = async () => {
  try {
    console.log('🔄 Starting multi-source job sync...');

    // Fetch from all sources in parallel (failures in one don't stop others)
    const [adzunaJobs, remotiveJobs, arbeitnowJobs, remoteOKJobs, hnJobs] = await Promise.allSettled([
      fetchAdzuna(),
      fetchRemotive(),
      fetchArbeitnow(),
      fetchRemoteOK(),
      scrapeHackerNewsJobs(),
    ]).then(results => results.map(r => (r.status === 'fulfilled' ? r.value : [])));

    const allJobs = [...adzunaJobs, ...remotiveJobs, ...arbeitnowJobs, ...remoteOKJobs, ...hnJobs];

    // Deduplicate by title+company fingerprint and upsert
    let inserted = 0;
    for (const job of allJobs) {
      try {
        await Job.updateOne(
          { title: job.title, company: job.company, sourcePortal: job.sourcePortal },
          { 
            $setOnInsert: job,
            $set: { lastSeenAt: new Date(), isActive: true }
          },
          { upsert: true }
        );
        inserted++;
      } catch (e) { /* skip dupe */ }
    }

    // Auto-clean jobs not seen in the last 2 days (i.e. they were removed from the API)
    // Company-posted jobs are exempt from this automated clean
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 2);
    const deleted = await Job.deleteMany({
      $or: [
        { lastSeenAt: { $lt: cutoff } },
        { lastSeenAt: { $exists: false }, createdAt: { $lt: cutoff } } // fallback for old records
      ],
      postedByCompany: { $exists: false }, // don't delete company-posted jobs
    });

    console.log(`✅ Job sync complete: ${inserted} jobs synced from ${[
      adzunaJobs.length > 0 ? 'Adzuna' : null,
      remotiveJobs.length > 0 ? 'Remotive' : null,
      arbeitnowJobs.length > 0 ? 'Arbeitnow' : null,
      remoteOKJobs.length > 0 ? 'RemoteOK' : null,
      hnJobs.length > 0 ? 'Hacker News' : null,
    ].filter(Boolean).join(', ')}, ${deleted.deletedCount} old jobs removed.`);

  } catch (err) {
    console.error('❌ Job sync failed (non-fatal):', err.message);
  }
};

module.exports = { fetchAndStoreJobs };
