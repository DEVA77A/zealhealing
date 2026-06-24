const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
    appointmentType: {
      type: String,
      required: true,
      default: 'Tarot Reading Appointment',
    },
    callType: {
      type: String,
      required: true,
      enum: ['Voice Call', 'Video Call'],
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    countryCode: { type: String },
    currency: { type: String },
    currencySymbol: { type: String },
    timezone: { type: String },
    exchangeRate: { type: Number },
    baseINRAmount: { type: Number },
    convertedAmount: { type: Number },
    conversionTimestamp: { type: Date, default: Date.now },
    notes: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Razorpay', 'Google Pay', 'Manual Bank Transfer'],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
    },
    razorpayOrderId: {
      type: String,
    },
    invoiceNumber: {
      type: String,
    },
    bookingDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    bookingStatus: {
      type: String,
      required: true,
      enum: ['Queued', 'Scheduled', 'Accepted', 'Completed', 'Cancelled', 'Rejected'],
      default: 'Queued',
    },
    // Payment proof fields — submitted by customer
    senderAccountNumber: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paymentScreenshot: {
      type: String, // base64 data URI or file path
    },
    paymentRemarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

