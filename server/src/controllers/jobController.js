const Job = require('../models/Job');
const { computeMatchScore } = require('../services/aiService');

// @GET /api/jobs  — search + filter + match scoring
exports.getJobs = async (req, res, next) => {
  try {
    const {
      q, location, locationType, jobType, salaryMin, salaryMax,
      skills, industry, minMatch, page = 1, limit = 20
    } = req.query;

    const query = { isActive: true };
    if (q) query.$text = { $search: q };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (locationType) query.locationType = locationType;
    if (jobType) query.jobType = jobType;
    if (industry) query.industry = { $regex: industry, $options: 'i' };
    if (salaryMin) query.salaryMax = { $gte: Number(salaryMin) };
    if (salaryMax) query.salaryMin = { $lte: Number(salaryMax) };
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArr.map(s => new RegExp(s, 'i')) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    let jobs = await Job.find(query).sort({ postedAt: -1 }).skip(skip).limit(Number(limit));

    // Compute match scores if user is logged in
    const userSkills = req.user?.profile?.skills || [];
    const userExperience = req.user?.profile?.experience || '';

    let enriched = jobs.map(job => {
      const match = computeMatchScore(job, userSkills, userExperience);
      return {
        ...job.toObject(),
        matchScore: match.score,
        matchGrade: match.grade,
        matchedSkills: match.matchedSkills,
        shouldSkip: match.score < 4.0,
      };
    });

    // Filter by minimum match if requested
    if (minMatch) {
      enriched = enriched.filter(j => j.matchScore >= Number(minMatch));
    }

    const total = await Job.countDocuments(query);
    res.json({ success: true, jobs: enriched, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

// @GET /api/jobs/:id
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    const userSkills = req.user?.profile?.skills || [];
    const match = computeMatchScore(job, userSkills);
    res.json({ success: true, job: { ...job.toObject(), matchScore: match.score, matchGrade: match.grade } });
  } catch (err) { next(err); }
};

// @GET /api/jobs/companies  — portal scanner
exports.getCompanyJobs = async (req, res, next) => {
  try {
    const { company } = req.params;
    const jobs = await Job.find({ company: { $regex: company, $options: 'i' }, isActive: true })
      .sort({ postedAt: -1 }).limit(15);
    res.json({ success: true, jobs });
  } catch (err) { next(err); }
};
