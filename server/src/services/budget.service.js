const Company = require('../models/Company.model');
const winston = require('winston');

class BudgetService {
  /**
   * Gets the current budget for a company, creating a new month's record if necessary.
   * This simulates a cron job by running on-demand.
   * @param {string} companyId - The ID of the company.
   * @returns {Promise<Object>} The budget object for the current month.
   */
  async getAndUpdateBudget(companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    let currentBudget = company.budgetHistory.find(
      b => b.year === currentYear && b.month === currentMonth
    );

    // If budget for the current month doesn't exist, create it
    if (!currentBudget) {
      winston.info(`No budget found for ${currentMonth}/${currentYear}. Creating new budget entry.`);
      
      const lastMonthDate = new Date(now.setMonth(now.getMonth() - 1));
      const lastMonthYear = lastMonthDate.getFullYear();
      const lastMonth = lastMonthDate.getMonth() + 1;

      const lastMonthBudget = company.budgetHistory.find(
        b => b.year === lastMonthYear && b.month === lastMonth
      );

      let rollover = 0;
      if (lastMonthBudget) {
        rollover = lastMonthBudget.allocated - lastMonthBudget.spent;
        winston.info(`Calculated rollover from previous month: ${rollover}`);
      }

      const staticMonthlyLimit = company.settings.expenseLimits.monthlyLimit || 0;
      
      currentBudget = {
        year: currentYear,
        month: currentMonth,
        allocated: staticMonthlyLimit + rollover,
        spent: 0,
        rollover: rollover
      };

      company.budgetHistory.push(currentBudget);
      await company.save();
      winston.info(`Saved new budget for ${currentMonth}/${currentYear} with allocation ${currentBudget.allocated}`);
    }

    return currentBudget;
  }
}

module.exports = new BudgetService();