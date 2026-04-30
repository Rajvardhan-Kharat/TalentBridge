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

router.post('/enhance-profile', protect, async (req, res, next) => {
  try {
    const User = require('../models/User');
    const { enhanceProfile } = require('../services/aiService');
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const enhanced = await enhanceProfile(user.profile);
    
    if (enhanced.workExperience) {
      user.profile.workExperience.forEach((exp, i) => {
        if (enhanced.workExperience[i]) {
          exp.description = enhanced.workExperience[i].description || exp.description;
        }
      });
    }
    if (enhanced.projects) {
      user.profile.projects.forEach((proj, i) => {
        if (enhanced.projects[i]) {
          proj.description = enhanced.projects[i].description || proj.description;
          if (enhanced.projects[i].highlights) proj.highlights = enhanced.projects[i].highlights;
        }
      });
    }
    
    await user.save();
    res.json({ success: true, profile: user.profile });
  } catch (err) { next(err); }
});

// @POST /api/ai/ready-check — "Am I Ready?" checker
router.post('/ready-check', protect, async (req, res, next) => {
  try {
    const { readyCheck } = require('../services/aiService');
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ success: false, message: 'jobDescription required' });
    const result = await readyCheck(jobDescription, req.user.profile || {});
    res.json({ success: true, result });
  } catch (err) { next(err); }
});

// @POST /api/ai/learning-roadmap — Free Learning Roadmap
router.post('/learning-roadmap', protect, async (req, res, next) => {
  try {
    const { generateLearningRoadmap } = require('../services/aiService');
    const { targetRole, timelineWeeks } = req.body;
    const role = targetRole || req.user.profile?.targetRoles?.[0] || req.user.profile?.currentTitle || 'Software Engineer';
    const skills = (req.user.profile?.skills || []).map(s => s.name || s);
    const roadmap = await generateLearningRoadmap(role, skills, Number(timelineWeeks) || 8);
    res.json({ success: true, roadmap });
  } catch (err) { next(err); }
});

module.exports = router;
