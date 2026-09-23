const express = require('express');
const router = express.Router();
const {
  getAdminOverviewStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/admin.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { verifyAdmin } = require('../middleware/admin.middleware');

// Protect all admin routes
router.use(verifyJWT, verifyAdmin);

router.get('/stats', getAdminOverviewStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
