const axios = require('axios');
const winston = require('winston');

class CurrencyService {
  constructor() {
    this.exchangeRateCache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour in milliseconds
    this.countriesCache = null;
    this.countriesCacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get all countries with their currencies from REST Countries API
   */
  async getAllCountriesWithCurrencies() {
    try {
      // Check cache first
      if (this.countriesCache && 
          this.countriesCache.timestamp && 
          Date.now() - this.countriesCache.timestamp < this.countriesCacheExpiry) {
        return this.countriesCache.data;
      }

      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies', {
        timeout: 10000
      });

      const countries = response.data.map(country => {
        const currencies = country.currencies ? Object.entries(country.currencies) : [];
        return {
          name: country.name.common,
          officialName: country.name.official,
          currencies: currencies.map(([code, details]) => ({
            code,
            name: details.name,
            symbol: details.symbol || code
          }))
        };
      }).filter(country => country.currencies.length > 0);

      // Cache the result
      this.countriesCache = {
        data: countries,
        timestamp: Date.now()
      };

      winston.info(`Fetched ${countries.length} countries with currencies`);
      return countries;
    } catch (error) {
      winston.error('Error fetching countries with currencies:', error.message);
      
      // Return fallback data if API fails
      return this.getFallbackCountriesData();
    }
  }

  /**
   * Get currency by country name
   */
  async getCurrencyByCountry(countryName) {
    try {
      const countries = await this.getAllCountriesWithCurrencies();
      const country = countries.find(c => 
        c.name.toLowerCase().includes(countryName.toLowerCase()) ||
        c.officialName.toLowerCase().includes(countryName.toLowerCase())
      );

      if (country && country.currencies.length > 0) {
        // Return the first currency (most countries have one primary currency)
        return country.currencies[0];
      }

      return null;
    } catch (error) {
      winston.error('Error getting currency by country:', error.message);
      return null;
    }
  }

  /**
   * Get exchange rates for a base currency
   */
  async getExchangeRates(baseCurrency = 'USD') {
    try {
      const cacheKey = baseCurrency.toUpperCase();
      const cached = this.exchangeRateCache.get(cacheKey);

      // Check if we have valid cached data
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, {
        timeout: 10000
      });

      const exchangeData = {
        base: response.data.base,
        date: response.data.date,
        rates: response.data.rates,
        timestamp: Date.now()
      };

      // Cache the result
      this.exchangeRateCache.set(cacheKey, {
        data: exchangeData,
        timestamp: Date.now()
      });

      winston.info(`Fetched exchange rates for ${baseCurrency}`);
      return exchangeData;
    } catch (error) {
      winston.error('Error fetching exchange rates:', error.message);
      
      // Return cached data if available, even if expired
      const cached = this.exchangeRateCache.get(baseCurrency.toUpperCase());
      if (cached) {
        winston.warn('Using expired exchange rate data due to API failure');
        return cached.data;
      }

      // Return fallback rates
      return this.getFallbackExchangeRates(baseCurrency);
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) {
        return {
          originalAmount: amount,
          convertedAmount: amount,
          exchangeRate: 1,
          fromCurrency,
          toCurrency
        };
      }

      const exchangeData = await this.getExchangeRates(fromCurrency);
      const rate = exchangeData.rates[toCurrency];

      if (!rate) {
        throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      }

      const convertedAmount = amount * rate;

      return {
        originalAmount: amount,
        convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
        exchangeRate: rate,
        fromCurrency,
        toCurrency,
        date: exchangeData.date
      };
    } catch (error) {
      winston.error('Error converting currency:', error.message);
      throw new Error(`Currency conversion failed: ${error.message}`);
    }
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies() {
    try {
      const exchangeData = await this.getExchangeRates('USD');
      const currencies = Object.keys(exchangeData.rates);
      
      // Add USD as it's the base currency
      if (!currencies.includes('USD')) {
        currencies.unshift('USD');
      }

      return currencies.sort();
    } catch (error) {
      winston.error('Error getting supported currencies:', error.message);
      return this.getFallbackCurrencies();
    }
  }

  /**
   * Validate currency code
   */
  async isValidCurrency(currencyCode) {
    try {
      const supportedCurrencies = await this.getSupportedCurrencies();
      return supportedCurrencies.includes(currencyCode.toUpperCase());
    } catch (error) {
      winston.error('Error validating currency:', error.message);
      return false;
    }
  }

  /**
   * Get currency details by code
   */
  async getCurrencyDetails(currencyCode) {
    try {
      const countries = await this.getAllCountriesWithCurrencies();
      
      for (const country of countries) {
        const currency = country.currencies.find(c => c.code === currencyCode.toUpperCase());
        if (currency) {
          return {
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            country: country.name
          };
        }
      }

      return null;
    } catch (error) {
      winston.error('Error getting currency details:', error.message);
      return null;
    }
  }

  /**
   * Fallback countries data in case API fails
   */
  getFallbackCountriesData() {
    return [
      {
        name: 'United States',
        currencies: [{ code: 'USD', name: 'United States Dollar', symbol: '$' }]
      },
      {
        name: 'United Kingdom',
        currencies: [{ code: 'GBP', name: 'British Pound Sterling', symbol: '£' }]
      },
      {
        name: 'European Union',
        currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }]
      },
      {
        name: 'India',
        currencies: [{ code: 'INR', name: 'Indian Rupee', symbol: '₹' }]
      },
      {
        name: 'Canada',
        currencies: [{ code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' }]
      },
      {
        name: 'Australia',
        currencies: [{ code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }]
      },
      {
        name: 'Japan',
        currencies: [{ code: 'JPY', name: 'Japanese Yen', symbol: '¥' }]
      }
    ];
  }

  /**
   * Fallback exchange rates in case API fails
   */
  getFallbackExchangeRates(baseCurrency) {
    const fallbackRates = {
      USD: { EUR: 0.85, GBP: 0.73, INR: 83.0, CAD: 1.35, AUD: 1.50, JPY: 110.0 },
      EUR: { USD: 1.18, GBP: 0.86, INR: 97.6, CAD: 1.59, AUD: 1.77, JPY: 129.4 },
      GBP: { USD: 1.37, EUR: 1.16, INR: 113.7, CAD: 1.85, AUD: 2.06, JPY: 150.7 }
    };

    const rates = fallbackRates[baseCurrency] || fallbackRates.USD;
    
    return {
      base: baseCurrency,
      date: new Date().toISOString().split('T')[0],
      rates: { ...rates, [baseCurrency]: 1 },
      timestamp: Date.now()
    };
  }

  /**
   * Fallback currencies list
   */
  getFallbackCurrencies() {
    return ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'SGD'];
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache() {
    this.exchangeRateCache.clear();
    this.countriesCache = null;
    winston.info('Currency service cache cleared');
  }
}

module.exports = new CurrencyService();
