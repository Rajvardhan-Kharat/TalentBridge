const express = require('express');
const router = express.Router();
const { getJobs, getJob, getCompanyJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

// protect is optional for jobs (match scoring uses profile if available)
const optionalAuth = (req, res, next) => {
  const auth = require('../middleware/auth');
  auth.protect(req, res, () => next()).catch ? auth.protect(req, res, next) : next();
};

router.get('/', protect, getJobs);
router.get('/company/:company', protect, getCompanyJobs);
router.get('/:id', protect, getJob);

module.exports = router;
