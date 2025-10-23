const express = require('express');
const router = express.Router();
const {
  approvePharmacy,
  rejectPharmacy,
  getDashboardStats,
  getPendingPharmacies,
  getApprovedPharmacies,
  getAllUsers,
  getActivityLogs,
  updateUserStatus,
  getAllReservations,
  getAllDeliveries,
  getAllMedicines,
  getIncompleteUsers,
  cleanupIncompleteUsers
} = require('../controllers/adminController');
const { authMiddleware: auth, verifyAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(auth);
router.use(verifyAdmin);

// @route   GET /api/admin/dashboard-stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard-stats', getDashboardStats);

// @route   GET /api/admin/pharmacies/pending
// @desc    Get pending pharmacies for approval
// @access  Private (Admin only)
router.get('/pharmacies/pending', getPendingPharmacies);

// @route   GET /api/admin/pharmacies/approved
// @desc    Get approved pharmacies
// @access  Private (Admin only)
router.get('/pharmacies/approved', getApprovedPharmacies);

// @route   PUT /api/admin/pharmacies/:id/approve
// @desc    Approve pharmacy
// @access  Private (Admin only)
router.put('/pharmacies/:id/approve', approvePharmacy);

// @route   PUT /api/admin/pharmacies/:id/reject
// @desc    Reject pharmacy
// @access  Private (Admin only)
router.put('/pharmacies/:id/reject', rejectPharmacy);

// @route   DELETE /api/admin/pharmacies/:id
// @desc    Delete pharmacy
// @access  Private (Admin only)
router.delete('/pharmacies/:id', require('../controllers/adminController').deletePharmacy);

// @route   GET /api/admin/users
// @desc    Get all users (Admin view)
// @access  Private (Admin only)
router.get('/users', getAllUsers);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:userId', require('../controllers/adminController').deleteUser);

// @route   GET /api/admin/activity-logs
// @desc    Get system activity logs
// @access  Private (Admin only)
router.get('/activity-logs', getActivityLogs);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', updateUserStatus);

// @route   GET /api/admin/reservations
// @desc    Get all reservations
// @access  Private (Admin only)
router.get('/reservations', getAllReservations);

// @route   GET /api/admin/deliveries
// @desc    Get all deliveries
// @access  Private (Admin only)
router.get('/deliveries', getAllDeliveries);

// @route   GET /api/admin/medicines
// @desc    Get all medicines
// @access  Private (Admin only)
router.get('/medicines', getAllMedicines);

// @route   GET /api/admin/users/incomplete
// @desc    Get incomplete/unregistered users
// @access  Private (Admin only)
router.get('/users/incomplete', getIncompleteUsers);

// @route   POST /api/admin/users/cleanup
// @desc    Cleanup incomplete/unregistered users
// @access  Private (Admin only)
router.post('/users/cleanup', cleanupIncompleteUsers);

module.exports = router;