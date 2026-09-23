const express = require('express');
const router = express.Router();
const {
  toggleTopicCompletion,
  saveTopicNotes,
  toggleTopicBookmark,
  incrementRevisionCount,
  getUserBookmarks,
  getUserNotes,
} = require('../controllers/progress.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

// Protect all progress routes
router.use(verifyJWT);

router.post('/topics/:topicId/toggle', toggleTopicCompletion);
router.post('/topics/:topicId/notes', saveTopicNotes);
router.post('/topics/:topicId/bookmark', toggleTopicBookmark);
router.post('/topics/:topicId/revise', incrementRevisionCount);
router.get('/user/bookmarks', getUserBookmarks);
router.get('/user/notes', getUserNotes);

module.exports = router;
