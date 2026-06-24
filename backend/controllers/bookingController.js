const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const { isSlotAvailable } = require('../services/slotService');
const { sendClientBookingEmail, sendAdminBookingEmail } = require('../services/emailService');
const { sendClientWhatsApp, sendAdminWhatsApp } = require('../services/whatsappService');
const { createZoomMeeting } = require('../services/zoomService');
const { GST_RATE_INDIA } = require('../config/pricingConfig');

// @desc    Create new booking
// @route   POST /api/bookings/create
// @access  Private
const createBooking = async (req, res) => {
  try {
    const {
      appointmentType,
      callType,
      duration,
      price,
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsApp,
      district,
      state,
      country,
      countryCategory,
      countryCode,
      currency,
      currencySymbol,
      timezone,
      exchangeRate,
      baseINRAmount,
      convertedAmount,
      appointmentDate,
      appointmentTime,
      notes,
      paymentMethod,
      // Payment proof fields
      senderAccountNumber,
      transactionId,
      paymentScreenshot,
      paymentRemarks,
    } = req.body;

    // Validate mandatory fields
    if (!customerName || !customerEmail || !customerPhone || !customerWhatsApp || !district || !state || !country) {
      return res.status(400).json({ message: 'All customer fields are required: Full Name, Email, Phone, WhatsApp, District, State, Country' });
    }

    // Validate appointment date/time
    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Appointment date and time are required' });
    }

    // Check slot availability
    const slotAvailable = await isSlotAvailable(appointmentDate, appointmentTime, duration);
    if (!slotAvailable) {
      return res.status(409).json({ message: 'This time slot is no longer available. Please select a different slot.' });
    }

    // Calculate GST & total
    const baseAmount = baseINRAmount || price;
    const isIndia = countryCategory === 'india';
    const gstRate = isIndia ? GST_RATE_INDIA : 0;
    const gstAmount = isIndia ? Math.round(baseAmount * gstRate / 100) : 0;
    const totalAmount = baseAmount + gstAmount;

    // Determine call platform
    let callPlatform = 'Normal Phone Call';
    if (callType === 'Video Call') {
      callPlatform = 'Zoom Meeting';
    } else if (!isIndia) {
      callPlatform = 'WhatsApp Voice Call';
    }

    // Calculate end time
    const [h, m] = appointmentTime.split(':').map(Number);
    const endMinutes = h * 60 + m + duration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const appointmentEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const booking = new Booking({
      userId: req.user ? req.user._id : null,
      appointmentType,
      callType,
      duration,
      price: baseAmount,
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsApp,
      district,
      state,
      country,
      countryCategory: countryCategory || 'india',
      countryCode,
      currency,
      currencySymbol,
      timezone,
      exchangeRate,
      baseINRAmount: baseAmount,
      convertedAmount,
      gstRate,
      gstAmount,
      totalAmount,
      appointmentDate,
      appointmentTime,
      appointmentEndTime,
      callPlatform,
      notes,
      paymentMethod,
      paymentStatus: 'Pending',
      bookingStatus: 'Queued',
      senderAccountNumber,
      transactionId,
      paymentScreenshot,
      paymentRemarks,
    });

    const createdBooking = await booking.save();

    // Create Zoom meeting for video calls (async, don't block response)
    if (callType === 'Video Call') {
      createZoomMeeting(createdBooking).then(async (zoomData) => {
        if (zoomData) {
          createdBooking.zoomMeetingId = zoomData.meetingId;
          createdBooking.zoomMeetingLink = zoomData.meetingLink;
          createdBooking.zoomMeetingPassword = zoomData.meetingPassword;
          await createdBooking.save();
        }
      }).catch(err => console.error('[Zoom] Async error:', err.message));
    }

    // Send notifications (async, don't block response)
    Promise.all([
      sendClientBookingEmail(createdBooking).then(sent => {
        if (sent) Booking.updateOne({ _id: createdBooking._id }, { emailSentToClient: true }).exec();
      }),
      sendAdminBookingEmail(createdBooking).then(sent => {
        if (sent) Booking.updateOne({ _id: createdBooking._id }, { emailSentToAdmin: true }).exec();
      }),
      sendClientWhatsApp(createdBooking).then(sent => {
        if (sent) Booking.updateOne({ _id: createdBooking._id }, { whatsappSentToClient: true }).exec();
      }),
      sendAdminWhatsApp(createdBooking).then(sent => {
        if (sent) Booking.updateOne({ _id: createdBooking._id }, { whatsappSentToAdmin: true }).exec();
      }),
    ]).catch(err => console.error('[Notifications] Error:', err.message));

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('userId', 'id name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { paymentStatus, bookingStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (bookingStatus) booking.bookingStatus = bookingStatus;

    // When admin accepts the booking, mark payment as completed and generate the invoice
    if (bookingStatus === 'Accepted') {
      booking.paymentStatus = 'Completed';

      // Auto-generate invoice on acceptance if it doesn't already exist
      const existingInvoice = await Invoice.findOne({ bookingId: booking._id });
      if (!existingInvoice) {
        const invoiceNumber = `ZH-FY25-26/R14_${Math.floor(Math.random() * 10000)}`;
        const subtotal = booking.baseINRAmount || booking.price;
        const isIndia = booking.countryCategory === 'india';
        const gstRate = isIndia ? GST_RATE_INDIA : 0;
        const SGST = subtotal * (gstRate / 200); // Half of GST
        const CGST = subtotal * (gstRate / 200); // Half of GST
        const grandTotal = subtotal + SGST + CGST;

        const invoice = new Invoice({
          bookingId: booking._id,
          invoiceNumber,
          subtotal,
          SGST,
          CGST,
          GST: gstRate,
          roundOff: 0,
          grandTotal,
        });

        await invoice.save();
        booking.invoiceNumber = invoiceNumber;
      }
    }

    // If rejected, mark payment as failed
    if (bookingStatus === 'Rejected') {
      booking.paymentStatus = 'Failed';
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a booking (Admin)
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      await Booking.deleteOne({ _id: booking._id });
      res.json({ message: 'Booking removed' });
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getBookings,
  updateBookingStatus,
  deleteBooking,
  getMyBookings,
};
