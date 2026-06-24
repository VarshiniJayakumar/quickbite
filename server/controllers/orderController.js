const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Food = require('../models/Food');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, phone, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.foodId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Build order items with snapshot of food data
    const orderItems = cart.items.map((item) => ({
      foodId: item.foodId._id,
      title: item.foodId.title,
      price: item.foodId.price,
      image: item.foodId.image,
      category: item.foodId.category,
      quantity: item.quantity,
    }));

    const subtotal = parseFloat(
      orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    );
    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const totalAmount = parseFloat((subtotal + tax).toFixed(2));

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      orderStatus: 'Pending',
      deliveryAddress,
      phone,
    });

    // Clear the cart
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Customers can only view their own orders
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status (for UPI/Card payment simulation)
// @route   PATCH /api/orders/:id/pay
// @access  Private
const updatePaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    order.paymentStatus = 'Paid';
    await order.save();

    res.json({ success: true, message: 'Payment recorded', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, updatePaymentStatus, cancelOrder };
