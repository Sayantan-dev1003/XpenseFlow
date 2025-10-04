import Tesseract from 'tesseract.js';

class OCRService {
  constructor() {
    this.worker = null;
  }

  /**
   * Initialize Tesseract worker
   */
  async initWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('eng');
    }
    return this.worker;
  }

  /**
   * Extract text from image file
   */
  async extractText(imageFile, onProgress = null) {
    try {
      const worker = await this.initWorker();
      
      const { data: { text } } = await worker.recognize(imageFile, {
        logger: onProgress ? (m) => {
          if (m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        } : undefined
      });

      return text;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
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
   * Process receipt image and extract structured data
   */
  async processReceipt(imageFile, onProgress = null) {
    try {
      const text = await this.extractText(imageFile, onProgress);
      const receiptData = this.extractReceiptData(text);
      
      return receiptData;
    } catch (error) {
      console.error('Receipt processing failed:', error);
      throw error;
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Image file size should be less than 10MB');
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
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
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
