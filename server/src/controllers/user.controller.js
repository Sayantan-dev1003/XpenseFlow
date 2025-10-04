const User = require('../models/User.model');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const { 
  changePasswordSchema,
  validate 
} = require('../middleware/validation');

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
        createdAt: req.user.createdAt
      }
    }
  });
});

module.exports = {
  changePassword: [validate(changePasswordSchema), changePassword],
  getUserStats,
  getCurrentUser
};