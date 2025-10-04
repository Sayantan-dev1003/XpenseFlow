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

// Admin-only user management routes
router.post('/create', ...userController.createUser);
router.get('/company', userController.getCompanyUsers);
router.get('/managers', userController.getManagers);

module.exports = router;
