const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: String,
  location: String,
  locationType: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'onsite' },
  salaryMin: Number,
  salaryMax: Number,
  currency: { type: String, default: 'INR' },
  description: String,
  requirements: [String],
  skills: [String],
  experience: String,
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' },
  industry: String,
  department: String,
  applyUrl: String,
  sourcePortal: String,
  isActive: { type: Boolean, default: true },
  postedAt: { type: Date, default: Date.now },
  closingDate: Date,

  // AI-computed fields
  inDemandSkills: [String],
  atsDensityScore: Number,
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', skills: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
