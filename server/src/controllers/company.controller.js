const Company = require('../models/Company.model');
const User = require('../models/User.model');
const currencyService = require('../services/currency.service');
const winston = require('winston');

class CompanyController {
  /**
   * Create a new company (typically during user registration)
   */
  async createCompany(req, res) {
    try {
      const { name, country, industry, website, address } = req.body;
      const userId = req.user.id;

      // Get currency for the country
      const currency = await currencyService.getCurrencyByCountry(country);
      if (!currency) {
        return res.status(400).json({
          success: false,
          message: 'Unable to determine currency for the specified country'
        });
      }

      // Create company
      const company = new Company({
        name,
        country,
        baseCurrency: currency,
        industry,
        website,
        address,
        createdBy: userId
      });

      await company.save();

      // Update user to be admin of this company
      await User.findByIdAndUpdate(userId, {
        company: company._id,
        role: 'admin'
      });

      winston.info(`Company created: ${company.name} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: {
          company: company.toObject()
        }
      });
    } catch (error) {
      winston.error('Error creating company:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create company',
        error: error.message
      });
    }
  }

  /**
   * Get company details
   */
  async getCompany(req, res) {
    try {
      const companyId = req.user.company;

      const company = await Company.findById(companyId)
        .populate('createdBy', 'firstName lastName email');

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      res.json({
        success: true,
        data: {
          company: company.toObject()
        }
      });
    } catch (error) {
      winston.error('Error fetching company:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company details',
        error: error.message
      });
    }
  }

  /**
   * Update company details (Admin only)
   */
  async updateCompany(req, res) {
    try {
      const companyId = req.user.company;
      const updates = req.body;

      // Only admins can update company details
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can update company details'
        });
      }

      // If country is being updated, update currency as well
      if (updates.country && updates.country !== req.company.country) {
        const currency = await currencyService.getCurrencyByCountry(updates.country);
        if (currency) {
          updates.baseCurrency = currency;
        }
      }

      const company = await Company.findByIdAndUpdate(
        companyId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      winston.info(`Company updated: ${company.name} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Company updated successfully',
        data: {
          company: company.toObject()
        }
      });
    } catch (error) {
      winston.error('Error updating company:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update company',
        error: error.message
      });
    }
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(req, res) {
    try {
      const companyId = req.user.company;

      // Get user counts by role
      const userStats = await User.aggregate([
        { $match: { company: companyId, isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      const stats = {
        users: {
          total: 0,
          admin: 0,
          manager: 0,
          employee: 0
        }
      };

      userStats.forEach(stat => {
        stats.users[stat._id] = stat.count;
        stats.users.total += stat.count;
      });

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      winston.error('Error fetching company stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch company statistics',
        error: error.message
      });
    }
  }


  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(req, res) {
    try {
      const currencies = await currencyService.getSupportedCurrencies();

      res.json({
        success: true,
        data: {
          currencies
        }
      });
    } catch (error) {
      winston.error('Error fetching currencies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supported currencies',
        error: error.message
      });
    }
  }

  /**
   * Update expense categories (Admin only)
   */
  async updateExpenseCategories(req, res) {
    try {
      const companyId = req.user.company;
      const { categories } = req.body;

      // Only admins can update expense categories
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can update expense categories'
        });
      }

      const company = await Company.findByIdAndUpdate(
        companyId,
        { $set: { 'settings.expenseCategories': categories } },
        { new: true, runValidators: true }
      );

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      winston.info(`Expense categories updated for company ${company.name}`);

      res.json({
        success: true,
        message: 'Expense categories updated successfully',
        data: {
          categories: company.settings.expenseCategories
        }
      });
    } catch (error) {
      winston.error('Error updating expense categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update expense categories',
        error: error.message
      });
    }
  }

  /**
   * Update company settings (Admin only)
   */
  async updateCompanySettings(req, res) {
    try {
      const companyId = req.user.company;
      const { settings } = req.body;

      // Only admins can update company settings
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can update company settings'
        });
      }

      const company = await Company.findByIdAndUpdate(
        companyId,
        { $set: { settings } },
        { new: true, runValidators: true }
      );

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      winston.info(`Company settings updated for ${company.name}`);

      res.json({
        success: true,
        message: 'Company settings updated successfully',
        data: {
          settings: company.settings
        }
      });
    } catch (error) {
      winston.error('Error updating company settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update company settings',
        error: error.message
      });
    }
  }

  /**
   * Get exchange rates for company's base currency
   */
  async getExchangeRates(req, res) {
    try {
      const company = await Company.findById(req.user.company);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      const exchangeRates = await currencyService.getExchangeRates(company.baseCurrency.code);

      res.json({
        success: true,
        data: {
          baseCurrency: company.baseCurrency,
          rates: exchangeRates
        }
      });
    } catch (error) {
      winston.error('Error fetching exchange rates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch exchange rates',
        error: error.message
      });
    }
  }
}

module.exports = new CompanyController();
