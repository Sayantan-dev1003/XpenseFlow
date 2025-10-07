const Expense = require('../models/Expense.model');
const Company = require('../models/Company.model');
const User = require('../models/User.model');
const ApprovalWorkflow = require('../models/ApprovalWorkflow.model');
const currencyService = require('../services/currency.service');
const receiptService = require('../services/receipt.service');
const notificationService = require('../services/notification.service');
const winston = require('winston');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (for OCR processing)
const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

class ExpenseController {
  constructor() {
    // Bind methods to ensure proper 'this' context
    this.getAllExpenses = this.getAllExpenses.bind(this);
    this.uploadReceipt = this.uploadReceipt.bind(this);
    this.updateExpenseWithReceiptData = this.updateExpenseWithReceiptData.bind(this);
    this.submitExpense = this.submitExpense.bind(this);
    this.getUserExpenses = this.getUserExpenses.bind(this);
    this.getPendingExpenses = this.getPendingExpenses.bind(this);
    this.processExpense = this.processExpense.bind(this);
    this.getExpenseDetails = this.getExpenseDetails.bind(this);
    this.getExpenseStats = this.getExpenseStats.bind(this);
    this.updateExpense = this.updateExpense.bind(this);
    this.deleteExpense = this.deleteExpense.bind(this);
  }

