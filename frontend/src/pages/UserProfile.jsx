import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { user, getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/bookings/mybookings', config);
        setBookings(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyBookings();
    }
  }, [user, getToken]);

  const handleDownloadInvoice = async (bookingId, invoiceNumber) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/invoice/${bookingId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-darkGreen">My Profile</h1>
          <p className="text-sage-700 mt-2">Manage your details and view your booking history.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Details Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 sticky top-28">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-sage-200 flex items-center justify-center text-3xl text-darkGreen font-bold border-4 border-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold">Name</label>
                  <p className="font-medium text-sage-900">{user.name}</p>
                </div>
                <div>
                  <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold">Email</label>
                  <p className="font-medium text-sage-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold">Phone</label>
                  <p className="font-medium text-sage-900">{user.phone}</p>
                </div>
                {user.location && (
                  <div>
                    <label className="text-xs text-sage-500 uppercase tracking-wider font-semibold">Location / Currency</label>
                    <p className="font-medium text-sage-900">{user.location.country} ({user.location.currency})</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Bookings Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold text-darkGreen mb-4">My Bookings</h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkGreen"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-12 text-center">
                <div className="text-4xl mb-4">🌿</div>
                <h3 className="text-xl font-medium text-sage-800 mb-2">No bookings yet</h3>
                <p className="text-sage-600 mb-6">You haven't booked any sessions or classes yet.</p>
                <Link to="/sessions" className="btn-primary inline-block">
                  Book a Session
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-sage-900">{booking.appointmentType}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.bookingStatus === 'Accepted' ? 'bg-green-100 text-green-800' :
                        booking.bookingStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                        booking.bookingStatus === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    <div className="text-sm text-sage-600 space-y-1">
                      <p>Type: <span className="capitalize font-medium">{booking.callType} Call</span></p>
                      <p>Duration: <span className="font-medium">{booking.duration} Minutes</span></p>
                      <p>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                      {['Accepted', 'Completed'].includes(booking.bookingStatus) && booking.invoiceNumber && (
                        <button 
                          onClick={() => handleDownloadInvoice(booking._id, booking.invoiceNumber)}
                          className="text-darkGreen font-medium mt-2 flex items-center gap-1 hover:underline bg-sage-100 px-3 py-1 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download Invoice ({booking.invoiceNumber})
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="sm:text-right flex flex-col sm:items-end border-t sm:border-t-0 sm:border-l border-sage-100 pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-sm text-sage-500 uppercase tracking-wider font-semibold mb-1">Amount</p>
                    <p className="text-2xl font-bold text-darkGreen">
                      {booking.currencySymbol}{booking.convertedAmount || booking.price}
                    </p>
                    <span className={`mt-2 px-2 py-1 rounded text-xs font-semibold inline-block ${
                      booking.paymentStatus === 'Completed' ? 'bg-green-50 text-green-700' :
                      booking.paymentStatus === 'Failed' ? 'bg-red-50 text-red-700' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      Payment: {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
