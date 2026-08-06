const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// 1. GET CURRENT AFFAIRS (Public, filterable by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM current_affairs';
    let params = [];

    if (category && category !== 'All') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY date DESC, id DESC';
    const news = await all(query, params);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current affairs.' });
  }
});

// 2. CREATE CURRENT AFFAIRS ARTICLE (Admin Only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { title, category, content, date, image_url } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Title, Category, and Content are required.' });
  }

  const articleDate = date || new Date().toISOString().split('T')[0];

  try {
    const result = await run(
      'INSERT INTO current_affairs (title, category, content, date, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, category, content, articleDate, image_url || '']
    );
    res.status(201).json({ message: 'Article published successfully.', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish article.' });
  }
});

// 3. DELETE CURRENT AFFAIRS ARTICLE (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await run('DELETE FROM current_affairs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article.' });
  }
});

module.exports = router;
