// config/db.js — MongoDB connection using Mongoose (Unit IV - Node.js Syllabus)
// Optimized for Vercel serverless: caches connection across warm invocations
const mongoose = require('mongoose');

let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, reuse
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠ No MONGO_URI set — API routes requiring DB will be unavailable.');
    return null;
  }

  // Skip localhost URIs on Vercel (they can't connect)
  if (process.env.VERCEL && uri.includes('localhost')) {
    console.warn('⚠ localhost MONGO_URI on Vercel — skipping DB connection.');
    return null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).then((m) => {
      console.log(`MongoDB Connected: ${m.connection.host}`);
      return m;
    }).catch((err) => {
      console.error(`MongoDB Connection Error: ${err.message}`);
      cached.promise = null; // Reset so next request retries
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error(`MongoDB Connection Error: ${err.message}`);
    return null;
  }

  return cached.conn;
};

module.exports = connectDB;
