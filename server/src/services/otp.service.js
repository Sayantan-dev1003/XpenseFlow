const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config');
const smsService = require('./sms.service');

class OTPService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
  }

  // Create email transporter
  createEmailTransporter() {
    // Check if email credentials are properly configured
    if (!config.EMAIL_USER || !config.EMAIL_PASS) {
      console.error('Email credentials not properly configured. Please check EMAIL_USER and EMAIL_PASS environment variables.');
      return null;
    }

    return nodemailer.createTransport({
      service: config.EMAIL_SERVICE || 'gmail',
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
      },
      // Add additional options for better error handling
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      rateDelta: 20000,
      rateLimit: 5
    });
  }

  // Generate OTP
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  // Generate secure token
  generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }


  // Send SMS OTP using SMS service
  async sendSMSOTP(phoneNumber, otp, type = 'verification') {
    try {
      // Validate phone number format
      if (!smsService.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Check if SMS service is configured
      const smsStatus = smsService.getStatus();
      if (!smsStatus.configured) {
        throw new Error('SMS service is not configured. Please contact administrator.');
      }

      // Send OTP via SMS service
      const result = await smsService.sendOTP(phoneNumber, otp, type);
      
      console.log('SMS OTP sent successfully:', result.messageId);
      return { 
        success: true, 
        messageId: result.messageId,
        status: result.status,
        to: result.to
      };
    } catch (error) {
      console.error('SMS OTP sending error:', error);
      
      // Handle specific Twilio errors with user-friendly messages
      if (error.message.includes('unverified')) {
        throw new Error('SMS service is currently unavailable. Please try email verification instead or contact support.');
      } else if (error.message.includes('Invalid \'To\' Phone Number')) {
        throw new Error('Invalid phone number format. Please check your phone number and try again.');
      } else if (error.message.includes('Trial accounts cannot send messages')) {
        throw new Error('SMS service is temporarily unavailable. Please try email verification instead.');
      } else {
        throw new Error(`Failed to send SMS OTP: ${error.message}`);
      }
    }
  }

  // Send Email OTP using email service
  async sendEmailOTP(email, otp, type = 'verification') {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Check if email service is configured
      if (!this.emailTransporter) {
        console.error('Email transporter not available. Email credentials may not be configured properly.');
        throw new Error('Email service not configured. Please contact administrator to configure email service.');
      }

      // Get email template
      const htmlContent = this.getEmailTemplate(otp, type);
      
      // Send email
      const mailOptions = {
        from: `"XpenseFlow" <${config.EMAIL_USER}>`,
        to: email,
        subject: `XpenseFlow ${type === 'login' ? 'Login' : 'Verification'} Code`,
        html: htmlContent
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      console.log('Email OTP sent successfully:', result.messageId);
      return { 
        success: true, 
        messageId: result.messageId,
        to: email
      };
    } catch (error) {
      console.error('Email OTP sending error:', error);
      
      // Provide more specific error messages
      if (error.code === 'EAUTH') {
        console.error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in environment variables.');
        throw new Error('Email authentication failed. Please contact administrator to configure email service.');
      } else if (error.code === 'ECONNECTION') {
        console.error('Email connection failed. Please check internet connection and email service configuration.');
        throw new Error('Email service temporarily unavailable. Please try again later.');
      } else if (error.message.includes('535-5.7.8')) {
        console.error('Gmail authentication error: Username and Password not accepted');
        throw new Error('Email service authentication failed. Please contact administrator to fix email configuration.');
      } else {
        console.error('Unexpected email error:', error.message);
        throw new Error(`Failed to send email OTP: ${error.message}`);
      }
    }
  }

  // Get email template
  getEmailTemplate(otp, type) {
    let title, message;
    
    if (type === 'login') {
      title = 'Login Verification';
      message = 'Please use the following OTP to complete your login:';
    } else {
      title = 'Password Reset';
      message = 'Please use the following OTP to reset your password:';
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 10px;
          }
          .otp-container {
            background-color: #f8fafc;
            border: 2px dashed #4f46e5;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #4f46e5;
            letter-spacing: 5px;
            margin: 10px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">XpenseFlow</div>
            <h1>${title}</h1>
          </div>
          
          <p>Hello,</p>
          <p>${message}</p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <p>This OTP is valid for 10 minutes.</p>
          </div>
          
          <div class="warning">
            <strong>Security Notice:</strong> Never share this OTP with anyone. XpenseFlow will never ask for your OTP via phone or email.
          </div>
          
          <p>If you didn't request this ${type === 'verification' ? 'verification' : 'password reset'}, please ignore this email.</p>
          
          <div class="footer">
            <p>This is an automated message from XpenseFlow.</p>
            <p>© 2024 XpenseFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send OTP for login
  async sendOTP(userId, method) {
    try {
      const User = require('../models/User.model');
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const otp = this.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      let maskedContact = '';
      let result;

      if (method === 'phone') {
        if (!user.phoneNumber) {
          throw new Error('Phone number not found for this user');
        }
        await this.sendSMSOTP(user.phoneNumber, otp, 'login');
        user.phoneVerificationToken = otp;
        user.phoneVerificationExpires = expiresAt;
        maskedContact = `${user.phoneNumber.substring(0, 3)}***${user.phoneNumber.substring(user.phoneNumber.length - 3)}`;
      } else if (method === 'email') {
        if (!user.email) {
          throw new Error('Email not found for this user');
        }
        await this.sendEmailOTP(user.email, otp, 'login');
        user.emailVerificationToken = otp;
        user.emailVerificationExpires = expiresAt;
        maskedContact = `${user.email.substring(0, 3)}***@${user.email.split('@')[1]}`;
      } else {
        throw new Error('Invalid OTP method');
      }

      await user.save();
      
      return { 
        success: true, 
        message: `OTP sent to ${method}`,
        maskedContact
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP for login
  async verifyOTP(userId, otp, type) {
    try {
      const User = require('../models/User.model');
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      let storedOTP;
      let expiresAt;
      
      if (type === 'phone') {
        storedOTP = user.phoneVerificationToken;
        expiresAt = user.phoneVerificationExpires;
      } else if (type === 'email') {
        storedOTP = user.emailVerificationToken;
        expiresAt = user.emailVerificationExpires;
      } else {
        throw new Error('Invalid OTP type');
      }

      if (!storedOTP || !expiresAt) {
        throw new Error('No OTP found or expired');
      }

      if (expiresAt < new Date()) {
        throw new Error('OTP has expired');
      }

      if (storedOTP !== otp) {
        throw new Error('Invalid OTP');
      }

      // Clear OTP after successful verification
      if (type === 'phone') {
        user.phoneVerificationToken = undefined;
        user.phoneVerificationExpires = undefined;
      } else if (type === 'email') {
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
      }

      await user.save();
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Resend OTP
  async resendOTP(userId, type) {
    try {
      const User = require('../models/User.model');
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const otp = this.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      if (type === 'phone') {
        await this.sendSMSOTP(user.phoneNumber, otp, 'verification');
        user.phoneVerificationToken = otp;
        user.phoneVerificationExpires = expiresAt;
      } else {
        throw new Error('Invalid OTP type');
      }

      await user.save();
      return { success: true, message: 'OTP resent successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get SMS service status
  getSMSServiceStatus() {
    return smsService.getStatus();
  }

  // Test SMS service
  async testSMSService(testPhoneNumber) {
    try {
      const otp = this.generateOTP();
      return await this.sendSMSOTP(testPhoneNumber, otp, 'verification');
    } catch (error) {
      throw error;
    }
  }

  // Validate phone number format
  isValidPhoneNumber(phoneNumber) {
    return smsService.isValidPhoneNumber(phoneNumber);
  }
}

module.exports = new OTPService();
