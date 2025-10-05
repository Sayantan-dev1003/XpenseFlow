import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiDollarSign, FiCalendar, FiTag, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReceiptUpload from './ReceiptUpload';
import expenseService from '../../api/expenseService';
import companyService from '../../api/companyService';

const ExpenseSubmissionForm = ({ onClose, onSubmitSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: { code: 'USD', name: 'US Dollar', symbol: '$' },
    category: '',
    expenseDateTime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    receipt: null,
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [autoFilledFields, setAutoFilledFields] = useState(new Set());

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [currenciesRes, companyRes] = await Promise.all([
        companyService.getSupportedCurrencies(),
        companyService.getCompany()
      ]);

      setCurrencies(currenciesRes.data.currencies || []);
      
      if (companyRes.data.company?.settings?.expenseCategories) {
        setCategories(companyRes.data.company.settings.expenseCategories.filter(cat => cat.isActive));
      } else {
        setCategories(expenseService.getExpenseCategories().map(cat => ({ name: cat, isActive: true })));
      }

      // Set default currency to company's base currency
      if (companyRes.data.company?.baseCurrency) {
        setFormData(prev => ({
          ...prev,
          currency: companyRes.data.company.baseCurrency
        }));
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCurrencyChange = (e) => {
    const currencyCode = e.target.value;
    const currency = currencies.find(c => c === currencyCode);
    
    setFormData(prev => ({
      ...prev,
      currency: {
        code: currencyCode,
        name: currency || currencyCode,
        symbol: currencyCode === 'USD' ? '$' : currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : currencyCode
      }
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value ? e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleReceiptData = (ocrData) => {
    console.log('📋 Received OCR data:', ocrData);
    
    // Auto-fill form with OCR extracted data
    const updates = {
      tags: [] // Initialize tags array in updates
    };
    const filledFields = new Set();
    
    // Title - only if empty
    if (ocrData.extractedVendor && !formData.title.trim()) {
      updates.title = `Expense from ${ocrData.extractedVendor}`;
      filledFields.add('title');
    }
    
    // Amount
    if (ocrData.extractedAmount) {
      updates.amount = ocrData.extractedAmount.toString();
      filledFields.add('amount');
    }
    
    // Currency
    if (ocrData.extractedCurrency) {
      const currencyCode = ocrData.extractedCurrency.toUpperCase();
      console.log('🪙 Detected currency:', currencyCode, 'Available currencies:', currencies);
      const currencyExists = currencies.includes(currencyCode);
      if (currencyExists) {
        updates.currency = {
          code: currencyCode,
          name: currencyCode,
          symbol: currencyCode === 'USD' ? '$' : currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : currencyCode === 'INR' ? '₹' : currencyCode
        };
        filledFields.add('currency');
        console.log('✅ Currency updated to:', updates.currency);
      } else {
        console.log('❌ Currency not supported:', currencyCode);
      }
    }
    
    // Date
    if (ocrData.extractedDate) {
      updates.date = new Date(ocrData.extractedDate).toISOString().split('T')[0];
      filledFields.add('date');
    }
    
    // Category
    if (ocrData.extractedCategory) {
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase() === ocrData.extractedCategory.toLowerCase()
      );
      if (matchingCategory) {
        updates.category = matchingCategory.name;
        filledFields.add('category');
      }
    }
    
    // Description - only if empty
    if (ocrData.extractedDescription && !formData.description.trim()) {
      updates.description = ocrData.extractedDescription;
      filledFields.add('description');
    }
    
    // Tags
    if (ocrData.extractedTags && ocrData.extractedTags.length > 0) {
      // Merge with existing tags
      const existingTags = formData.tags || [];
      const newTags = [...new Set([...existingTags, ...ocrData.extractedTags])];
      updates.tags = newTags;
      filledFields.add('tags');
    }
    
    // Notes - only if empty
    if (ocrData.extractedNotes && !formData.notes.trim()) {
      updates.notes = ocrData.extractedNotes;
      filledFields.add('notes');
    }

    // Apply all updates at once
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...updates
      }));
      
      setAutoFilledFields(filledFields);
      
      // Clear auto-filled highlighting after 5 seconds
      setTimeout(() => {
        setAutoFilledFields(new Set());
      }, 5000);
      
      const fieldsCount = filledFields.size;
      toast.success(`Receipt data extracted! ${fieldsCount} field${fieldsCount > 1 ? 's' : ''} auto-filled (${ocrData.confidence}% confidence)`);
    } else {
      toast.info('Receipt processed, but no data could be extracted automatically.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        amount: parseFloat(formData.amount),
        currency: {
          code: formData.currency.code.toUpperCase(),
          name: formData.currency.name,
          symbol: formData.currency.symbol
        },
        category: formData.category.trim(),
        date: new Date(formData.date).toISOString(),
        tags: formData.tags || [],
        notes: formData.notes?.trim() || ''
      };

      console.log('📤 Submitting expense data:', expenseData);
      console.log('📤 Expense data types:', {
        title: typeof expenseData.title,
        amount: typeof expenseData.amount,
        currency: typeof expenseData.currency,
        category: typeof expenseData.category,
        date: typeof expenseData.date,
        tags: typeof expenseData.tags,
        description: typeof expenseData.description,
        notes: typeof expenseData.notes
      });
      console.log('📤 Currency object:', expenseData.currency);
      console.log('📤 Date value:', expenseData.date);
      console.log('📤 Tags array:', expenseData.tags);
      
      await expenseService.submitExpense(expenseData, selectedFile);
      
      toast.success('Expense submitted successfully!');
      if (onSubmitSuccess) onSubmitSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to submit expense:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Validation errors:', error.response?.data?.errors);
      
      let errorMessage = 'Failed to submit expense';
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        console.error('Full validation errors object:', JSON.stringify(validationErrors, null, 2));
        
        // Extract detailed error messages
        let errorMessages = [];
        if (validationErrors.body && Array.isArray(validationErrors.body)) {
          errorMessages = validationErrors.body.map(err => `${err.field}: ${err.message}`);
          console.error('Body validation errors:', validationErrors.body);
        } else {
          errorMessages = Object.entries(validationErrors).map(([field, msg]) => `${field}: ${msg}`);
        }
        
        errorMessage = `Validation failed: ${errorMessages.join(', ')}`;
        console.error('Detailed validation errors:', validationErrors);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = `Validation error: ${error.response.data.details}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
          {/* Receipt Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Upload</h3>
            <ReceiptUpload
              onReceiptData={handleReceiptData}
              onFileSelect={setSelectedFile}
              onClose={onClose}
              disabled={loading}
            />
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 text-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.title ? 'border-red-300' : 
                      autoFilledFields.has('title') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter expense title"
                  />
                  <FiFileText className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`block w-full px-3 py-2 text-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.amount ? 'border-red-300' : 
                      autoFilledFields.has('amount') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter amount"
                  />
                  <FiDollarSign className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency.code}
                  onChange={handleCurrencyChange}
                  className={`mt-1 block w-full px-3 py-2 text-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                    autoFilledFields.has('currency') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <div className="mt-1 relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.category ? 'border-red-300' : 
                      autoFilledFields.has('category') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <FiTag className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <div className="mt-1 relative">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      errors.date ? 'border-red-300' : 
                      autoFilledFields.has('date') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                    }`}
                  />
                  <FiCalendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 text-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                    autoFilledFields.has('description') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter expense description"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FiX className="w-4 h-4 mr-2 inline" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2 inline" />
                  Submit Expense
                </>
              )}
            </button>
        </div>
    </form>
  );
};

export default ExpenseSubmissionForm;
