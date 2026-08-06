const express = require('express');
const router = express.Router();
const { all } = require('../db');

// GLOBAL SEARCH API
router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json({ sheets: [], topics: [], pyqs: [], news: [], notifications: [] });
  }

  const queryTerm = `%${q.trim()}%`;

  try {
    const [sheets, topics, pyqs, news, notifications] = await Promise.all([
      all('SELECT id, title, slug, description, category FROM sheets WHERE title LIKE ? OR description LIKE ? LIMIT 5', [queryTerm, queryTerm]),
      all(`SELECT t.id, t.title, t.subject, t.difficulty, s.slug as sheet_slug, s.title as sheet_title 
           FROM topics t JOIN sheets s ON t.sheet_id = s.id 
           WHERE t.title LIKE ? OR t.subject LIKE ? OR t.notes_content LIKE ? LIMIT 8`, [queryTerm, queryTerm, queryTerm]),
      all('SELECT id, title, exam, year, paper_type FROM pyqs WHERE title LIKE ? OR exam LIKE ? LIMIT 5', [queryTerm, queryTerm]),
      all('SELECT id, title, category, date FROM current_affairs WHERE title LIKE ? OR content LIKE ? LIMIT 5', [queryTerm, queryTerm]),
      all('SELECT id, title, exam, eligibility FROM notifications WHERE title LIKE ? OR exam LIKE ? LIMIT 5', [queryTerm, queryTerm])
    ]);

    res.json({
      sheets,
      topics,
      pyqs,
      news,
      notifications
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed.' });
  }
});

module.exports = router;
