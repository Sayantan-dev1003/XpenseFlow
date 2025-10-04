const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const oauthController = require('../controllers/oauth.controller');
const userController = require('../controllers/user.controller');
const { authenticate, refreshToken } = require('../utils/generateTokens');
const { 
  authLimiter, 
  otpLimiter, 
  passwordResetLimiter, 
  registrationLimiter,
  userRateLimiter 
} = require('../middleware/rateLimiter');

const router = express.Router();

// Authentication routes with rate limiting
router.post('/register', registrationLimiter, ...authController.register);
router.post('/login', authLimiter, ...authController.login);
router.post('/send-login-otp', otpLimiter, ...authController.sendLoginOTP);
router.post('/verify-login-otp', otpLimiter, ...authController.verifyLoginOTP);
router.post('/logout', authenticate, authController.logout);


// Password reset routes
router.post('/forgot-password', passwordResetLimiter, ...authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  oauthController.googleCallback
);
router.get('/google/failure', oauthController.googleFailure);

// GitHub OAuth (Optional - only if credentials are configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
  router.get('/github/callback', 
    passport.authenticate('github', { failureRedirect: '/api/auth/github/failure' }),
    oauthController.githubCallback
  );
  router.get('/github/failure', oauthController.githubFailure);
}

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

// SMS service endpoints (for testing/development)
router.post('/test-sms', authController.testSMS);
router.get('/sms-status', authController.getSMSStatus);

module.exports = router;