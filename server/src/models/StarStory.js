const mongoose = require('mongoose');

const starStorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  situation: String,
  task: String,
  action: String,
  result: String,
  skills: [String],
  situations: [String], // tags: leadership, conflict, failure, etc.
  tool: String, // which prompt tool generated this
  jobContext: String,
}, { timestamps: true });

module.exports = mongoose.model('StarStory', starStorySchema);
