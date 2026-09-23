const MockTest = require('../models/MockTest.model');
const MockAttempt = require('../models/MockAttempt.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// 1. GET ALL MOCK TESTS (Public)
const getAllMockTests = asyncHandler(async (req, res) => {
  const mocks = await MockTest.find().select('-questions').sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, mocks, 'Mock tests fetched successfully.')
  );
});

// 2. GET SINGLE MOCK TEST BY ID (Public, hiding answer keys for test execution)
const getMockTestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mock = await MockTest.findById(id);

  if (!mock) {
    throw new ApiError(404, 'Mock test not found.');
  }

  const sanitizedQuestions = mock.questions.map((q) => ({
    id: q.id,
    section: q.section,
    question: q.question,
    options: q.options,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: mock._id,
        title: mock.title,
        exam: mock.exam,
        durationMinutes: mock.durationMinutes,
        totalMarks: mock.totalMarks,
        positiveMarks: mock.positiveMarks,
        negativeMarks: mock.negativeMarks,
        totalQuestions: mock.questions.length,
        questions: sanitizedQuestions,
      },
      'Mock test details fetched successfully.'
    )
  );
});

// 3. SUBMIT MOCK TEST ATTEMPT (Protected)
const submitMockAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userAnswers, timeSpentSeconds } = req.body;
  const userId = req.user._id;

  const mock = await MockTest.findById(id);
  if (!mock) {
    throw new ApiError(404, 'Mock test not found.');
  }

  const posMarks = mock.positiveMarks || 1.0;
  const negMarks = mock.negativeMarks || 0.33;

  let attemptedCount = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let rawScore = 0;

  const breakdown = mock.questions.map((q) => {
    const selected = userAnswers ? userAnswers[q.id] : null;
    let status = 'unattempted';
    let marksEarned = 0;

    if (selected !== null && selected !== undefined) {
      attemptedCount++;
      if (selected === q.answerIndex) {
        correctCount++;
        status = 'correct';
        marksEarned = posMarks;
        rawScore += posMarks;
      } else {
        wrongCount++;
        status = 'wrong';
        marksEarned = -negMarks;
        rawScore -= negMarks;
      }
    }

    return {
      id: q.id,
      section: q.section,
      question: q.question,
      options: q.options,
      selectedOption: selected,
      correctOption: q.answerIndex,
      status,
      marksEarned,
      explanation: q.explanation || '',
    };
  });

  const finalScore = Number(Math.max(0, rawScore).toFixed(2));
  const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;

  const attempt = await MockAttempt.create({
    user: userId,
    mockTest: id,
    score: finalScore,
    totalMarks: mock.totalMarks,
    attemptedCount,
    correctCount,
    wrongCount,
    accuracy,
    timeSpentSeconds: timeSpentSeconds || 0,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attemptId: attempt._id,
        score: finalScore,
        totalMarks: mock.totalMarks,
        attemptedCount,
        correctCount,
        wrongCount,
        accuracy,
        timeSpentSeconds,
        breakdown,
      },
      'Mock test evaluated successfully.'
    )
  );
});

// 4. GET USER MOCK TEST HISTORY (Protected)
const getUserMockHistory = asyncHandler(async (req, res) => {
  const history = await MockAttempt.find({ user: req.user._id })
    .populate('mockTest', 'title exam totalMarks')
    .sort({ createdAt: -1 });

  const formattedHistory = history.map((h) => ({
    _id: h._id,
    mock_title: h.mockTest?.title || 'Mock Test',
    exam: h.mockTest?.exam || '',
    score: h.score,
    total_marks: h.totalMarks,
    attempted_count: h.attemptedCount,
    correct_count: h.correctCount,
    wrong_count: h.wrongCount,
    accuracy: h.accuracy,
    time_spent_seconds: h.timeSpentSeconds,
    created_at: h.createdAt,
  }));

  return res.status(200).json(
    new ApiResponse(200, formattedHistory, 'Mock test history fetched successfully.')
  );
});

// 5. CREATE MOCK TEST (Admin Only)
const createMockTest = asyncHandler(async (req, res) => {
  const { title, exam, durationMinutes, totalMarks, positiveMarks, negativeMarks, questions } = req.body;

  if (!title || !exam || !questions || !Array.isArray(questions)) {
    throw new ApiError(400, 'Title, Exam, and Questions array are required.');
  }

  const mock = await MockTest.create({
    title,
    exam,
    durationMinutes: durationMinutes || 120,
    totalMarks: totalMarks || 100,
    positiveMarks: positiveMarks || 1.0,
    negativeMarks: negativeMarks || 0.33,
    questions,
  });

  return res.status(201).json(
    new ApiResponse(201, mock, 'Mock test created successfully.')
  );
});

// 6. DELETE MOCK TEST (Admin Only)
const deleteMockTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mock = await MockTest.findByIdAndDelete(id);

  if (!mock) {
    throw new ApiError(404, 'Mock test not found.');
  }

  await MockAttempt.deleteMany({ mockTest: id });

  return res.status(200).json(
    new ApiResponse(200, null, 'Mock test deleted successfully.')
  );
});

module.exports = {
  getAllMockTests,
  getMockTestById,
  submitMockAttempt,
  getUserMockHistory,
  createMockTest,
  deleteMockTest,
};
