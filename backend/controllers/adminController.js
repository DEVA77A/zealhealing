const Booking = require('../models/Booking');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Class = require('../models/Class');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const range = req.query.range || 'all';
    
    let bookingFilter = {};
    let userFilter = { role: 'user' };
    
    if (range !== 'all') {
      const days = parseInt(range);
      const d = new Date();
      d.setDate(d.getDate() - days);
      bookingFilter = { bookingDate: { $gte: d } };
      userFilter.createdAt = { $gte: d };
    }

    const totalUsers = await User.countDocuments(userFilter);
    const totalBookings = await Booking.countDocuments(bookingFilter);
    const totalClasses = await Class.countDocuments();
    
    // Revenue calculations for the selected range
    const completedBookings = await Booking.find({ paymentStatus: 'Completed', ...bookingFilter });
    const totalRevenue = completedBookings.reduce((acc, curr) => acc + (curr.totalAmount || curr.convertedAmount || curr.price), 0);

    // This month's revenue (from the filtered set)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyBookings = completedBookings.filter(b => b.bookingDate >= startOfMonth);
    const monthlyRevenue = monthlyBookings.reduce((acc, curr) => acc + (curr.totalAmount || curr.convertedAmount || curr.price), 0);

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyBookings = completedBookings.filter(b => b.bookingDate >= today);
    const todaysRevenue = dailyBookings.reduce((acc, curr) => acc + (curr.totalAmount || curr.convertedAmount || curr.price), 0);

    // Pending vs Completed (using range filter)
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'Scheduled', ...bookingFilter });
    const completedSessions = await Booking.countDocuments({ bookingStatus: 'Completed', ...bookingFilter });

    // Chart Data: Revenue over time (last 6 months)
    // We use all completed bookings for this to always show the 6-month trend properly regardless of filter
    const allCompletedBookings = await Booking.find({ paymentStatus: 'Completed' });
    const revenueChart = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      
      const monthRev = allCompletedBookings
        .filter(b => b.bookingDate >= start && b.bookingDate <= end)
        .reduce((acc, curr) => acc + (curr.totalAmount || curr.convertedAmount || curr.price), 0);
        
      revenueChart.push({ name: monthName, revenue: monthRev });
    }

    // Chart Data: Country distribution (from selected range)
    const countryData = {};
    completedBookings.forEach(b => {
      if (!countryData[b.country]) countryData[b.country] = 0;
      countryData[b.country] += (b.totalAmount || b.convertedAmount || b.price);
    });
    const countryChart = Object.keys(countryData).map(k => ({ name: k, value: countryData[k] }));

    // Chart Data: Class popularity (from selected range)
    const classData = {};
    completedBookings.forEach(b => {
      const key = `${b.callType} ${b.duration}m`;
      if (!classData[key]) classData[key] = 0;
      classData[key] += 1;
    });
    const classChart = Object.keys(classData).map(k => ({ name: k, sales: classData[k] }));

    // Top performing classes ranked by booking count
    // Group by appointmentType + callType + duration (no classId on Booking model)
    const allBookingsRaw = await Booking.find({ paymentStatus: 'Completed' });
    const classStatsMap = {};
    allBookingsRaw.forEach(b => {
      const key = `${b.appointmentType}||${b.callType}||${b.duration}`;
      if (!classStatsMap[key]) {
        classStatsMap[key] = {
          title: b.appointmentType,
          type: b.callType,
          duration: b.duration,
          price: b.baseINRAmount || b.price,
          bookings: 0,
          revenue: 0,
        };
      }
      classStatsMap[key].bookings += 1;
      classStatsMap[key].revenue += (b.totalAmount || b.convertedAmount || b.price || 0);
    });
    const topClasses = Object.values(classStatsMap)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)
      .map((c, i) => ({ ...c, rank: i + 1 }));

    res.json({
      overview: {
        totalRevenue,
        totalBookings,
        totalUsers,
        totalClassesSold: completedBookings.length, 
        monthlyRevenue,
        todaysRevenue,
        pendingBookings,
        completedSessions,
      },
      charts: {
        revenueChart,
        countryChart,
        classChart,
      },
      topClasses,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    // Attach total bookings and spending for each user
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const bookings = await Booking.find({ userId: u._id, paymentStatus: 'Completed' });
      const totalSpending = bookings.reduce((acc, curr) => acc + (curr.totalAmount || curr.convertedAmount || curr.price), 0);
      return {
        ...u.toObject(),
        totalBookings: bookings.length,
        totalSpending,
      };
    }));
    
    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all invoices
// @route   GET /api/admin/invoices
// @access  Private/Admin
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({}).populate('bookingId');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  deleteUser,
  getInvoices,
};
