const jwt = require('jsonwebtoken');
const { User, Pharmacy } = require('../models');
const { Op } = require('sequelize');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const { name, email, password, role, pharmacyName, address, licenseNumber, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Validate role (only allow customer and pharmacy for public signup)
    const allowedRoles = ['customer', 'pharmacy'];
    const userRole = role && allowedRoles.includes(role) ? role : 'customer';

    // Additional validation for pharmacy signup
    if (userRole === 'pharmacy') {
      if (!pharmacyName || !address || !licenseNumber || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Please provide pharmacy name, address, phone number, and license number'
        });
      }

      // Validate phone number format
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'The provided number is wrong. Phone number must be 11 digits starting with 01[3-9]'
        });
      }

      // Check if license number is already in use
      const existingLicense = await Pharmacy.findOne({ where: { licenseNumber } });
      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: 'License number already registered'
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    // If pharmacy role, create pharmacy record automatically
    let pharmacy = null;
    if (userRole === 'pharmacy') {
      pharmacy = await Pharmacy.create({
        userId: user.id,
        name: pharmacyName,
        address,
        phone: phone || '',
        licenseNumber,
        status: 'pending'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    const responseData = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };

    // Include pharmacy info if created
    if (pharmacy) {
      responseData.pharmacy = {
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        licenseNumber: pharmacy.licenseNumber,
        status: pharmacy.status
      };
    }

    res.status(201).json({
      success: true,
      message: userRole === 'pharmacy' 
        ? 'Pharmacy account created successfully. Awaiting admin approval.'
        : 'User registered successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // 'email' here can be email or username (identifier)

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email OR name (treat provided 'email' as identifier)
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { name: email }
        ]
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone) {
      // Validate phone number format if provided
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (phone.trim() !== '' && !phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'The provided number is wrong. Phone number must be 11 digits starting with 01[3-9]'
        });
      }
      user.phone = phone;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set new password'
        });
      }

      // Verify current password
      const isPasswordValid = await user.matchPassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      user.password = newPassword; // Will be hashed by the model hook
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getMe,
  updateProfile
};