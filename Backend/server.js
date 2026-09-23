require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 RozerThat Backend Server listening on http://localhost:${PORT}`);
  
  // Initiate MongoDB Atlas Connection
  connectDB();
});