  /**
   * Get all expenses with optional filters
   */
  async getAllExpenses(req, res) {
    try {
      const { status, sort = 'desc' } = req.query;
      const filters = {};

      // If the user is a manager, only show expenses from their team members.
      if (req.user.role === 'manager') {
        const teamMembers = await User.find({ manager: req.user._id });
        const teamMemberIds = teamMembers.map(member => member._id);
        filters.submittedBy = { $in: teamMemberIds };
      } else if (req.user.role !== 'admin' && req.user.role !== 'finance') {
        filters.submittedBy = req.user._id;
      }
      
      // Add status filter if provided
      if (status && status !== 'all') {
        filters.status = status;
      } else if (status === 'all') {
        filters.status = { $in: ['pending', 'approved', 'processing', 'rejected'] };
      }

      // Create and execute the query with proper error handling
      const expenses = await Expense.find(filters)
        .populate({
          path: 'submittedBy',
          select: 'firstName lastName email role company',
          model: 'User'
        })
        .populate({
          path: 'company',
          select: 'name baseCurrency settings',
          model: 'Company'
        })
        .populate('receipt')
        .sort({ submissionDateTime: sort === 'desc' ? -1 : 1 })
        .lean()
        .exec();

      if (!expenses) {
        return res.status(404).json({
          success: false,
          message: 'No expenses found'
        });
      }
      
      const mappedExpenses = expenses.map(expense => {
        const user = expense.submittedBy;
        const mappedExpense = {
          ...expense,
          user: user ? {
            _id: user._id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: user.role || '',
            company: user.company || null
          } : null,
          userId: user ? user._id : null
        };
        delete mappedExpense.submittedBy;
        return mappedExpense;
      });

      return res.status(200).json({
        success: true,
        count: mappedExpenses.length,
        expenses: mappedExpenses
      });
    } catch (error) {
      winston.error('Error fetching expenses:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to fetch expenses',
        error: error.message 
      });
    }
  }

  /**
   * Process and store a receipt image with OCR
   */
  async uploadReceipt(req, res) {
    try {
      return res.status(501).json({
        message: 'Server-side OCR is disabled. Please perform OCR on the client using Tesseract.js and submit structured expense data via the standard submission endpoint.'
      });
    } catch (error) {
      winston.error('Error processing receipt:', error);
      res.status(500).json({
        message: 'Failed to process receipt',
        error: error.message
      });
    }
  }

  /**
   * Update expense details after receipt processing
   */
  async updateExpenseWithReceiptData(req, res) {
    try {
      const { expenseId } = req.params;
      const updates = req.body;
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      // Verify user has permission to update this expense
      if (expense.submittedBy.toString() !== req.user._id.toString() &&
        !['admin', 'finance'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized to update this expense' });
      }
      // Update fields from manual input
      const allowedUpdates = ['amount', 'title', 'description', 'category', 'expenseDateTime'];
      for (const field of allowedUpdates) {
        if (updates[field] !== undefined) {
          if (field === 'expenseDateTime') {
            expense[field] = new Date(updates[field]);
          } else {
            expense[field] = updates[field];
          }
        }
      }
      // If amount changed, recalculate converted amount
      if (updates.amount !== undefined) {
        expense.convertedAmount = expense.amount * expense.exchangeRate;
      }
      // If currency changed, update exchange rate and converted amount
      if (updates.currency && updates.currency.code !== expense.currency.code) {
        const company = await Company.findById(expense.company);
        const exchangeRate = await receiptService.getExchangeRate(
          updates.currency.code,
          company.baseCurrency
        );
        expense.currency = updates.currency;
        expense.exchangeRate = exchangeRate;
        expense.convertedAmount = expense.amount * exchangeRate;
      }
      await expense.save();
      res.json({
        message: 'Expense updated successfully',
        expense: {
          id: expense._id,
          title: expense.title,
          amount: expense.amount,
          convertedAmount: expense.convertedAmount,
          currency: expense.currency,
          category: expense.category,
          expenseDateTime: expense.expenseDateTime
        }
      });
    } catch (error) {
      winston.error('Error updating expense:', error);
      res.status(500).json({
        message: 'Failed to update expense',
        error: error.message
      });
    }
  }

  /**
   * Submit a new expense
   */
  async submitExpense(req, res) {
    try {
      console.log('Received request body:', req.body);
      console.log('Request file:', req.file);

      // Parse currency from form data (optional; may be inferred)
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
        submissionDateTime,
        locationCountry,
        ocrData
      } = req.body;

      // Validate required fields
      if (!title || !amount || !category || !date) {
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

      console.log('Processed data:', {
        title,
        amount: parsedAmount,
        currency,
        category,
        date,
        description: description || '',
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

      // If currency is missing, try to infer it from country hints
      if (!currency) {
        // 1) Explicit country hint
        if (locationCountry) {
          const inferred = await currencyService.getCurrencyByCountry(locationCountry);
          if (inferred) currency = inferred;
        }
        // 2) OCR data country hint
        if (!currency && ocrData && ocrData.extractedLocation && ocrData.extractedLocation.country) {
          const inferred = await currencyService.getCurrencyByCountry(ocrData.extractedLocation.country);
          if (inferred) currency = inferred;
        }
      }

      // Fallback to company's base currency
      if (!currency) {
        currency = company.baseCurrency;
      }

      // Convert currency if different from company base currency
      let convertedAmount = parsedAmount;
      let exchangeRate = 1;

      if (currency.code !== company.baseCurrency.code) {
        const conversion = await currencyService.convertCurrency(
          parsedAmount,
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
        amount: parsedAmount,
        currency,
        convertedAmount,
        exchangeRate,
        category,
        expenseDateTime: new Date(date),
        submissionDateTime: submissionDateTime ? new Date(submissionDateTime) : new Date(),
        submittedBy: userId,
        company: companyId
      });

      // Handle receipt upload if present: store binary in DB
      if (req.file) {
        expense.receiptImage = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };

        expense.receipt = {
          filename: req.file.originalname,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          image: {
            data: req.file.buffer,
            contentType: req.file.mimetype
          }
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
          await expense.addApproval(req.user.id, req.user.role, 'approved', 'Auto-approved by workflow');
        } else {
          expense.status = 'processing';
        }

        await expense.save();
      }

      const populatedExpense = await Expense.findById(expense._id)
        .populate('submittedBy', 'firstName lastName email')
        .populate('company', 'name baseCurrency');

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
        .populate('submittedBy', 'firstName lastName email manager');

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

      // If user is not admin or finance, only show their own stats
      if (!req.user.isAdmin() && req.user.role !== 'finance') {
        baseQuery.submittedBy = userId;
      }
      
      const statsPromise = Expense.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$convertedAmount' }
          }
        }
      ]);

      const categoryStatsPromise = Expense.aggregate([
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
      
      const approvedAmountPromise = Expense.aggregate([
          { $match: { ...baseQuery, status: 'approved' } },
          {
              $group: {
                  _id: null,
                  totalApprovedAmount: { $sum: '$convertedAmount' }
              }
          }
      ]);

      const [stats, categoryStats, approvedAmountResult] = await Promise.all([
          statsPromise,
          categoryStatsPromise,
          approvedAmountPromise
      ]);
      
      const totalApprovedAmount = approvedAmountResult[0]?.totalApprovedAmount || 0;

      const result = {
        summary: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          processing: 0,
          totalAmount: 0,
          totalApprovedAmount: totalApprovedAmount
        },
        categories: categoryStats
      };

      stats.forEach(stat => {
        if (result.summary.hasOwnProperty(stat._id)) {
            result.summary[stat._id] = stat.count;
        }
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

// Export instance of the controller
module.exports = new ExpenseController();