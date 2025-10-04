const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'authflow-api' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join('logs', 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join('logs', 'rejections.log') })
  ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Add security event logging
const securityLogger = {
  loginAttempt: (email, success, ip, userAgent) => {
    logger.info('Login Attempt', {
      email,
      success,
      ip,
      userAgent,
      event: 'login_attempt'
    });
  },
  
  registrationAttempt: (email, success, ip, userAgent) => {
    logger.info('Registration Attempt', {
      email,
      success,
      ip,
      userAgent,
      event: 'registration_attempt'
    });
  },
  
  passwordResetRequest: (email, ip, userAgent) => {
    logger.info('Password Reset Request', {
      email,
      ip,
      userAgent,
      event: 'password_reset_request'
    });
  },
  
  accountLocked: (email, ip, reason) => {
    logger.warn('Account Locked', {
      email,
      ip,
      reason,
      event: 'account_locked'
    });
  },
  
  suspiciousActivity: (email, ip, activity, details) => {
    logger.warn('Suspicious Activity', {
      email,
      ip,
      activity,
      details,
      event: 'suspicious_activity'
    });
  },
  
  tokenRefresh: (userId, ip, userAgent) => {
    logger.info('Token Refresh', {
      userId,
      ip,
      userAgent,
      event: 'token_refresh'
    });
  },
  
  socialLogin: (provider, email, success, ip, userAgent) => {
    logger.info('Social Login', {
      provider,
      email,
      success,
      ip,
      userAgent,
      event: 'social_login'
    });
  }
};

module.exports = {
  logger,
  requestLogger,
  securityLogger
};
