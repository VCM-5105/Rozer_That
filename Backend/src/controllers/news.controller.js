const News = require('../models/News.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadOnCloudinary } = require('../utils/cloudinaryUpload');

// 1. GET ALL CURRENT AFFAIRS (Public, filterable by category)
const getAllNews = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category && category !== 'All' ? { category } : {};

  const news = await News.find(filter).sort({ date: -1, createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, news, 'Current affairs fetched successfully.')
  );
});

// 2. CREATE CURRENT AFFAIRS ARTICLE (Admin Only with Cloudinary Image support)
const createNews = asyncHandler(async (req, res) => {
  const { title, category, content, date } = req.body;

  if (!title || !category || !content) {
    throw new ApiError(400, 'Title, Category, and Content are required.');
  }

  let imageUrl = req.body.imageUrl || '';
  if (req.file?.path) {
    const uploadedImg = await uploadOnCloudinary(req.file.path, 'rozer_that_news_images');
    if (uploadedImg?.url) {
      imageUrl = uploadedImg.url;
    }
  }

  const newsArticle = await News.create({
    title,
    category,
    content,
    date: date || new Date().toISOString().split('T')[0],
    imageUrl,
  });

  return res.status(201).json(
    new ApiResponse(201, newsArticle, 'Current affairs article published successfully.')
  );
});

// 3. DELETE CURRENT AFFAIRS ARTICLE (Admin Only)
const deleteNews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const news = await News.findByIdAndDelete(id);

  if (!news) {
    throw new ApiError(404, 'Article not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Article deleted successfully.')
  );
});

module.exports = {
  getAllNews,
  createNews,
  deleteNews,
};
