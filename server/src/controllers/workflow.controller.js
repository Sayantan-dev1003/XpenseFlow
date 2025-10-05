const ApprovalWorkflow = require('../models/ApprovalWorkflow.model');
const User = require('../models/User.model');
const winston = require('winston');

class WorkflowController {
  /**
   * Create a new approval workflow (Admin only)
   */
  async createWorkflow(req, res) {
    try {
      const {
        name,
        description,
        type,
        conditions,
        rules,
        levels,
        priority
      } = req.body;

      const companyId = req.user.company;
      const userId = req.user.id;

      // Only admins can create workflows
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can create approval workflows'
        });
      }

      // Validate approvers exist and belong to the same company
      const allApproverIds = [];
      
      if (rules.percentage?.eligibleApprovers) {
        allApproverIds.push(...rules.percentage.eligibleApprovers);
      }
      
      if (rules.specificApprover?.approver) {
        allApproverIds.push(rules.specificApprover.approver);
      }
      
      if (rules.hybrid?.percentage?.eligibleApprovers) {
        allApproverIds.push(...rules.hybrid.percentage.eligibleApprovers);
      }
      
      if (rules.hybrid?.specificApprover?.approver) {
        allApproverIds.push(rules.hybrid.specificApprover.approver);
      }

      if (levels) {
        levels.forEach(level => {
          if (level.approvers) {
            allApproverIds.push(...level.approvers);
          }
        });
      }

      if (allApproverIds.length > 0) {
        const approvers = await User.find({
          _id: { $in: allApproverIds },
          company: companyId,
          isActive: true
        });

        if (approvers.length !== allApproverIds.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more approvers are invalid or not from the same company'
          });
        }
      }

      const workflow = new ApprovalWorkflow({
        name,
        description,
        company: companyId,
        type,
        conditions,
        rules,
        levels,
        priority: priority || 0,
        createdBy: userId
      });

      await workflow.save();

      const populatedWorkflow = await ApprovalWorkflow.findById(workflow._id)
        .populate('rules.percentage.eligibleApprovers', 'firstName lastName email role')
        .populate('rules.specificApprover.approver', 'firstName lastName email role')
        .populate('rules.hybrid.percentage.eligibleApprovers', 'firstName lastName email role')
        .populate('rules.hybrid.specificApprover.approver', 'firstName lastName email role')
        .populate('levels.approvers', 'firstName lastName email role')
        .populate('createdBy', 'firstName lastName email');

      winston.info(`Approval workflow created: ${workflow.name} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Approval workflow created successfully',
        data: {
          workflow: populatedWorkflow
        }
      });
    } catch (error) {
      winston.error('Error creating workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create approval workflow',
        error: error.message
      });
    }
  }

  /**
   * Get all workflows for the company
   */
  async getWorkflows(req, res) {
    try {
      const companyId = req.user.company;
      const { page = 1, limit = 10, isActive } = req.query;

      const query = { company: companyId };
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const workflows = await ApprovalWorkflow.find(query)
        .populate('rules.percentage.eligibleApprovers', 'firstName lastName email role')
        .populate('rules.specificApprover.approver', 'firstName lastName email role')
        .populate('rules.hybrid.percentage.eligibleApprovers', 'firstName lastName email role')
        .populate('rules.hybrid.specificApprover.approver', 'firstName lastName email role')
        .populate('levels.approvers', 'firstName lastName email role')
        .populate('createdBy', 'firstName lastName email')
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await ApprovalWorkflow.countDocuments(query);

      res.json({
        success: true,
        data: {
          workflows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      winston.error('Error fetching workflows:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch approval workflows',
        error: error.message
      });
    }
  }

  /**
   * Get workflow details
   */
  async getWorkflowDetails(req, res) {
    try {
      const { workflowId } = req.params;
      const companyId = req.user.company;

      const workflow = await ApprovalWorkflow.findOne({
        _id: workflowId,
        company: companyId
      })
        .populate('rules.percentage.eligibleApprovers', 'firstName lastName email role')
        .populate('rules.specificApprover.approver', 'firstName lastName email role')
        .populate('rules.hybrid.percentage.eligibleApprovers', 'firstName lastName email role')
        .populate('rules.hybrid.specificApprover.approver', 'firstName lastName email role')
        .populate('levels.approvers', 'firstName lastName email role')
        .populate('createdBy', 'firstName lastName email');

      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: 'Approval workflow not found'
        });
      }

      res.json({
        success: true,
        data: {
          workflow
        }
      });
    } catch (error) {
      winston.error('Error fetching workflow details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch workflow details',
        error: error.message
      });
    }
  }

  /**
   * Update workflow (Admin only)
   */
  async updateWorkflow(req, res) {
    try {
      const { workflowId } = req.params;
      const updates = req.body;
      const companyId = req.user.company;

      // Only admins can update workflows
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can update approval workflows'
        });
      }

      const workflow = await ApprovalWorkflow.findOne({
        _id: workflowId,
        company: companyId
      });

      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: 'Approval workflow not found'
        });
      }

      // Validate approvers if being updated
      if (updates.rules || updates.levels) {
        const allApproverIds = [];
        
        const rules = updates.rules || workflow.rules;
        const levels = updates.levels || workflow.levels;

        if (rules.percentage?.eligibleApprovers) {
          allApproverIds.push(...rules.percentage.eligibleApprovers);
        }
        
        if (rules.specificApprover?.approver) {
          allApproverIds.push(rules.specificApprover.approver);
        }
        
        if (rules.hybrid?.percentage?.eligibleApprovers) {
          allApproverIds.push(...rules.hybrid.percentage.eligibleApprovers);
        }
        
        if (rules.hybrid?.specificApprover?.approver) {
          allApproverIds.push(rules.hybrid.specificApprover.approver);
        }

        if (levels) {
          levels.forEach(level => {
            if (level.approvers) {
              allApproverIds.push(...level.approvers);
            }
          });
        }

        if (allApproverIds.length > 0) {
          const approvers = await User.find({
            _id: { $in: allApproverIds },
            company: companyId,
            isActive: true
          });

          if (approvers.length !== allApproverIds.length) {
            return res.status(400).json({
              success: false,
              message: 'One or more approvers are invalid or not from the same company'
            });
          }
        }
      }

      const updatedWorkflow = await ApprovalWorkflow.findByIdAndUpdate(
        workflowId,
        { $set: updates },
        { new: true, runValidators: true }
      )
        .populate('rules.percentage.eligibleApprovers', 'firstName lastName email role')
        .populate('rules.specificApprover.approver', 'firstName lastName email role')
        .populate('rules.hybrid.percentage.eligibleApprovers', 'firstName lastName email role')
        .populate('rules.hybrid.specificApprover.approver', 'firstName lastName email role')
        .populate('levels.approvers', 'firstName lastName email role')
        .populate('createdBy', 'firstName lastName email');

      winston.info(`Approval workflow updated: ${updatedWorkflow.name} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Approval workflow updated successfully',
        data: {
          workflow: updatedWorkflow
        }
      });
    } catch (error) {
      winston.error('Error updating workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update approval workflow',
        error: error.message
      });
    }
  }

  /**
   * Delete workflow (Admin only)
   */
  async deleteWorkflow(req, res) {
    try {
      const { workflowId } = req.params;
      const companyId = req.user.company;

      // Only admins can delete workflows
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can delete approval workflows'
        });
      }

      const workflow = await ApprovalWorkflow.findOneAndDelete({
        _id: workflowId,
        company: companyId
      });

      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: 'Approval workflow not found'
        });
      }

      winston.info(`Approval workflow deleted: ${workflow.name} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Approval workflow deleted successfully'
      });
    } catch (error) {
      winston.error('Error deleting workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete approval workflow',
        error: error.message
      });
    }
  }

  /**
   * Toggle workflow active status (Admin only)
   */
  async toggleWorkflowStatus(req, res) {
    try {
      const { workflowId } = req.params;
      const companyId = req.user.company;

      // Only admins can toggle workflow status
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can toggle workflow status'
        });
      }

      const workflow = await ApprovalWorkflow.findOne({
        _id: workflowId,
        company: companyId
      });

      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: 'Approval workflow not found'
        });
      }

      workflow.isActive = !workflow.isActive;
      await workflow.save();

      winston.info(`Approval workflow ${workflow.isActive ? 'activated' : 'deactivated'}: ${workflow.name}`);

      res.json({
        success: true,
        message: `Approval workflow ${workflow.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          workflow: {
            id: workflow._id,
            name: workflow.name,
            isActive: workflow.isActive
          }
        }
      });
    } catch (error) {
      winston.error('Error toggling workflow status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle workflow status',
        error: error.message
      });
    }
  }

  /**
   * Get eligible approvers for workflow creation
   */
  async getEligibleApprovers(req, res) {
    try {
      const companyId = req.user.company;

      const approvers = await User.find({
        company: companyId,
        role: { $in: ['admin', 'manager'] },
        isActive: true
      }).select('firstName lastName email role');

      res.json({
        success: true,
        data: {
          approvers
        }
      });
    } catch (error) {
      winston.error('Error fetching eligible approvers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch eligible approvers',
        error: error.message
      });
    }
  }

  /**
   * Test workflow against sample expense data
   */
  async testWorkflow(req, res) {
    try {
      const { workflowId } = req.params;
      const { sampleExpense } = req.body;
      const companyId = req.user.company;

      const workflow = await ApprovalWorkflow.findOne({
        _id: workflowId,
        company: companyId
      }).populate('rules.percentage.eligibleApprovers', 'firstName lastName email role')
        .populate('rules.specificApprover.approver', 'firstName lastName email role');

      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: 'Approval workflow not found'
        });
      }

      // Create a mock user for testing
      const mockUser = {
        role: sampleExpense.userRole || 'employee',

      };

      // Create a mock expense
      const mockExpense = {
        convertedAmount: sampleExpense.amount || 100,
        category: sampleExpense.category || 'General',
        submittedBy: req.user.id
      };

      // Test if workflow applies
      const applies = workflow.appliesTo(mockExpense, mockUser);
      
      let result = {
        applies,
        workflowType: workflow.type,
        workflowName: workflow.name
      };

      if (applies) {
        if (workflow.type === 'percentage') {
          result.percentageRule = {
            requiredPercentage: workflow.rules.percentage.required,
            eligibleApprovers: workflow.rules.percentage.eligibleApprovers.length,
            approversList: workflow.rules.percentage.eligibleApprovers
          };
        } else if (workflow.type === 'specific_approver') {
          result.specificApproverRule = {
            approver: workflow.rules.specificApprover.approver,
            autoApprove: workflow.rules.specificApprover.autoApprove
          };
        } else if (workflow.type === 'hybrid') {
          result.hybridRule = {
            primaryRule: workflow.rules.hybrid.primaryRule,
            fallbackRule: workflow.rules.hybrid.fallbackRule
          };
        }

        if (workflow.levels && workflow.levels.length > 0) {
          result.approvalLevels = workflow.levels.map(level => ({
            level: level.level,
            name: level.name,
            approvers: level.approvers.length,
            requiredApprovals: level.requiredApprovals,
            isOptional: level.isOptional
          }));
        }
      }

      res.json({
        success: true,
        data: {
          testResult: result
        }
      });
    } catch (error) {
      winston.error('Error testing workflow:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test workflow',
        error: error.message
      });
    }
  }
}

module.exports = new WorkflowController();
