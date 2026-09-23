const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['National', 'International', 'Defence', 'Economy', 'Science', 'Sports'],
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    imageUrl: {
      type: String, // Cloudinary Image URL
    }
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model('News', newsSchema);
module.exports = News;
