const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
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
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  industry: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        if (!url) return true; // Optional field
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Please enter a valid website URL'
    }
  },
  logo: {
    type: String,
    default: ''
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
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Default expense categories
companySchema.pre('save', function(next) {
  if (this.isNew && (!this.settings.expenseCategories || this.settings.expenseCategories.length === 0)) {
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
  next();
});

// Index for better performance
companySchema.index({ name: 1 });
companySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Company', companySchema);
