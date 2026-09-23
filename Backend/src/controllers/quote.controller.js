const Quote = require('../models/Quote.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// 1. GET DAILY MOTIVATIONAL QUOTE (Public)
const getDailyQuote = asyncHandler(async (req, res) => {
  const quotes = await Quote.find();

  if (quotes.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          quote: 'Some goals are so worthy, it\'s glorious even to fail.',
          author: 'Captain Manoj Kumar Pandey, Param Vir Chakra',
        },
        'Fallback quote returned.'
      )
    );
  }

  // Pick quote deterministically based on day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const selectedQuote = quotes[dayOfYear % quotes.length];

  return res.status(200).json(
    new ApiResponse(200, selectedQuote, 'Daily motivational quote fetched.')
  );
});

// 2. GET ALL QUOTES
const getAllQuotes = asyncHandler(async (req, res) => {
  const quotes = await Quote.find().sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, quotes, 'Quotes fetched successfully.')
  );
});

// 3. CREATE QUOTE (Admin Only)
const createQuote = asyncHandler(async (req, res) => {
  const { quote, author } = req.body;

  if (!quote || !author) {
    throw new ApiError(400, 'Quote text and author are required.');
  }

  const newQuote = await Quote.create({ quote, author });

  return res.status(201).json(
    new ApiResponse(201, newQuote, 'Motivational quote added successfully.')
  );
});

// 4. DELETE QUOTE (Admin Only)
const deleteQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quote = await Quote.findByIdAndDelete(id);

  if (!quote) {
    throw new ApiError(404, 'Quote not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Quote deleted successfully.')
  );
});

module.exports = {
  getDailyQuote,
  getAllQuotes,
  createQuote,
  deleteQuote,
};
