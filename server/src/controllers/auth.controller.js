const User = require('../models/User.model');
const Token = require('../models/Token.model');
const Company = require('../models/Company.model');
const mongoose = require('mongoose');
const config = require('../config');
const { 
  generateTokens, 
  setSecureCookies, 
  clearSecureCookies,
  generateSecureToken 
} = require('../utils/generateTokens');
const otpService = require('../services/otp.service');
const emailService = require('../services/email.service');
const currencyService = require('../services/currency.service');
const { securityLogger } = require('../utils/logger');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const { 
  registerSchema, 
  loginSchema, 
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,
  sendLoginOTPSchema,
  verifyLoginOTPSchema,
  validate 
} = require('../middleware/validation');

// Register user
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, companyName, country } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  // Get currency for the country (if provided)
  let currency = null;
  if (country) {
    currency = await currencyService.getCurrencyByCountry(country);
    if (!currency) {
      // Fallback to USD if currency detection fails
      currency = { code: 'USD', name: 'US Dollar', symbol: '$' };
    }
  } else {
    // Default to USD if no country provided
    currency = { code: 'USD', name: 'US Dollar', symbol: '$' };
  }

  // Use a transaction to ensure data consistency
  const session = await User.startSession();
  let company = null;
  let user = null;

  try {
    const result = await session.withTransaction(async () => {
      if (companyName) {
        // Step 1: Create user first (without company field initially)
        const newUser = new User({
          firstName,
          lastName,
          email: email.toLowerCase(),
          password,
          phoneNumber,
          authProvider: 'local',
          role: 'admin'
          // company field is intentionally omitted initially
        }, { session });

        await newUser.save({ session });

        // Step 2: Create company with the user ID as createdBy
        const newCompany = new Company({
          name: companyName,
          country: country || 'United States',
          baseCurrency: currency,
          createdBy: newUser._id, // Now we have the actual user ID
          settings: {
            expenseCategories: [],
            expenseLimits: {
              dailyLimit: 1000,
              monthlyLimit: 10000
            },
            approvalSettings: {
              requireApprovalAbove: 100,
              autoApproveBelow: 50
            }
          }
        }, { session });

        await newCompany.save({ session });

        // Step 3: Update user with the company reference
        newUser.company = newCompany._id;
        await newUser.save({ session });

        return { user: newUser, company: newCompany };
      } else {
        // If no company name provided, this might be joining an existing company
        // For now, throw an error as this flow isn't fully implemented
        throw new AppError('Company name is required for registration', 400);
      }
    });

    // Extract user and company from transaction result
    user = result.user;
    company = result.company;
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }

  // Ensure we have the user with proper _id after transaction
  if (!user || !user._id) {
    throw new AppError('User creation failed', 500);
  }

  // Generate tokens for immediate login
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  await Token.createToken(user._id, 'refresh', '30d', {
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Set secure cookies
  setSecureCookies(res, accessToken, refreshToken);

  // Log registration attempt
  securityLogger.registrationAttempt(user.email, true, req.ip, req.get('User-Agent'));

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        company: company ? {
          id: company._id,
          name: company.name,
          baseCurrency: company.baseCurrency
        } : null
      },
      accessToken,
      refreshToken
    }
  });
});

// Login user - Step 1: Check credentials
const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    securityLogger.loginAttempt(email, false, req.ip, req.get('User-Agent'));
    throw new AppError('Something went wrong', 401);
  }

  // Check if account is locked
  if (user.isLocked) {
    securityLogger.accountLocked(user.email, req.ip, 'Account locked due to failed attempts');
    throw new AppError('Account is temporarily locked due to too many failed login attempts', 423);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    securityLogger.loginAttempt(email, false, req.ip, req.get('User-Agent'));
    throw new AppError('Something went wrong', 401);
  }

  // Validate role if provided
  if (role && user.role !== role) {
    securityLogger.loginAttempt(email, false, req.ip, req.get('User-Agent'), 'Role mismatch');
    throw new AppError('Invalid role selection for this account', 401);
  }

  // Reset login attempts
  await user.resetLoginAttempts();

  // Return user info for OTP method selection
  res.status(200).json({
    success: true,
    message: 'Credentials verified. Please select OTP method.',
    data: {
      userId: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      hasEmail: !!user.email,
      hasPhone: !!user.phoneNumber,
      role: user.role
    }
  });
});

