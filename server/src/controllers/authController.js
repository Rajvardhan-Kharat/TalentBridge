const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      onboardingComplete: user.onboardingComplete,
      profile: user.profile,
      companyProfile: user.companyProfile,
      subscription: user.subscription,
      searchGoals: user.searchGoals,
    },
  });
};

// @POST /api/auth/register  (jobseeker or company)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyProfile } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const userRole = role === 'company' ? 'company' : 'jobseeker';
    const userData = { name, email, password, role: userRole };
    if (userRole === 'company' && companyProfile) {
      userData.companyProfile = companyProfile;
      userData.onboardingComplete = true; // companies skip job-seeker onboarding
    }

    const user = await User.create(userData);
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

// @POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

// @GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
};

// @PUT /api/auth/profile  — full profile update
exports.updateProfile = async (req, res, next) => {
  try {
    const { profile, searchGoals, name, avatar } = req.body;
    const updateFields = {};
    if (profile) updateFields.profile = profile;
    if (searchGoals) updateFields.searchGoals = searchGoals;
    if (name) updateFields.name = name;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: false }
    ).select('-password');
    res.json({ success: true, user: updated });
  } catch (err) { next(err); }
};

// @PUT /api/auth/onboarding
exports.completeOnboarding = async (req, res, next) => {
  try {
    const { profile, searchGoals, skip } = req.body;
    const updateData = { onboardingComplete: true };
    if (!skip && profile) {
      // Merge profile fields — use dot notation so avatar (saved separately) is preserved
      Object.keys(profile).forEach(key => {
        updateData[`profile.${key}`] = profile[key];
      });
    }
    if (!skip && searchGoals) updateData.searchGoals = searchGoals;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select('-password');
    res.json({ success: true, user: updated });
  } catch (err) { next(err); }
};

// @PUT /api/auth/avatar
exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: false }
    ).select('-password');
    res.json({ success: true, user: updated });
  } catch (err) { next(err); }
};

// @PUT /api/auth/company-profile  — update company details
exports.updateCompanyProfile = async (req, res, next) => {
  try {
    const { companyProfile, name } = req.body;
    const updateFields = {};
    if (companyProfile) updateFields.companyProfile = companyProfile;
    if (name) updateFields.name = name;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: false }
    ).select('-password');
    res.json({ success: true, user: updated });
  } catch (err) { next(err); }
};

// @GET /api/auth/public/:userId  — public resume/profile page (no auth required)
exports.getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name avatar profile.currentTitle profile.headline profile.skills profile.workExperience profile.education profile.projects profile.certifications profile.linkedinUrl profile.githubUrl profile.portfolioUrl profile.bio companyProfile role'
    );
    if (!user) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @PUT /api/auth/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    
    // We update settings specifically
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { settings } },
      { new: true, runValidators: false }
    ).select('-password');
    
    res.json({ success: true, user: updated });
  } catch (err) { next(err); }
};

// @PUT /api/auth/update-password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }
    
    user.password = newPassword;
    await user.save();
    
    // We can return the user minus the password
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user: updatedUser, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

// @DELETE /api/auth/delete-account
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    // For security, optionally require password confirmation to delete
    const { password } = req.body;
    
    if (password) {
      if (!(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
    }
    
    await User.findByIdAndDelete(req.user._id);
    // Optionally: Clean up associated applications, cvs, etc. (Can be done via mongoose middleware later)
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) { next(err); }
};
