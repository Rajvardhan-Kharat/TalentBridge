const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// @POST /api/auth/google
exports.googleLogin = async (req, res, next) => {
  try {
    const { token, role } = req.body; // token from google
    if (!token) return res.status(400).json({ success: false, message: 'Google token required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      const userRole = role === 'company' ? 'company' : 'jobseeker';
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        role: userRole,
        onboardingComplete: userRole === 'company',
      });
    } else {
      // Update existing user with googleId if missing
      if (!user.googleId) {
        user.googleId = sub;
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }
    }
    sendToken(user, 200, res);
  } catch (err) { 
    console.error('Google Auth Error:', err);
    res.status(401).json({ success: false, message: 'Invalid Google token' }); 
  }
};

// @POST /api/auth/linkedin
exports.linkedinLogin = async (req, res, next) => {
  try {
    const { code, redirectUri, role } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'LinkedIn authorization code required' });

    // 1. Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Get User Profile (using OIDC endpoint to get email and profile)
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const { sub, email, name, picture } = profileResponse.data;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      const userRole = role === 'company' ? 'company' : 'jobseeker';
      user = await User.create({
        name,
        email,
        linkedinId: sub,
        avatar: picture,
        role: userRole,
        onboardingComplete: userRole === 'company',
      });
    } else {
      // Update existing user with linkedinId if missing
      if (!user.linkedinId) {
        user.linkedinId = sub;
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }
    }
    sendToken(user, 200, res);
  } catch (err) {
    console.error('LinkedIn Auth Error:', err?.response?.data || err.message);
    res.status(401).json({ success: false, message: 'LinkedIn authentication failed' });
  }
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
