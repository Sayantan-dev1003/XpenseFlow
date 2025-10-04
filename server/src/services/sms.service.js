const twilio = require('twilio');
const config = require('../config');
const { logger } = require('../utils/logger');

class SMSService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.initializeService();
  }

  // Initialize SMS service
  initializeService() {
    try {
      if (config.SMS_SERVICE_PROVIDER === 'twilio') {
        if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_PHONE_NUMBER) {
          logger.warn('Twilio SMS service not fully configured. SMS functionality will be disabled.');
          return;
        }

        this.client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
        this.isConfigured = true;
        logger.info('Twilio SMS service initialized successfully');
      } else if (config.SMS_SERVICE_PROVIDER === 'console' || config.NODE_ENV === 'development') {
        // Development mode - log OTP to console instead of sending SMS
        this.isConfigured = true;
        this.isDevelopmentMode = true;
        logger.info('SMS service running in development mode - OTPs will be logged to console');
      } else {
        logger.warn(`Unsupported SMS service provider: ${config.SMS_SERVICE_PROVIDER}`);
      }
    } catch (error) {
      logger.error('Failed to initialize SMS service:', error);
    }
  }

  // Send SMS message
  async sendSMS(to, message, options = {}) {
    try {
      if (!this.isConfigured) {
        throw new Error('SMS service is not configured');
      }

      // Development mode - log to console instead of sending
      if (this.isDevelopmentMode) {
        const formattedNumber = this.formatPhoneNumber(to);
        if (!formattedNumber) {
          throw new Error('Invalid phone number format');
        }

        logger.info(`[DEV MODE] SMS would be sent to ${formattedNumber}: ${message}`);
        console.log(`\n📱 SMS OTP (Development Mode):`);
        console.log(`To: ${formattedNumber}`);
        console.log(`Message: ${message}`);
        console.log(`Time: ${new Date().toISOString()}\n`);
        
        return {
          success: true,
          messageId: `dev-${Date.now()}`,
          status: 'sent',
          to: formattedNumber,
          from: 'DEV-MODE'
        };
      }

      if (!this.client) {
        throw new Error('SMS client is not initialized');
      }

      // Validate phone number format
      const formattedNumber = this.formatPhoneNumber(to);
      if (!formattedNumber) {
        throw new Error('Invalid phone number format');
      }

      const messageOptions = {
        body: message,
        from: config.TWILIO_PHONE_NUMBER,
        to: formattedNumber,
        ...options
      };

      logger.info(`Sending SMS to ${formattedNumber}`);
      
      const result = await this.client.messages.create(messageOptions);
      
      logger.info(`SMS sent successfully. SID: ${result.sid}`);
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        to: formattedNumber,
        from: result.from
      };
    } catch (error) {
      logger.error('SMS sending failed:', error);
      
      // Handle specific Twilio errors with more descriptive messages
      if (error.code === 21608) {
        throw new Error('SMS service is temporarily unavailable. Please try email verification instead.');
      } else if (error.code === 21211) {
        throw new Error('Invalid phone number format. Please check your phone number and try again.');
      } else if (error.message.includes('unverified')) {
        throw new Error('SMS service is currently unavailable. Please try email verification instead.');
      } else {
        throw new Error(`Failed to send SMS: ${error.message}`);
      }
    }
  }

  // Send OTP SMS
  async sendOTP(phoneNumber, otp, type = 'verification') {
    try {
      const message = this.getOTPMessage(otp, type);
      return await this.sendSMS(phoneNumber, message);
    } catch (error) {
      logger.error('OTP SMS sending failed:', error);
      throw error;
    }
  }

  // Get OTP message template
  getOTPMessage(otp, type) {
    const appName = 'AuthFlow';
    const expiry = '10 minutes';
    
    if (type === 'verification') {
      return `Your ${appName} verification code is: ${otp}. This code expires in ${expiry}. Do not share this code with anyone.`;
    } else if (type === 'password_reset') {
      return `Your ${appName} password reset code is: ${otp}. This code expires in ${expiry}. Do not share this code with anyone.`;
    } else {
      return `Your ${appName} code is: ${otp}. This code expires in ${expiry}. Do not share this code with anyone.`;
    }
  }

  // Format phone number for international format (India +91)
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 91 and is 12 digits (India with country code), keep as is
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    // If it's 10 digits (India without country code), add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // If it already has country code, add + if missing
    if (cleaned.length > 10) {
      return `+${cleaned}`;
    }
    
    // Return null for invalid lengths
    return null;
  }

  // Verify phone number format
  isValidPhoneNumber(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return formatted !== null;
  }

  // Get service status
  getStatus() {
    return {
      configured: this.isConfigured,
      provider: config.SMS_SERVICE_PROVIDER,
      hasClient: !!this.client,
      isDevelopmentMode: this.isDevelopmentMode || false
    };
  }

  // Test SMS service
  async testService(testNumber) {
    try {
      if (!this.isConfigured) {
        throw new Error('SMS service is not configured');
      }

      const testMessage = 'This is a test message from AuthFlow SMS service.';
      const result = await this.sendSMS(testNumber, testMessage);
      
      logger.info('SMS service test completed successfully');
      return result;
    } catch (error) {
      logger.error('SMS service test failed:', error);
      throw error;
    }
  }
}

module.exports = new SMSService();