// Send OTP for login - Step 2: Send OTP based on method
const sendLoginOTP = asyncHandler(async (req, res) => {
  const { userId, method } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  try {
    let result;
    if (method === 'email') {
      result = await otpService.sendOTP(userId, 'email');
    } else if (method === 'phone') {
      try {
        result = await otpService.sendOTP(userId, 'phone');
      } catch (smsError) {
        // If SMS fails and user has email, automatically fallback to email
        if (user.email && (smsError.message.includes('SMS service is currently unavailable') || 
            smsError.message.includes('SMS service is temporarily unavailable'))) {
          
          console.log(`SMS failed for user ${userId}, falling back to email`);
          result = await otpService.sendOTP(userId, 'email');
          
          // Update the response to indicate fallback
          res.status(200).json({
            success: true,
            message: 'SMS service is temporarily unavailable. OTP sent to your email instead.',
            data: {
              userId,
              method: 'email', // Changed to email
              originalMethod: 'phone', // Keep track of original request
              maskedContact: result.maskedContact,
              fallback: true
            }
          });
          return;
        } else {
          // Re-throw SMS errors if no email fallback available
          throw smsError;
        }
      }
    } else {
      throw new AppError('Invalid OTP method', 400);
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        userId,
        method,
        maskedContact: result.maskedContact
      }
    });
  } catch (error) {
    // Handle remaining errors
    if (error.message.includes('SMS service is currently unavailable') || 
        error.message.includes('SMS service is temporarily unavailable')) {
      throw new AppError(error.message, 503);
    } else if (error.message.includes('Invalid phone number format')) {
      throw new AppError(error.message, 400);
    } else {
      // Re-throw other errors as they are
      throw error;
    }
  }
});

// Verify OTP for login - Step 3: Verify OTP and complete login
const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { otp, userId, method } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const result = await otpService.verifyOTP(userId, otp, method);

  if (result.success) {
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    await Token.createToken(user._id, 'refresh', '30d', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Set secure cookies
    setSecureCookies(res, accessToken, refreshToken);

    // Log successful login
    securityLogger.loginAttempt(user.email, true, req.ip, req.get('User-Agent'));

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePicture: user.profilePicture,
          role: user.role,
          company: user.company
        },
        accessToken,
        refreshToken
      }
    });
  } else {
    throw new AppError(result.message, 400);
  }
});


// Logout user
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Invalidate refresh token
    await Token.findOneAndUpdate(
      { token: refreshToken, type: 'refresh' },
      { isUsed: true }
    );
  }

  // Clear cookies
  clearSecureCookies(res);

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal if user exists or not
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = expiresAt;
  await user.save();

  // Send reset email
  await emailService.sendPasswordResetEmail(user.email, resetToken);

  // Log password reset request
  securityLogger.passwordResetRequest(user.email, req.ip, req.get('User-Agent'));

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

// Change password (for authenticated users)
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

// Get current user
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


// Test SMS service (for development/testing purposes)
const testSMS = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    throw new AppError('Phone number is required', 400);
  }

  // Validate phone number format
  if (!otpService.isValidPhoneNumber(phoneNumber)) {
    throw new AppError('Invalid phone number format', 400);
  }

  // Check SMS service status
  const smsStatus = otpService.getSMSServiceStatus();
  if (!smsStatus.configured) {
    throw new AppError('SMS service is not configured', 503);
  }

  // Send test SMS
  const result = await otpService.testSMSService(phoneNumber);

  res.status(200).json({
    success: true,
    message: 'Test SMS sent successfully',
    data: {
      messageId: result.messageId,
      status: result.status,
      to: result.to,
      smsServiceStatus: smsStatus
    }
  });
});

// Get SMS service status
const getSMSStatus = asyncHandler(async (req, res) => {
  const smsStatus = otpService.getSMSServiceStatus();
  
  res.status(200).json({
    success: true,
    data: {
      smsService: smsStatus
    }
  });
});

module.exports = {
  register: [validate(registerSchema), register],
  login: [validate(loginSchema), login],
  sendLoginOTP: [validate(sendLoginOTPSchema), sendLoginOTP],
  verifyLoginOTP: [validate(verifyLoginOTPSchema), verifyLoginOTP],
  logout,
  forgotPassword: [validate(passwordResetRequestSchema), forgotPassword],
  resetPassword: [validate(passwordResetSchema), resetPassword],
  changePassword: [validate(changePasswordSchema), changePassword],
  getCurrentUser,
  testSMS,
  getSMSStatus
};
