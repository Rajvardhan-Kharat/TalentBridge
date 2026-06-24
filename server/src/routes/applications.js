const express = require('express');
const router = express.Router();
const { protect, jobseekerOnly } = require('../middleware/auth');
const {
  getApplications, createApplication, updateApplication,
  deleteApplication, getAnalytics
} = require('../controllers/applicationController');

router.use(protect);
router.use(jobseekerOnly);

router.get('/analytics', getAnalytics);
router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

module.exports = router;
