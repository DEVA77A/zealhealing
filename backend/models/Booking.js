const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Make it optional for guest bookings if needed, but per requirements we have login flow. Let's make it required eventually.
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
      type: Number, // in minutes
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
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
