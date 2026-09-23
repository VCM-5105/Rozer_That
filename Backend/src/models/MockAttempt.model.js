const mongoose = require('mongoose');

const mockAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    attemptedCount: {
      type: Number,
      required: true,
    },
    correctCount: {
      type: Number,
      required: true,
    },
    wrongCount: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const MockAttempt = mongoose.model('MockAttempt', mockAttemptSchema);
module.exports = MockAttempt;
