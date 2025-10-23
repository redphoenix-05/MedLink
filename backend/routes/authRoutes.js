const express = require('express');
const { signupUser, loginUser, getMe, updateProfile, deleteAccount } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signupUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/account', authMiddleware, deleteAccount);

module.exports = router;