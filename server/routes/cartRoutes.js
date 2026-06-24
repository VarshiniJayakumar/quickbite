const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', protect, getCart);

router.post(
  '/',
  protect,
  [
    body('foodId').notEmpty().withMessage('Food ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  addToCart
);

router.put(
  '/:foodId',
  protect,
  [body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or more')],
  validate,
  updateCartItem
);

router.delete('/clear', protect, clearCart);
router.delete('/:foodId', protect, removeFromCart);

module.exports = router;
