const User = require('../models/User.model');
const Token = require('../models/Token.model');
const Company = require('../models/Company.model');
const mongoose = require('mongoose');
const axios = require('axios');
const config = require('../config');
const {
  generateTokens,
  setSecureCookies,
  clearSecureCookies,
  generateSecureToken,
  generateEmployeeId,
  generateCompanyId
} = require('../utils/generateTokens');
const currencyService = require('../services/currency.service');
const { securityLogger } = require('../utils/logger');
const { asyncHandler, AppError } = require('../middleware/error.middleware');
const {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,
  validate
} = require('../middleware/validation');

// Register user
const register = asyncHandler(async (req, res) => {
  const {
    // Admin details
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    dateOfBirth,
    gender,

    // Company details
    companyName,
    address,
    industry
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  // Generate unique IDs
  const employeeId = generateEmployeeId(companyName);
  const companyId = generateCompanyId(companyName);

  // Fetch currency data for the country
  let baseCurrency;
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    const countryData = response.data.find(country =>
      country.name.common === address.country ||
      country.name.official === address.country ||
      Object.values(country.name.nativeName || {}).some(
        name => name.common === address.country || name.official === address.country
      )
    );

    if (countryData && countryData.currencies) {
      const currencyCode = Object.keys(countryData.currencies)[0];
      const currency = countryData.currencies[currencyCode];
      baseCurrency = {
        code: currencyCode,
        name: currency.name,
        symbol: currency.symbol
      };
    } else {
      // Default to USD if currency not found
      baseCurrency = {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$'
      };
    }
  } catch (error) {
    console.error('Error fetching currency data:', error);
    // Default to USD in case of API failure
    baseCurrency = {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$'
    };
  }

  // Use transaction to ensure data consistency
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
          dateOfBirth,
          gender,
          authProvider: 'local',
          role: 'admin',
          employeeId // <-- Save generated employeeId
          // company field is intentionally omitted initially
        }, { session });

        await newUser.save({ session });

        // Step 2: Create company with the user ID as createdBy
        const newCompany = new Company({
          name: companyName,
          country: address.country || 'United States',
          baseCurrency: baseCurrency,
          address,
          industry,
          createdBy: newUser._id, // Now we have the actual user ID
          companyId, // <-- Save generated companyId
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
        employeeId: user.employeeId, // <-- Return employeeId
        company: company ? {
          id: company._id,
          name: company.name,
          baseCurrency: company.baseCurrency,
          companyId: company.companyId // <-- Return companyId
        } : null
      },
      accessToken,
      refreshToken
    }
  });
});

// Login user - Simple login with credentials
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    securityLogger.loginAttempt(email, false, req.ip, req.get('User-Agent'));
    throw new AppError('Invalid email or password', 401);
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
    throw new AppError('Invalid email or password', 401);
  }

  // Reset login attempts
  await user.resetLoginAttempts();

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
      }
    }
  });
});



// Logout user
const logout = asyncHandler(async (req, res) => {
  // Get refresh token from cookies
  const refreshToken = req.cookies?.refreshToken;

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

  // Note: Email service removed - password reset functionality disabled

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



module.exports = {
  register: [validate(registerSchema), register],
  login: [validate(loginSchema), login],
  logout,
  forgotPassword: [validate(passwordResetRequestSchema), forgotPassword],
  resetPassword: [validate(passwordResetSchema), resetPassword],
  changePassword: [validate(changePasswordSchema), changePassword],
  getCurrentUser
};
