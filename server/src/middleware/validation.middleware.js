const Joi = require('joi');

/**
 * Middleware to validate request data using Joi schemas
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all validation errors
      allowUnknown: true, // Allow unknown keys in the request
      stripUnknown: true // Remove unknown keys from the request
    };

    // Validate different parts of the request
    const validationPromises = [];

    if (schema.body) {
      validationPromises.push(
        schema.body.validateAsync(req.body, validationOptions)
          .then(value => { req.body = value; })
          .catch(error => ({ type: 'body', error }))
      );
    }

    if (schema.query) {
      validationPromises.push(
        schema.query.validateAsync(req.query, validationOptions)
          .then(value => { req.query = value; })
          .catch(error => ({ type: 'query', error }))
      );
    }

    if (schema.params) {
      validationPromises.push(
        schema.params.validateAsync(req.params, validationOptions)
          .then(value => { req.params = value; })
          .catch(error => ({ type: 'params', error }))
      );
    }

    if (schema.headers) {
      validationPromises.push(
        schema.headers.validateAsync(req.headers, validationOptions)
          .then(value => { req.headers = value; })
          .catch(error => ({ type: 'headers', error }))
      );
    }

    Promise.all(validationPromises)
      .then(results => {
        // Check if any validation failed
        const errors = results.filter(result => result && result.error);
        
        if (errors.length > 0) {
          const validationErrors = {};
          
          errors.forEach(({ type, error }) => {
            validationErrors[type] = error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message,
              value: detail.context.value
            }));
          });

          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationErrors
          });
        }

        next();
      })
      .catch(error => {
        return res.status(500).json({
          success: false,
          message: 'Validation error',
          error: error.message
        });
      });
  };
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  // MongoDB ObjectId validation
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ObjectId format'),
  
  // Email validation
  email: Joi.string().email().lowercase().trim(),
  
  // Password validation
  password: Joi.string().min(6).max(128).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')),
  
  // Phone number validation
  phoneNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/),
  
  // Currency code validation
  currencyCode: Joi.string().length(3).uppercase(),
  
  // Date validation
  date: Joi.date().iso(),
  
  // Pagination
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  },
  
  // Status validation
  expenseStatus: Joi.string().valid('pending', 'approved', 'rejected', 'processing'),
  
  // Role validation
  userRole: Joi.string().valid('admin', 'manager', 'employee')
};

/**
 * Validation schemas for authentication
 */
const authSchemas = {
  register: {
    body: Joi.object({
      firstName: Joi.string().required().trim().max(50),
      lastName: Joi.string().required().trim().max(50),
      email: commonSchemas.email.required(),
      password: commonSchemas.password.required(),
      phoneNumber: commonSchemas.phoneNumber.optional(),
      companyName: Joi.string().optional().trim().max(100),
      country: Joi.string().optional().trim()
    })
  },
  
  login: {
    body: Joi.object({
      email: commonSchemas.email.required(),
      password: Joi.string().required()
    })
  },
  
  
  forgotPassword: {
    body: Joi.object({
      email: commonSchemas.email.required()
    })
  },
  
  resetPassword: {
    body: Joi.object({
      token: Joi.string().required(),
      password: commonSchemas.password.required()
    })
  }
};

/**
 * Validation schemas for user management
 */
const userSchemas = {
  updateProfile: {
    body: Joi.object({
      firstName: Joi.string().optional().trim().max(50),
      lastName: Joi.string().optional().trim().max(50),
      phoneNumber: commonSchemas.phoneNumber.optional()
    })
  },
  
  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: commonSchemas.password.required()
    })
  },

  createUser: {
    body: Joi.object({
      firstName: Joi.string().required().trim().max(50),
      lastName: Joi.string().required().trim().max(50),
      email: commonSchemas.email.required(),
      role: Joi.string().valid('employee', 'manager', 'finance').required(),
      manager: Joi.string().optional().when('role', {
        is: 'employee',
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
      })
    })
  }
};

module.exports = {
  validate,
  commonSchemas,
  authSchemas,
  userSchemas
};
