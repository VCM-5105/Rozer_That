const express = require('express');
const router = express.Router();
const {
  getAllQuizzes,
  getQuizById,
  submitQuizAttempt,
  getUserQuizHistory,
  createQuiz,
  deleteQuiz,
} = require('../controllers/quiz.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');

// Public routes
router.get('/', getAllQuizzes);
router.get('/user/history', verifyJWT, getUserQuizHistory);
router.get('/:id', getQuizById);

// Protected student evaluation
router.post('/:id/submit', verifyJWT, submitQuizAttempt);

// Admin routes
router.post('/', verifyJWT, verifyAdmin, createQuiz);
router.delete('/:id', verifyJWT, verifyAdmin, deleteQuiz);

module.exports = router;
