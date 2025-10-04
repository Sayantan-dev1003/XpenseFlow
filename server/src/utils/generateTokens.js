const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const Token = require('../models/Token.model');
const config = require('../config');
const { securityLogger } = require('./logger');

// Generate JWT tokens
const generateTokens = (userId) => {
  const payload = { userId };
  
  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
  
  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRE
  });
  
  return { accessToken, refreshToken };
};

// Generate secure refresh token with rotation
const generateSecureRefreshToken = async (userId, req) => {
  // Generate a cryptographically secure random token
  const tokenValue = crypto.randomBytes(32).toString('hex');
  
  // Create token document
  const tokenDoc = await Token.createToken(
    userId, 
    'refresh', 
    config.JWT_REFRESH_EXPIRE,
    {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      tokenValue: tokenValue
    }
  );
  
  return tokenValue;
};

// Set secure HTTP-only cookies
const setSecureCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access token cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });

  // Refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/'
  });
};

// Clear secure cookies
const clearSecureCookies = (res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

// Verify JWT token
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Authentication middleware with enhanced security
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check for token in cookies (preferred method)
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token, config.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (token) {
      const decoded = verifyToken(token, config.JWT_SECRET);
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

// Enhanced refresh token middleware with rotation
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }
    
    // Verify refresh token
    const decoded = verifyToken(token, config.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }
    
    // Check if refresh token exists in database
    const tokenDoc = await Token.findOne({
      userId: decoded.userId,
      token,
      type: 'refresh',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found or expired.'
      });
    }
    
    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    
    // Mark old refresh token as used
    tokenDoc.isUsed = true;
    await tokenDoc.save();
    
    // Save new refresh token
    await Token.createToken(user._id, 'refresh', config.JWT_REFRESH_EXPIRE, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Log token refresh
    securityLogger.tokenRefresh(user._id, req.ip, req.get('User-Agent'));
    
    req.user = user;
    req.tokens = { accessToken, refreshToken: newRefreshToken };
    next();
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token refresh.'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }
    
    next();
  };
};

// Generate secure random token for password reset
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate secure random token for email verification
const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateTokens,
  generateSecureRefreshToken,
  setSecureCookies,
  clearSecureCookies,
  verifyToken,
  authenticate,
  optionalAuth,
  refreshToken,
  authorize,
  generateSecureToken,
  generateEmailVerificationToken
};
