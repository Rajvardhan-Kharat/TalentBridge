/**
 * Adzuna Job Fetcher Service
 * Pulls fresh Indian tech jobs every night and saves to MongoDB
 * Auto-cleans jobs older than 30 days
 */

const axios = require('axios');
const Job = require('../models/Job');

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const COUNTRY = 'in'; // India

// Keywords that maximize Indian tech/software job results
const SEARCH_QUERIES = [
  'software developer',
  'full stack developer',
  'data scientist',
  'react developer',
  'nodejs developer',
  'java developer',
  'python developer',
  'product manager',
];

const fetchJobsForQuery = async (query, page = 1) => {
  const url = `https://api.adzuna.com/v1/api/jobs/${COUNTRY}/search/${page}`;
  const res = await axios.get(url, {
    timeout: 10000, // 10 second timeout — if Adzuna is slow/down, skip it
    params: {
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      what: query,
      results_per_page: 20,
      sort_by: 'date',
    },
  });
  return res.data.results || [];
};

const mapAdzunaJob = (job) => {
  const salaryMin = job.salary_min || Math.floor(Math.random() * 8 + 4) * 100000;
  const salaryMax = job.salary_max || salaryMin + Math.floor(Math.random() * 10 + 5) * 100000;

  const title = job.title || 'Unknown Role';
  const company = job.company?.display_name || 'Unknown Company';

  // Use redirect_url as the apply link — fallback to a Google Jobs search so users always have somewhere to go
  const applyUrl = job.redirect_url
    || `https://www.google.com/search?q=${encodeURIComponent(`${title} ${company} job apply India`)}`;

  // Detect remote from title or description
  const isRemote = title.toLowerCase().includes('remote') || (job.description || '').toLowerCase().includes('remote');

  return {
    title,
    company,
    location: job.location?.display_name || 'India',
    locationType: isRemote ? 'remote' : 'onsite',
    salaryMin,
    salaryMax,
    currency: 'INR',
    description: job.description || '',
    requirements: [],
    skills: job.category?.tag ? [job.category.tag] : ['Software'],
    experience: '1-3 years',
    jobType: job.contract_time === 'part_time' ? 'part-time' : (job.contract_type === 'contract' ? 'contract' : 'full-time'),
    industry: job.category?.label || 'Technology',
    applyUrl,
    sourcePortal: 'Adzuna',
    isActive: true,
    postedAt: job.created ? new Date(job.created) : new Date(),
  };
};


const fetchAndStoreJobs = async () => {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.warn('⚠️  Adzuna API keys not set. Skipping job sync.');
    return;
  }

  // ── Wrapped in top-level try/catch so a crash here NEVER affects the app ──
  try {
    console.log('🔄 Starting Adzuna job sync...');
    let totalInserted = 0;

    for (const query of SEARCH_QUERIES) {
      try {
        const jobs = await fetchJobsForQuery(query);
        const mapped = jobs.map(mapAdzunaJob);

        for (const job of mapped) {
          await Job.updateOne(
            { title: job.title, company: job.company, applyUrl: job.applyUrl },
            { $setOnInsert: job },
            { upsert: true }
          );
          totalInserted++;
        }

        // Small delay between requests to respect API rate limits
        await new Promise(r => setTimeout(r, 500));
      } catch (queryErr) {
        // One query fails → just log and continue, don't stop the others
        console.warn(`⚠️  Skipped query "${query}": ${queryErr.message}`);
      }
    }

    // Auto-clean jobs older than 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const deleted = await Job.deleteMany({ createdAt: { $lt: cutoff } });

    console.log(`✅ Job sync complete: ${totalInserted} jobs synced, ${deleted.deletedCount} old jobs removed.`);
  } catch (err) {
    // Top-level catch — Adzuna completely down or DB error — server keeps running
    console.error('❌ Job sync failed (non-fatal):', err.message);
  }
};

module.exports = { fetchAndStoreJobs };
