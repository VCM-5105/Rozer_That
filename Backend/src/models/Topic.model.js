const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    sheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sheet',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    notesContent: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    pdfUrl: {
      type: String, // Cloudinary PDF URL
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

const Topic = mongoose.model('Topic', topicSchema);
module.exports = Topic;
