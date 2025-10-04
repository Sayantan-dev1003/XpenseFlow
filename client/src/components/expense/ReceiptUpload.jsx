import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiEye, FiCheck, FiLoader } from 'react-icons/fi';
import ocrService from '../../services/ocrService';

const ReceiptUpload = ({ onReceiptData, onFileSelect, disabled = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate file
      ocrService.validateImageFile(file);
      
      setSelectedFile(file);
      setExtractedData(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Notify parent component
      if (onFileSelect) {
        onFileSelect(file);
      }
    } catch (error) {
      alert(error.message);
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
      
      // Notify parent component with extracted data
      if (onReceiptData) {
        onReceiptData(receiptData);
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert('Failed to process receipt. You can still submit manually.');
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setShowPreview(false);
    setIsProcessing(false);
    setOcrProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clean up preview URL
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

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
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
              PNG, JPG, WebP, PDF up to 10MB
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
                  onClick={() => setShowPreview(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Preview"
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

            {/* Extracted Data */}
            {extractedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FiCheck className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="text-sm font-medium text-green-800">
                    Data Extracted Successfully
                  </h4>
                  <span className="ml-auto text-xs text-green-600">
                    Confidence: {extractedData.confidence}%
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <p className="text-gray-900">
                      {extractedData.extractedAmount 
                        ? `$${extractedData.extractedAmount.toFixed(2)}`
                        : 'Not found'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <p className="text-gray-900">
                      {extractedData.extractedDate 
                        ? new Date(extractedData.extractedDate).toLocaleDateString()
                        : 'Not found'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Vendor:</span>
                    <p className="text-gray-900 truncate">
                      {extractedData.extractedVendor || 'Not found'}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-green-600 mt-2">
                  Review and edit the extracted data in the form below
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Receipt Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptUpload;
