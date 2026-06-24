const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Invoice = require('./models/Invoice');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/zealhealing');
  const b = await Booking.findOne({ invoiceNumber: { $regex: '8260' } });
  if (b) {
    console.log('--- BOOKING ---');
    console.log('ID:', b._id);
    console.log('Price:', b.price);
    console.log('totalAmount:', b.totalAmount);
    console.log('gstAmount:', b.gstAmount);
    console.log('gstRate:', b.gstRate);
    
    const inv = await Invoice.findOne({ bookingId: b._id });
    if (inv) {
      console.log('--- INVOICE ---');
      console.log('Grand Total:', inv.grandTotal);
      console.log('Subtotal:', inv.subtotal);
      console.log('GST:', inv.GST);
    }
  } else {
    console.log('Booking not found');
  }
  process.exit(0);
}

check();
