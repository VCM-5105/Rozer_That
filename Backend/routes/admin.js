const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(authenticateToken, requireAdmin);

// 1. GET ADMIN OVERVIEW STATS
router.get('/stats', async (req, res) => {
  try {
    const usersCount = await get('SELECT COUNT(*) as count FROM users');
    const sheetsCount = await get('SELECT COUNT(*) as count FROM sheets');
    const topicsCount = await get('SELECT COUNT(*) as count FROM topics');
    const notifsCount = await get('SELECT COUNT(*) as count FROM notifications');
    const pyqsCount = await get('SELECT COUNT(*) as count FROM pyqs');
    const newsCount = await get('SELECT COUNT(*) as count FROM current_affairs');
    const quizAttemptsCount = await get('SELECT COUNT(*) as count FROM quiz_attempts');
    const mockAttemptsCount = await get('SELECT COUNT(*) as count FROM mock_attempts');

    res.json({
      totalUsers: usersCount.count,
      totalSheets: sheetsCount.count,
      totalTopics: topicsCount.count,
      totalNotifications: notifsCount.count,
      totalPYQs: pyqsCount.count,
      totalNews: newsCount.count,
      totalQuizAttempts: quizAttemptsCount.count,
      totalMockAttempts: mockAttemptsCount.count
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

// 2. GET ALL USERS LIST
router.get('/users', async (req, res) => {
  try {
    const users = await all('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
});

// 3. UPDATE USER ROLE
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['student', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }
  try {
    await run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// 4. DELETE USER
router.delete('/users/:id', async (req, res) => {
  try {
    await run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

module.exports = router;
