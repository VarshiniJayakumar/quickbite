const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay lazily so missing env vars don't crash server startup
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Delivery partners pool (simulated)
const DELIVERY_PARTNERS = [
  { name: 'Arjun Kumar', phone: '+91 98765 11111', vehicle: 'Bike • KA-01-AB-1234', rating: 4.8, avatar: 'A' },
  { name: 'Ravi Sharma', phone: '+91 98765 22222', vehicle: 'Bike • KA-02-CD-5678', rating: 4.9, avatar: 'R' },
  { name: 'Siva Prasad', phone: '+91 98765 33333', vehicle: 'Scooter • KA-03-EF-9012', rating: 4.7, avatar: 'S' },
  { name: 'Meena Raj', phone: '+91 98765 44444', vehicle: 'Bike • KA-04-GH-3456', rating: 4.6, avatar: 'M' },
  { name: 'Karthik V', phone: '+91 98765 55555', vehicle: 'Scooter • KA-05-IJ-7890', rating: 4.9, avatar: 'K' },
];

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const razorpay = getRazorpay();
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment and place order
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData, // { deliveryAddress, phone, coordinates, items, subtotal, tax, totalAmount }
    } = req.body;

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Assign random delivery partner
    const partner = DELIVERY_PARTNERS[Math.floor(Math.random() * DELIVERY_PARTNERS.length)];

    // Create order in DB
    const order = await Order.create({
      userId: req.user._id,
      items: orderData.items,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      totalAmount: orderData.totalAmount,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      orderStatus: 'Confirmed',
      deliveryAddress: orderData.deliveryAddress,
      coordinates: orderData.coordinates,
      phone: orderData.phone,
      deliveryPartner: partner,
    });

    res.status(201).json({ success: true, message: 'Payment verified and order placed!', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Place COD order (no payment needed)
// @route   POST /api/payment/cod
// @access  Private
const placeCODOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, phone, coordinates, items, subtotal, tax, totalAmount } = req.body;

    // Assign random delivery partner
    const partner = DELIVERY_PARTNERS[Math.floor(Math.random() * DELIVERY_PARTNERS.length)];

    const order = await Order.create({
      userId: req.user._id,
      items,
      subtotal,
      tax,
      totalAmount,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      deliveryAddress,
      coordinates,
      phone,
      deliveryPartner: partner,
    });

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyPayment, placeCODOrder };
