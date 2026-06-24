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
      enum: ['COD', 'UPI', 'Card'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
