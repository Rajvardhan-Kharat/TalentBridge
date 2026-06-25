const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes We Work Remotely (Programming Jobs)
 * Uses their public RSS feed which is bot-friendly, preventing 429 errors.
 */
const scrapeHackerNewsJobs = async () => {
  try {
    const { data } = await axios.get('https://weworkremotely.com/categories/remote-programming-jobs.rss', {
      timeout: 10000,
    });

    const $ = cheerio.load(data, { xmlMode: true });
    const jobs = [];

    $('item').each((i, el) => {
      const titleElement = $(el).find('title').text();
      const applyUrl = $(el).find('link').text();
      const description = $(el).find('description').text().replace(/<[^>]*>/g, '').slice(0, 2000);
      const pubDate = $(el).find('pubDate').text();
      const category = $(el).find('category').text();

      if (!titleElement) return;

      // WWR format: "Company Name: Job Title"
      let company = 'Unknown Company';
      let title = titleElement;

      if (titleElement.includes(':')) {
        const parts = titleElement.split(':');
        company = parts[0].trim();
        title = parts.slice(1).join(':').trim();
      }

      jobs.push({
        title: title || 'Software Engineer',
        company: company || 'Startup',
        location: 'Remote',
        locationType: 'remote',
        description: description,
        requirements: [],
        skills: ['Software', category].filter(Boolean),
        experience: '1-3 years',
        jobType: 'full-time',
        industry: 'Technology',
        applyUrl: applyUrl,
        sourcePortal: 'We Work Remotely',
        isActive: true,
        postedAt: pubDate ? new Date(pubDate) : new Date(),
        currency: 'USD'
      });
    });

    console.log(`  ✅ Custom Scraper (WWR): ${jobs.length} jobs fetched`);
    return jobs;
  } catch (error) {
    console.error(`⚠️ Custom Scraper (WWR) failed: ${error.message}`);
    return [];
  }
};

module.exports = {
  scrapeHackerNewsJobs
};
