const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  updateUserAvatar,
} = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', verifyJWT, logoutUser);
router.get('/me', verifyJWT, getCurrentUser);
router.post('/avatar', verifyJWT, upload.single('avatar'), updateUserAvatar);

module.exports = router;
