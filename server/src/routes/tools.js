const express = require('express');
const router = express.Router();
const { protect, jobseekerOnly } = require('../middleware/auth');
const { runTool, getHistory, getStories, createStory, deleteStory } = require('../controllers/toolsController');

router.use(protect);
router.use(jobseekerOnly);

router.post('/run', runTool);
router.get('/history', getHistory);
router.get('/stories', getStories);
router.post('/stories', createStory);
router.delete('/stories/:id', deleteStory);

module.exports = router;
