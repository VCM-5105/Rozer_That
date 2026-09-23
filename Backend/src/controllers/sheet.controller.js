const Sheet = require('../models/Sheet.model');
const Topic = require('../models/Topic.model');
const TopicProgress = require('../models/TopicProgress.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadOnCloudinary } = require('../utils/cloudinaryUpload');

// 1. GET ALL SHEETS (Public with user progress calculation)
const getAllSheets = asyncHandler(async (req, res) => {
  const sheets = await Sheet.find().sort({ orderIndex: 1, createdAt: 1 });
  const userId = req.user ? req.user._id : null;

  const enrichedSheets = await Promise.all(
    sheets.map(async (sheet) => {
      const totalTopics = await Topic.countDocuments({ sheet: sheet._id });
      let completedTopics = 0;

      if (userId) {
        const topics = await Topic.find({ sheet: sheet._id }).select('_id');
        const topicIds = topics.map((t) => t._id);
        completedTopics = await TopicProgress.countDocuments({
          user: userId,
          topic: { $in: topicIds },
          isCompleted: true,
        });
      }

      return {
        ...sheet.toObject(),
        totalTopics,
        completedTopics,
        percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(200, enrichedSheets, 'Study sheets fetched successfully.')
  );
});

// 2. GET SINGLE SHEET BY SLUG
const getSheetBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const sheet = await Sheet.findOne({ slug: slug.toLowerCase() });

  if (!sheet) {
    throw new ApiError(404, 'Study sheet not found.');
  }

  const topics = await Topic.find({ sheet: sheet._id }).sort({ orderIndex: 1, createdAt: 1 });
  const userId = req.user ? req.user._id : null;

  let progressMap = {};
  if (userId) {
    const topicIds = topics.map((t) => t._id);
    const userProgress = await TopicProgress.find({
      user: userId,
      topic: { $in: topicIds },
    });
    userProgress.forEach((p) => {
      progressMap[p.topic.toString()] = p;
    });
  }

  const enrichedTopics = topics.map((t) => {
    const prog = progressMap[t._id.toString()] || {};
    return {
      ...t.toObject(),
      isCompleted: prog.isCompleted || false,
      revisionCount: prog.revisionCount || 0,
      isBookmarked: prog.isBookmarked || false,
      userNotes: prog.userNotes || '',
    };
  });

  const completedCount = enrichedTopics.filter((t) => t.isCompleted).length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sheet,
        topics: enrichedTopics,
        totalTopics: topics.length,
        completedTopics: completedCount,
        percentage: topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0,
      },
      'Sheet detail fetched successfully.'
    )
  );
});

// 3. CREATE SHEET (Admin Only)
const createSheet = asyncHandler(async (req, res) => {
  const { title, slug, description, category, icon, orderIndex } = req.body;

  if (!title) {
    throw new ApiError(400, 'Sheet title is required.');
  }

  const generatedSlug = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const existing = await Sheet.findOne({ slug: generatedSlug });

  if (existing) {
    throw new ApiError(400, 'Sheet with this title or slug already exists.');
  }

  const sheet = await Sheet.create({
    title,
    slug: generatedSlug,
    description: description || '',
    category: category || 'General',
    icon: icon || 'Shield',
    orderIndex: orderIndex || 0,
  });

  return res.status(201).json(
    new ApiResponse(201, sheet, 'Study sheet created successfully.')
  );
});

// 4. UPDATE SHEET (Admin Only)
const updateSheet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sheet = await Sheet.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!sheet) {
    throw new ApiError(404, 'Study sheet not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, sheet, 'Study sheet updated successfully.')
  );
});

// 5. DELETE SHEET (Admin Only)
const deleteSheet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sheet = await Sheet.findById(id);

  if (!sheet) {
    throw new ApiError(404, 'Study sheet not found.');
  }

  await Topic.deleteMany({ sheet: id });
  await sheet.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, 'Study sheet and associated topics deleted successfully.')
  );
});

// 6. ADD TOPIC TO SHEET (Admin Only with PDF file upload support)
const addTopicToSheet = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;
  const { title, subject, difficulty, notesContent, videoUrl, orderIndex } = req.body;

  if (!title || !subject) {
    throw new ApiError(400, 'Topic title and subject are required.');
  }

  const sheet = await Sheet.findById(sheetId);
  if (!sheet) {
    throw new ApiError(404, 'Study sheet not found.');
  }

  let pdfUrl = req.body.pdfUrl || '';
  if (req.file?.path) {
    const uploadedFile = await uploadOnCloudinary(req.file.path, 'rozer_that_topics_pdfs');
    if (uploadedFile?.url) {
      pdfUrl = uploadedFile.url;
    }
  }

  const topic = await Topic.create({
    sheet: sheetId,
    title,
    subject,
    difficulty: difficulty || 'Medium',
    notesContent: notesContent || '',
    videoUrl: videoUrl || '',
    pdfUrl,
    orderIndex: orderIndex || 0,
  });

  return res.status(201).json(
    new ApiResponse(201, topic, 'Topic added to study sheet successfully.')
  );
});

// 7. DELETE TOPIC (Admin Only)
const deleteTopic = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const topic = await Topic.findById(topicId);

  if (!topic) {
    throw new ApiError(404, 'Topic not found.');
  }

  await TopicProgress.deleteMany({ topic: topicId });
  await topic.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, 'Topic deleted successfully.')
  );
});

module.exports = {
  getAllSheets,
  getSheetBySlug,
  createSheet,
  updateSheet,
  deleteSheet,
  addTopicToSheet,
  deleteTopic,
};
