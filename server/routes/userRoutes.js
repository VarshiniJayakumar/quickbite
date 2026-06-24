const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getProfile, updateProfile, updateEmail, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/profile', protect, getProfile);

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().isLength({ max: 100 }),
    body('phone').optional().isLength({ max: 20 }),
    body('address').optional().isLength({ max: 300 }),
  ],
  validate,
  updateProfile
);

router.put(
  '/email',
  protect,
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  updateEmail
);

router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  validate,
  changePassword
);

module.exports = router;
