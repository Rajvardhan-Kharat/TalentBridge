const { evaluateJob } = require('../services/aiService');
const User = require('../models/User');

// @POST /api/ai/evaluate-job
exports.evaluateJobPost = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription)
      return res.status(400).json({ success: false, message: 'jobDescription is required' });

    const user = await User.findById(req.user._id);
    const plan = user.subscription?.plan || 'free';
    
    // Check daily limits
    const today = new Date().toDateString();
    const lastDate = user.usageStats?.lastAiSearchDate?.toDateString();
    
    if (lastDate !== today) {
      user.usageStats = { lastAiSearchDate: new Date(), aiSearchesToday: 0 };
    }
    
    if (plan === 'free' && user.usageStats.aiSearchesToday >= 3) {
      return res.status(403).json({ success: false, message: 'Free plan limit reached: 3 smart evaluations per day. Please upgrade.' });
    }
    if (plan === 'gold' && user.usageStats.aiSearchesToday >= 20) {
      return res.status(403).json({ success: false, message: 'Gold plan limit reached: 20 smart evaluations per day. Please upgrade to Platinum.' });
    }
    
    // Increment usage
    user.usageStats.aiSearchesToday += 1;
    await user.save();
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
