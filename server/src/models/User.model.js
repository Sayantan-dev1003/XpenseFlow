const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        const standardEmailPattern = /^[\w.-]+@[\w.-]+\.[\w]{2,}$/;
        return standardEmailPattern.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  // Company and Role Management
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false // Made optional to handle registration flow
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee', 'finance'],
    default: 'employee',
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  employeeId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ company: 1 });
userSchema.index({ manager: 1 });
userSchema.index({ role: 1 });
userSchema.index({ employeeId: 1, company: 1 }, { sparse: true });

// Pre-save middleware to ensure _id is set and hash password
userSchema.pre('save', async function(next) {
  // Ensure _id is set if not already present
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId();
  }
  
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance methods for role checking
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

userSchema.methods.isManager = function() {
  return this.role === 'manager';
};

userSchema.methods.isEmployee = function() {
  return this.role === 'employee';
};

userSchema.methods.canManage = function(userId) {
  if (this.isAdmin()) return true;
  if (this.isManager()) {
    // Check if the user is under this manager
    return this._id.toString() === userId.toString() || 
           (this.directReports && this.directReports.includes(userId));
  }
  return false;
};

// Static method to find user by email
userSchema.statics.findByCredentials = async function(email) {
  return await this.findOne({ email: email.toLowerCase() });
};

// Static method to get team members for a manager
userSchema.statics.getTeamMembers = async function(managerId) {
  return await this.find({ manager: managerId }).populate('company', 'name');
};

module.exports = mongoose.model('User', userSchema);