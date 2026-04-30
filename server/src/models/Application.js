const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },

  // Manual entry if job isn't in DB
  jobTitle: String,
  company: String,
  applyUrl: String,

  status: {
    type: String,
    enum: ['discovered', 'applied', 'interview', 'offer', 'rejected'],
    default: 'discovered'
  },
  matchScore: Number,
  matchGrade: String,
  cvVersionUsed: { type: mongoose.Schema.Types.ObjectId, ref: 'CvVersion' },
  notes: String,
  appliedAt: Date,
  nextStep: String,
  salaryOffered: Number,

  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String,
  }],

  aiEvaluation: {
    overallScore: Number,
    grade: String,
    recommendation: String,
    dimensions: mongoose.Schema.Types.Mixed,
    reasoning: String,
    evaluatedAt: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
