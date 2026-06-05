const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const fs = require('fs');
const path = require('path');

// @desc    Generate Invoice PDF
// @route   GET /api/invoice/:bookingId
// @access  Private
const generateInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if invoice already exists
    let invoice = await Invoice.findOne({ bookingId: booking._id });

    if (!invoice) {
      // Create new invoice record
      const invoiceNumber = `ZH-FY25-26/R14_${Math.floor(Math.random() * 1000)}`;
      
      const subtotal = booking.convertedAmount || booking.price;
      const SGST = subtotal * 0.025;
      const CGST = subtotal * 0.025;
      const GST = 5;
      const grandTotal = subtotal + SGST + CGST;

      invoice = new Invoice({
        bookingId: booking._id,
        invoiceNumber,
        subtotal,
        SGST,
        CGST,
        GST,
        roundOff: 0,
        grandTotal,
      });

      await invoice.save();
      booking.invoiceNumber = invoiceNumber;
      await booking.save();
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    // Add Logo placeholder and Header
    doc
      .fontSize(20)
      .text('ZEAL HEALING', { align: 'right' })
      .fontSize(10)
      .text('Tax Invoice', { align: 'right' })
      .moveDown();

    // Bill To
    doc.fontSize(12).text('Bill To:');
    doc.fontSize(10).text(booking.customerName);
    doc.text(`Contact No. : ${booking.customerPhone}`);
    doc.moveDown();

    // Invoice Details
    doc.text(`Invoice No. : ${invoice.invoiceNumber}`, { align: 'right' });
    doc.text(`Date : ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, { align: 'right' });
    
    // Additional Country & Currency Info
    if (booking.currency && booking.currency !== 'INR') {
      doc.moveDown();
      doc.fontSize(10).text(`Country: ${booking.country} | Timezone: ${booking.timezone || 'N/A'}`);
      doc.text(`Base Amount: Rs. ${booking.baseINRAmount || booking.price} | Exchange Rate: ${booking.exchangeRate || 1} ${booking.currency}/INR`);
    }

    doc.moveDown();

    // Table Header
    const tableTop = 200;
    doc
      .fillColor('white')
      .rect(50, tableTop, 500, 20)
      .fill('#2E7D32') // Dark green
      .stroke();
    
    doc.fillColor('white');
    doc.text('Item name', 55, tableTop + 5);
    doc.text('HSN/ SAC', 250, tableTop + 5);
    doc.text('Qty', 320, tableTop + 5);
    doc.text('Unit', 350, tableTop + 5);
    doc.text('Price/ Unit', 400, tableTop + 5);
    doc.text('GST', 460, tableTop + 5);
    doc.text('Amount', 500, tableTop + 5);

    // Table Row
    const rowTop = tableTop + 20;
    doc.fillColor('black');
    doc.text(booking.appointmentType, 55, rowTop + 5);
    doc.text('9992', 250, rowTop + 5);
    doc.text('1', 320, rowTop + 5);
    doc.text('Nos', 350, rowTop + 5);
    doc.text(invoice.subtotal.toFixed(2), 400, rowTop + 5);
    doc.text('5.0%', 460, rowTop + 5);
    doc.text((invoice.subtotal + invoice.SGST + invoice.CGST).toFixed(2), 500, rowTop + 5);
    
    doc.moveDown(5);

    // Summary
    const summaryLeft = 350;
    doc.text('Sub Total (Excl. Tax)', summaryLeft, doc.y);
    doc.text(invoice.subtotal.toFixed(2), 500, doc.y - 10, { align: 'right' });
    doc.moveDown();

    doc.text('SGST@2.5%', summaryLeft, doc.y);
    doc.text(invoice.SGST.toFixed(2), 500, doc.y - 10, { align: 'right' });
    doc.moveDown();

    doc.text('CGST@2.5%', summaryLeft, doc.y);
    doc.text(invoice.CGST.toFixed(2), 500, doc.y - 10, { align: 'right' });
    doc.moveDown();

    doc.text('Round off', summaryLeft, doc.y);
    doc.text('0.00', 500, doc.y - 10, { align: 'right' });
    doc.moveDown();

    // Grand Total background
    doc
      .fillColor('#2E7D32')
      .rect(summaryLeft - 10, doc.y, 220, 20)
      .fill();
    
    doc.fillColor('white').text('Grand Total', summaryLeft, doc.y - 15);
    const symbol = booking.currencySymbol || 'Rs.';
    doc.text(`${symbol} ${invoice.grandTotal.toFixed(2)}`, 500, doc.y - 10, { align: 'right' });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateInvoice };
