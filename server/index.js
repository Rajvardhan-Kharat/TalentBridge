require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('express-async-errors');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error');

const app = express();

// ── Security & Middleware ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// ── Health ─────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', platform: 'HireIndia', time: new Date() }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./src/routes/auth'));
app.use('/api/jobs',         require('./src/routes/jobs'));
app.use('/api/ai',           require('./src/routes/ai'));
app.use('/api/cv',           require('./src/routes/cv'));
app.use('/api/applications', require('./src/routes/applications'));
app.use('/api/tools',        require('./src/routes/tools'));
app.use('/api/subscription', require('./src/routes/subscription'));

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// ── Error Handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const cron = require('node-cron');
const { fetchAndStoreJobs } = require('./src/services/jobFetcher');

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 HireIndia API running on http://localhost:${PORT}`));

  // Run job sync immediately on first start
  fetchAndStoreJobs();

  // Schedule daily sync at 2:00 AM
  cron.schedule('0 2 * * *', () => {
    console.log('⏰ Running scheduled Adzuna job sync...');
    fetchAndStoreJobs();
  });
});
