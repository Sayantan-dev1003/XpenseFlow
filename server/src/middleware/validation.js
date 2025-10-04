const Joi = require('joi');

// Common validation patterns
const commonPatterns = {
  email: Joi.string().email().lowercase().trim().max(255),
  password: Joi.string().min(6).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).messages({
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  }),
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).max(15).messages({
    'string.pattern.base': 'Please enter a valid international phone number'
  }),
  name: Joi.string().min(2).max(50).trim().pattern(/^[a-zA-Z\s]+$/).messages({
    'string.pattern.base': 'Name can only contain letters and spaces'
  }),
  otp: Joi.string().length(6).pattern(/^\d+$/).messages({
    'string.pattern.base': 'OTP must be 6 digits'
  })
};

// Registration validation schema
const registerSchema = Joi.object({
  firstName: commonPatterns.name.required().messages({
    'any.required': 'First name is required',
    'string.empty': 'First name cannot be empty'
  }),
  lastName: commonPatterns.name.required().messages({
    'any.required': 'Last name is required',
    'string.empty': 'Last name cannot be empty'
  }),
  email: commonPatterns.email.required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  password: commonPatterns.password.required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  }),
  phoneNumber: commonPatterns.phoneNumber.optional().allow(''),
  companyName: Joi.string().min(2).max(100).trim().required().messages({
    'any.required': 'Company name is required',
    'string.empty': 'Company name cannot be empty'
  }),
  country: Joi.string().min(2).max(100).trim().required().messages({
    'any.required': 'Country is required',
    'string.empty': 'Country cannot be empty'
  })
});

// Login validation schema
const loginSchema = Joi.object({
  email: commonPatterns.email.required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password cannot be empty'
  })
});

// OTP verification schema
const otpVerificationSchema = Joi.object({
  otp: commonPatterns.otp.required().messages({
    'any.required': 'OTP is required',
    'string.length': 'OTP must be exactly 6 digits'
  }),
  type: Joi.string().valid('email', 'phone').required().messages({
    'any.required': 'OTP type is required',
    'any.only': 'OTP type must be either email or phone'
  })
});

// Password reset request schema
const passwordResetRequestSchema = Joi.object({
  email: commonPatterns.email.required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please enter a valid email address'
  })
});

// Password reset schema
const passwordResetSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  password: commonPatterns.password.required().messages({
    'any.required': 'New password is required',
    'string.min': 'Password must be at least 6 characters long'
  })
});

// Change password schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
    'string.empty': 'Current password cannot be empty'
  }),
  newPassword: commonPatterns.password.required().messages({
    'any.required': 'New password is required',
    'string.min': 'Password must be at least 6 characters long'
  })
});

// Create user validation schema (Admin only)
const createUserSchema = Joi.object({
  firstName: commonPatterns.name.required().messages({
    'any.required': 'First name is required',
    'string.empty': 'First name cannot be empty'
  }),
  lastName: commonPatterns.name.required().messages({
    'any.required': 'Last name is required',
    'string.empty': 'Last name cannot be empty'
  }),
  email: commonPatterns.email.required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  phoneNumber: commonPatterns.phoneNumber.required().messages({
    'any.required': 'Phone number is required',
    'string.pattern.base': 'Please enter a valid phone number'
  }),
  password: commonPatterns.password.required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  }),
  role: Joi.string().valid('employee', 'manager', 'finance').required().messages({
    'any.required': 'Role is required',
    'any.only': 'Role must be employee, manager, or finance'
  }),
  manager: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow('').messages({
    'string.pattern.base': 'Invalid manager ID format'
  })
});

// Account linking schema
const accountLinkingSchema = Joi.object({
  email: commonPatterns.email.required(),
  password: Joi.string().required().messages({
    'any.required': 'Password is required to link accounts'
  }),
  provider: Joi.string().valid('google', 'github').required()
});

// Resend OTP schema
const resendOTPSchema = Joi.object({
  type: Joi.string().valid('email', 'phone').required().messages({
    'any.required': 'OTP type is required',
    'any.only': 'OTP type must be either email or phone'
  })
});

// Send login OTP schema
const sendLoginOTPSchema = Joi.object({
  userId: Joi.string().required().messages({
    'any.required': 'User ID is required',
    'string.empty': 'User ID cannot be empty'
  }),
  method: Joi.string().valid('email', 'phone').required().messages({
    'any.required': 'OTP method is required',
    'any.only': 'OTP method must be either email or phone'
  })
});

// Verify login OTP schema
const verifyLoginOTPSchema = Joi.object({
  userId: Joi.string().required().messages({
    'any.required': 'User ID is required',
    'string.empty': 'User ID cannot be empty'
  }),
  otp: commonPatterns.otp.required().messages({
    'any.required': 'OTP is required',
    'string.length': 'OTP must be exactly 6 digits'
  }),
  method: Joi.string().valid('email', 'phone').required().messages({
    'any.required': 'OTP method is required',
    'any.only': 'OTP method must be either email or phone'
  })
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Show all validation errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }

    req.query = value;
    next();
  };
};

// Params validation
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        errors
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  // Schemas
  registerSchema,
  loginSchema,
  otpVerificationSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,
  createUserSchema,
  accountLinkingSchema,
  resendOTPSchema,
  sendLoginOTPSchema,
  verifyLoginOTPSchema,
  
  // Validation middleware
  validate,
  validateQuery,
  validateParams,
  
  // Common patterns for reuse
  commonPatterns
};