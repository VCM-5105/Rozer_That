const mongoose = require('mongoose');

const pyqSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'PYQ title is required'],
      trim: true,
    },
    exam: {
      type: String,
      required: [true, 'Exam branch is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    paperType: {
      type: String,
    },
    fileUrl: {
      type: String, // Cloudinary PDF URL
    },
    downloadCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const Pyq = mongoose.model('Pyq', pyqSchema);
module.exports = Pyq;
