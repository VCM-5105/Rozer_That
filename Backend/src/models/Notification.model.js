const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    exam: {
      type: String,
      enum: ['NDA', 'CDS', 'AFCAT', 'CAPF', 'All'],
      required: true,
    },
    eligibility: {
      type: String,
    },
    ageLimit: {
      type: String,
    },
    applyStart: {
      type: String,
    },
    applyEnd: {
      type: String,
    },
    officialLink: {
      type: String,
    },
    pdfUrl: {
      type: String, // Cloudinary PDF URL
    }
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
