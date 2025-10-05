const axios = require('axios');
const FormData = require('form-data');
const config = require('../config');
const logger = require('../utils/logger');

// Server-side OCR has been removed in favor of client-side Tesseract.js

class ReceiptService {
    constructor() {
        this.restCountriesApi = 'https://restcountries.com/v3.1';
        this.exchangeRateApi = 'https://api.exchangerate-api.com/v4/latest';
    }

    /**
     * Process receipt image through OCR
     * @param {Buffer} imageBuffer - The receipt image as a buffer
     * @returns {Promise<Object>} Extracted OCR data
     */
    async processReceiptOCR() {
        // Intentionally disabled
        throw new Error('Server-side OCR is disabled. Use client-side Tesseract.js.');
    }

    /**
     * Get currency details for a country
     * @param {string} countryName - The name of the country
     * @returns {Promise<Object>} Currency details
     */
    async getCurrencyForCountry(countryName) {
        try {
            const response = await axios.get(
                `${this.restCountriesApi}/name/${encodeURIComponent(countryName)}?fields=name,currencies`
            );

            if (response.data && response.data[0]?.currencies) {
                const currencies = response.data[0].currencies;
                const currencyCode = Object.keys(currencies)[0];
                const currency = currencies[currencyCode];

                return {
                    code: currencyCode,
                    name: currency.name,
                    symbol: currency.symbol
                };
            }
            throw new Error('Currency information not found');
        } catch (error) {
            logger.error('Error fetching country currency:', error);
            throw new Error('Failed to fetch currency information');
        }
    }

    /**
     * Get exchange rate between currencies
     * @param {string} baseCurrency - The currency to convert from
     * @param {string} targetCurrency - The currency to convert to
     * @returns {Promise<number>} Exchange rate
     */
    async getExchangeRate(baseCurrency, targetCurrency) {
        try {
            const response = await axios.get(
                `${this.exchangeRateApi}/${baseCurrency}`
            );

            if (response.data?.rates?.[targetCurrency]) {
                return response.data.rates[targetCurrency];
            }
            throw new Error('Exchange rate not found');
        } catch (error) {
            logger.error('Error fetching exchange rate:', error);
            throw new Error('Failed to fetch exchange rate');
        }
    }

    /**
     * Extract meaningful text patterns from OCR data
     * @param {string} text - The raw OCR text
     * @returns {Object} Extracted patterns
     */
    extractDataPatterns(text) {
        // Implement regex patterns to extract:
        // - Currency symbols and amounts (e.g., $50.00, €100,00)
        // - Dates (various formats)
        // - Business names (usually at the top of receipt)
        // - Addresses and location information
        // This is a placeholder implementation
        return {
            amount: null,
            date: null,
            vendor: null,
            location: null
        };
    }

    /**
     * Clean and validate extracted amount
     * @param {string|number} amount 
     * @returns {number|null}
     */
    cleanAmount(amount) {
        if (!amount) return null;
        // Remove currency symbols and convert to number
        const cleaned = parseFloat(amount.toString().replace(/[^0-9.,]/g, '')
            .replace(',', '.'));
        return isNaN(cleaned) ? null : cleaned;
    }

    /**
     * Clean and validate extracted date
     * @param {string} date 
     * @returns {Date|null}
     */
    cleanDate(date) {
        if (!date) return null;
        const parsed = new Date(date);
        return parsed.toString() === 'Invalid Date' ? null : parsed;
    }
}

module.exports = new ReceiptService();