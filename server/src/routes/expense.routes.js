const express = require('express');
const multer = require('multer');
const expenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { parseFormData } = require('../middleware/formdata.middleware');
const Joi = require('joi');

const router = express.Router();

// Configure multer for memory storage to accept receipt image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Validation schemas
const getAllExpensesSchema = {
  query: Joi.object({
    status: Joi.string().valid('all', 'pending', 'approved', 'rejected', 'processing').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    sort: Joi.string().valid('asc', 'desc').optional()
  })
};

const receiptUploadSchema = {
  body: Joi.object({
    companyId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    category: Joi.string().optional().trim(),
    notes: Joi.string().optional().trim().max(500)
  })
};

const updateReceiptDataSchema = {
  params: Joi.object({
    expenseId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
  }),
  body: Joi.object({
    title: Joi.string().optional().trim().max(100),
    description: Joi.string().optional().trim().max(500),
    amount: Joi.number().optional().min(0.01),
    category: Joi.string().optional().trim(),
    expenseDateTime: Joi.date().optional().iso(),
    currency: Joi.object({
      code: Joi.string().length(3).uppercase(),
      name: Joi.string(),
      symbol: Joi.string()
    }).optional()
  })
};
const submitExpenseSchema = {
  body: Joi.object({
    title: Joi.string().required().trim().max(100),
    description: Joi.string().optional().trim().max(500),
    amount: Joi.number().required().min(0.01),
    // Currency can be inferred from location if not provided
    currency: Joi.object({
      code: Joi.string().length(3).uppercase(),
      name: Joi.string(),
      symbol: Joi.string()
    }).optional(),
    // Optional hints from client OCR
    locationCountry: Joi.string().optional().trim(),
    ocrData: Joi.object().optional(),
    category: Joi.string().required().trim(),
    date: Joi.date().required()
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
    date: Joi.date().optional()
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
router.post('/', upload.single('receipt'), parseFormData, validate(submitExpenseSchema), expenseController.submitExpense);
router.get('/my-expenses', validate(querySchema), expenseController.getUserExpenses);

// Expense management routes
router.get('/pending', validate(querySchema), expenseController.getPendingExpenses);
// Get all expenses
router.get('/', authenticate, validate(getAllExpensesSchema), expenseController.getAllExpenses);

// Get expense routes
router.get('/stats', authenticate, expenseController.getExpenseStats);

// Individual expense routes
router.get('/:expenseId', expenseController.getExpenseDetails);
router.put('/:expenseId', validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:expenseId', expenseController.deleteExpense);

// Approval routes
// Process expense report for a specific expense
router.post('/:expenseId/process', authenticate, validate(processExpenseSchema), expenseController.processExpense);

// Receipt processing routes
router.post(
  '/upload-receipt',
  authenticate,
  upload.single('receipt'),
  validate(receiptUploadSchema),
  expenseController.uploadReceipt
);

router.patch(
  '/receipt/:expenseId',
  authenticate,
  validate(updateReceiptDataSchema),
  expenseController.updateExpenseWithReceiptData
);

module.exports = router;