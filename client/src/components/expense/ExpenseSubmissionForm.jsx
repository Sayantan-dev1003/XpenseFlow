import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { FiSave, FiX, FiDollarSign, FiCalendar, FiTag, FiFileText, FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import expenseService from '../../api/expenseService';
import companyService from '../../api/companyService';

const ExpenseSubmissionForm = ({ onClose, onSubmitSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: { code: 'USD', name: 'US Dollar', symbol: '$' },
    category: '',
    expenseDateTime: '',
    submissionDateTime: new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    receipt: null
  });

  const [errors, setErrors] = useState({});
  const [autoFilledFields] = useState(new Set());

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

      setFormData(prev => ({
        ...prev,
        submissionDateTime: new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      }));
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

  // Manual file select for non-OCR flow
  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const options = {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        maxIteration: 20,
        fileType: 'image/jpeg',
        initialQuality: 0.7
      };
      let compressedFile = await imageCompression(file, options);
      if (compressedFile.size > 51200) {
        compressedFile = await imageCompression(file, {
          ...options,
          initialQuality: 0.5,
          maxWidthOrHeight: 800
        });
      }
      setSelectedFile(compressedFile);
      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);
    } catch (err) {
      setPreviewUrl(null);
      setSelectedFile(null);
      console.error('Image compression failed:', err);
    } finally {
      setImageLoading(false);
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

    if (!formData.expenseDateTime) {
      newErrors.expenseDateTime = 'Expense date and time is required';
    }

    if (!formData.submissionDateTime) {
      newErrors.submissionDateTime = 'Submission date and time is required';
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
        date: new Date(formData.expenseDateTime).toISOString(),
        submissionDateTime: new Date(formData.submissionDateTime).toISOString()
      };

      await expenseService.submitExpense(expenseData, selectedFile);

      toast.success('Expense submitted successfully!');
      if (onSubmitSuccess) onSubmitSuccess();
      if (onClose) onClose();
    } catch (error) {
      let errorMessage = 'Failed to submit expense';
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        
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
      {/* Receipt Upload (Manual, non-OCR) */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Upload</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
            id="manual-receipt-file"
          />
          <label htmlFor="manual-receipt-file" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 cursor-pointer">
            {imageLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></span>
                Loading Image...
              </>
            ) : loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></span>
                Uploading...
              </>
            ) : (
              <>
                <FiUpload className="w-4 h-4 mr-2" />
                Choose Image
              </>
            )}
          </label>
          <p className="mt-2 text-sm text-gray-500">PNG, JPG, WebP up to 10MB</p>
          {selectedFile && (
            <div className="mt-4 text-left">
              <p className="text-sm text-gray-700"><strong>Selected:</strong> {selectedFile.name}</p>
              {previewUrl && (
                <img src={previewUrl} alt="Receipt preview" className="mt-2 max-h-56 rounded-md inline-block" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
                className={`block w-full px-3 py-2 text-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.title ? 'border-red-300' :
                    autoFilledFields.has('title') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                placeholder="Enter expense title"
              />
              <FiFileText className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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
                className={`block w-full px-3 py-2 border text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.category ? 'border-red-300' :
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
                className={`block w-full px-3 py-2 text-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.amount ? 'border-red-300' :
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
              className={`mt-1 block w-full px-3 py-2 text-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${autoFilledFields.has('currency') ? 'border-green-400 bg-green-50' : 'border-gray-300'
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
             <label htmlFor="expenseDateTime" className="block text-sm font-medium text-gray-700">
               Expense date & time *
             </label>
             <div className="mt-1 relative">
               <input
                 type="datetime-local"
                 id="expenseDateTime"
                 name="expenseDateTime"
                 value={formData.expenseDateTime}
                 onChange={handleInputChange}
                 className={`block w-full px-3 py-2 border text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.expenseDateTime ? 'border-red-300' :
                     autoFilledFields.has('expenseDateTime') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                   }`}
               />
               <FiCalendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
             </div>
             {errors.expenseDateTime && <p className="mt-1 text-sm text-red-600">{errors.expenseDateTime}</p>}
           </div>

           <div>
             <label htmlFor="submissionDateTime" className="block text-sm font-medium text-gray-700">
               Submission date & time *
             </label>
             <div className="mt-1 relative">
               <input
                 type="datetime-local"
                 id="submissionDateTime"
                 name="submissionDateTime"
                 value={formData.submissionDateTime}
                 onChange={() => {}}
                 readOnly
                 className={`block w-full px-3 py-2 border text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.submissionDateTime ? 'border-red-300' :
                     autoFilledFields.has('submissionDateTime') ? 'border-green-400 bg-green-50' : 'border-gray-300'
                   }`}
               />
               <FiCalendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
             </div>
             {errors.submissionDateTime && <p className="mt-1 text-sm text-red-600">{errors.submissionDateTime}</p>}
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
              className={`mt-1 block w-full px-3 py-2 text-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${autoFilledFields.has('description') ? 'border-green-400 bg-green-50' : 'border-gray-300'
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
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
        >
          <FiX className="w-4 h-4 mr-2 inline" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 border border-transparent rounded-md text-white bg-purple-500 hover:bg-purple-600 cursor-pointer"
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
