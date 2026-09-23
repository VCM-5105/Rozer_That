const Sheet = require('../models/Sheet.model');
const Topic = require('../models/Topic.model');
const Notification = require('../models/Notification.model');
const Pyq = require('../models/Pyq.model');
const News = require('../models/News.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GLOBAL SEARCH API
const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(200).json(
      new ApiResponse(200, { sheets: [], topics: [], pyqs: [], news: [], notifications: [] }, 'Empty query.')
    );
  }

  const regex = new RegExp(q.trim(), 'i');

  const [sheets, topics, pyqs, news, notifications] = await Promise.all([
    Sheet.find({ $or: [{ title: regex }, { description: regex }] }).limit(5),
    Topic.find({ $or: [{ title: regex }, { subject: regex }, { notesContent: regex }] })
      .populate('sheet', 'title slug')
      .limit(8),
    Pyq.find({ $or: [{ title: regex }, { exam: regex }] }).limit(5),
    News.find({ $or: [{ title: regex }, { content: regex }] }).limit(5),
    Notification.find({ $or: [{ title: regex }, { exam: regex }] }).limit(5),
  ]);

  const formattedTopics = topics.map((t) => ({
    _id: t._id,
    title: t.title,
    subject: t.subject,
    difficulty: t.difficulty,
    sheet_title: t.sheet?.title || '',
    sheet_slug: t.sheet?.slug || '',
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sheets,
        topics: formattedTopics,
        pyqs,
        news,
        notifications,
      },
      'Search results retrieved.'
    )
  );
});

module.exports = { globalSearch };
