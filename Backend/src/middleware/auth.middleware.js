const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Verify mandatory Access Token JWT Authentication
const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, 'Unauthorized request. Access token is missing.');
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || 'rozer_that_access_token_secret_key_2026'
    );

    const user = await User.findById(decodedToken._id).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token. User does not exist.');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid or expired Access Token.');
  }
});

// Optional Authentication Middleware
const optionalJWT = asyncHandler(async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.accessToken;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || 'rozer_that_access_token_secret_key_2026'
    );
    const user = await User.findById(decodedToken._id).select('-password -refreshToken');
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }
  next();
});

module.exports = {
  verifyJWT,
  optionalJWT,
};
