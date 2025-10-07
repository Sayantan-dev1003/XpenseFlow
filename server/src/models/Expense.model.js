const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    code: {
      type: String,
      required: [true, 'Currency code is required'],
      uppercase: true,
      match: [/^[A-Z]{3}$/, 'Currency code must be 3 uppercase letters']
    },
    name: String,
    symbol: String
  },
  // Amount converted to company's base currency
  convertedAmount: {
    type: Number,
    required: true
  },
  exchangeRate: {
    type: Number,
    required: true,
    default: 1
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  expenseDateTime: {
    type: Date,
    required: [true, 'Expense date and time is required']
  },
  submissionDateTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Direct binary storage of receipt image
  receiptImage: {
    data: Buffer,
    contentType: String
  },
  receipt: {
    // Original receipt file details
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    
    // Binary storage of receipt image
    image: {
      data: Buffer,
      contentType: String
    },
    
    // OCR extracted data
    ocrData: {
      extractedText: String,
      extractedAmount: Number,
      extractedDate: Date,
      extractedVendor: String,
      extractedLocation: {
        country: String,
        city: String,
        address: String
      },
      confidence: {
        overall: Number,
        amount: Number,
        date: Number,
        vendor: Number,
        location: Number
      }
    }
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing'],
    default: 'pending'
  },
  // Track approvals from different roles
  approvals: {
    manager: {
      approved: { type: Boolean, default: false },
      approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: Date
    },
    finance: {
      approved: { type: Boolean, default: false },
      approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: Date
    }
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for approval status
expenseSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

expenseSchema.virtual('isRejected').get(function() {
  return this.status === 'rejected';
});

expenseSchema.virtual('isPending').get(function() {
  return this.status === 'pending' || this.status === 'processing';
});

// Virtual for latest approval action
expenseSchema.virtual('latestApproval').get(function() {
  if (this.approvalHistory && this.approvalHistory.length > 0) {
    return this.approvalHistory[this.approvalHistory.length - 1];
  }
  return null;
});

// Indexes for better performance
expenseSchema.index({ submittedBy: 1 });
expenseSchema.index({ company: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ 'approvalHistory.approver': 1 });
expenseSchema.index({ createdAt: -1 });

// Compound indexes
expenseSchema.index({ company: 1, status: 1, date: -1 });
expenseSchema.index({ submittedBy: 1, status: 1, date: -1 });

// Pre-save middleware for receipt processing and currency conversion
expenseSchema.pre('save', async function(next) {
  try {
    // Update convertedAmount if amount or exchangeRate changes
    if (this.isModified('amount') || this.isModified('exchangeRate')) {
      this.convertedAmount = this.amount * this.exchangeRate;
    }

    // Process OCR data if receipt image is modified
    if (this.isModified('receipt.image.data')) {
      // Set submissionDateTime to current time when receipt is uploaded
      this.submissionDateTime = new Date();
      
      // If OCR data exists, try to update expense details
      if (this.receipt.ocrData) {
        // Update amount if not manually set
        if (!this.isModified('amount') && this.receipt.ocrData.extractedAmount) {
          this.amount = this.receipt.ocrData.extractedAmount;
        }

        // Update expenseDateTime if not manually set
        if (!this.isModified('expenseDateTime') && this.receipt.ocrData.extractedDate) {
          this.expenseDateTime = this.receipt.ocrData.extractedDate;
        }

        // If location is detected, try to set currency
        if (this.receipt.ocrData.extractedLocation && this.receipt.ocrData.extractedLocation.country) {
          // Note: Actual currency fetching will be handled by the controller
          // using the Rest Countries API
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to add approval with dual approval logic
expenseSchema.methods.addApproval = function(approverId, approverRole, action, comment = '') {
  // Add to approval history
  this.approvalHistory.push({
    approver: approverId,
    action: action,
    comment: comment,
    level: 0,
    timestamp: new Date()
  });
  
  if (action === 'rejected') {
    // Any rejection immediately rejects the expense
    this.status = 'rejected';
  } else if (action === 'approved') {
    // Update role-specific approval
    if (approverRole === 'manager') {
      this.approvals.manager.approved = true;
      this.approvals.manager.approver = approverId;
      this.approvals.manager.timestamp = new Date();
      this.approvals.manager.comment = comment;
    } else if (approverRole === 'finance') {
      this.approvals.finance.approved = true;
      this.approvals.finance.approver = approverId;
      this.approvals.finance.timestamp = new Date();
      this.approvals.finance.comment = comment;
    }
    
    // Check if both manager and finance have approved
    if (this.approvals.manager.approved && this.approvals.finance.approved) {
      this.status = 'approved';
    } else {
      this.status = 'processing'; // Partially approved
    }
  }
  
  return this.save();
};

// Instance method to check if user has already approved
expenseSchema.methods.hasUserApproved = function(userId, userRole) {
  if (userRole === 'manager' && this.approvals.manager.approved) {
    return this.approvals.manager.approver.toString() === userId.toString();
  }
  if (userRole === 'finance' && this.approvals.finance.approved) {
    return this.approvals.finance.approver.toString() === userId.toString();
  }
  return false;
};

// Instance method to get approval status
expenseSchema.methods.getApprovalStatus = function() {
  return {
    managerApproved: this.approvals.manager.approved,
    financeApproved: this.approvals.finance.approved,
    fullyApproved: this.approvals.manager.approved && this.approvals.finance.approved,
    partiallyApproved: (this.approvals.manager.approved || this.approvals.finance.approved) && 
                      !(this.approvals.manager.approved && this.approvals.finance.approved)
  };
};

// Instance method to check if user can approve
expenseSchema.methods.canBeApprovedBy = function(userId) {
  // Cannot approve own expense
  if (this.submittedBy.toString() === userId.toString()) {
    return false;
  }
  
  // If already approved or rejected, cannot approve again
  if (this.status === 'approved' || this.status === 'rejected') {
    return false;
  }
  
  return true;
};

// Static method to get expenses by status
expenseSchema.statics.getByStatus = function(status, companyId, options = {}) {
  const query = { status, company: companyId };
  
  if (options.userId) {
    query.submittedBy = options.userId;
  }
  
  if (options.dateFrom || options.dateTo) {
    query.date = {};
    if (options.dateFrom) query.date.$gte = new Date(options.dateFrom);
    if (options.dateTo) query.date.$lte = new Date(options.dateTo);
  }
  
  return this.find(query)
    .populate('submittedBy', 'firstName lastName email role')
    .populate('company', 'name baseCurrency')
    .populate('approvalHistory.approver', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get expenses for approval by manager
expenseSchema.statics.getPendingForApprover = function(approverId, companyId) {
  return this.find({
    company: companyId,
    status: { $in: ['pending', 'processing'] },
    submittedBy: { $ne: approverId } // Cannot approve own expenses
  })
    .populate('submittedBy', 'firstName lastName email role manager')
    .populate('company', 'name baseCurrency')
    .sort({ createdAt: -1 });
};

// Helper method to process OCR data
expenseSchema.methods.processOCRData = async function() {
  if (!this.receipt.ocrData) return;

  // Validate and clean extracted amount
  if (this.receipt.ocrData.extractedAmount) {
    const amount = parseFloat(this.receipt.ocrData.extractedAmount);
    if (!isNaN(amount) && amount > 0) {
      this.amount = amount;
    }
  }

  // Validate and clean extracted date
  if (this.receipt.ocrData.extractedDate) {
    const date = new Date(this.receipt.ocrData.extractedDate);
    if (date.toString() !== 'Invalid Date') {
      this.expenseDateTime = date;
    }
  }

  // Update vendor information if available
  if (this.receipt.ocrData.extractedVendor) {
    if (!this.title) {
      this.title = `Expense at ${this.receipt.ocrData.extractedVendor}`;
    }
    if (!this.description) {
      this.description = `Purchase from ${this.receipt.ocrData.extractedVendor}`;
    }
  }
};

// Helper method to update currency and exchange rate
expenseSchema.methods.updateCurrencyAndRate = async function(currencyDetails, exchangeRate) {
  // Update currency details
  this.currency = {
    code: currencyDetails.code,
    name: currencyDetails.name,
    symbol: currencyDetails.symbol
  };

  // Update exchange rate and recalculate converted amount
  this.exchangeRate = exchangeRate;
  this.convertedAmount = this.amount * this.exchangeRate;
};

module.exports = mongoose.model('Expense', expenseSchema);
