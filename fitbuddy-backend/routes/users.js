const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.put('/change-password', changePassword);

module.exports = router;
