const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { placeOrder, getMyOrders, getOrderById, updatePaymentStatus, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  protect,
  [
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required').isLength({ max: 300 }),
    body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ max: 20 }),
    body('paymentMethod').isIn(['COD', 'UPI', 'Card']).withMessage('Invalid payment method'),
  ],
  validate,
  placeOrder
);

router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/pay', protect, updatePaymentStatus);
router.patch('/:id/cancel', protect, cancelOrder);

module.exports = router;
