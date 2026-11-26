const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const { isSlotAvailable } = require('../services/slotService');
const { sendClientBookingEmail } = require('../services/emailService');
const { sendClientWhatsApp } = require('../services/whatsappService');
const { createZoomMeeting } = require('../services/zoomService');
const { GST_RATE } = require('../config/pricingConfig');

const getEndTime = (time, duration) => {
  const [hours, minutes] = time.split(':').map(Number);
  const end = hours * 60 + minutes + Number(duration);
  return [Math.floor(end / 60), end % 60].map(value => String(value).padStart(2, '0')).join(':');
};

const attachZoomMeeting = async (booking) => {
  if (booking.callType !== 'Video Call') return;

  const zoom = await createZoomMeeting(booking);
  if (!zoom) return;

  booking.zoomMeetingId = zoom.meetingId;
  booking.zoomMeetingLink = zoom.meetingLink;
  booking.zoomMeetingPassword = zoom.meetingPassword;
  await booking.save();
};

const notifyScheduledBooking = async (booking) => {
  await attachZoomMeeting(booking);
  const [emailSent, whatsappSent] = await Promise.all([
    sendClientBookingEmail(booking),
    sendClientWhatsApp(booking),
  ]);
  const notificationUpdates = {
    ...(emailSent && { emailSentToClient: true }),
    ...(whatsappSent && { whatsappSentToClient: true }),
  };
  if (Object.keys(notificationUpdates).length) {
    await Booking.updateOne({ _id: booking._id }, notificationUpdates);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking && (req.user.role === 'admin' || String(booking.userId) === req.user.id)) {
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
    const query = {};
    if (req.query.userId) {
      query.userId = req.query.userId;
    }
    const bookings = await Booking.find(query).populate('userId', 'id name email').sort({ bookingDate: -1 });
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
    const {
      bookingStatus,
      isManuallyConfirmed,
      crystals,
      medicine,
      adminSuggestion,
      appointmentDate,
      appointmentTime,
    } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const assigningSchedule = appointmentDate !== undefined || appointmentTime !== undefined;
    if (assigningSchedule) {
      if (booking.paymentAmountMinor != null && !booking.paidAt) {
        return res.status(409).json({ message: 'Payment must be captured before scheduling.' });
      }
      if (booking.appointmentDate && booking.appointmentTime) {
        return res.status(409).json({ message: 'This booking already has a schedule.' });
      }
      if (!['Queued', 'Accepted'].includes(booking.bookingStatus)) {
        return res.status(409).json({ message: 'Only queued or accepted bookings can be scheduled.' });
      }
      const date = new Date(appointmentDate + 'T00:00:00');
      if (typeof appointmentDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) ||
          !Number.isFinite(date.getTime()) || date.getDate() !== Number(appointmentDate.slice(-2)) ||
          typeof appointmentTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(appointmentTime)) {
        return res.status(400).json({ message: 'Enter a valid appointment date and time.' });
      }
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const start = new Date(date);
      start.setHours(hours, minutes);
      if (start <= new Date() || !(await isSlotAvailable(date, appointmentTime, booking.duration))) {
        return res.status(409).json({ message: 'Choose an available future appointment slot.' });
      }
      booking.appointmentDate = date;
      booking.appointmentTime = appointmentTime;
      booking.appointmentEndTime = getEndTime(appointmentTime, booking.duration);
      if (booking.paidAt && booking.bookingStatus === 'Queued') booking.bookingStatus = 'Accepted';
    }

    if (bookingStatus) {
      if (booking.paymentAmountMinor != null && !booking.paidAt) {
        return res.status(409).json({ message: 'Payment must be captured before updating the booking status.' });
      }
      booking.bookingStatus = bookingStatus;
    }
    if (isManuallyConfirmed !== undefined) booking.isManuallyConfirmed = isManuallyConfirmed;
    if (crystals !== undefined) booking.crystals = crystals;
    if (medicine !== undefined) booking.medicine = medicine;

    // Guidance shown to the client. Only re-stamp the timestamp when the text
    // actually changes, so unrelated updates don't look like new advice.
    if (adminSuggestion !== undefined) {
      const next = String(adminSuggestion);
      if (next !== booking.adminSuggestion) {
        booking.adminSuggestion = next;
        booking.adminSuggestionAt = next.trim() ? new Date() : undefined;
      }
    }

    // Keep invoice handling for previously paid bookings.
    if (bookingStatus === 'Accepted') {

      // Auto-generate invoice on acceptance if it doesn't already exist
      const existingInvoice = await Invoice.findOne({ bookingId: booking._id });
      if (!existingInvoice && booking.paymentStatus === 'Completed') {
        const invoiceNumber = `ZH-FY25-26/R14_${Math.floor(Math.random() * 10000)}`;
        // Invoice is always raised in INR (the stored base), GST inclusive.
        const subtotal = booking.baseINRAmount || booking.price;
        const gstRate = booking.gstRate > 0 ? booking.gstRate : GST_RATE;
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

    // Validate only what this request changed. Legacy bookings predate some
    // required fields, and full-document validation would reject an otherwise
    // valid admin edit (e.g. adding a suggestion) on those older records.
    const updatedBooking = await booking.save({ validateModifiedOnly: true });
    if (assigningSchedule) {
      notifyScheduledBooking(updatedBooking).catch(err => console.error('[Scheduling] Notification error:', err.message));
    }
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

    if (booking?.paymentAmountMinor != null) {
      return res.status(409).json({ message: 'Online payment records must be retained.' });
    }
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
    const bookings = await Booking.find({ userId: req.user._id, $or: [{ paymentAmountMinor: { $exists: false } }, { paidAt: { $exists: true } }] }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBookingById,
  getBookings,
  updateBookingStatus,
  deleteBooking,
  getMyBookings,
};
