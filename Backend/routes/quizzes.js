const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const quizzes = await all('SELECT id, title, subject, exam, duration_minutes FROM quizzes ORDER BY id DESC');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const quiz = await get('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const questions = JSON.parse(quiz.questions_json);
    
    const sanitizedQuestions = questions.map(({ answerIndex, explanation, ...rest }) => rest);

    res.json({
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      exam: quiz.exam,
      duration_minutes: quiz.duration_minutes,
      total_questions: questions.length,
      questions: sanitizedQuestions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz detail.' });
  }
});

router.post('/:id/submit', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userAnswers, timeSpentSeconds } = req.body; // userAnswers: { questionId: selectedIndex }
  const userId = req.user.id;

  try {
    const quiz = await get('SELECT * FROM quizzes WHERE id = ?', [id]);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const questions = JSON.parse(quiz.questions_json);
    let correctCount = 0;

    const breakdown = questions.map((q) => {
      const selected = userAnswers ? userAnswers[q.id] : null;
      const isCorrect = selected === q.answerIndex;
      if (isCorrect) correctCount++;

      return {
        id: q.id,
        question: q.question,
        options: q.options,
        selectedOption: selected,
        correctOption: q.answerIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const totalQuestions = questions.length;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const score = correctCount; 

    const result = await run(
      `INSERT INTO quiz_attempts 
       (user_id, quiz_id, score, total_questions, correct_answers, accuracy, time_spent_seconds) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, id, score, totalQuestions, correctCount, accuracy, timeSpentSeconds || 0]
    );

    res.json({
      message: 'Quiz evaluated successfully.',
      attemptId: result.lastID,
      score,
      totalQuestions,
      correctCount,
      accuracy,
      breakdown
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: 'Failed to submit quiz.' });
  }
});

router.get('/user/history', authenticateToken, async (req, res) => {
  try {
    const history = await all(
      `SELECT qa.*, q.title as quiz_title, q.subject 
       FROM quiz_attempts qa 
       JOIN quizzes q ON qa.quiz_id = q.id 
       WHERE qa.user_id = ? 
       ORDER BY qa.created_at DESC`,
      [req.user.id]
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz history.' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { title, subject, exam, duration_minutes, questions } = req.body;

  if (!title || !subject || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Title, Subject, and Questions array are required.' });
  }

  try {
    const result = await run(
      'INSERT INTO quizzes (title, subject, exam, duration_minutes, questions_json) VALUES (?, ?, ?, ?, ?)',
      [title, subject, exam || 'All', duration_minutes || 10, JSON.stringify(questions)]
    );
    res.status(201).json({ message: 'Quiz created successfully.', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quiz.' });
  }
});

module.exports = router;
