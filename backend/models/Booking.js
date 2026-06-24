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
    // Customer Information
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
    customerWhatsApp: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    countryCategory: {
      type: String,
      required: true,
      enum: ['india', 'abroad'],
      default: 'india',
    },
    // Scheduling
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    appointmentEndTime: {
      type: String,
    },
    timezone: { type: String },
    // Pricing
    countryCode: { type: String },
    currency: { type: String },
    currencySymbol: { type: String },
    exchangeRate: { type: Number },
    baseINRAmount: { type: Number },
    convertedAmount: { type: Number },
    gstRate: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number },
    conversionTimestamp: { type: Date, default: Date.now },
    notes: {
      type: String,
    },
    // Payment
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
    // Zoom Meeting Details (for Video Calls)
    zoomMeetingId: { type: String },
    zoomMeetingLink: { type: String },
    zoomMeetingPassword: { type: String },
    // Communication platform info
    callPlatform: {
      type: String, // 'Normal Phone Call', 'WhatsApp Voice Call', 'Zoom Meeting'
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
    // Notification tracking
    emailSentToClient: { type: Boolean, default: false },
    emailSentToAdmin: { type: Boolean, default: false },
    whatsappSentToClient: { type: Boolean, default: false },
    whatsappSentToAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for preventing double bookings
bookingSchema.index({ appointmentDate: 1, appointmentTime: 1, bookingStatus: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
