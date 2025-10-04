const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const companyRoutes = require('./company.routes');
const expenseRoutes = require('./expense.routes');
const workflowRoutes = require('./workflow.routes');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/company', companyRoutes);
router.use('/expenses', expenseRoutes);
router.use('/workflows', workflowRoutes);

module.exports = router;
