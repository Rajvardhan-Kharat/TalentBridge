const { runPromptTool } = require('../services/aiService');
const PromptHistory = require('../models/PromptHistory');
const StarStory = require('../models/StarStory');

// @POST /api/tools/run
exports.runTool = async (req, res, next) => {
  try {
    const { toolId, toolName, inputs } = req.body;
    if (!toolId || !inputs)
      return res.status(400).json({ success: false, message: 'toolId and inputs required' });

    const output = await runPromptTool(toolId, inputs, req.user.profile);

    // Save to history
    await PromptHistory.create({ user: req.user._id, toolId, toolName, inputs, output });

    // If behavioral stories, auto-save to story bank
    if (toolId === 'behavioral-stories') {
      const stories = output.split(/---|\n\n(?=Story \d)/i).filter(s => s.trim());
      for (const story of stories) {
        await StarStory.create({
          user: req.user._id,
          title: story.split('\n')[0]?.replace(/^#+\s*/, '').trim() || 'Story',
          action: story,
          tool: toolId,
          skills: inputs.themes?.split(',') || [],
        });
      }
    }

    res.json({ success: true, output });
  } catch (err) { next(err); }
};

// @GET /api/tools/history
exports.getHistory = async (req, res, next) => {
  try {
    const history = await PromptHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, history });
  } catch (err) { next(err); }
};

// @GET /api/tools/stories
exports.getStories = async (req, res, next) => {
  try {
    const { search, skill } = req.query;
    const query = { user: req.user._id };
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };
    const stories = await StarStory.find(query).sort({ createdAt: -1 });
    res.json({ success: true, stories });
  } catch (err) { next(err); }
};

// @POST /api/tools/stories
exports.createStory = async (req, res, next) => {
  try {
    const story = await StarStory.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, story });
  } catch (err) { next(err); }
};

// @DELETE /api/tools/stories/:id
exports.deleteStory = async (req, res, next) => {
  try {
    await StarStory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) { next(err); }
};
