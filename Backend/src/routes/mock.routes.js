const express = require('express');
const router = express.Router();
const {
  getAllMockTests,
  getMockTestById,
  submitMockAttempt,
  getUserMockHistory,
  createMockTest,
  deleteMockTest,
} = require('../controllers/mock.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');

// Public routes
router.get('/', getAllMockTests);
router.get('/user/history', verifyJWT, getUserMockHistory);
router.get('/:id', getMockTestById);

// Protected student evaluation
router.post('/:id/submit', verifyJWT, submitMockAttempt);

// Admin routes
router.post('/', verifyJWT, verifyAdmin, createMockTest);
router.delete('/:id', verifyJWT, verifyAdmin, deleteMockTest);

module.exports = router;
