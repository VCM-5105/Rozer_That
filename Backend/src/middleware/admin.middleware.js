const ApiError = require('../utils/ApiError');

// Admin Role Check Middleware
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden. Admin privileges required for this action.');
  }
  next();
};

module.exports = { verifyAdmin };
