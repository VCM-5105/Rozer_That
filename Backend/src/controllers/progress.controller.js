const TopicProgress = require('../models/TopicProgress.model');
const Topic = require('../models/Topic.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// 1. TOGGLE TOPIC COMPLETION (Protected)
const toggleTopicCompletion = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const userId = req.user._id;

  let progress = await TopicProgress.findOne({ user: userId, topic: topicId });

  if (progress) {
    progress.isCompleted = !progress.isCompleted;
    await progress.save();
  } else {
    progress = await TopicProgress.create({
      user: userId,
      topic: topicId,
      isCompleted: true,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { isCompleted: progress.isCompleted }, 'Topic completion updated.')
  );
});

// 2. SAVE PERSONAL TOPIC NOTE (Protected)
const saveTopicNotes = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const { notes } = req.body;
  const userId = req.user._id;

  let progress = await TopicProgress.findOne({ user: userId, topic: topicId });

  if (progress) {
    progress.userNotes = notes || '';
    await progress.save();
  } else {
    progress = await TopicProgress.create({
      user: userId,
      topic: topicId,
      userNotes: notes || '',
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { userNotes: progress.userNotes }, 'Personal notes saved successfully.')
  );
});

// 3. TOGGLE BOOKMARK (Protected)
const toggleTopicBookmark = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const userId = req.user._id;

  let progress = await TopicProgress.findOne({ user: userId, topic: topicId });

  if (progress) {
    progress.isBookmarked = !progress.isBookmarked;
    await progress.save();
  } else {
    progress = await TopicProgress.create({
      user: userId,
      topic: topicId,
      isBookmarked: true,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { isBookmarked: progress.isBookmarked }, 'Bookmark status updated.')
  );
});

// 4. INCREMENT REVISION COUNT (Protected)
const incrementRevisionCount = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const userId = req.user._id;

  let progress = await TopicProgress.findOne({ user: userId, topic: topicId });

  if (progress) {
    progress.revisionCount += 1;
    await progress.save();
  } else {
    progress = await TopicProgress.create({
      user: userId,
      topic: topicId,
      revisionCount: 1,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { revisionCount: progress.revisionCount }, 'Revision count incremented.')
  );
});

// 5. GET USER BOOKMARKS (Protected)
const getUserBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await TopicProgress.find({ user: req.user._id, isBookmarked: true })
    .populate({
      path: 'topic',
      populate: { path: 'sheet', select: 'title slug' },
    });

  const formattedBookmarks = bookmarks.map((b) => ({
    _id: b.topic._id,
    title: b.topic.title,
    subject: b.topic.subject,
    difficulty: b.topic.difficulty,
    sheet_title: b.topic.sheet?.title || '',
    sheet_slug: b.topic.sheet?.slug || '',
    userNotes: b.userNotes,
  }));

  return res.status(200).json(
    new ApiResponse(200, formattedBookmarks, 'User bookmarks fetched successfully.')
  );
});

// 6. GET USER NOTES (Protected)
const getUserNotes = asyncHandler(async (req, res) => {
  const notes = await TopicProgress.find({
    user: req.user._id,
    userNotes: { $exists: true, $ne: '' },
  }).populate({
    path: 'topic',
    populate: { path: 'sheet', select: 'title slug' },
  });

  const formattedNotes = notes.map((n) => ({
    _id: n.topic._id,
    title: n.topic.title,
    subject: n.topic.subject,
    sheet_title: n.topic.sheet?.title || '',
    sheet_slug: n.topic.sheet?.slug || '',
    user_notes: n.userNotes,
    updatedAt: n.updatedAt,
  }));

  return res.status(200).json(
    new ApiResponse(200, formattedNotes, 'User personal notes fetched successfully.')
  );
});

module.exports = {
  toggleTopicCompletion,
  saveTopicNotes,
  toggleTopicBookmark,
  incrementRevisionCount,
  getUserBookmarks,
  getUserNotes,
};
