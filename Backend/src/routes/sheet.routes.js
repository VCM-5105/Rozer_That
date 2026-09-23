const express = require('express');
const router = express.Router();
const {
  getAllSheets,
  getSheetBySlug,
  createSheet,
  updateSheet,
  deleteSheet,
  addTopicToSheet,
  deleteTopic,
} = require('../controllers/sheet.controller');
const { verifyJWT, optionalJWT } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');
const upload = require('../middleware/multer.middleware');

// Public routes (with optional user progress parsing)
router.get('/', optionalJWT, getAllSheets);
router.get('/:slug', optionalJWT, getSheetBySlug);

// Admin routes for study sheets
router.post('/', verifyJWT, verifyAdmin, createSheet);
router.put('/:id', verifyJWT, verifyAdmin, updateSheet);
router.delete('/:id', verifyJWT, verifyAdmin, deleteSheet);

// Admin routes for topics
router.post('/:sheetId/topics', verifyJWT, verifyAdmin, upload.single('pdf'), addTopicToSheet);
router.delete('/topics/:topicId', verifyJWT, verifyAdmin, deleteTopic);

module.exports = router;
