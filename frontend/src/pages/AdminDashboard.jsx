import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaDownload, FaCheck, FaTimes } from 'react-icons/fa';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || userInfo.role !== 'admin') {
          toast.error('Not authorized as an admin');
          navigate('/');
          return;
        }

        const { data } = await axios.get('http://localhost:5000/api/admin/bookings', {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setBookings(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch bookings');
        setLoading(false);
      }
    };
    fetchBookings();
  }, [navigate]);

  const updateStatus = async (id, status) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put(`http://localhost:5000/api/admin/bookings/${id}`, 
        { bookingStatus: status, paymentStatus: status === 'Completed' ? 'Completed' : undefined },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setBookings(bookings.map(b => b._id === id ? { ...b, bookingStatus: status, paymentStatus: status === 'Completed' ? 'Completed' : b.paymentStatus } : b));
      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteBooking = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        await axios.delete(`http://localhost:5000/api/admin/bookings/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setBookings(bookings.filter(b => b._id !== id));
        toast.success('Booking deleted');
      } catch (error) {
        toast.error('Failed to delete booking');
      }
    }
  };

  const downloadInvoice = (id) => {
    window.open(`http://localhost:5000/api/invoice/${id}`, '_blank');
  };

  // Stats
  const totalRevenue = bookings.reduce((acc, curr) => curr.paymentStatus === 'Completed' ? acc + (curr.baseINRAmount || curr.price) : acc, 0);
  const totalVoice = bookings.filter(b => b.callType === 'Voice Call').length;
  const totalVideo = bookings.filter(b => b.callType === 'Video Call').length;

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading Admin Data...</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-sage-900 mb-8">Admin Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card border-l-4 border-l-darkGreen">
            <h3 className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-sage-900">{bookings.length}</p>
          </div>
          <div className="card border-l-4 border-l-sage-400">
            <h3 className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-sage-900">₹{totalRevenue}</p>
          </div>
          <div className="card border-l-4 border-l-sage-600">
            <h3 className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-2">Voice Bookings</h3>
            <p className="text-3xl font-bold text-sage-900">{totalVoice}</p>
          </div>
          <div className="card border-l-4 border-l-sage-800">
            <h3 className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-2">Video Bookings</h3>
            <p className="text-3xl font-bold text-sage-900">{totalVideo}</p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card overflow-x-auto">
          <h3 className="text-xl font-serif font-bold text-sage-900 mb-4">Recent Bookings</h3>
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-100 text-sage-700 text-sm uppercase tracking-wider">
                <th className="p-4 rounded-tl-lg">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Country/Currency</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 text-sm text-sage-800">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="p-4">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <p className="font-semibold text-sage-900">{booking.customerName}</p>
                    <p className="text-xs text-sage-500">{booking.customerEmail}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-sage-900">{booking.country}</p>
                    <p className="text-xs text-sage-500">{booking.currency || 'INR'}</p>
                  </td>
                  <td className="p-4">{booking.callType} <br/> <span className="text-xs text-sage-500">{booking.duration} Min</span></td>
                  <td className="p-4">
                    <p className="font-medium text-sage-900">{booking.currencySymbol || '₹'}{booking.convertedAmount || booking.price}</p>
                    <p className="text-xs text-sage-500">Base: ₹{booking.baseINRAmount || booking.price}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.bookingStatus === 'Completed' ? 'bg-green-100 text-green-700' : 
                      booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 
                      booking.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {booking.bookingStatus !== 'Completed' && (
                      <button onClick={() => updateStatus(booking._id, 'Completed')} className="p-2 bg-sage-100 text-darkGreen rounded-lg hover:bg-sage-200 transition" title="Mark Completed">
                        <FaCheck />
                      </button>
                    )}
                    {booking.bookingStatus !== 'Cancelled' && (
                      <button onClick={() => updateStatus(booking._id, 'Cancelled')} className="p-2 bg-sage-100 text-red-600 rounded-lg hover:bg-red-100 transition" title="Cancel Booking">
                        <FaTimes />
                      </button>
                    )}
                    <button onClick={() => downloadInvoice(booking._id)} className="p-2 bg-sage-100 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Download Invoice">
                      <FaDownload />
                    </button>
                    <button onClick={() => deleteBooking(booking._id)} className="p-2 bg-sage-100 text-red-600 rounded-lg hover:bg-red-100 transition" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-sage-500">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
