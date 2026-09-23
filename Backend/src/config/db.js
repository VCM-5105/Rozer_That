const mongoose = require('mongoose');
const { DB_NAME } = require('../constants');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rozer_that';
    
    // Append DB_NAME if not already present in connection URI
    if (!uri.includes(DB_NAME) && !uri.includes('?')) {
      uri = `${uri}/${DB_NAME}`;
    }

    const connectionInstance = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5s if IP is blocked
    });
    console.log(`✅ MongoDB Atlas Connected Successfully! Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Notice: ${error.message}`);
    console.log(`💡 Please whitelist Render IP (0.0.0.0/0) in MongoDB Atlas Network Access.`);
  }
};

module.exports = connectDB;
