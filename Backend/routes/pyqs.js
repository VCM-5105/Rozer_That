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
    cb(null, `pyq-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const { exam, year } = req.query;
    let query = 'SELECT * FROM pyqs WHERE 1=1';
    let params = [];

    if (exam && exam !== 'All') {
      query += ' AND exam = ?';
      params.push(exam);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }

    query += ' ORDER BY year DESC, title ASC';
    const pyqs = await all(query, params);
    res.json(pyqs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PYQs.' });
  }
});

router.post('/', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  const { title, exam, year, paper_type } = req.body;
  const file_url = req.file ? `/uploads/${req.file.filename}` : req.body.file_url || '';

  if (!title || !exam || !year) {
    return res.status(400).json({ error: 'Title, Exam, and Year are required.' });
  }

  try {
    const result = await run(
      'INSERT INTO pyqs (title, exam, year, paper_type, file_url) VALUES (?, ?, ?, ?, ?)',
      [title, exam, year, paper_type, file_url]
    );
    res.status(201).json({ message: 'PYQ added successfully.', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add PYQ.' });
  }
});

router.post('/:id/download', async (req, res) => {
  try {
    await run('UPDATE pyqs SET download_count = download_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Download counter incremented.' });
  } catch (err) {
    res.status(500).json({ error: 'Database update failed.' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await run('DELETE FROM pyqs WHERE id = ?', [req.params.id]);
    res.json({ message: 'PYQ deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete PYQ.' });
  }
});

module.exports = router;
