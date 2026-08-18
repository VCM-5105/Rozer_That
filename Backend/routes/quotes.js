const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/daily', async (req, res) => {
  try {
    const quotes = await all('SELECT * FROM quotes');
    if (quotes.length === 0) {
      return res.json({
        quote: 'Work hard in silence, let your success make the noise.',
        author: 'Indian Armed Forces'
      });
    }
    
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const selectedQuote = quotes[dayOfYear % quotes.length];
    res.json(selectedQuote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quote.' });
  }
});


router.get('/', async (req, res) => {
  try {
    const quotes = await all('SELECT * FROM quotes ORDER BY id DESC');
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotes.' });
  }
});


router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { quote, author } = req.body;
  if (!quote || !author) {
    return res.status(400).json({ error: 'Quote text and Author are required.' });
  }
  try {
    const result = await run('INSERT INTO quotes (quote, author) VALUES (?, ?)', [quote, author]);
    res.status(201).json({ message: 'Quote added successfully.', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add quote.' });
  }
});

module.exports = router;
