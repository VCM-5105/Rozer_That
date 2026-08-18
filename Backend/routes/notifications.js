const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { run, get, all } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `notif-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const { exam } = req.query;
    let query = 'SELECT * FROM notifications ORDER BY created_at DESC';
    let params = [];

    if (exam && exam !== 'All') {
      query = 'SELECT * FROM notifications WHERE exam = ? ORDER BY created_at DESC';
      params = [exam];
    }

    const notifications = await all(query, params);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

router.post('/', authenticateToken, requireAdmin, upload.single('pdf'), async (req, res) => {
  const { title, exam, eligibility, age_limit, apply_start, apply_end, official_link } = req.body;
  const pdf_url = req.file ? `/uploads/${req.file.filename}` : req.body.pdf_url || '';

  if (!title || !exam) {
    return res.status(400).json({ error: 'Title and Exam category are required.' });
  }

  try {
    const result = await run(
      'INSERT INTO notifications (title, exam, eligibility, age_limit, apply_start, apply_end, official_link, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, exam, eligibility, age_limit, apply_start, apply_end, official_link, pdf_url]
    );

    res.status(201).json({ message: 'Notification published successfully.', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification.' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await run('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification.' });
  }
});

module.exports = router;
