const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['refresh', 'phoneVerification', 'passwordReset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for better performance
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ token: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create token
tokenSchema.statics.createToken = async function(userId, type, expiresIn = '1h', metadata = {}) {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + this.parseExpiresIn(expiresIn));
  
  const tokenDoc = new this({
    userId,
    token,
    type,
    expiresAt,
    metadata
  });
  
  await tokenDoc.save();
  return tokenDoc;
};

// Static method to parse expires in string
tokenSchema.statics.parseExpiresIn = function(expiresIn) {
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };
  
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiresIn format. Use format like "1h", "30m", "7d"');
  }
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
};

// Static method to find and validate token
tokenSchema.statics.findAndValidate = async function(token, type) {
  const tokenDoc = await this.findOne({
    token,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
  
  if (!tokenDoc) {
    return null;
  }
  
  return tokenDoc;
};

// Instance method to mark token as used
tokenSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

// Instance method to check if token is expired
tokenSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

module.exports = mongoose.model('Token', tokenSchema);
