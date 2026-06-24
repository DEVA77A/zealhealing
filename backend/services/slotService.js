const Booking = require('../models/Booking');
const { workingHours } = require('../config/pricingConfig');

/**
 * Get available time slots for a given date and duration
 */
const getAvailableSlots = async (date, duration) => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0=Sunday
  const hours = workingHours[dayOfWeek];

  if (!hours) return [];

  // Generate all possible slots
  const slots = [];
  const [startH, startM] = hours.start.split(':').map(Number);
  const [endH, endM] = hours.end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Generate slots at 30-min intervals
  for (let t = startMinutes; t + duration <= endMinutes; t += 30) {
    const slotH = Math.floor(t / 60);
    const slotM = t % 60;
    const slotTime = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;
    slots.push(slotTime);
  }

  // Find already booked slots for this date
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await Booking.find({
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    bookingStatus: { $nin: ['Cancelled', 'Rejected'] },
  });

  // Remove overlapping slots
  const availableSlots = slots.filter(slotTime => {
    const [sH, sM] = slotTime.split(':').map(Number);
    const slotStart = sH * 60 + sM;
    const slotEnd = slotStart + duration;

    for (const booking of existingBookings) {
      const [bH, bM] = booking.appointmentTime.split(':').map(Number);
      const bookingStart = bH * 60 + bM;
      const bookingEnd = bookingStart + booking.duration;

      // Check overlap
      if (slotStart < bookingEnd && slotEnd > bookingStart) {
        return false;
      }
    }
    return true;
  });

  return availableSlots;
};

/**
 * Check if a specific slot is available
 */
const isSlotAvailable = async (date, time, duration) => {
  const slots = await getAvailableSlots(date, duration);
  return slots.includes(time);
};

/**
 * Format time from 24h to 12h
 */
const formatTime12h = (time24) => {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

module.exports = { getAvailableSlots, isSlotAvailable, formatTime12h };
