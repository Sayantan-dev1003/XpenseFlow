const passport = require('passport');
const User = require('../models/User.model');
const Token = require('../models/Token.model');
const { generateTokens } = require('../utils/generateTokens');
const emailService = require('../services/email.service');

// Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken } = generateTokens(req.user._id);

    // Save refresh token
    await Token.createToken(req.user._id, 'refresh', '30d', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Send welcome email for new users
    if (req.user.authProvider === 'google' && req.user.createdAt > new Date(Date.now() - 60000)) {
      await emailService.sendWelcomeEmail(req.user.email, req.user.firstName);
    }

    // Redirect to frontend with tokens
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/success?token=${accessToken}&refresh=${refreshToken}`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
  }
};

// Google OAuth failure
const googleFailure = (req, res) => {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Google authentication failed')}`);
};

// GitHub OAuth callback
const githubCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken } = generateTokens(req.user._id);

    // Save refresh token
    await Token.createToken(req.user._id, 'refresh', '30d', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Send welcome email for new users
    if (req.user.authProvider === 'github' && req.user.createdAt > new Date(Date.now() - 60000)) {
      await emailService.sendWelcomeEmail(req.user.email, req.user.firstName);
    }

    // Redirect to frontend with tokens
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/success?token=${accessToken}&refresh=${refreshToken}`);
  } catch (error) {
    console.error('GitHub callback error:', error);
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
  }
};

// GitHub OAuth failure
const githubFailure = (req, res) => {
  const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('GitHub authentication failed')}`);
};

module.exports = {
  googleCallback,
  googleFailure,
  githubCallback,
  githubFailure
};