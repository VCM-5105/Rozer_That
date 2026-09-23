const express = require('express');
const router = express.Router();
const {
  getAllPyqs,
  createPyq,
  incrementDownloadCount,
  deletePyq,
} = require('../controllers/pyq.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');
const upload = require('../middleware/multer.middleware');

// Public routes
router.get('/', getAllPyqs);
router.post('/:id/download', incrementDownloadCount);

// Admin routes
router.post('/', verifyJWT, verifyAdmin, upload.single('file'), createPyq);
router.delete('/:id', verifyJWT, verifyAdmin, deletePyq);

module.exports = router;
