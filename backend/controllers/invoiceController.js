const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const fs = require('fs');
const path = require('path');

// Helper function to convert number to words (for Indian Rupees)
const numberToWords = (num) => {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; var str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
  return str;
};

// @desc    Generate Invoice PDF
// @route   GET /api/invoice/:bookingId
// @access  Private
const generateInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Block invoice generation if booking hasn't been accepted by admin yet
    if (!['Accepted', 'Completed'].includes(booking.bookingStatus)) {
      return res.status(403).json({ message: 'Invoice not available. Your booking is still in queue and awaiting admin approval.' });
    }

    // Determine pricing and taxes (18% GST -> 9% SGST, 9% CGST)
    const baseTotal = booking.convertedAmount || booking.price;
    // The baseTotal in the booking is currently treated as the grand total, so we must reverse-calculate the subtotal to match 18% GST.
    // If user paid 1180, subtotal is 1000, GST is 180.
    const subtotal = baseTotal / 1.18;
    const SGST = subtotal * 0.09;
    const CGST = subtotal * 0.09;
    const GST = 18;
    const grandTotal = Math.round(subtotal + SGST + CGST);
    const roundOff = grandTotal - (subtotal + SGST + CGST);

    // Check if invoice already exists
    let invoice = await Invoice.findOne({ bookingId: booking._id });

    if (!invoice) {
      const invoiceNumber = `ZH-25-26/07${Math.floor(Math.random() * 1000)}`;
      
      invoice = new Invoice({
        bookingId: booking._id,
        invoiceNumber,
        subtotal,
        SGST,
        CGST,
        GST,
        roundOff,
        grandTotal,
      });

      await invoice.save();
      booking.invoiceNumber = invoiceNumber;
      await booking.save();
    } else {
      // Update invoice to reflect 18% GST if it was generated with old 5% logic
      if (invoice.GST !== 18) {
        invoice.subtotal = subtotal;
        invoice.SGST = SGST;
        invoice.CGST = CGST;
        invoice.GST = 18;
        invoice.grandTotal = grandTotal;
        invoice.roundOff = roundOff;
        await invoice.save();
      }
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );

    doc.pipe(res);

    const greenColor = '#107c41'; // Adjusted to match the specific green in screenshot
    const darkText = '#000000';
    const lightText = '#333333';

    // --- Header ---
    doc.font('Helvetica-Bold').fontSize(14).fillColor(darkText).text('Zeal Healing', 40, 40);
    
    doc.font('Helvetica').fontSize(9).fillColor(lightText);
    doc.text('1A, Kalasigudai Street, Namakkal');
    doc.text('Tamil Nadu - 637001');
    doc.text('Phone no : 9005974758');
    doc.text('Email : isigihyouse@gmail.com');
    doc.text('GSTIN : 33BJJPB868G1Z7');
    doc.text('State : 33-Tamil Nadu');
    doc.text('Web : https://zealhealing.com/', { link: 'https://zealhealing.com/', underline: true, fill: greenColor });

    // Try to add Logo if it exists in frontend public
    const logoPath = path.join(__dirname, '../../frontend/public/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 450, 30, { width: 60 });
      doc.font('Helvetica-Bold').fontSize(10).fillColor(greenColor).text('ZEAL HEALING', 440, 95, { width: 80, align: 'center' });
    } else {
      doc.font('Helvetica-Bold').fontSize(16).fillColor(greenColor).text('ZEAL HEALING', 430, 50, { width: 120, align: 'right' });
    }

    // --- Tax Invoice Title & Line ---
    doc.moveDown(2);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).lineWidth(1).strokeColor(greenColor).stroke();
    
    doc.font('Helvetica-Bold').fontSize(12).fillColor(greenColor).text('Tax Invoice', 40, doc.y + 5, { align: 'center' });
    
    // --- Bill To & Invoice Details ---
    const detailY = doc.y + 15;
    
    // Left: Bill To
    doc.font('Helvetica-Bold').fontSize(9).fillColor(darkText).text('Bill To', 40, detailY);
    doc.font('Helvetica-Bold').fontSize(10).text(booking.customerName, 40, detailY + 12);
    doc.font('Helvetica').fontSize(9).fillColor(lightText).text(`Contact No. : ${booking.customerPhone}`, 40, detailY + 26);

    // Right: Invoice Details
    doc.font('Helvetica-Bold').fontSize(9).fillColor(darkText).text('Invoice Details', 400, detailY, { width: 155, align: 'right' });
    doc.font('Helvetica').fontSize(9).fillColor(lightText).text(`Invoice No. : ${invoice.invoiceNumber}`, 400, detailY + 12, { width: 155, align: 'right' });
    doc.text(`Date : ${new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-GB').replace(/\//g, '-')}`, 400, detailY + 26, { width: 155, align: 'right' });

    // --- Table Header ---
    const tableTop = detailY + 60;
    doc.rect(40, tableTop, 515, 20).fillAndStroke(greenColor, greenColor);
    
    doc.font('Helvetica-Bold').fontSize(9).fillColor('white');
    doc.text('Item name', 45, tableTop + 5);
    doc.text('HSN/ SAC', 220, tableTop + 5, { width: 60, align: 'center' });
    doc.text('Qty', 280, tableTop + 5, { width: 30, align: 'center' });
    doc.text('Unit', 310, tableTop + 5, { width: 40, align: 'center' });
    doc.text('Price/ Unit', 350, tableTop + 5, { width: 70, align: 'right' });
    doc.text('GST', 420, tableTop + 5, { width: 40, align: 'right' });
    doc.text('Amount', 480, tableTop + 5, { width: 70, align: 'right' });

    // --- Table Row ---
    const rowTop = tableTop + 25;
    doc.font('Helvetica').fontSize(9).fillColor(darkText);
    
    const itemName = `${booking.appointmentType} ${booking.duration}min ${booking.callType.charAt(0).toUpperCase() + booking.callType.slice(1)}`;
    doc.text('1', 40, rowTop, { width: 15, align: 'center' }); // Serial number
    doc.text(itemName, 55, rowTop);
    doc.text('9993', 220, rowTop, { width: 60, align: 'center' });
    doc.text('1', 280, rowTop, { width: 30, align: 'center' });
    doc.text('Nos', 310, rowTop, { width: 40, align: 'center' });
    doc.text(subtotal.toFixed(2), 350, rowTop, { width: 70, align: 'right' });
    doc.text('18.0%', 420, rowTop, { width: 40, align: 'right' });
    doc.text(baseTotal.toFixed(2), 480, rowTop, { width: 70, align: 'right' });

    // --- Bottom Section ---
    const summaryTop = rowTop + 50;

    // Left: Amount in Words
    doc.font('Helvetica').fontSize(9).fillColor(lightText);
    doc.text('Invoice Amount In Words', 40, summaryTop);
    doc.font('Helvetica-Bold').fillColor(darkText).text(numberToWords(Math.round(grandTotal)), 40, summaryTop + 12);

    // Right: Summary Calculations
    const sumX = 350;
    const sumW = 205;
    let currentY = summaryTop;

    doc.font('Helvetica-Bold').fontSize(9).text('Sub Total (Excl. Tax)', sumX, currentY);
    doc.font('Helvetica').text(subtotal.toFixed(2), sumX, currentY, { width: sumW, align: 'right' });
    currentY += 14;

    doc.font('Helvetica-Bold').text('SGST@9.0%', sumX, currentY);
    doc.font('Helvetica').text(SGST.toFixed(2), sumX, currentY, { width: sumW, align: 'right' });
    currentY += 14;

    doc.font('Helvetica-Bold').text('CGST@9.0%', sumX, currentY);
    doc.font('Helvetica').text(CGST.toFixed(2), sumX, currentY, { width: sumW, align: 'right' });
    currentY += 14;

    doc.font('Helvetica-Bold').text('Round off', sumX, currentY);
    doc.font('Helvetica').text(roundOff.toFixed(2), sumX, currentY, { width: sumW, align: 'right' });
    currentY += 14;

    // Grand Total Row
    doc.rect(sumX, currentY, sumW, 20).fillAndStroke(greenColor, greenColor);
    doc.font('Helvetica-Bold').fillColor('white').text('Grand Total', sumX + 5, currentY + 5);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, sumX, currentY + 5, { width: sumW - 5, align: 'right' });
    currentY += 25;

    // Payment Info
    doc.font('Helvetica').fillColor(darkText).text('Received', sumX, currentY);
    doc.text(grandTotal.toFixed(2), sumX, currentY, { width: sumW, align: 'right' });
    currentY += 14;

    doc.text('Balance', sumX, currentY);
    doc.text('0.00', sumX, currentY, { width: sumW, align: 'right' });

    // --- Footer / Signature ---
    const footerY = doc.page.height - 150;
    
    // Draw signature image
    const signaturePath = path.join(__dirname, '../../frontend/public/signature.jpg');
    if (fs.existsSync(signaturePath)) {
      // Adjusted coordinates to position the image nicely above "From Zeal Healing"
      doc.image(signaturePath, 450, footerY - 30, { width: 60 });
    } else {
      doc.font('Helvetica-Oblique').fontSize(16).fillColor('#000080').text('Zeal Healing', 400, footerY, { width: 155, align: 'center' });
    }
    
    doc.font('Helvetica').fontSize(9).fillColor(lightText).text('From Zeal Healing', 400, footerY + 25, { width: 155, align: 'center' });
    doc.font('Helvetica-Bold').text('Authorised Signatory', 400, footerY + 37, { width: 155, align: 'center' });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateInvoice };
