const Application = require('../models/Application');

// @GET /api/applications
exports.getApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ user: req.user._id })
      .populate('job', 'title company location salaryMin salaryMax')
      .populate('cvVersionUsed', 'label')
      .sort({ updatedAt: -1 });
    res.json({ success: true, applications: apps });
  } catch (err) { next(err); }
};

// @POST /api/applications
exports.createApplication = async (req, res, next) => {
  try {
    const app = await Application.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, application: app });
  } catch (err) { next(err); }
};

// @PUT /api/applications/:id
exports.updateApplication = async (req, res, next) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ success: false, message: 'Not found' });

    // Track status changes
    if (req.body.status && req.body.status !== app.status) {
      app.statusHistory.push({ status: req.body.status, note: req.body.statusNote });
    }

    Object.assign(app, req.body);
    await app.save();
    res.json({ success: true, application: app });
  } catch (err) { next(err); }
};

// @DELETE /api/applications/:id
exports.deleteApplication = async (req, res, next) => {
  try {
    await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

// @GET /api/applications/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const apps = await Application.find({ user: req.user._id });
    const total = apps.length;
    const byStatus = apps.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});
    const applied = apps.filter(a => a.status !== 'discovered').length;
    const interviews = byStatus.interview || 0;
    const offers = byStatus.offer || 0;
    const avgMatchScore = apps.length
      ? (apps.reduce((s, a) => s + (a.matchScore || 0), 0) / apps.length).toFixed(1)
      : 0;
    const responseRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;

    res.json({ success: true, analytics: { total, byStatus, applied, interviews, offers, avgMatchScore, responseRate } });
  } catch (err) { next(err); }
};
