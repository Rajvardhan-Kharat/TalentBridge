const User = require('../models/User');
const Application = require('../models/Application');

// ─── Helper ───────────────────────────────────────────────────────────────────
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @GET /api/admin/stats  — Platform overview
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCompanies,
      totalJobseekers,
      totalAdmins,
      goldUsers,
      platinumUsers,
      freeUsers,
      companyBasicUsers,
      companyProUsers,
      totalApplications,
      recentSignups,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'company' }),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ 'subscription.plan': 'gold', 'subscription.status': 'active' }),
      User.countDocuments({ 'subscription.plan': 'platinum', 'subscription.status': 'active' }),
      User.countDocuments({ 'subscription.plan': 'free' }),
      User.countDocuments({ 'subscription.plan': 'company_basic', 'subscription.status': 'active' }),
      User.countDocuments({ 'subscription.plan': 'company_pro', 'subscription.status': 'active' }),
      Application.countDocuments({}),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email role subscription.plan avatar createdAt'),
    ]);

    // Revenue calculation (demo — based on active paid users)
    const monthlyRevenue = (goldUsers * 499) + (platinumUsers * 999) + (companyBasicUsers * 1999) + (companyProUsers * 4999);
    const totalRevenue = monthlyRevenue; // simplified for demo

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCompanies,
        totalJobseekers,
        totalAdmins,
        goldUsers,
        platinumUsers,
        freeUsers,
        companyBasicUsers,
        companyProUsers,
        totalApplications,
        monthlyRevenue,
        totalRevenue,
        recentSignups,
      },
    });
  } catch (err) { next(err); }
};

// @GET /api/admin/users  — Paginated user list with search & filter
exports.getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const search = req.query.search || '';
    const role = req.query.role || '';
    const plan = req.query.plan || '';

    const filter = {};
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    if (role) filter.role = role;
    if (plan) filter['subscription.plan'] = plan;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('name email role avatar subscription.plan subscription.status onboardingComplete createdAt'),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// @PUT /api/admin/users/:id/role  — Change user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['jobseeker', 'company', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    // Prevent demoting self
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: false }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @DELETE /api/admin/users/:id  — Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
};

// @PUT /api/admin/users/:id/plan  — Change user subscription plan
exports.updateUserPlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const validPlans = ['free', 'gold', 'platinum'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        'subscription.plan': plan,
        'subscription.status': 'active',
        'subscription.startDate': new Date(),
        'subscription.endDate': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { new: true, runValidators: false }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @GET /api/admin/revenue  — Revenue breakdown by month
exports.getRevenue = async (req, res, next) => {
  try {
    // Get monthly revenue data for the last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const [gold, platinum, companyBasic, companyPro] = await Promise.all([
        User.countDocuments({
          'subscription.plan': 'gold',
          'subscription.status': 'active',
          'subscription.startDate': { $lte: end },
          $or: [{ 'subscription.endDate': { $gte: d } }, { 'subscription.endDate': null }],
        }),
        User.countDocuments({
          'subscription.plan': 'platinum',
          'subscription.status': 'active',
          'subscription.startDate': { $lte: end },
          $or: [{ 'subscription.endDate': { $gte: d } }, { 'subscription.endDate': null }],
        }),
        User.countDocuments({
          'subscription.plan': 'company_basic',
          'subscription.status': 'active',
          'subscription.startDate': { $lte: end },
          $or: [{ 'subscription.endDate': { $gte: d } }, { 'subscription.endDate': null }],
        }),
        User.countDocuments({
          'subscription.plan': 'company_pro',
          'subscription.status': 'active',
          'subscription.startDate': { $lte: end },
          $or: [{ 'subscription.endDate': { $gte: d } }, { 'subscription.endDate': null }],
        }),
      ]);
      months.push({
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        gold,
        platinum,
        companyBasic,
        companyPro,
        revenue: (gold * 499) + (platinum * 999) + (companyBasic * 1999) + (companyPro * 4999),
      });
    }

    res.json({ success: true, revenue: months });
  } catch (err) { next(err); }
};
