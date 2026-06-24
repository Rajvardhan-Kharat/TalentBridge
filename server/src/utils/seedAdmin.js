const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: 'admin@talentbridge.com' });
    if (existing) {
      // Ensure role is admin even if it was created incorrectly before
      if (existing.role !== 'admin') {
        await User.findByIdAndUpdate(existing._id, { role: 'admin' });
        console.log('✅ Admin role updated for admin@talentbridge.com');
      } else {
        console.log('✅ Admin user already exists: admin@talentbridge.com');
      }
      return;
    }

    await User.create({
      name: 'Platform Admin',
      email: 'admin@talentbridge.com',
      password: 'admin123',
      role: 'admin',
      onboardingComplete: true,
    });

    console.log('🔐 Admin user created: admin@talentbridge.com / admin123');
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err.message);
  }
};

module.exports = seedAdmin;
