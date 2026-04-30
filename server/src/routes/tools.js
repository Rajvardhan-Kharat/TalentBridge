const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { runTool, getHistory, getStories, createStory, deleteStory } = require('../controllers/toolsController');

router.post('/run', protect, runTool);
router.get('/history', protect, getHistory);
router.get('/stories', protect, getStories);
router.post('/stories', protect, createStory);
router.delete('/stories/:id', protect, deleteStory);

module.exports = router;
