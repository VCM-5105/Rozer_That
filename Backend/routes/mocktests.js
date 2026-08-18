const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');


router.get('/', async (req, res) => {
  try {
    const mocks = await all(
      'SELECT id, title, exam, duration_minutes, total_marks, positive_marks, negative_marks FROM mock_tests ORDER BY id DESC'
    );
    res.json(mocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mock tests.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mock = await get('SELECT * FROM mock_tests WHERE id = ?', [req.params.id]);
    if (!mock) return res.status(404).json({ error: 'Mock test not found.' });

    const questions = JSON.parse(mock.questions_json);
    const sanitizedQuestions = questions.map(({ answerIndex, explanation, ...rest }) => rest);

    res.json({
      id: mock.id,
      title: mock.title,
      exam: mock.exam,
      duration_minutes: mock.duration_minutes,
      total_marks: mock.total_marks,
      positive_marks: mock.positive_marks,
      negative_marks: mock.negative_marks,
      total_questions: questions.length,
      questions: sanitizedQuestions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mock test details.' });
  }
});

router.post('/:id/submit', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userAnswers, timeSpentSeconds } = req.body; // userAnswers: { questionId: selectedIndex }
  const userId = req.user.id;

  try {
    const mock = await get('SELECT * FROM mock_tests WHERE id = ?', [id]);
    if (!mock) return res.status(404).json({ error: 'Mock test not found.' });

    const questions = JSON.parse(mock.questions_json);
    const posMarks = mock.positive_marks || 1.0;
    const negMarks = mock.negative_marks || 0.33;

    let attemptedCount = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let rawScore = 0;

    const breakdown = questions.map((q) => {
      const selected = userAnswers ? userAnswers[q.id] : null;
      let status = 'unattempted';
      let marksEarned = 0;

      if (selected !== null && selected !== undefined) {
        attemptedCount++;
        if (selected === q.answerIndex) {
          correctCount++;
          status = 'correct';
          marksEarned = posMarks;
          rawScore += posMarks;
        } else {
          wrongCount++;
          status = 'wrong';
          marksEarned = -negMarks;
          rawScore -= negMarks;
        }
      }

      return {
        id: q.id,
        section: q.section,
        question: q.question,
        options: q.options,
        selectedOption: selected,
        correctOption: q.answerIndex,
        status,
        marksEarned,
        explanation: q.explanation
      };
    });

    const finalScore = parseFloat(Math.max(0, rawScore).toFixed(2));
    const accuracy = attemptedCount > 0 ? parseFloat(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;

    const result = await run(
      `INSERT INTO mock_attempts 
       (user_id, mock_id, score, total_marks, attempted_count, correct_count, wrong_count, accuracy, time_spent_seconds) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, id, finalScore, mock.total_marks, attemptedCount, correctCount, wrongCount, accuracy, timeSpentSeconds || 0]
    );

    res.json({
      message: 'Mock test evaluated successfully!',
      attemptId: result.lastID,
      score: finalScore,
      totalMarks: mock.total_marks,
      attemptedCount,
      correctCount,
      wrongCount,
      accuracy,
      timeSpentSeconds,
      breakdown
    });
  } catch (err) {
    console.error('Mock submission error:', err);
    res.status(500).json({ error: 'Failed to submit mock test.' });
  }
});

router.get('/user/history', authenticateToken, async (req, res) => {
  try {
    const history = await all(
      `SELECT ma.*, m.title as mock_title, m.exam 
       FROM mock_attempts ma 
       JOIN mock_tests m ON ma.mock_id = m.id 
       WHERE ma.user_id = ? 
       ORDER BY ma.created_at DESC`,
      [req.user.id]
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mock test history.' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { title, exam, duration_minutes, total_marks, positive_marks, negative_marks, questions } = req.body;

  if (!title || !exam || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Title, Exam, and Questions array are required.' });
  }

  try {
    const result = await run(
      'INSERT INTO mock_tests (title, exam, duration_minutes, total_marks, positive_marks, negative_marks, questions_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, exam, duration_minutes || 120, total_marks || 100, positive_marks || 1.0, negative_marks || 0.33, JSON.stringify(questions)]
    );
    res.status(201).json({ message: 'Mock test created successfully.', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create mock test.' });
  }
});

module.exports = router;
