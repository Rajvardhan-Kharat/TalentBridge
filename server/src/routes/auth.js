const express = require('express');
const router = express.Router();
const { register, login, googleLogin, linkedinLogin, getMe, updateProfile, completeOnboarding, updateAvatar, updateCompanyProfile, getPublicProfile, updateSettings, updatePassword, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/linkedin', linkedinLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/onboarding', protect, completeOnboarding);
router.put('/avatar', protect, updateAvatar);
router.put('/company-profile', protect, updateCompanyProfile);
router.put('/settings', protect, updateSettings);
router.put('/update-password', protect, updatePassword);
router.delete('/delete-account', protect, deleteAccount);
router.get('/public/:userId', getPublicProfile);  // public — no auth

module.exports = router;
