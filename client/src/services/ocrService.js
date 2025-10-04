import Tesseract from 'tesseract.js';

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitializing = false;
  }

  /**
   * Initialize Tesseract worker with better error handling
   */
  async initWorker() {
    if (this.worker) {
      return this.worker;
    }

    if (this.isInitializing) {
      // Wait for existing initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.worker;
    }

    try {
      this.isInitializing = true;
      
      // Create worker with specific configuration to avoid CSP issues
      this.worker = await Tesseract.createWorker('eng', 1, {
        workerPath: 'https://unpkg.com/tesseract.js@5.1.0/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://unpkg.com/tesseract.js-core@5.0.0/tesseract-core-simd.wasm.js',
      });
      
      return this.worker;
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      this.worker = null;
      throw new Error('Failed to initialize OCR engine. Please try again or upload manually.');
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Extract text from image file
   */
  async extractText(imageFile, onProgress = null) {
    try {
      const worker = await this.initWorker();
      
      if (!worker) {
        throw new Error('OCR worker not available');
      }
      
      const { data: { text } } = await worker.recognize(imageFile, {
        logger: onProgress ? (m) => {
          if (m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        } : undefined
      });

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the image');
      }

      return text;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      
      // Provide more specific error messages
      if (error.message.includes('worker')) {
        throw new Error('OCR service is not available. Please try again or enter data manually.');
      } else if (error.message.includes('CSP') || error.message.includes('Content Security Policy')) {
        throw new Error('Browser security settings are blocking OCR. Please enter data manually.');
      } else {
        throw new Error('Failed to extract text from image. Please try again or enter data manually.');
      }
    }
  }

  /**
   * Extract structured data from receipt text
   */
  extractReceiptData(text) {
    const data = {
      extractedText: text,
      extractedAmount: null,
      extractedDate: null,
      extractedVendor: null,
      extractedCategory: null,
      extractedDescription: null,
      confidence: 0
    };

    try {
      // Extract amount - look for currency symbols and numbers (including INR)
      const amountPatterns = [
        /\$\s*(\d+(?:\.\d{2})?)/g,
        /(\d+(?:\.\d{2})?)\s*\$/g,
        /(\d+(?:\.\d{1,2}))\s*INR/gi,
        /INR\s*(\d+(?:\.\d{1,2})?)/gi,
        /total[:\s]*\$?\s*(\d+(?:\.\d{1,2})?)/gi,
        /total[:\s]*(\d+(?:\.\d{1,2})?)\s*INR/gi,
        /amount[:\s]*\$?\s*(\d+(?:\.\d{1,2})?)/gi,
        /(\d+\.\d{1,2})/g
      ];

      let amounts = [];
      amountPatterns.forEach(pattern => {
        const matches = [...text.matchAll(pattern)];
        matches.forEach(match => {
          const amount = parseFloat(match[1]);
          if (amount > 0) {
            amounts.push(amount);
          }
        });
      });

      if (amounts.length > 0) {
        // Usually the largest amount is the total
        data.extractedAmount = Math.max(...amounts);
        data.confidence += 30;
      }

      // Extract date - various date formats
      const datePatterns = [
        /(\d{1,2}\/\d{1,2}\/\d{2,4})/g,
        /(\d{1,2}-\d{1,2}-\d{2,4})/g,
        /(\d{4}-\d{1,2}-\d{1,2})/g,
        /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}/gi,
        /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4}/gi,
        /date[:\s]*(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
        /(\d{2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4})/gi
      ];

      datePatterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match && !data.extractedDate) {
          const dateStr = match[0];
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            data.extractedDate = parsedDate;
            data.confidence += 25;
          }
        }
      });

      // Extract vendor/merchant name
      // Look for common patterns at the beginning of receipts
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      // Look for business names in the first few lines
      for (let i = 0; i < Math.min(8, lines.length); i++) {
        const line = lines[i].trim();
        
        // Skip lines that look like addresses, phone numbers, or common receipt terms
        if (line.length > 3 && 
            !line.match(/^\d+/) && 
            !line.toLowerCase().includes('receipt') &&
            !line.toLowerCase().includes('invoice') &&
            !line.toLowerCase().includes('phone') &&
            !line.toLowerCase().includes('address') &&
            !line.toLowerCase().includes('fine foods') &&
            !line.toLowerCase().includes('beverages') &&
            !line.match(/\d{3}-\d{3}-\d{4}/) &&
            !line.match(/^\d+\s+\w+\s+(st|ave|rd|blvd|dr|lane|city)/i) &&
            !line.match(/^\d{2,4}[-\/]\d{2}[-\/]\d{2,4}/) &&
            !line.match(/^time:/i) &&
            !line.match(/^date:/i)) {
          
          // Prioritize lines that look like business names
          if (line.toLowerCase().includes('spoon') || 
              line.toLowerCase().includes('restaurant') ||
              line.toLowerCase().includes('cafe') ||
              line.toLowerCase().includes('the ') ||
              line.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/)) {
            data.extractedVendor = line;
            data.confidence += 25;
            break;
          } else if (!data.extractedVendor) {
            data.extractedVendor = line;
            data.confidence += 15;
          }
        }
      }

      // Extract category based on vendor or content
      const categoryKeywords = {
        'Meals': ['restaurant', 'cafe', 'food', 'dining', 'lunch', 'dinner', 'breakfast', 'spoon', 'kitchen', 'grill', 'bar'],
        'Transportation': ['taxi', 'uber', 'lyft', 'bus', 'train', 'flight', 'airline', 'transport'],
        'Accommodation': ['hotel', 'motel', 'inn', 'resort', 'lodge', 'accommodation'],
        'Office Supplies': ['office', 'supplies', 'stationery', 'paper', 'pen', 'printer'],
        'Technology': ['computer', 'software', 'hardware', 'tech', 'electronics'],
        'Marketing': ['advertising', 'marketing', 'promotion', 'campaign'],
        'Training': ['training', 'course', 'workshop', 'seminar', 'education'],
        'Utilities': ['electricity', 'water', 'gas', 'internet', 'phone', 'utility']
      };

      const textLower = text.toLowerCase();
      let bestCategory = null;
      let maxMatches = 0;

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const matches = keywords.filter(keyword => textLower.includes(keyword)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestCategory = category;
        }
      }

      if (bestCategory) {
        data.extractedCategory = bestCategory;
        data.confidence += 15;
      }

      // Extract description from items or context
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const itemLines = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        // Look for lines that might be item descriptions
        if (trimmedLine.length > 3 && 
            !trimmedLine.match(/^\d+/) &&
            !trimmedLine.toLowerCase().includes('total') &&
            !trimmedLine.toLowerCase().includes('subtotal') &&
            !trimmedLine.toLowerCase().includes('tax') &&
            !trimmedLine.toLowerCase().includes('receipt') &&
            !trimmedLine.toLowerCase().includes('date') &&
            !trimmedLine.toLowerCase().includes('time') &&
            !trimmedLine.match(/\d{2,4}[-\/]\d{2}[-\/]\d{2,4}/) &&
            trimmedLine.match(/[a-zA-Z]/) &&
            trimmedLine.length < 50) {
          
          // Skip address-like lines
          if (!trimmedLine.match(/^\d+\s+\w+\s+(st|ave|rd|blvd|dr|lane|city)/i) &&
              !trimmedLine.toLowerCase().includes('phone') &&
              !trimmedLine.toLowerCase().includes('address')) {
            itemLines.push(trimmedLine);
          }
        }
      }

      if (itemLines.length > 0) {
        // Take the first few meaningful lines as description
        data.extractedDescription = itemLines.slice(0, 3).join(', ');
        data.confidence += 10;
      }

      // Additional confidence based on text quality
      const wordCount = text.split(/\s+/).length;
      if (wordCount > 10) {
        data.confidence += 15;
      }

      // Cap confidence at 100
      data.confidence = Math.min(data.confidence, 100);

    } catch (error) {
      console.error('Error extracting receipt data:', error);
    }

    return data;
  }

  /**
   * Convert PDF to image for OCR processing
   */
  async convertPdfToImage(pdfFile) {
    try {
      console.log('📄 Converting PDF to image for OCR...');
      
      // For now, show a helpful message for PDF files
      throw new Error('PDF processing is not yet supported. Please upload an image file (JPG, PNG, WebP) or convert your PDF to an image first.');
    } catch (error) {
      console.error('PDF conversion failed:', error);
      throw error;
    }
  }

  /**
   * Fallback OCR method using Tesseract without workers
   */
  async extractTextFallback(imageFile, onProgress = null) {
    try {
      console.log('🔍 Starting fallback OCR extraction for file:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
      
      // Validate file before processing
      if (!imageFile || imageFile.size === 0) {
        throw new Error('Invalid or empty file');
      }

      // Handle PDF files
      if (imageFile.type === 'application/pdf') {
        throw new Error('PDF files are not supported for OCR. Please upload an image file (JPG, PNG, WebP) or convert your PDF to an image first.');
      }

      // Validate image file types
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!supportedTypes.includes(imageFile.type)) {
        throw new Error(`Unsupported file type: ${imageFile.type}. Please upload a JPG, PNG, or WebP image.`);
      }
      
      // Use Tesseract.recognize directly without creating a worker
      console.log('📸 Calling Tesseract.recognize...');
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            if (onProgress) {
              onProgress(Math.round(m.progress * 100));
            }
          } else {
            console.log('OCR Status:', m.status);
          }
        }
      });

      console.log('✅ OCR Result received:', result);
      const text = result.data.text;

      if (!text || text.trim().length === 0) {
        console.warn('⚠️ No text extracted from image');
        throw new Error('No text could be extracted from the image. The image might be too blurry or contain no readable text.');
      }

      console.log('📝 Extracted text length:', text.length);
      console.log('📄 First 200 characters:', text.substring(0, 200));
      return text;
    } catch (error) {
      console.error('❌ Fallback OCR extraction failed:', error);
      throw new Error(`Failed to extract text from image: ${error.message}. Please enter data manually.`);
    }
  }

  /**
   * Process receipt image and extract structured data
   */
  async processReceipt(imageFile, onProgress = null) {
    console.log('🔍 Starting OCR processing for:', imageFile.name);
    
    try {
      let text;
      
      // ALWAYS use fallback method to avoid CSP issues completely
      console.log('📝 Using direct Tesseract.recognize method (no workers)');
      text = await this.extractTextFallback(imageFile, onProgress);
      
      console.log('✅ OCR text extraction successful');
      const receiptData = this.extractReceiptData(text);
      
      return receiptData;
    } catch (error) {
      console.error('❌ Receipt processing failed:', error);
      throw error;
    }
  }

  /**
   * Check if CSP is likely blocking web workers
   */
  isCSPBlocking() {
    try {
      // Try to create a simple blob worker to test CSP
      const blob = new Blob(['self.postMessage("test");'], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const worker = new Worker(url);
      worker.terminate();
      URL.revokeObjectURL(url);
      return false;
    } catch (error) {
      console.log('CSP is blocking web workers:', error);
      return true;
    }
  }

  /**
   * Validate image file for OCR
   */
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      if (file.type === 'application/pdf') {
        throw new Error('PDF files are not supported for OCR. Please upload an image file (JPEG, PNG, WebP) or convert your PDF to an image first.');
      } else {
        throw new Error('Please upload a valid image file (JPEG, PNG, WebP)');
      }
    }

    if (file.size > maxSize) {
      throw new Error('File size should be less than 10MB');
    }

    return true;
  }

  /**
   * Clean up worker
   */
  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Get supported file types
   */
  getSupportedTypes() {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  }

  /**
   * Format extracted data for display
   */
  formatExtractedData(data) {
    return {
      amount: data.extractedAmount ? `$${data.extractedAmount.toFixed(2)}` : 'Not found',
      date: data.extractedDate ? data.extractedDate.toLocaleDateString() : 'Not found',
      vendor: data.extractedVendor || 'Not found',
      confidence: `${data.confidence}%`
    };
  }
}

export default new OCRService();
