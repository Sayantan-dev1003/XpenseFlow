/**
 * Middleware to parse JSON strings from FormData
 * This runs before validation to ensure proper data types
 */
const parseFormData = (req, res, next) => {
  try {
    // Only process if it's multipart/form-data
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      console.log('🔄 Parsing FormData JSON strings...');
      console.log('📥 Original body:', req.body);

      // Parse JSON strings from FormData
      Object.keys(req.body).forEach(key => {
        const value = req.body[key];
        
        if (typeof value === 'string') {
          // Try to parse JSON strings
          if ((key === 'currency' || key === 'tags') && (value.startsWith('{') || value.startsWith('['))) {
            try {
              req.body[key] = JSON.parse(value);
              console.log(`✅ Parsed ${key}:`, req.body[key]);
            } catch (e) {
              console.log(`❌ Failed to parse ${key}:`, e.message);
            }
          }
          // Convert numeric strings
          else if (key === 'amount' && !isNaN(value)) {
            req.body[key] = parseFloat(value);
            console.log(`✅ Converted ${key} to number:`, req.body[key]);
          }
        }
      });

      console.log('📋 Processed body:', req.body);
    }
    
    next();
  } catch (error) {
    console.error('❌ FormData parsing error:', error);
    next(error);
  }
};

module.exports = { parseFormData };
