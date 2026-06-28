const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const { protect } = require('../middleware/auth');

// @POST /api/support
// Create a new support ticket
router.post('/', protect, async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      message
    });

    res.status(201).json({ success: true, ticket, message: 'Support ticket submitted successfully' });
  } catch (err) { 
    next(err); 
  }
});

// @GET /api/support
// Get all tickets for the logged in user
router.get('/', protect, async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
