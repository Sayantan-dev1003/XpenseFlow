const express = require('express');
const workflowController = require('../controllers/workflow.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createWorkflowSchema = {
  body: Joi.object({
    name: Joi.string().required().trim().max(100),
    description: Joi.string().optional().trim().max(500),
    type: Joi.string().required().valid('percentage', 'specific_approver', 'hybrid'),
    conditions: Joi.object({
      minAmount: Joi.number().min(0).optional(),
      maxAmount: Joi.number().min(0).optional(),
      categories: Joi.array().items(Joi.string().trim()).optional(),
      departments: Joi.array().items(Joi.string().trim()).optional(),
      roles: Joi.array().items(Joi.string().valid('admin', 'manager', 'employee')).optional()
    }).optional(),
    rules: Joi.object({
      percentage: Joi.object({
        required: Joi.number().min(1).max(100).optional(),
        eligibleApprovers: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
      }).optional(),
      specificApprover: Joi.object({
        approver: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        autoApprove: Joi.boolean().optional()
      }).optional(),
      hybrid: Joi.object({
        primaryRule: Joi.string().valid('percentage', 'specific_approver').optional(),
        fallbackRule: Joi.string().valid('percentage', 'specific_approver').optional(),
        percentage: Joi.object({
          required: Joi.number().min(1).max(100).optional(),
          eligibleApprovers: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
        }).optional(),
        specificApprover: Joi.object({
          approver: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
          autoApprove: Joi.boolean().optional()
        }).optional()
      }).optional()
    }).required(),
    levels: Joi.array().items(
      Joi.object({
        level: Joi.number().integer().min(0).required(),
        name: Joi.string().required().trim(),
        approvers: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
        requiredApprovals: Joi.number().integer().min(1).optional(),
        isOptional: Joi.boolean().optional()
      })
    ).optional(),
    priority: Joi.number().integer().min(0).optional()
  })
};

const updateWorkflowSchema = {
  body: Joi.object({
    name: Joi.string().optional().trim().max(100),
    description: Joi.string().optional().trim().max(500),
    type: Joi.string().optional().valid('percentage', 'specific_approver', 'hybrid'),
    conditions: Joi.object({
      minAmount: Joi.number().min(0).optional(),
      maxAmount: Joi.number().min(0).optional(),
      categories: Joi.array().items(Joi.string().trim()).optional(),
      departments: Joi.array().items(Joi.string().trim()).optional(),
      roles: Joi.array().items(Joi.string().valid('admin', 'manager', 'employee')).optional()
    }).optional(),
    rules: Joi.object({
      percentage: Joi.object({
        required: Joi.number().min(1).max(100).optional(),
        eligibleApprovers: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
      }).optional(),
      specificApprover: Joi.object({
        approver: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        autoApprove: Joi.boolean().optional()
      }).optional(),
      hybrid: Joi.object({
        primaryRule: Joi.string().valid('percentage', 'specific_approver').optional(),
        fallbackRule: Joi.string().valid('percentage', 'specific_approver').optional(),
        percentage: Joi.object({
          required: Joi.number().min(1).max(100).optional(),
          eligibleApprovers: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional()
        }).optional(),
        specificApprover: Joi.object({
          approver: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
          autoApprove: Joi.boolean().optional()
        }).optional()
      }).optional()
    }).optional(),
    levels: Joi.array().items(
      Joi.object({
        level: Joi.number().integer().min(0).required(),
        name: Joi.string().required().trim(),
        approvers: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
        requiredApprovals: Joi.number().integer().min(1).optional(),
        isOptional: Joi.boolean().optional()
      })
    ).optional(),
    priority: Joi.number().integer().min(0).optional(),
    isActive: Joi.boolean().optional()
  })
};

const querySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    isActive: Joi.boolean().optional()
  })
};

const testWorkflowSchema = {
  body: Joi.object({
    sampleExpense: Joi.object({
      amount: Joi.number().min(0.01).required(),
      category: Joi.string().optional(),
      userRole: Joi.string().valid('admin', 'manager', 'employee').optional(),
      userDepartment: Joi.string().optional()
    }).required()
  })
};

// Apply authentication to all routes
router.use(authenticate);

// Workflow management routes
router.post('/', validate(createWorkflowSchema), workflowController.createWorkflow);
router.get('/', validate(querySchema), workflowController.getWorkflows);
router.get('/approvers', workflowController.getEligibleApprovers);

// Individual workflow routes
router.get('/:workflowId', workflowController.getWorkflowDetails);
router.put('/:workflowId', validate(updateWorkflowSchema), workflowController.updateWorkflow);
router.delete('/:workflowId', workflowController.deleteWorkflow);
router.patch('/:workflowId/toggle', workflowController.toggleWorkflowStatus);
router.post('/:workflowId/test', validate(testWorkflowSchema), workflowController.testWorkflow);

module.exports = router;
