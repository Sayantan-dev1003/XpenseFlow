const mongoose = require('mongoose');

const approvalWorkflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow name is required'],
    trim: true,
    maxlength: [100, 'Workflow name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  type: {
    type: String,
    enum: ['percentage', 'specific_approver', 'hybrid'],
    required: true
  },
  // Conditions that trigger this workflow
  conditions: {
    minAmount: {
      type: Number,
      default: 0
    },
    maxAmount: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER
    },
    categories: [{
      type: String,
      trim: true
    }],
    roles: [{
      type: String,
      enum: ['admin', 'manager', 'employee']
    }]
  },
  // Approval rules configuration
  rules: {
    // For percentage-based approval
    percentage: {
      required: {
        type: Number,
        min: 1,
        max: 100,
        validate: {
          validator: function(value) {
            return this.type !== 'percentage' || (value >= 1 && value <= 100);
          },
          message: 'Percentage must be between 1 and 100'
        }
      },
      eligibleApprovers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    // For specific approver rule
    specificApprover: {
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        validate: {
          validator: function(value) {
            return this.type !== 'specific_approver' || value;
          },
          message: 'Specific approver is required for specific_approver type'
        }
      },
      autoApprove: {
        type: Boolean,
        default: true
      }
    },
    // For hybrid rule (combination of both)
    hybrid: {
      primaryRule: {
        type: String,
        enum: ['percentage', 'specific_approver'],
        validate: {
          validator: function(value) {
            return this.type !== 'hybrid' || value;
          },
          message: 'Primary rule is required for hybrid type'
        }
      },
      fallbackRule: {
        type: String,
        enum: ['percentage', 'specific_approver'],
        validate: {
          validator: function(value) {
            return this.type !== 'hybrid' || value;
          },
          message: 'Fallback rule is required for hybrid type'
        }
      },
      percentage: {
        required: Number,
        eligibleApprovers: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }]
      },
      specificApprover: {
        approver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        autoApprove: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  // Approval levels/sequence
  levels: [{
    level: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    approvers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    requiredApprovals: {
      type: Number,
      default: 1,
      min: 1
    },
    isOptional: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0
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

// Virtual for workflow complexity
approvalWorkflowSchema.virtual('complexity').get(function() {
  if (this.type === 'specific_approver') return 'simple';
  if (this.type === 'percentage') return 'moderate';
  return 'complex';
});

// Indexes for better performance
approvalWorkflowSchema.index({ company: 1 });
approvalWorkflowSchema.index({ type: 1 });
approvalWorkflowSchema.index({ isActive: 1 });
approvalWorkflowSchema.index({ priority: -1 });
approvalWorkflowSchema.index({ 'conditions.minAmount': 1, 'conditions.maxAmount': 1 });

// Compound indexes
approvalWorkflowSchema.index({ company: 1, isActive: 1, priority: -1 });

// Instance method to check if workflow applies to expense
approvalWorkflowSchema.methods.appliesTo = function(expense, user) {
  // Check amount range
  if (expense.convertedAmount < this.conditions.minAmount || 
      expense.convertedAmount > this.conditions.maxAmount) {
    return false;
  }
  
  // Check categories
  if (this.conditions.categories.length > 0 && 
      !this.conditions.categories.includes(expense.category)) {
    return false;
  }
  

  
  // Check roles
  if (this.conditions.roles.length > 0 && 
      !this.conditions.roles.includes(user.role)) {
    return false;
  }
  
  return true;
};

// Instance method to get next approvers for an expense
approvalWorkflowSchema.methods.getNextApprovers = function(currentLevel = 0) {
  const nextLevel = this.levels.find(level => level.level === currentLevel + 1);
  if (!nextLevel) return [];
  
  return nextLevel.approvers;
};

// Instance method to check if expense should be auto-approved
approvalWorkflowSchema.methods.shouldAutoApprove = function(expense, approver) {
  if (this.type === 'specific_approver') {
    return this.rules.specificApprover.autoApprove && 
           this.rules.specificApprover.approver.toString() === approver._id.toString();
  }
  
  if (this.type === 'hybrid') {
    if (this.rules.hybrid.primaryRule === 'specific_approver') {
      return this.rules.hybrid.specificApprover.autoApprove && 
             this.rules.hybrid.specificApprover.approver.toString() === approver._id.toString();
    }
  }
  
  return false;
};

// Instance method to check percentage approval
approvalWorkflowSchema.methods.checkPercentageApproval = function(expense) {
  if (this.type !== 'percentage' && 
      !(this.type === 'hybrid' && this.rules.hybrid.primaryRule === 'percentage')) {
    return { approved: false, percentage: 0 };
  }
  
  const requiredPercentage = this.type === 'percentage' ? 
    this.rules.percentage.required : 
    this.rules.hybrid.percentage.required;
    
  const eligibleApprovers = this.type === 'percentage' ? 
    this.rules.percentage.eligibleApprovers : 
    this.rules.hybrid.percentage.eligibleApprovers;
  
  const currentPercentage = (approvedCount / eligibleApprovers.length) * 100;
  
  return {
    approved: currentPercentage >= requiredPercentage,
    percentage: currentPercentage,
    required: requiredPercentage,
    approvedCount,
    totalEligible: eligibleApprovers.length
  };
};

// Static method to find applicable workflow for expense
approvalWorkflowSchema.statics.findApplicableWorkflow = async function(expense, user) {
  const workflows = await this.find({
    company: expense.company,
    isActive: true
  }).sort({ priority: -1 });
  
  for (const workflow of workflows) {
    if (workflow.appliesTo(expense, user)) {
      return workflow;
    }
  }
  
  return null;
};

// Static method to get default workflow for company
approvalWorkflowSchema.statics.getDefaultWorkflow = async function(companyId) {
  return await this.findOne({
    company: companyId,
    isActive: true,
    priority: 0
  });
};

module.exports = mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);
