const Job = require('../models/Job');
const User = require('../models/User');

// Middleware: ensure user is a company
const isCompany = (req, res, next) => {
  if (req.user?.role !== 'company') {
    return res.status(403).json({ success: false, message: 'Only company accounts can perform this action' });
  }
  next();
};

// @GET /api/company/jobs  — list jobs posted by this company
exports.getMyJobs = [isCompany, async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedByCompany: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) { next(err); }
}];

// @POST /api/company/jobs  — post a new job
exports.postJob = [isCompany, async (req, res, next) => {
  try {
    const {
      title, description, requirements, skills, location, locationType,
      salaryMin, salaryMax, jobType, industry, experience, applyUrl, closingDate
    } = req.body;

    if (!title || !description)
      return res.status(400).json({ success: false, message: 'title and description are required' });

    const companyName = req.user.companyProfile?.companyName || req.user.name;
    const companyLogo = req.user.companyProfile?.logo || req.user.avatar || '';

    const job = await Job.create({
      title,
      company: companyName,
      companyLogo,
      description,
      requirements: requirements || [],
      skills: skills || [],
      location: location || req.user.companyProfile?.headquarters || 'India',
      locationType: locationType || 'onsite',
      salaryMin: Number(salaryMin) || undefined,
      salaryMax: Number(salaryMax) || undefined,
      jobType: jobType || 'full-time',
      industry: industry || req.user.companyProfile?.industry || 'Technology',
      experience: experience || '1-3 years',
      applyUrl: applyUrl || '',
      sourcePortal: 'TalentBridge',
      isActive: true,
      postedAt: new Date(),
      closingDate: closingDate ? new Date(closingDate) : undefined,
      postedByCompany: req.user._id,
    });

    // Increment company's job count
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'companyProfile.totalJobsPosted': 1 } });

    res.status(201).json({ success: true, job });
  } catch (err) { next(err); }
}];

// @PUT /api/company/jobs/:id  — update a job posting
exports.updateJob = [isCompany, async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedByCompany: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or not yours' });

    const allowedFields = ['title', 'description', 'requirements', 'skills', 'location', 'locationType',
      'salaryMin', 'salaryMax', 'jobType', 'industry', 'experience', 'applyUrl', 'isActive', 'closingDate'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });
    await job.save();
    res.json({ success: true, job });
  } catch (err) { next(err); }
}];

// @DELETE /api/company/jobs/:id  — remove a job posting
exports.deleteJob = [isCompany, async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedByCompany: req.user._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or not yours' });
    res.json({ success: true, message: 'Job removed' });
  } catch (err) { next(err); }
}];
