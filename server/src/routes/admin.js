const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  updateUserPlan,
  getRevenue,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/stats',               getStats);
router.get('/users',               getUsers);
router.put('/users/:id/role',      updateUserRole);
router.put('/users/:id/plan',      updateUserPlan);
router.delete('/users/:id',        deleteUser);
router.get('/revenue',             getRevenue);

module.exports = router;
