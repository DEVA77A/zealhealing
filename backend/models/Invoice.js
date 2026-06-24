const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Booking',
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    SGST: {
      type: Number,
      required: true,
    },
    CGST: {
      type: Number,
      required: true,
    },
    GST: {
      type: Number,
      required: true,
      default: 18,
    },
    roundOff: {
      type: Number,
      required: true,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    pdfUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
