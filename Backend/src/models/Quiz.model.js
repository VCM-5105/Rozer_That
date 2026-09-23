const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answerIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    exam: {
      type: String,
      default: 'All',
    },
    durationMinutes: {
      type: Number,
      default: 10,
    },
    questions: [quizQuestionSchema],
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
