const Quiz = require('../models/Quiz.model');
const QuizAttempt = require('../models/QuizAttempt.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// 1. GET ALL QUIZZES (Public)
const getAllQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find().select('-questions').sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, quizzes, 'Quizzes fetched successfully.')
  );
});

// 2. GET SINGLE QUIZ BY ID (Public, hiding answer keys for test execution)
const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findById(id);

  if (!quiz) {
    throw new ApiError(404, 'Quiz not found.');
  }

  const sanitizedQuestions = quiz.questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        exam: quiz.exam,
        durationMinutes: quiz.durationMinutes,
        totalQuestions: quiz.questions.length,
        questions: sanitizedQuestions,
      },
      'Quiz details fetched successfully.'
    )
  );
});

// 3. SUBMIT QUIZ ATTEMPT (Protected)
const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userAnswers, timeSpentSeconds } = req.body; // userAnswers: { questionId: selectedIndex }
  const userId = req.user._id;

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    throw new ApiError(404, 'Quiz not found.');
  }

  let correctCount = 0;
  const breakdown = quiz.questions.map((q) => {
    const selected = userAnswers ? userAnswers[q.id] : null;
    const isCorrect = selected === q.answerIndex;
    if (isCorrect) correctCount++;

    return {
      id: q.id,
      question: q.question,
      options: q.options,
      selectedOption: selected,
      correctOption: q.answerIndex,
      isCorrect,
      explanation: q.explanation || '',
    };
  });

  const totalQuestions = quiz.questions.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const score = correctCount;

  const attempt = await QuizAttempt.create({
    user: userId,
    quiz: id,
    score,
    totalQuestions,
    correctAnswers: correctCount,
    accuracy,
    timeSpentSeconds: timeSpentSeconds || 0,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attemptId: attempt._id,
        score,
        totalQuestions,
        correctCount,
        accuracy,
        breakdown,
      },
      'Quiz evaluated successfully.'
    )
  );
});

// 4. GET USER QUIZ HISTORY (Protected)
const getUserQuizHistory = asyncHandler(async (req, res) => {
  const history = await QuizAttempt.find({ user: req.user._id })
    .populate('quiz', 'title subject exam')
    .sort({ createdAt: -1 });

  const formattedHistory = history.map((h) => ({
    _id: h._id,
    quiz_title: h.quiz?.title || 'Quiz',
    subject: h.quiz?.subject || '',
    score: h.score,
    total_questions: h.totalQuestions,
    correct_answers: h.correctAnswers,
    accuracy: h.accuracy,
    time_spent_seconds: h.timeSpentSeconds,
    created_at: h.createdAt,
  }));

  return res.status(200).json(
    new ApiResponse(200, formattedHistory, 'Quiz history fetched successfully.')
  );
});

// 5. CREATE QUIZ (Admin Only)
const createQuiz = asyncHandler(async (req, res) => {
  const { title, subject, exam, durationMinutes, questions } = req.body;

  if (!title || !subject || !questions || !Array.isArray(questions)) {
    throw new ApiError(400, 'Title, Subject, and Questions array are required.');
  }

  const quiz = await Quiz.create({
    title,
    subject,
    exam: exam || 'All',
    durationMinutes: durationMinutes || 10,
    questions,
  });

  return res.status(201).json(
    new ApiResponse(201, quiz, 'Quiz created successfully.')
  );
});

// 6. DELETE QUIZ (Admin Only)
const deleteQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findByIdAndDelete(id);

  if (!quiz) {
    throw new ApiError(404, 'Quiz not found.');
  }

  await QuizAttempt.deleteMany({ quiz: id });

  return res.status(200).json(
    new ApiResponse(200, null, 'Quiz deleted successfully.')
  );
});

module.exports = {
  getAllQuizzes,
  getQuizById,
  submitQuizAttempt,
  getUserQuizHistory,
  createQuiz,
  deleteQuiz,
};
