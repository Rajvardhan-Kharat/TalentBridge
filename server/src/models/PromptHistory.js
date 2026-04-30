const mongoose = require('mongoose');

const promptHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toolId: String,  // e.g., 'cover-letter', 'interview-kit'
  toolName: String,
  inputs: mongoose.Schema.Types.Mixed,
  output: String,
  tokensUsed: Number,
}, { timestamps: true });

module.exports = mongoose.model('PromptHistory', promptHistorySchema);
