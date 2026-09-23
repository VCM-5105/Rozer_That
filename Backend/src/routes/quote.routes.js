const express = require('express');
const router = express.Router();
const {
  getDailyQuote,
  getAllQuotes,
  createQuote,
  deleteQuote,
} = require('../controllers/quote.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');

router.get('/daily', getDailyQuote);
router.get('/', getAllQuotes);
router.post('/', verifyJWT, verifyAdmin, createQuote);
router.delete('/:id', verifyJWT, verifyAdmin, deleteQuote);

module.exports = router;
