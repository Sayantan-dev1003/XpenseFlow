const express = require('express');
const companyController = require('../controllers/company.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createCompanySchema = {
  body: Joi.object({
    name: Joi.string().required().trim().max(100),
    country: Joi.string().required().trim(),
    industry: Joi.string().optional().trim(),
    website: Joi.string().optional().uri(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional()
  })
};

const updateCompanySchema = {
  body: Joi.object({
    name: Joi.string().optional().trim().max(100),
    country: Joi.string().optional().trim(),
    industry: Joi.string().optional().trim(),
    website: Joi.string().optional().uri(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional()
  })
};

const updateCategoriesSchema = {
  body: Joi.object({
    categories: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        description: Joi.string().optional(),
        isActive: Joi.boolean().optional()
      })
    ).required()
  })
};

const updateSettingsSchema = {
  body: Joi.object({
    settings: Joi.object({
      expenseCategories: Joi.array().items(
        Joi.object({
          name: Joi.string().required().trim(),
          description: Joi.string().optional(),
          isActive: Joi.boolean().optional()
        })
      ).optional(),
      expenseLimits: Joi.object({
        dailyLimit: Joi.number().min(0).optional(),
        monthlyLimit: Joi.number().min(0).optional()
      }).optional(),
      approvalSettings: Joi.object({
        requireApprovalAbove: Joi.number().min(0).optional(),
        autoApproveBelow: Joi.number().min(0).optional()
      }).optional()
    }).required()
  })
};

// Apply authentication to all routes
router.use(authenticate);

// Company management routes
router.post('/', validate(createCompanySchema), companyController.createCompany);
router.get('/', companyController.getCompany);
router.put('/', validate(updateCompanySchema), companyController.updateCompany);
router.get('/stats', companyController.getCompanyStats);

// Currency routes
router.get('/currencies', companyController.getSupportedCurrencies);
router.get('/exchange-rates', companyController.getExchangeRates);

// Company settings routes
router.put('/categories', validate(updateCategoriesSchema), companyController.updateExpenseCategories);
router.put('/settings', validate(updateSettingsSchema), companyController.updateCompanySettings);

module.exports = router;
