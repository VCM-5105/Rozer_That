const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');


router.get('/', optionalAuth, async (req, res) => {
  try {
    const sheets = await all('SELECT * FROM sheets ORDER BY order_index ASC');

    const userId = req.user ? req.user.id : null;

    const enrichedSheets = await Promise.all(
      sheets.map(async (sheet) => {
        const totalTopics = await get('SELECT COUNT(*) as count FROM topics WHERE sheet_id = ?', [sheet.id]);

        let completedCount = 0;
        if (userId) {
          const comp = await get(
            `SELECT COUNT(*) as count FROM user_topic_progress utp
             JOIN topics t ON utp.topic_id = t.id
             WHERE t.sheet_id = ? AND utp.user_id = ? AND utp.is_completed = 1`,
            [sheet.id, userId]
          );
          completedCount = comp.count || 0;
        }

        return {
          ...sheet,
          totalTopics: totalTopics.count || 0,
          completedTopics: completedCount,
          percentage: totalTopics.count ? Math.round((completedCount / totalTopics.count) * 100) : 0
        };
      })
    );

    res.json(enrichedSheets);
  } catch (err) {
    console.error('Fetch sheets error:', err);
    res.status(500).json({ error: 'Failed to fetch study sheets.' });
  }
});


router.get('/:slug', optionalAuth, async (req, res) => {
  const { slug } = req.params;
  const userId = req.user ? req.user.id : null;

  try {
    const sheet = await get('SELECT * FROM sheets WHERE slug = ?', [slug]);
    if (!sheet) return res.status(404).json({ error: 'Study Sheet not found.' });

    const topics = await all('SELECT * FROM topics WHERE sheet_id = ? ORDER BY order_index ASC', [sheet.id]);

    let userProgressMap = {};
    if (userId) {
      const userProgress = await all(
        'SELECT topic_id, is_completed, revision_count, is_bookmarked, notes FROM user_topic_progress WHERE user_id = ?',
        [userId]
      );
      userProgress.forEach((p) => {
        userProgressMap[p.topic_id] = p;
      });
    }

    const enrichedTopics = topics.map((t) => {
      const prog = userProgressMap[t.id] || {};
      return {
        ...t,
        isCompleted: prog.is_completed === 1,
        revisionCount: prog.revision_count || 0,
        isBookmarked: prog.is_bookmarked === 1,
        userNotes: prog.notes || ''
      };
    });

    const completedCount = enrichedTopics.filter((t) => t.isCompleted).length;

    res.json({
      sheet,
      topics: enrichedTopics,
      totalTopics: topics.length,
      completedTopics: completedCount,
      percentage: topics.length ? Math.round((completedCount / topics.length) * 100) : 0
    });
  } catch (err) {
    console.error('Fetch sheet detail error:', err);
    res.status(500).json({ error: 'Failed to fetch sheet detail.' });
  }
});


router.post('/topics/:topicId/toggle', authenticateToken, async (req, res) => {
  const { topicId } = req.params;
  const userId = req.user.id;

  try {
    const existing = await get(
      'SELECT is_completed FROM user_topic_progress WHERE user_id = ? AND topic_id = ?',
      [userId, topicId]
    );

    let newStatus = 1;
    if (existing) {
      newStatus = existing.is_completed === 1 ? 0 : 1;
      await run(
        'UPDATE user_topic_progress SET is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND topic_id = ?',
        [newStatus, userId, topicId]
      );
    } else {
      await run(
        'INSERT INTO user_topic_progress (user_id, topic_id, is_completed) VALUES (?, ?, ?)',
        [userId, topicId, 1]
      );
    }

    res.json({ message: 'Topic progress updated.', isCompleted: newStatus === 1 });
  } catch (err) {
    console.error('Toggle progress error:', err);
    res.status(500).json({ error: 'Failed to update topic progress.' });
  }
});


router.post('/topics/:topicId/notes', authenticateToken, async (req, res) => {
  const { topicId } = req.params;
  const { notes } = req.body;
  const userId = req.user.id;

  try {
    const existing = await get(
      'SELECT id FROM user_topic_progress WHERE user_id = ? AND topic_id = ?',
      [userId, topicId]
    );

    if (existing) {
      await run(
        'UPDATE user_topic_progress SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND topic_id = ?',
        [notes, userId, topicId]
      );
    } else {
      await run(
        'INSERT INTO user_topic_progress (user_id, topic_id, notes) VALUES (?, ?, ?)',
        [userId, topicId, notes]
      );
    }

    res.json({ message: 'Personal notes saved successfully.', notes });
  } catch (err) {
    console.error('Save notes error:', err);
    res.status(500).json({ error: 'Failed to save personal notes.' });
  }
});

router.post('/topics/:topicId/bookmark', authenticateToken, async (req, res) => {
  const { topicId } = req.params;
  const userId = req.user.id;

  try {
    const existing = await get(
      'SELECT is_bookmarked FROM user_topic_progress WHERE user_id = ? AND topic_id = ?',
      [userId, topicId]
    );

    let newBookmark = 1;
    if (existing) {
      newBookmark = existing.is_bookmarked === 1 ? 0 : 1;
      await run(
        'UPDATE user_topic_progress SET is_bookmarked = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND topic_id = ?',
        [newBookmark, userId, topicId]
      );
    } else {
      await run(
        'INSERT INTO user_topic_progress (user_id, topic_id, is_bookmarked) VALUES (?, ?, ?)',
        [userId, topicId, 1]
      );
    }

    res.json({ message: 'Bookmark updated.', isBookmarked: newBookmark === 1 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bookmark.' });
  }
});


router.post('/topics/:topicId/revise', authenticateToken, async (req, res) => {
  const { topicId } = req.params;
  const userId = req.user.id;

  try {
    const existing = await get(
      'SELECT revision_count FROM user_topic_progress WHERE user_id = ? AND topic_id = ?',
      [userId, topicId]
    );

    let newCount = 1;
    if (existing) {
      newCount = (existing.revision_count || 0) + 1;
      await run(
        'UPDATE user_topic_progress SET revision_count = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND topic_id = ?',
        [newCount, userId, topicId]
      );
    } else {
      await run(
        'INSERT INTO user_topic_progress (user_id, topic_id, revision_count) VALUES (?, ?, ?)',
        [userId, topicId, 1]
      );
    }

    res.json({ message: 'Revision count updated.', revisionCount: newCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment revision count.' });
  }
});


router.get('/user/bookmarks', authenticateToken, async (req, res) => {
  try {
    const bookmarks = await all(
      `SELECT t.*, s.title as sheet_title, s.slug as sheet_slug, utp.notes as user_notes 
       FROM user_topic_progress utp
       JOIN topics t ON utp.topic_id = t.id
       JOIN sheets s ON t.sheet_id = s.id
       WHERE utp.user_id = ? AND utp.is_bookmarked = 1`,
      [req.user.id]
    );
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  }
});


router.get('/user/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await all(
      `SELECT t.*, s.title as sheet_title, s.slug as sheet_slug, utp.notes as user_notes, utp.updated_at 
       FROM user_topic_progress utp
       JOIN topics t ON utp.topic_id = t.id
       JOIN sheets s ON t.sheet_id = s.id
       WHERE utp.user_id = ? AND utp.notes IS NOT NULL AND utp.notes != ''`,
      [req.user.id]
    );
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user notes.' });
  }
});

module.exports = router;
