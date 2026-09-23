const mongoose = require('mongoose');

const mockQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  section: { type: String, default: 'General' },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answerIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Mock test title is required'],
      trim: true,
    },
    exam: {
      type: String,
      required: [true, 'Exam branch is required'],
    },
    durationMinutes: {
      type: Number,
      default: 120,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    positiveMarks: {
      type: Number,
      default: 1.0,
    },
    negativeMarks: {
      type: Number,
      default: 0.33,
    },
    questions: [mockQuestionSchema],
  },
  {
    timestamps: true,
  }
);

const MockTest = mongoose.model('MockTest', mockTestSchema);
module.exports = MockTest;
