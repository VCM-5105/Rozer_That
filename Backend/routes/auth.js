const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hash, 'student']
    );

    const user = { id: result.lastID, username, email, role: 'student' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful! Welcome Cadet.',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and Password are required.' });
  }

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userData = { id: user.id, username: user.username, email: user.email, role: user.role };
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful!',
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});


router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });


    const totalTopics = await get('SELECT COUNT(*) as count FROM topics');
    const completedTopics = await get('SELECT COUNT(*) as count FROM user_topic_progress WHERE user_id = ? AND is_completed = 1', [req.user.id]);
    const totalQuizzes = await get('SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?', [req.user.id]);
    const totalMocks = await get('SELECT COUNT(*) as count FROM mock_attempts WHERE user_id = ?', [req.user.id]);
    const bookmarks = await get('SELECT COUNT(*) as count FROM user_topic_progress WHERE user_id = ? AND is_bookmarked = 1', [req.user.id]);

    res.json({
      user,
      stats: {
        totalTopics: totalTopics.count || 0,
        completedTopics: completedTopics.count || 0,
        completedPercentage: totalTopics.count ? Math.round((completedTopics.count / totalTopics.count) * 100) : 0,
        quizzesTaken: totalQuizzes.count || 0,
        mocksTaken: totalMocks.count || 0,
        bookmarkedTopics: bookmarks.count || 0,
        streakDays: 5 
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

  
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Password reset instructions have been generated.',
      resetToken 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error processing request.' });
  }
});

module.exports = router;
