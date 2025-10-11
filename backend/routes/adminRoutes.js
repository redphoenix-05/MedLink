const express = require('express');
const router = express.Router();
const {
  approvePharmacy,
  rejectPharmacy,
  getDashboardStats,
  getPendingPharmacies,
  getAllUsers,
  getActivityLogs,
} = require('../controllers/adminController');
const { authMiddleware: auth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes require admin authentication
router.use(auth);
router.use(roleMiddleware('admin'));

// @route   PUT /api/admin/pharmacies/:id/approve
// @desc    Approve pharmacy
// @access  Private (Admin only)
router.put('/pharmacies/:id/approve', approvePharmacy);

// @route   PUT /api/admin/pharmacies/:id/reject
// @desc    Reject pharmacy
// @access  Private (Admin only)
router.put('/pharmacies/:id/reject', rejectPharmacy);

// @route   GET /api/admin/dashboard-stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard-stats', getDashboardStats);

// @route   GET /api/admin/pharmacies/pending
// @desc    Get pending pharmacies for approval
// @access  Private (Admin only)
router.get('/pharmacies/pending', getPendingPharmacies);

// @route   GET /api/admin/users
// @desc    Get all users (Admin view)
// @access  Private (Admin only)
router.get('/users', getAllUsers);

// @route   GET /api/admin/activity-logs
// @desc    Get system activity logs
// @access  Private (Admin only)
router.get('/activity-logs', getActivityLogs);

module.exports = router;