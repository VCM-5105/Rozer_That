const mongoose = require('mongoose');
const { DB_NAME } = require('../constants');

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`MongoDB Connected Successfully! Host: ${connectionInstance.connection.host} / DB: ${DB_NAME}`);
  } catch (error) {
    console.error(`MongoDB Connection Notice: ${error.message}`);
    
  }
};

module.exports = connectDB;
