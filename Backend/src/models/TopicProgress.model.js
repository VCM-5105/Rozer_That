const mongoose = require('mongoose');

const topicProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    revisionCount: {
      type: Number,
      default: 0,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    userNotes: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Compound unique index for user and topic
topicProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

const TopicProgress = mongoose.model('TopicProgress', topicProgressSchema);
module.exports = TopicProgress;
