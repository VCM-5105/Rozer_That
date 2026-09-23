const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadOnCloudinary = async (localFilePath, folder = 'rozer_that_assets') => {
  try {
    if (!localFilePath) return null;

    // Check if Cloudinary credentials are mock/default placeholder
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo_cloud') {
      console.log('⚠️ Cloudinary keys not configured. Returning local temp asset path as fallback.');
      return {
        url: `/uploads/${localFilePath.split(/[\\/]/).pop()}`,
        public_id: localFilePath
      };
    }

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder: folder
    });

    // Remove local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error.message);
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

module.exports = { uploadOnCloudinary };
