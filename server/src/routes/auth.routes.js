const express = require('express');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const { authenticate, refreshToken } = require('../utils/generateTokens');
const { 
  authLimiter, 
  passwordResetLimiter, 
  registrationLimiter,
  userRateLimiter 
} = require('../middleware/rateLimiter');

const router = express.Router();

// Authentication routes with rate limiting
router.post('/register', registrationLimiter, ...authController.register);
router.post('/login', authLimiter, ...authController.login);
router.post('/logout', authenticate, authController.logout);


// Password reset routes
router.post('/forgot-password', passwordResetLimiter, ...authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);


// Token refresh
router.post('/refresh-token', refreshToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: req.tokens.accessToken,
      refreshToken: req.tokens.refreshToken
    }
  });
});

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);


module.exports = router;