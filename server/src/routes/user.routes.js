const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../utils/generateTokens');
const { userRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require authentication and rate limiting
router.use(authenticate);
router.use(userRateLimiter);

// User routes
router.get('/profile', userController.getCurrentUser);
router.put('/change-password', ...userController.changePassword);
router.get('/stats', userController.getUserStats);

module.exports = router;
