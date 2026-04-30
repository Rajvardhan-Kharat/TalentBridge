const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getApplications, createApplication, updateApplication,
  deleteApplication, getAnalytics
} = require('../controllers/applicationController');

router.get('/analytics', protect, getAnalytics);
router.get('/', protect, getApplications);
router.post('/', protect, createApplication);
router.put('/:id', protect, updateApplication);
router.delete('/:id', protect, deleteApplication);

module.exports = router;
