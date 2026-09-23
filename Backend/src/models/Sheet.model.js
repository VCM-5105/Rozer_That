const mongoose = require('mongoose');

const sheetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Sheet title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['NDA', 'CDS', 'AFCAT', 'SSB', 'Revision', 'Final Practice', 'General'],
      default: 'General',
    },
    icon: {
      type: String,
      default: 'Shield',
    },
    orderIndex: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const Sheet = mongoose.model('Sheet', sheetSchema);
module.exports = Sheet;
