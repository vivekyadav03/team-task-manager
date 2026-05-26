// config/db.js
// This file handles the MongoDB connection using Mongoose

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB Atlas using the connection string from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options ensure a stable connection
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
