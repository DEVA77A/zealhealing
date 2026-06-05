import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCheck, FaDownload, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';

const PaymentSuccess = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : '';
        const { data } = await axios.get(`http://localhost:5000/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooking(data);
      } catch (error) {
        console.error("Error fetching booking", error);
      }
    };
    fetchBooking();
  }, [id]);

  if (!booking) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const handleDownloadInvoice = () => {
    // Open in new tab or trigger download
    window.open(`http://localhost:5000/api/invoice/${id}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4 flex flex-col items-center">
      
      {/* Header */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-darkGreen text-white rounded-full flex items-center justify-center text-3xl mb-6">
        <FaCheck />
      </motion.div>
      <h2 className="text-4xl font-serif font-bold text-darkGreen mb-4 text-center">Payment Successful</h2>
      <p className="text-sage-700 mb-10 text-center max-w-lg">
        Your journey to spiritual clarity has officially begun. We've sent a confirmation email with all the details.
      </p>

      {/* Summary Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-2xl bg-white border-transparent p-8 mb-8 relative">
        <div className="flex justify-between items-center border-b border-sage-100 pb-6 mb-6">
          <h3 className="text-xl font-serif font-bold text-sage-900">Booking Summary</h3>
          <span className="bg-sage-200 text-darkGreen px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {booking.paymentStatus === 'Completed' ? 'Confirmed' : 'Pending Verification'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">SESSION</p>
            <p className="font-medium text-sage-900">{booking.appointmentType}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">SESSION TYPE</p>
            <p className="font-medium text-sage-900">{booking.callType}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">DATE</p>
            <p className="font-medium text-sage-900">{new Date(booking.bookingDate).toLocaleDateString()} • {booking.duration} Mins</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">TOTAL AMOUNT</p>
            <p className="font-medium text-sage-900">{booking.currencySymbol || '₹'}{((booking.convertedAmount || booking.price) * 1.05).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-sage-50 rounded-xl p-4 flex items-start gap-4 mb-8">
          <div className="bg-sage-200 p-2 rounded-lg text-darkGreen mt-1">
            <FaMapMarkerAlt />
          </div>
          <div>
            <p className="font-semibold text-sage-900">Digital Sanctuary</p>
            <p className="text-sm text-sage-600">A secure link will be sent to your email 10 minutes before the session.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleDownloadInvoice} className="btn-primary flex items-center justify-center gap-2">
            <FaDownload /> Download Invoice
          </button>
          <Link to="/">
            <button className="btn-secondary w-full flex items-center justify-center gap-2">
              <FaArrowLeft /> Back to Home
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Decorative banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl h-48 rounded-2xl overflow-hidden relative shadow-md">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-bg.png')" }} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h4 className="text-white font-serif font-bold text-xl mb-1">Prepare for your session</h4>
          <p className="text-sage-100 text-sm">Find a quiet space and arrive 5 minutes early.</p>
        </div>
      </motion.div>

    </div>
  );
};

export default PaymentSuccess;
