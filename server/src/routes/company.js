const express = require('express');
const router = express.Router();
const { getMyJobs, postJob, updateJob, deleteJob } = require('../controllers/companyController');
const { protect } = require('../middleware/auth');

// All company routes require authentication
router.use(protect);

router.get('/jobs', getMyJobs);
router.post('/jobs', postJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

module.exports = router;
