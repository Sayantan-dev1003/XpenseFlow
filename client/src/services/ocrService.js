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
      confidence: 0
    };

    try {
      // Extract amount - look for currency symbols and numbers
      const amountPatterns = [
        /\$\s*(\d+(?:\.\d{2})?)/g,
        /(\d+(?:\.\d{2})?)\s*\$/g,
        /total[:\s]*\$?\s*(\d+(?:\.\d{2})?)/gi,
        /amount[:\s]*\$?\s*(\d+(?:\.\d{2})?)/gi,
        /(\d+\.\d{2})/g
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
        /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4}/gi
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
      
      // First few lines often contain merchant name
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        
        // Skip lines that look like addresses, phone numbers, or common receipt terms
        if (line.length > 3 && 
            !line.match(/^\d+/) && 
            !line.toLowerCase().includes('receipt') &&
            !line.toLowerCase().includes('invoice') &&
            !line.toLowerCase().includes('phone') &&
            !line.toLowerCase().includes('address') &&
            !line.match(/\d{3}-\d{3}-\d{4}/) &&
            !line.match(/^\d+\s+\w+\s+(st|ave|rd|blvd|dr)/i)) {
          
          data.extractedVendor = line;
          data.confidence += 20;
          break;
        }
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
   * Fallback OCR method using Tesseract without workers
   */
  async extractTextFallback(imageFile, onProgress = null) {
    try {
      console.log('Starting fallback OCR extraction for file:', imageFile.name);
      
      // Use Tesseract.recognize directly without creating a worker
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => {
          console.log('OCR Progress:', m);
          if (onProgress && m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        }
      });

      console.log('OCR Result:', result);
      const text = result.data.text;

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the image');
      }

      console.log('Extracted text:', text.substring(0, 100) + '...');
      return text;
    } catch (error) {
      console.error('Fallback OCR extraction failed:', error);
      throw new Error(`Failed to extract text from image: ${error.message}. Please enter data manually.`);
    }
  }

  /**
   * Process receipt image and extract structured data
   */
  async processReceipt(imageFile, onProgress = null) {
    try {
      let text;
      
      // Always use fallback method in development to avoid CSP issues
      const isDevelopment = import.meta.env.DEV;
      
      if (isDevelopment) {
        console.log('Using direct Tesseract.recognize method in development');
        text = await this.extractTextFallback(imageFile, onProgress);
      } else {
        try {
          // Try the worker-based approach first in production
          text = await this.extractText(imageFile, onProgress);
        } catch (workerError) {
          console.warn('Worker-based OCR failed, trying fallback method:', workerError);
          
          // Fallback to direct Tesseract.recognize
          text = await this.extractTextFallback(imageFile, onProgress);
        }
      }
      
      const receiptData = this.extractReceiptData(text);
      
      return receiptData;
    } catch (error) {
      console.error('Receipt processing failed:', error);
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
   * Validate image/PDF file
   */
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, WebP) or PDF');
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
