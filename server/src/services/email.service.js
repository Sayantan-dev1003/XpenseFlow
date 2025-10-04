const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  // Create email transporter
  createTransporter() {
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

  // Send welcome email for new users
  async sendWelcomeEmail(email, firstName, tempPassword) {
    try {
      // Check if transporter is available
      if (!this.transporter) {
        console.error('Email transporter not available. Email credentials may not be configured properly.');
        throw new Error('Email service not configured. Please contact administrator.');
      }

      const loginUrl = `${config.CLIENT_URL}/login`;
      const html = this.getWelcomeEmailTemplate(firstName, email, tempPassword, loginUrl);
      
      const mailOptions = {
        from: `"XpenseFlow" <${config.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to XpenseFlow - Your Account is Ready!',
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Welcome email error:', error);
      
      // Provide more specific error messages
      if (error.code === 'EAUTH') {
        console.error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in environment variables.');
        throw new Error('Email authentication failed. Please contact administrator to configure email service.');
      } else if (error.code === 'ECONNECTION') {
        console.error('Email connection failed. Please check internet connection and email service configuration.');
        throw new Error('Email service temporarily unavailable. Please try again later.');
      } else {
        console.error('Unexpected email error:', error.message);
        throw new Error('Failed to send welcome email. Please contact administrator.');
      }
    }
  }

  // Get welcome email template
  getWelcomeEmailTemplate(firstName, email, tempPassword, loginUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to XpenseFlow</title>
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
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .credentials {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
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
            <h1>Welcome to XpenseFlow!</h1>
          </div>
          
          <p>Hello ${firstName},</p>
          <p>Your account has been created successfully! You can now access the XpenseFlow expense management system.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to XpenseFlow</a>
          </div>
          
          <div class="warning">
            <strong>Important Security Notice:</strong> Please change your password immediately after your first login for security reasons.
          </div>
          
          <p>If you have any questions or need assistance, please contact your administrator.</p>
          
          <div class="footer">
            <p>This is an automated message from XpenseFlow.</p>
            <p>© 2024 XpenseFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetUrl = `${config.CLIENT_URL}/reset-password?token=${resetToken}`;
      const html = this.getPasswordResetTemplate(resetUrl);
      
      const mailOptions = {
        from: `"AuthFlow" <${config.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - AuthFlow',
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Password reset email error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Get password reset email template
  getPasswordResetTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - AuthFlow</title>
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
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
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
            <div class="logo">AuthFlow</div>
            <h1>Password Reset Request</h1>
          </div>
          
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <div class="warning">
            <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4f46e5;">${resetUrl}</p>
          
          <div class="footer">
            <p>This is an automated message from AuthFlow.</p>
            <p>© 2024 AuthFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();