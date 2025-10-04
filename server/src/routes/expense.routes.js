const express = require('express');
const { controller: expenseController, upload } = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const submitExpenseSchema = {
  body: Joi.object({
    title: Joi.string().required().trim().max(100),
    description: Joi.string().optional().trim().max(500),
    amount: Joi.number().required().min(0.01),
    currency: Joi.object({
      code: Joi.string().required().length(3).uppercase(),
      name: Joi.string().optional(),
      symbol: Joi.string().optional()
    }).required(),
    category: Joi.string().required().trim(),
    date: Joi.date().required(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    notes: Joi.string().optional().trim().max(1000)
  })
};

const processExpenseSchema = {
  body: Joi.object({
    action: Joi.string().required().valid('approved', 'rejected'),
    comment: Joi.string().optional().trim().max(500)
  })
};

const updateExpenseSchema = {
  body: Joi.object({
    title: Joi.string().optional().trim().max(100),
    description: Joi.string().optional().trim().max(500),
    amount: Joi.number().optional().min(0.01),
    currency: Joi.object({
      code: Joi.string().required().length(3).uppercase(),
      name: Joi.string().optional(),
      symbol: Joi.string().optional()
    }).optional(),
    category: Joi.string().optional().trim(),
    date: Joi.date().optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    notes: Joi.string().optional().trim().max(1000)
  })
};

const querySchema = {
  query: Joi.object({
    status: Joi.string().optional().valid('pending', 'approved', 'rejected', 'processing'),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    category: Joi.string().optional(),
    period: Joi.string().optional().valid('week', 'month', 'year')
  })
};

// Apply authentication to all routes
router.use(authenticate);

// Expense submission routes
router.post('/', upload, validate(submitExpenseSchema), expenseController.submitExpense);
router.get('/my-expenses', validate(querySchema), expenseController.getUserExpenses);

// Expense management routes
router.get('/pending', validate(querySchema), expenseController.getPendingExpenses);
router.get('/stats', validate(querySchema), expenseController.getExpenseStats);

// Individual expense routes
router.get('/:expenseId', expenseController.getExpenseDetails);
router.put('/:expenseId', validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:expenseId', expenseController.deleteExpense);

// Approval routes
router.post('/:expenseId/process', validate(processExpenseSchema), expenseController.processExpense);

module.exports = router;
