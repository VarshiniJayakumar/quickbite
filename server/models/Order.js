const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Razorpay'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    deliveryPartner: {
      name: { type: String },
      phone: { type: String },
      vehicle: { type: String },
      rating: { type: Number },
      avatar: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
