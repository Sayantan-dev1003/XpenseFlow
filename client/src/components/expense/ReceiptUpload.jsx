import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiEye, FiCheck, FiLoader, FiSave, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ocrService from '../../services/ocrService';
import expenseService from '../../api/expenseService';

const ReceiptUpload = ({ onClose, disabled = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload' or 'edit'
  const fileInputRef = useRef(null);
  
  const [editedData, setEditedData] = useState({
    title: '',
    amount: '',
    currency: {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$'
    },
    category: '',
    expenseDateTime: new Date().toISOString().slice(0, 16),
    description: ''
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      ocrService.validateImageFile(file);
      setSelectedFile(file);
      setExtractedData(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (error) {
      toast.error(error.message);
      resetUpload();
    }
  };

  const processWithOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setOcrProgress(0);

    try {
      const receiptData = await ocrService.processReceipt(
        selectedFile,
        (progress) => setOcrProgress(progress)
      );

      setExtractedData(receiptData);
      
      // Pre-fill the edited data with extracted values
      setEditedData({
        title: receiptData.extractedVendor ? `Expense from ${receiptData.extractedVendor}` : '',
        amount: receiptData.extractedAmount?.toString() || '',
        currency: {
          code: receiptData.extractedCurrency || 'USD',
          name: receiptData.extractedCurrency === 'INR' ? 'Indian Rupee' : 'US Dollar',
          symbol: receiptData.extractedCurrency === 'INR' ? '₹' : '$'
        },
        category: receiptData.extractedCategory || '',
        expenseDateTime: receiptData.extractedDate ? new Date(receiptData.extractedDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        description: receiptData.extractedDescription || ''
      });
      
      // Move to edit step
      setCurrentStep('edit');
      toast.success('Receipt data extracted successfully!');
    } catch (error) {
      console.error('OCR processing failed:', error);
      toast.error('Failed to process receipt. You can still enter details manually.');
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format the data according to server expectations
      const formattedData = {
        title: editedData.title,
        amount: parseFloat(editedData.amount),
        currency: editedData.currency,
        category: editedData.category,
        description: editedData.description || '',
        date: editedData.expenseDateTime,
        submissionDateTime: new Date().toISOString(),
        notes: editedData.description || ''
      };

      // Log the data being sent for debugging
      console.log('Submitting expense:', formattedData);
      console.log('Receipt file:', selectedFile);

      await expenseService.submitExpense(formattedData, selectedFile);

      toast.success('Expense submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to submit expense:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit expense. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'currency') {
      // Handle currency code change
      const currencyInfo = {
        USD: { name: 'US Dollar', symbol: '$' },
        INR: { name: 'Indian Rupee', symbol: '₹' },
        EUR: { name: 'Euro', symbol: '€' },
        GBP: { name: 'British Pound', symbol: '£' }
      };

      const code = value.toUpperCase();
      setEditedData(prev => ({
        ...prev,
        currency: {
          code,
          name: currencyInfo[code]?.name || code,
          symbol: currencyInfo[code]?.symbol || code
        }
      }));
    } else {
      setEditedData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setShowPreview(false);
    setIsProcessing(false);
    setOcrProgress(0);
    setCurrentStep('upload');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (currentStep === 'edit') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Review Extracted Data</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                name="title"
                value={editedData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full text-gray-500 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount *</label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  name="amount"
                  value={editedData.amount}
                  onChange={handleInputChange}
                  className="block w-full text-gray-500 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  step="0.01"
                  min="0"
                />
                <FiDollarSign className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Currency *</label>
              <input
                type="text"
                name="currency"
                value={editedData.currency.code}
                onChange={handleInputChange}
                className="mt-1 block w-full text-gray-500 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <input
                type="text"
                name="category"
                value={editedData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full text-gray-500 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date and Time *</label>
              <div className="mt-1 relative">
                <input
                  type="datetime-local"
                  name="expenseDateTime"
                  value={editedData.expenseDateTime}
                  onChange={handleInputChange}
                  className="block w-full text-gray-500 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <FiCalendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={editedData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full text-gray-500 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Preview Image */}
          {previewUrl && (
            <div className="mt-6 border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Receipt</h4>
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetUpload}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin inline mr-2 h-4 w-4" />
                  Submitting...
                </>
              ) : (
                <>
                  <FiSave className="inline mr-2 h-4 w-4" />
                  Submit Expense
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isProcessing}
          className="hidden"
        />
        
        {!selectedFile ? (
          <div>
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Receipt
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              PNG, JPG, WebP up to 10MB
            </p>
            <p className="mt-1 text-xs text-gray-400">
              For PDF files, please convert to image first
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiUpload className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Toggle Preview"
                >
                  <FiEye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={resetUpload}
                  disabled={isProcessing}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  title="Remove"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* OCR Processing */}
            {!extractedData && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={processWithOCR}
                  disabled={isProcessing || disabled}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Processing... {ocrProgress}%
                    </>
                  ) : (
                    <>
                      <FiCheck className="-ml-1 mr-2 h-4 w-4" />
                      Extract Data with OCR
                    </>
                  )}
                </button>
                
                {isProcessing && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Image */}
      {showPreview && previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Receipt preview"
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;