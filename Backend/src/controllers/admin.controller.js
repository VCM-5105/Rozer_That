const User = require('../models/User.model');
const Sheet = require('../models/Sheet.model');
const Topic = require('../models/Topic.model');
const Notification = require('../models/Notification.model');
const Pyq = require('../models/Pyq.model');
const News = require('../models/News.model');
const QuizAttempt = require('../models/QuizAttempt.model');
const MockAttempt = require('../models/MockAttempt.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// 1. GET ADMIN OVERVIEW STATS
const getAdminOverviewStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalSheets,
    totalTopics,
    totalNotifications,
    totalPYQs,
    totalNews,
    totalQuizAttempts,
    totalMockAttempts,
  ] = await Promise.all([
    User.countDocuments(),
    Sheet.countDocuments(),
    Topic.countDocuments(),
    Notification.countDocuments(),
    Pyq.countDocuments(),
    News.countDocuments(),
    QuizAttempt.countDocuments(),
    MockAttempt.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalSheets,
        totalTopics,
        totalNotifications,
        totalPYQs,
        totalNews,
        totalQuizAttempts,
        totalMockAttempts,
      },
      'Admin overview stats fetched successfully.'
    )
  );
});

// 2. GET ALL USERS LIST
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, users, 'User directory fetched successfully.')
  );
});

// 3. UPDATE USER ROLE (e.g. Change student -> admin in DB or via API)
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['student', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Role must be student or admin.');
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, user, `User role updated to ${role} successfully.`)
  );
});

// 4. DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    throw new ApiError(400, 'Super admin cannot delete their own account via API.');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'User deleted successfully.')
  );
});

module.exports = {
  getAdminOverviewStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
