const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const TopicProgress = require('../models/TopicProgress.model');
const Topic = require('../models/Topic.model');
const QuizAttempt = require('../models/QuizAttempt.model');
const MockAttempt = require('../models/MockAttempt.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadOnCloudinary } = require('../utils/cloudinaryUpload');

// Helper function to generate Access and Refresh Tokens
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating Access & Refresh tokens.');
  }
};

// 1. REGISTER USER (Default role: 'student')
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, 'All fields (username, email, password) are required.');
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(400, 'User with this username or email already exists.');
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    role: 'student', // Everyone registers as normal student
  });

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(201)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, accessToken, refreshToken },
        'Registration successful! Welcome Cadet.'
      )
    );
});

// 2. LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and Password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        'Login successful!'
      )
    );
});

// 3. REFRESH ACCESS TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request. Refresh token is missing.');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'rozer_that_refresh_token_secret_key_2026'
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, 'Invalid Refresh Token.');
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or has been revoked.');
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access Token Refreshed Successfully.'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Refresh Token.');
  }
});

// 4. LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // Remove refresh token from DB
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully.'));
});

// 5. GET CURRENT LOGGED IN USER PROFILE & STATS
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const totalTopics = await Topic.countDocuments();
  const completedTopics = await TopicProgress.countDocuments({ user: user._id, isCompleted: true });
  const quizzesTaken = await QuizAttempt.countDocuments({ user: user._id });
  const mocksTaken = await MockAttempt.countDocuments({ user: user._id });
  const bookmarkedTopics = await TopicProgress.countDocuments({ user: user._id, isBookmarked: true });

  const stats = {
    totalTopics,
    completedTopics,
    completedPercentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    quizzesTaken,
    mocksTaken,
    bookmarkedTopics,
    streakDays: user.streakDays || 1,
  };

  return res.status(200).json(
    new ApiResponse(200, { user, stats }, 'Profile data fetched successfully.')
  );
});

// 6. UPDATE USER AVATAR (Cloudinary + Multer)
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar image file is required.');
  }

  const cloudinaryResult = await uploadOnCloudinary(avatarLocalPath, 'rozer_that_avatars');

  if (!cloudinaryResult || !cloudinaryResult.url) {
    throw new ApiError(500, 'Failed to upload avatar image to cloud.');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: cloudinaryResult.url } },
    { new: true }
  ).select('-password -refreshToken');

  return res.status(200).json(
    new ApiResponse(200, user, 'Avatar image updated successfully.')
  );
});

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  updateUserAvatar,
};
