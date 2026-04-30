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
      onboardingComplete: user.onboardingComplete,
      profile: user.profile,
      subscription: user.subscription,
      searchGoals: user.searchGoals,
    },
  });
};

// @POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
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
