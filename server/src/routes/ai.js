const express = require('express');
const router = express.Router();
const { evaluateJobPost } = require('../controllers/aiController');
const { analyzeSkillsGap } = require('../services/aiService');
const { protect } = require('../middleware/auth');

router.post('/evaluate-job', protect, evaluateJobPost);

router.post('/skills-gap', protect, async (req, res, next) => {
  try {
    const user = req.user;
    const skills = user.profile?.skills || [];
    const targetRole = req.body.targetRole || user.profile?.targetRoles?.[0] || 'Software Engineer';
    const industry = req.body.industry || user.profile?.industry || 'Technology';
    const result = await analyzeSkillsGap(skills, targetRole, industry);
    res.json({ success: true, analysis: result });
  } catch (err) { next(err); }
});

module.exports = router;
