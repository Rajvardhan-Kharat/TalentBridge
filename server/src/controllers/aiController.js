const { evaluateJob } = require('../services/aiService');
const User = require('../models/User');

// @POST /api/ai/evaluate-job
exports.evaluateJobPost = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription)
      return res.status(400).json({ success: false, message: 'jobDescription is required' });

    const user = await User.findById(req.user._id);
    const cvText = user.baseCv?.extractedText || '';
    const profileSummary = `
Name: ${user.name}
Title: ${user.profile?.currentTitle || 'Not specified'}
Headline: ${user.profile?.headline || ''}
Sector: ${(user.profile?.sectors || [user.profile?.sector]).filter(Boolean).join(', ') || 'Not specified'}
Experience: ${user.profile?.experience || 'Not specified'}
Skills: ${(user.profile?.skills || []).map(s => s.name || s).join(', ')}
Target roles: ${(user.profile?.targetRoles || []).join(', ')}
Target salary: ${user.profile?.targetSalaryMin || 'N/A'} - ${user.profile?.targetSalaryMax || 'N/A'} INR
Preferred location: ${(user.profile?.preferredLocations || []).join(', ')}
Work mode: ${user.profile?.workMode || 'any'}
Industry: ${(user.profile?.sectors || [user.profile?.industry]).filter(Boolean).join(', ') || 'Not specified'}`;

    const result = await evaluateJob(jobDescription, cvText || profileSummary, user.profile);
    res.json({ success: true, evaluation: result });
  } catch (err) { next(err); }
};
