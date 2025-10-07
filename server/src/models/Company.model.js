const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  baseCurrency: {
    code: {
      type: String,
      required: [true, 'Currency code is required'],
      uppercase: true,
      match: [/^[A-Z]{3}$/, 'Currency code must be 3 uppercase letters']
    },
    name: {
      type: String,
      required: [true, 'Currency name is required']
    },
    symbol: {
      type: String,
      required: [true, 'Currency symbol is required']
    }
  },
  address: {
    area: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  industry: {
    type: String,
    trim: true
  },
  settings: {
    expenseCategories: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: String,
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    expenseLimits: {
      dailyLimit: {
        type: Number,
        default: 1000
      },
      monthlyLimit: {
        type: Number,
        default: 10000
      }
    },
    approvalSettings: {
      requireApprovalAbove: {
        type: Number,
        default: 100
      },
      autoApproveBelow: {
        type: Number,
        default: 50
      }
    }
  },
  budgetHistory: [{
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    allocated: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    rollover: { type: Number, default: 0 }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to ensure _id is set and set default categories
companySchema.pre('save', function (next) {
  if (this.isNew) {
    // Set default expense categories if they don't exist
    if (!this.settings.expenseCategories || this.settings.expenseCategories.length === 0) {
      this.settings.expenseCategories = [
        { name: 'Travel', description: 'Travel and transportation expenses' },
        { name: 'Meals', description: 'Business meals and entertainment' },
        { name: 'Office Supplies', description: 'Office equipment and supplies' },
        { name: 'Software', description: 'Software licenses and subscriptions' },
        { name: 'Training', description: 'Training and professional development' },
        { name: 'Marketing', description: 'Marketing and advertising expenses' },
        { name: 'Utilities', description: 'Utilities and communication expenses' },
        { name: 'Other', description: 'Other business expenses' }
      ];
    }

    // Initialize budget history for the current month
    if (!this.budgetHistory || this.budgetHistory.length === 0) {
      const now = new Date();
      this.budgetHistory.push({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        allocated: this.settings.expenseLimits.monthlyLimit,
        spent: 0,
        rollover: 0
      });
    }
  }
  next();
});

// Index for better performance
companySchema.index({ name: 1 });
companySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Company', companySchema);
