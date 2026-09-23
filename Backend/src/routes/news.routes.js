const express = require('express');
const router = express.Router();
const {
  getAllNews,
  createNews,
  deleteNews,
} = require('../controllers/news.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');
const upload = require('../middleware/multer.middleware');

router.get('/', getAllNews);
router.post('/', verifyJWT, verifyAdmin, upload.single('image'), createNews);
router.delete('/:id', verifyJWT, verifyAdmin, deleteNews);

module.exports = router;
