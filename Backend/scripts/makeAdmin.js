require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const { DB_NAME } = require('../src/constants');

const identifier = process.argv[2];

if (!identifier) {
  console.error('❌ Please provide a username or email.\nExample: node scripts/makeAdmin.js vipul');
  process.exit(1);
}

const promoteUser = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI missing in .env file!');
      process.exit(1);
    }

    const connStr = mongoUri.includes('?') 
      ? mongoUri.replace('?', `/${DB_NAME}?`) 
      : `${mongoUri}/${DB_NAME}`;

    await mongoose.connect(connStr);
    console.log('✅ Connected to MongoDB Atlas');

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { username: identifier.toLowerCase().trim() }
      ]
    });

    if (!user) {
      console.error(`❌ User matching "${identifier}" not found in database.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save({ validateBeforeSave: false });

    console.log(`\n🎉 SUCCESS! User "${user.username}" (${user.email}) is now an ADMIN!`);
    console.log(`🎖️ Role: ${user.role}`);

  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

promoteUser();
