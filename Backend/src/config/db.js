const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Atlas Connected Successfully: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(` MongoDB Connection Notice: ${error.message}`);
    
  }
};

module.exports = connectDB;
