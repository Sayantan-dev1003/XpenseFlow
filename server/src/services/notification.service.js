const User = require('../models/User.model');
const emailService = require('./email.service');
const smsService = require('./sms.service');
const winston = require('winston');

class NotificationService {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/notifications.log' })
      ]
    });
  }

  /**
   * Send expense submission notification to managers and finance
   */
  async notifyExpenseSubmission(expense, submitter) {
    try {
      this.logger.info(`Sending expense submission notifications for expense ${expense._id}`);

      // Get all managers and finance users in the company
      const approvers = await User.find({
        company: expense.company,
        role: { $in: ['manager', 'finance'] },
        isActive: true
      });

      if (approvers.length === 0) {
        this.logger.warn(`No approvers found for company ${expense.company}`);
        return { success: false, message: 'No approvers found' };
      }

      const notifications = [];

      // Send notifications to each approver
      for (const approver of approvers) {
        try {
          // Send email notification
          const emailResult = await this.sendExpenseNotificationEmail(
            approver, 
            expense, 
            submitter, 
            'submission'
          );
          
          notifications.push({
            type: 'email',
            recipient: approver.email,
            success: emailResult.success
          });

          // Optionally send SMS if phone number exists
          if (approver.phoneNumber) {
            const smsResult = await this.sendExpenseNotificationSMS(
              approver, 
              expense, 
              submitter, 
              'submission'
            );
            
            notifications.push({
              type: 'sms',
              recipient: approver.phoneNumber,
              success: smsResult.success
            });
          }
        } catch (error) {
          this.logger.error(`Failed to notify ${approver.email}:`, error);
          notifications.push({
            type: 'email',
            recipient: approver.email,
            success: false,
            error: error.message
          });
        }
      }

      return { success: true, notifications };
    } catch (error) {
      this.logger.error('Error sending expense submission notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send expense approval/rejection notification
   */
  async notifyExpenseDecision(expense, submitter, approver, action, comment = '') {
    try {
      this.logger.info(`Sending expense ${action} notification for expense ${expense._id}`);

      const notifications = [];

      // Notify the submitter
      const emailResult = await this.sendExpenseNotificationEmail(
        submitter, 
        expense, 
        approver, 
        action,
        comment
      );
      
      notifications.push({
        type: 'email',
        recipient: submitter.email,
        success: emailResult.success
      });

      // If approved by one but still pending final approval, notify other approvers
      if (action === 'approved' && expense.status === 'processing') {
        const otherApprovers = await User.find({
          company: expense.company,
          role: { $in: ['manager', 'finance'] },
          isActive: true,
          _id: { $ne: approver._id }
        });

        for (const otherApprover of otherApprovers) {
          const result = await this.sendExpenseNotificationEmail(
            otherApprover, 
            expense, 
            submitter, 
            'partial_approval'
          );
          
          notifications.push({
            type: 'email',
            recipient: otherApprover.email,
            success: result.success
          });
        }
      }

      return { success: true, notifications };
    } catch (error) {
      this.logger.error('Error sending expense decision notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email notification for expense events
   */
  async sendExpenseNotificationEmail(recipient, expense, actor, type, comment = '') {
    try {
      let subject, htmlContent;

      switch (type) {
        case 'submission':
          subject = `New Expense Submitted: ${expense.title}`;
          htmlContent = `
            <h2>New Expense Requires Your Approval</h2>
            <p>Dear ${recipient.firstName} ${recipient.lastName},</p>
            <p>A new expense has been submitted and requires your approval:</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>${expense.title}</h3>
              <p><strong>Submitted by:</strong> ${actor.firstName} ${actor.lastName}</p>
              <p><strong>Amount:</strong> ${expense.currency.symbol}${expense.amount} (${expense.currency.code})</p>
              <p><strong>Category:</strong> ${expense.category}</p>
              <p><strong>Date:</strong> ${new Date(expense.date).toLocaleDateString()}</p>
              ${expense.description ? `<p><strong>Description:</strong> ${expense.description}</p>` : ''}
            </div>
            
            <p>Please log in to the system to review and approve this expense.</p>
            <p>Best regards,<br>Expense Management System</p>
          `;
          break;

        case 'approved':
          subject = `Expense Approved: ${expense.title}`;
          htmlContent = `
            <h2>Your Expense Has Been Approved</h2>
            <p>Dear ${recipient.firstName} ${recipient.lastName},</p>
            <p>Your expense has been approved by ${actor.firstName} ${actor.lastName}:</p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #10b981;">
              <h3>${expense.title}</h3>
              <p><strong>Amount:</strong> ${expense.currency.symbol}${expense.amount} (${expense.currency.code})</p>
              <p><strong>Status:</strong> ${expense.status === 'approved' ? 'Fully Approved' : 'Partially Approved'}</p>
              ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
            </div>
            
            ${expense.status === 'approved' ? 
              '<p>Your expense is now ready for reimbursement.</p>' : 
              '<p>Your expense still requires approval from another approver.</p>'
            }
            
            <p>Best regards,<br>Expense Management System</p>
          `;
          break;

        case 'rejected':
          subject = `Expense Rejected: ${expense.title}`;
          htmlContent = `
            <h2>Your Expense Has Been Rejected</h2>
            <p>Dear ${recipient.firstName} ${recipient.lastName},</p>
            <p>Unfortunately, your expense has been rejected by ${actor.firstName} ${actor.lastName}:</p>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ef4444;">
              <h3>${expense.title}</h3>
              <p><strong>Amount:</strong> ${expense.currency.symbol}${expense.amount} (${expense.currency.code})</p>
              <p><strong>Status:</strong> Rejected</p>
              ${comment ? `<p><strong>Reason:</strong> ${comment}</p>` : ''}
            </div>
            
            <p>You may resubmit this expense with corrections if needed.</p>
            <p>Best regards,<br>Expense Management System</p>
          `;
          break;

        case 'partial_approval':
          subject = `Expense Partially Approved: ${expense.title}`;
          htmlContent = `
            <h2>Expense Requires Your Approval</h2>
            <p>Dear ${recipient.firstName} ${recipient.lastName},</p>
            <p>An expense has been partially approved and now requires your approval:</p>
            
            <div style="background: #fffbeb; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f59e0b;">
              <h3>${expense.title}</h3>
              <p><strong>Submitted by:</strong> ${actor.firstName} ${actor.lastName}</p>
              <p><strong>Amount:</strong> ${expense.currency.symbol}${expense.amount} (${expense.currency.code})</p>
              <p><strong>Category:</strong> ${expense.category}</p>
              <p><strong>Status:</strong> Partially Approved</p>
            </div>
            
            <p>This expense has received one approval and now needs your review to be fully approved.</p>
            <p>Please log in to the system to review and approve this expense.</p>
            <p>Best regards,<br>Expense Management System</p>
          `;
          break;
      }

      const result = await emailService.sendEmail(
        recipient.email,
        subject,
        htmlContent
      );

      return { success: true, result };
    } catch (error) {
      this.logger.error(`Failed to send email to ${recipient.email}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS notification for expense events
   */
  async sendExpenseNotificationSMS(recipient, expense, actor, type) {
    try {
      let message;

      switch (type) {
        case 'submission':
          message = `New expense "${expense.title}" (${expense.currency.symbol}${expense.amount}) submitted by ${actor.firstName} ${actor.lastName} requires your approval. Please check the system.`;
          break;
        case 'approved':
          message = `Your expense "${expense.title}" has been approved by ${actor.firstName} ${actor.lastName}. Status: ${expense.status === 'approved' ? 'Fully Approved' : 'Partially Approved'}.`;
          break;
        case 'rejected':
          message = `Your expense "${expense.title}" has been rejected by ${actor.firstName} ${actor.lastName}. Please check the system for details.`;
          break;
        case 'partial_approval':
          message = `Expense "${expense.title}" by ${actor.firstName} ${actor.lastName} is partially approved and requires your review.`;
          break;
      }

      const result = await smsService.sendSMS(recipient.phoneNumber, message);
      return { success: true, result };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${recipient.phoneNumber}:`, error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
