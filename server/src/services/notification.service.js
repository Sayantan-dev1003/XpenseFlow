const User = require('../models/User.model');
// Email service removed
// SMS service removed
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

      for (const approver of approvers) {
        try {
        } catch (error) {
          this.logger.error(`Failed to notify approver:`, error);
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
  async notifyExpenseDecision(expense, submitter, approver, action) {
    try {
      this.logger.info(`Sending expense ${action} notification for expense ${expense._id}`);

      const notifications = [];

      if (action === 'approved' && expense.status === 'processing') {
        const otherApprovers = await User.find({
          company: expense.company,
          role: { $in: ['manager', 'finance'] },
          isActive: true,
          _id: { $ne: approver._id }
        });

      }

      return { success: true, notifications };
    } catch (error) {
      this.logger.error('Error sending expense decision notifications:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
