const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPlans,
  createOrder,
  verifyPayment,
  cancelSubscription,
  getSubscription,
} = require('../controllers/subscriptionController');

router.get('/plans', getPlans);
router.get('/me', protect, getSubscription);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
