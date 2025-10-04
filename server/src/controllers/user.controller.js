const User = require('../models/User.model');
const Company = require('../models/Company.model');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const { 
  changePasswordSchema,
  createUserSchema,
  validate 
} = require('../middleware/validation');
const emailService = require('../services/email.service');
const crypto = require('crypto');

// Create new user (Admin only)
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password, role, manager } = req.body;
  const adminId = req.user._id;
  const companyId = req.user.company;

  // Only admins can create users
  if (!req.user.isAdmin()) {
    throw new AppError('Only administrators can create new users', 403);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  // Validate manager if role is employee
  if (role === 'employee' && manager) {
    const managerUser = await User.findOne({ 
      _id: manager, 
      company: companyId,
      role: { $in: ['manager', 'admin'] }
    });
    if (!managerUser) {
      throw new AppError('Invalid manager selected', 400);
    }
  }

  // Create user
  const user = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phoneNumber,
    password,
    company: companyId,
    role,
    manager: role === 'employee' ? manager : null,
    authProvider: 'local',
    hasChangedDefaultPassword: false // Admin sets the password, so it's not a default
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        manager: user.manager
      },
      credentials: {
        email: user.email,
        password: password,
        note: 'Please share these credentials with the user offline'
      }
    }
  });
});

// Get all users in company (Admin only)
const getCompanyUsers = asyncHandler(async (req, res) => {
  const companyId = req.user.company;

  // Only admins can view all users
  if (!req.user.isAdmin()) {
    throw new AppError('Only administrators can view company users', 403);
  }

  const users = await User.find({ company: companyId })
    .populate('manager', 'firstName lastName email')
    .select('-password -passwordResetToken -passwordResetExpires -phoneVerificationToken -phoneVerificationExpires -emailVerificationToken -emailVerificationExpires')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { users }
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Get user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user has a password (social login users might not)
  if (!user.password) {
    throw new AppError('Password change not available for social login accounts', 400);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});


// Get managers for dropdown (Admin only)
const getManagers = asyncHandler(async (req, res) => {
  const companyId = req.user.company;

  // Only admins can get managers list
  if (!req.user.isAdmin()) {
    throw new AppError('Only administrators can access this resource', 403);
  }

  const managers = await User.find({ 
    company: companyId,
    role: { $in: ['manager', 'admin'] }
  }).select('firstName lastName email role');

  res.status(200).json({
    success: true,
    data: {
      managers
    }
  });
});

// Get user statistics
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  const stats = {
    accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
    lastLogin: user.lastLogin,
    authProvider: user.authProvider,
    loginAttempts: user.loginAttempts,
    isLocked: user.isLocked
  };

  res.status(200).json({
    success: true,
    data: { stats }
  });
});

// Get current user (alias for profile)
const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        profilePicture: req.user.profilePicture,
        authProvider: req.user.authProvider,
        preferences: req.user.preferences,
        createdAt: req.user.createdAt,
        role: req.user.role,
        company: req.user.company
      }
    }
  });
});

// Test email configuration (Admin only)
const testEmailConfig = asyncHandler(async (req, res) => {
  // Only admins can test email configuration
  if (!req.user.isAdmin()) {
    throw new AppError('Only administrators can test email configuration', 403);
  }

  const testEmail = req.body.email || req.user.email;
  
  try {
    await emailService.sendWelcomeEmail(testEmail, 'Test User', '123456');
    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      data: { testEmail }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

module.exports = {
  createUser: [validate(createUserSchema), createUser],
  getCompanyUsers,
  getManagers,
  changePassword: [validate(changePasswordSchema), changePassword],
  getUserStats,
  getCurrentUser,
  testEmailConfig
};