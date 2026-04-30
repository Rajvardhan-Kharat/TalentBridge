const User = require('../models/User');
const crypto = require('crypto');

// ── Plan definitions ──────────────────────────────────────────────────────
const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceMonthly: 0,
    currency: 'INR',
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #475569, #64748b)',
    frame: 'none',
    badge: '🆓',
    features: [
      'Basic profile creation',
      'Up to 5 job applications/month',
      'Basic AI job matching',
      'Standard resume template (1)',
      'Community access',
    ],
    limits: {
      applications: 5,
      resumeTemplates: 1,
      aiSearches: 3,
      profileViews: false,
      priorityListing: false,
      advancedAnalytics: false,
    },
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    price: 49900,   // ₹499/month in paise
    priceMonthly: 499,
    currency: 'INR',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)',
    frame: 'gold',
    badge: '⭐',
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited job applications',
      '20 AI searches/day',
      '5 premium resume templates',
      'Gold profile frame badge',
      'Priority job listing',
      'Advanced analytics',
      'Email alerts for matching jobs',
      'LinkedIn profile optimization tips',
    ],
    limits: {
      applications: -1, // unlimited
      resumeTemplates: 5,
      aiSearches: 20,
      profileViews: true,
      priorityListing: true,
      advancedAnalytics: true,
    },
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    price: 99900,  // ₹999/month in paise
    priceMonthly: 999,
    currency: 'INR',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #6d28d9, #8b5cf6, #a78bfa)',
    frame: 'platinum',
    badge: '💎',
    features: [
      'Everything in Gold',
      'Unlimited AI searches',
      'All 15+ premium resume templates',
      'Platinum diamond profile frame',
      'Featured candidate listing',
      'Direct recruiter messaging',
      'Personal career coach AI',
      'Interview prep sessions (5/month)',
      'Salary negotiation AI toolkit',
      'Priority support (24/7)',
    ],
    limits: {
      applications: -1,
      resumeTemplates: -1,
      aiSearches: -1,
      profileViews: true,
      priorityListing: true,
      advancedAnalytics: true,
      featuredListing: true,
      directMessaging: true,
      careerCoach: true,
    },
  },
};

// @GET /api/subscription/plans
exports.getPlans = (req, res) => {
  res.json({ success: true, plans: PLANS });
};

// @GET /api/subscription/me
exports.getSubscription = async (req, res) => {
  const user = await User.findById(req.user._id).select('subscription name email');
  const plan = PLANS[user.subscription?.plan || 'free'];
  res.json({ success: true, subscription: user.subscription, plan, planDetails: PLANS });
};

// @POST /api/subscription/create-order  — Demo mode: generates a fake Razorpay order
exports.createOrder = async (req, res) => {
  const { planId } = req.body;
  const plan = PLANS[planId];
  if (!plan || plan.id === 'free') {
    return res.status(400).json({ success: false, message: 'Invalid plan selected' });
  }

  // DEMO: In production, use Razorpay SDK to create real order
  // const Razorpay = require('razorpay');
  // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  // const order = await razorpay.orders.create({ amount: plan.price, currency: 'INR', receipt: `order_${Date.now()}` });

  const demoOrderId = `order_DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  res.json({
    success: true,
    order: {
      id: demoOrderId,
      amount: plan.price,
      currency: 'INR',
      planId,
    },
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_DEMO_KEY',
    demo: true,
  });
};

// @POST /api/subscription/verify  — Demo mode: auto-approves payment
exports.verifyPayment = async (req, res) => {
  const { planId, orderId, paymentId, signature } = req.body;
  const plan = PLANS[planId];
  if (!plan) return res.status(400).json({ success: false, message: 'Invalid plan' });

  // DEMO: In production, verify Razorpay signature:
  // const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  // if (expectedSig !== signature) return res.status(400).json({ success: false, message: 'Payment verification failed' });

  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      subscription: {
        plan: planId,
        status: 'active',
        razorpayOrderId: orderId || `order_DEMO_${Date.now()}`,
        razorpayPaymentId: paymentId || `pay_DEMO_${Date.now()}`,
        razorpaySignature: signature || 'DEMO_SIGNATURE',
        startDate: now,
        endDate,
        autoRenew: true,
      },
    },
    { new: true, runValidators: false }
  ).select('-password');

  res.json({ success: true, message: `🎉 Welcome to ${plan.name} plan!`, user: updated });
};

// @POST /api/subscription/cancel
exports.cancelSubscription = async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      'subscription.plan': 'free',
      'subscription.status': 'cancelled',
      'subscription.autoRenew': false,
    },
    { new: true, runValidators: false }
  ).select('-password');

  res.json({ success: true, message: 'Subscription cancelled. You are now on the Free plan.', user: updated });
};
