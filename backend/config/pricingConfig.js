const basePrices = {
  india: {
    voice: {
      15: 1000,
      30: 2000,
      45: 3000,
      60: 4000,
    },
    video: {
      15: 2000,
      30: 4000,
      45: 6000,
      60: 8000,
    },
  },
  abroad: {
    voice: {
      15: 2000,
      30: 4000,
      45: 6000,
      60: 8000,
    },
    video: {
      15: 4000,
      30: 8000,
      45: 12000,
      60: 16000,
    },
  },
};

// GST applies only for India (18%)
const GST_RATE_INDIA = 18;

// Working hours configuration
const workingHours = {
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  0: { start: '10:00', end: '18:00' }, // Sunday: 10 AM to 6 PM
  1: { start: '09:00', end: '22:00' }, // Monday
  2: { start: '09:00', end: '22:00' }, // Tuesday
  3: { start: '09:00', end: '22:00' }, // Wednesday
  4: { start: '09:00', end: '22:00' }, // Thursday
  5: { start: '09:00', end: '22:00' }, // Friday
  6: { start: '09:00', end: '22:00' }, // Saturday
};

module.exports = { basePrices, GST_RATE_INDIA, workingHours };
