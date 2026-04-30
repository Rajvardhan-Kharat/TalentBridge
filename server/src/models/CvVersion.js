const mongoose = require('mongoose');

const cvVersionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobTitle: String,
  company: String,
  jobDescription: String,
  tailoredContent: String, // AI-generated text
  pdfUrl: String,
  pdfPublicId: String,
  isBase: { type: Boolean, default: false },
  label: String,
  aiChanges: [String], // summary of changes made
}, { timestamps: true });

module.exports = mongoose.model('CvVersion', cvVersionSchema);

