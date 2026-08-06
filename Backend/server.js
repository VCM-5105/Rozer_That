require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const sheetsRoutes = require('./routes/sheets');
const notificationRoutes = require('./routes/notifications');
const pyqRoutes = require('./routes/pyqs');
const newsRoutes = require('./routes/news');
const quoteRoutes = require('./routes/quotes');
const quizRoutes = require('./routes/quizzes');
const mockTestRoutes = require('./routes/mocktests');
const searchRoutes = require('./routes/search');
const adminRoutes = require('./routes/admin');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (PDFs, images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Rozer That Defence Aspirants Backend is Operational 🎖️' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sheets', sheetsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/pyqs', pyqRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/mocktests', mockTestRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Rozer That backend running on http://localhost:${PORT}`);
});
