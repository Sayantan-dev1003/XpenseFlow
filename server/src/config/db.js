const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Configure Mongoose to ensure proper _id generation
    mongoose.set('strictQuery', false);
    mongoose.set('autoIndex', true);
    mongoose.set('autoCreate', true);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
