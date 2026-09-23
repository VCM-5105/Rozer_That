const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  createNotification,
  deleteNotification,
} = require('../controllers/notification.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');
const upload = require('../middleware/multer.middleware');

// Public listing
router.get('/', getAllNotifications);

// Admin operations
router.post('/', verifyJWT, verifyAdmin, upload.single('pdf'), createNotification);
router.delete('/:id', verifyJWT, verifyAdmin, deleteNotification);

module.exports = router;
