const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

module.exports = router;
