// config/db.js — MongoDB connection using Mongoose (Unit IV - Node.js Syllabus)
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost')) {
      console.warn('⚠ No remote MONGO_URI set — API routes requiring DB will be unavailable. Frontend uses local quiz data.');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't crash the process — allow app to serve static content
    console.warn('⚠ Continuing without MongoDB — local quiz data will be used.');
  }
};

module.exports = connectDB;
