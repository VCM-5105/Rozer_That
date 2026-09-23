const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const sheetRoutes = require('./routes/sheet.routes');
const progressRoutes = require('./routes/progress.routes');
const notificationRoutes = require('./routes/notification.routes');
const pyqRoutes = require('./routes/pyq.routes');
const newsRoutes = require('./routes/news.routes');
const quoteRoutes = require('./routes/quote.routes');
const quizRoutes = require('./routes/quiz.routes');
const mockRoutes = require('./routes/mock.routes');
const searchRoutes = require('./routes/search.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Serve local uploads folder (fallback asset serving)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '🎖️ RozerThat Defence Aspirants Backend API is Live & Operational',
    timestamp: new Date(),
  });
});

// Mounting API Routes (supporting both /api and /api/v1 prefix)
app.use('/api/auth', authRoutes);
app.use('/api/sheets', sheetRoutes);
app.use('/api/sheets', progressRoutes); // Progress sub-routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/pyqs', pyqRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/mocktests', mockRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
