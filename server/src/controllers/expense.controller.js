const Expense = require('../models/Expense.model');
const Company = require('../models/Company.model');
const User = require('../models/User.model');
const ApprovalWorkflow = require('../models/ApprovalWorkflow.model');
const currencyService = require('../services/currency.service');
const notificationService = require('../services/notification.service');
const winston = require('winston');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/receipts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

class ExpenseController {
  /**
   * Submit a new expense
   */
  async submitExpense(req, res) {
    try {
      console.log('📥 Received request body:', req.body);
      console.log('📥 Request file:', req.file);
      
      // Parse currency from form data
      let currency;
      try {
        if (req.body['currency[code]']) {
          // Handle individually submitted currency fields
          currency = {
            code: req.body['currency[code]'],
            name: req.body['currency[name]'],
            symbol: req.body['currency[symbol]']
          };
        } else {
          // Try parsing currency as JSON string
          currency = typeof req.body.currency === 'string' 
            ? JSON.parse(req.body.currency)
            : req.body.currency;
        }
      } catch (err) {
        console.error('Error parsing currency:', err);
        return res.status(400).json({
          success: false,
          message: 'Invalid currency format'
        });
      }

      // Extract and parse other data from request body
      const {
        title,
        description,
        amount,
        category,
        date,
        notes,
        submissionDateTime
      } = req.body;

      // Validate required fields
      if (!title || !amount || !currency || !category || !date) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Parse amount to number if it's a string
      const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

      if (isNaN(parsedAmount)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      console.log('📋 Processed data:', {
        title,
        amount: parsedAmount,
        currency,
        category,
        date,
        description: description || '',
        notes: notes || ''
      });

      const userId = req.user.id;
      const companyId = req.user.company;

      // Get company details for base currency
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      // Convert currency if different from company base currency
      let convertedAmount = amount;
      let exchangeRate = 1;

      if (currency.code !== company.baseCurrency.code) {
        const conversion = await currencyService.convertCurrency(
          amount,
          currency.code,
          company.baseCurrency.code
        );
        convertedAmount = conversion.convertedAmount;
        exchangeRate = conversion.exchangeRate;
      }

      // Create expense
      const expense = new Expense({
        title,
        description,
        amount,
        currency,
        convertedAmount,
        exchangeRate,
        category,
        date: new Date(date),
        submittedBy: userId,
        company: companyId,
        tags: tags || [],
        notes
      });

      // Handle receipt upload if present
      if (req.file) {
        expense.receipt = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: `/uploads/receipts/${req.file.filename}`
        };
      }

      await expense.save();

      // Find applicable approval workflow
      const workflow = await ApprovalWorkflow.findApplicableWorkflow(expense, req.user);
      if (workflow) {
        expense.workflowId = workflow._id;
        
        // Check if should be auto-approved
        if (workflow.shouldAutoApprove(expense, req.user)) {
          expense.status = 'approved';
          expense.addApproval(req.user.id, 'approved', 'Auto-approved by workflow', 0);
        } else {
          expense.status = 'processing';
        }
        
        await expense.save();
      }

      const populatedExpense = await Expense.findById(expense._id)
        .populate('submittedBy', 'firstName lastName email')
        .populate('company', 'name baseCurrency')
        .populate('workflowId', 'name type');

      winston.info(`Expense submitted: ${expense.title} by user ${userId}`);

      // Send notifications to managers and finance
      try {
        const submitter = await User.findById(userId);
        await notificationService.notifyExpenseSubmission(populatedExpense, submitter);
        winston.info(`Notifications sent for expense ${expense._id}`);
      } catch (notificationError) {
        winston.error('Failed to send notifications:', notificationError);
        // Don't fail the expense submission if notifications fail
      }

      res.status(201).json({
        success: true,
        message: 'Expense submitted successfully',
        data: {
          expense: populatedExpense
        }
      });
    } catch (error) {
      winston.error('Error submitting expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit expense',
        error: error.message
      });
    }
  }

  /**
   * Get user's expenses
   */
  async getUserExpenses(req, res) {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10, dateFrom, dateTo, category } = req.query;

      const query = { submittedBy: userId };
      
      if (status) query.status = status;
      if (category) query.category = category;
      if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) query.date.$gte = new Date(dateFrom);
        if (dateTo) query.date.$lte = new Date(dateTo);
      }

      const expenses = await Expense.find(query)
        .populate('company', 'name baseCurrency')
        .populate('approvalHistory.approver', 'firstName lastName email')
        .populate('workflowId', 'name type')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Expense.countDocuments(query);

      res.json({
        success: true,
        data: {
          expenses,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      winston.error('Error fetching user expenses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses',
        error: error.message
      });
    }
  }

  /**
   * Get expenses pending approval (for managers/admins)
   */
  async getPendingExpenses(req, res) {
    try {
      const userId = req.user.id;
      const companyId = req.user.company;
      const { page = 1, limit = 10 } = req.query;

      let query = {
        company: companyId,
        status: { $in: ['pending', 'processing'] },
        submittedBy: { $ne: userId } // Cannot approve own expenses
      };

      // If user is a manager (not admin), only show expenses from their team
      if (req.user.isManager() && !req.user.isAdmin()) {
        const teamMembers = await User.getTeamMembers(userId);
        const teamMemberIds = teamMembers.map(member => member._id);
        query.submittedBy = { $in: teamMemberIds };
      }

      const expenses = await Expense.find(query)
        .populate('submittedBy', 'firstName lastName email role department')
        .populate('company', 'name baseCurrency')
        .populate('approvalHistory.approver', 'firstName lastName email')
        .populate('workflowId', 'name type')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Expense.countDocuments(query);

      res.json({
        success: true,
        data: {
          expenses,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      winston.error('Error fetching pending expenses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending expenses',
        error: error.message
      });
    }
  }

  /**
   * Approve or reject an expense
   */
  async processExpense(req, res) {
    try {
      const { expenseId } = req.params;
      const { action, comment } = req.body;
      const approverId = req.user.id;

      if (!['approved', 'rejected'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Action must be either "approved" or "rejected"'
        });
      }

      const expense = await Expense.findById(expenseId)
        .populate('submittedBy', 'firstName lastName email manager')
        .populate('workflowId');

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      // Check if user can approve this expense
      if (!expense.canBeApprovedBy(approverId)) {
        return res.status(403).json({
          success: false,
          message: 'You cannot approve this expense'
        });
      }

      // Check if user has permission to approve (only managers and finance)
      const approverRole = req.user.role;
      if (!['manager', 'finance'].includes(approverRole)) {
        return res.status(403).json({
          success: false,
          message: 'Only managers and finance personnel can approve expenses'
        });
      }

      // Check if user has already approved
      if (expense.hasUserApproved(approverId, approverRole)) {
        return res.status(400).json({
          success: false,
          message: 'You have already approved this expense'
        });
      }

      // Check if expense is already finalized
      if (expense.status === 'approved' || expense.status === 'rejected') {
        return res.status(400).json({
          success: false,
          message: 'This expense has already been finalized'
        });
      }

      // Add approval using new dual approval logic
      await expense.addApproval(approverId, approverRole, action, comment);

      const updatedExpense = await Expense.findById(expenseId)
        .populate('submittedBy', 'firstName lastName email')
        .populate('company', 'name baseCurrency')
        .populate('approvalHistory.approver', 'firstName lastName email')
        .populate('approvals.manager.approver', 'firstName lastName email')
        .populate('approvals.finance.approver', 'firstName lastName email')
        .populate('workflowId', 'name type');

      // Send notifications
      try {
        const approver = await User.findById(approverId);
        await notificationService.notifyExpenseDecision(
          updatedExpense, 
          updatedExpense.submittedBy, 
          approver, 
          action, 
          comment
        );
        winston.info(`Notifications sent for expense ${action}: ${expense._id}`);
      } catch (notificationError) {
        winston.error('Failed to send decision notifications:', notificationError);
      }

      winston.info(`Expense ${action}: ${expense.title} by ${approverRole} ${approverId}`);

      res.json({
        success: true,
        message: `Expense ${action} successfully`,
        data: {
          expense: updatedExpense,
          approvalStatus: updatedExpense.getApprovalStatus()
        }
      });
    } catch (error) {
      winston.error('Error processing expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process expense',
        error: error.message
      });
    }
  }

  /**
   * Get expense details
   */
  async getExpenseDetails(req, res) {
    try {
      const { expenseId } = req.params;
      const userId = req.user.id;

      const expense = await Expense.findById(expenseId)
        .populate('submittedBy', 'firstName lastName email role department')
        .populate('company', 'name baseCurrency')
        .populate('approvalHistory.approver', 'firstName lastName email role')
        .populate('workflowId', 'name type rules');

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      // Check if user has permission to view this expense
      const canView = expense.submittedBy._id.toString() === userId ||
        req.user.isAdmin() ||
        (req.user.isManager() && expense.submittedBy.manager?.toString() === userId);

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this expense'
        });
      }

      res.json({
        success: true,
        data: {
          expense
        }
      });
    } catch (error) {
      winston.error('Error fetching expense details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expense details',
        error: error.message
      });
    }
  }

  /**
   * Get expense statistics
   */
  async getExpenseStats(req, res) {
    try {
      const companyId = req.user.company;
      const userId = req.user.id;
      const { period = 'month' } = req.query;

      let dateFilter = {};
      const now = new Date();
      
      switch (period) {
        case 'week':
          dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
          break;
        case 'month':
          dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
          break;
        case 'year':
          dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
          break;
      }

      const baseQuery = { company: companyId };
      if (dateFilter.$gte) baseQuery.createdAt = dateFilter;

      // If user is not admin, only show their own stats
      if (!req.user.isAdmin()) {
        baseQuery.submittedBy = userId;
      }

      const stats = await Expense.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$convertedAmount' }
          }
        }
      ]);

      const categoryStats = await Expense.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalAmount: { $sum: '$convertedAmount' }
          }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 }
      ]);

      const result = {
        summary: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          totalAmount: 0
        },
        categories: categoryStats
      };

      stats.forEach(stat => {
        result.summary[stat._id] = stat.count;
        result.summary.total += stat.count;
        result.summary.totalAmount += stat.totalAmount;
      });

      res.json({
        success: true,
        data: {
          stats: result,
          period
        }
      });
    } catch (error) {
      winston.error('Error fetching expense stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expense statistics',
        error: error.message
      });
    }
  }

  /**
   * Update expense (only if pending and by submitter)
   */
  async updateExpense(req, res) {
    try {
      const { expenseId } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      // Only submitter can update and only if pending
      if (expense.submittedBy.toString() !== userId || expense.status !== 'pending') {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own pending expenses'
        });
      }

      // Recalculate converted amount if amount or currency changed
      if (updates.amount || updates.currency) {
        const company = await Company.findById(req.user.company);
        const currency = updates.currency || expense.currency;
        const amount = updates.amount || expense.amount;

        if (currency.code !== company.baseCurrency.code) {
          const conversion = await currencyService.convertCurrency(
            amount,
            currency.code,
            company.baseCurrency.code
          );
          updates.convertedAmount = conversion.convertedAmount;
          updates.exchangeRate = conversion.exchangeRate;
        } else {
          updates.convertedAmount = amount;
          updates.exchangeRate = 1;
        }
      }

      const updatedExpense = await Expense.findByIdAndUpdate(
        expenseId,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('submittedBy', 'firstName lastName email')
        .populate('company', 'name baseCurrency');

      winston.info(`Expense updated: ${updatedExpense.title} by user ${userId}`);

      res.json({
        success: true,
        message: 'Expense updated successfully',
        data: {
          expense: updatedExpense
        }
      });
    } catch (error) {
      winston.error('Error updating expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update expense',
        error: error.message
      });
    }
  }

  /**
   * Delete expense (only if pending and by submitter)
   */
  async deleteExpense(req, res) {
    try {
      const { expenseId } = req.params;
      const userId = req.user.id;

      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      // Only submitter can delete and only if pending
      if (expense.submittedBy.toString() !== userId || expense.status !== 'pending') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own pending expenses'
        });
      }

      await Expense.findByIdAndDelete(expenseId);

      winston.info(`Expense deleted: ${expense.title} by user ${userId}`);

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      winston.error('Error deleting expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete expense',
        error: error.message
      });
    }
  }
}

// Export both the controller and upload middleware
module.exports = {
  controller: new ExpenseController(),
  upload: upload.single('receipt')
};
