import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCheck, FaDownload, FaArrowLeft, FaMapMarkerAlt, FaClock, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

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

  const isQueued = booking.bookingStatus === 'Queued';
  const isAccepted = ['Accepted', 'Completed'].includes(booking.bookingStatus);
  const isRejected = booking.bookingStatus === 'Rejected';

  const handleDownloadInvoice = () => {
    if (!isAccepted) {
      toast.info('Invoice will be available once your booking is confirmed by the admin.');
      return;
    }
    window.open(`http://localhost:5000/api/invoice/${id}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4 flex flex-col items-center">
      
      {/* Header Icon */}
      {isQueued && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-3xl mb-6">
            <FaClock />
          </motion.div>
          <h2 className="text-4xl font-serif font-bold text-yellow-600 mb-4 text-center">Booking Submitted!</h2>
          <p className="text-sage-700 mb-10 text-center max-w-lg">
            Your payment proof has been received. <strong>Your slot is currently in queue</strong> and awaiting confirmation from our admin. You will be notified once your booking is accepted and your invoice is generated.
          </p>
        </>
      )}

      {isAccepted && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-darkGreen text-white rounded-full flex items-center justify-center text-3xl mb-6">
            <FaCheck />
          </motion.div>
          <h2 className="text-4xl font-serif font-bold text-darkGreen mb-4 text-center">Booking Confirmed!</h2>
          <p className="text-sage-700 mb-10 text-center max-w-lg">
            Your journey to spiritual clarity has officially begun. Your payment has been verified and your invoice is ready for download.
          </p>
        </>
      )}

      {isRejected && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-3xl mb-6">
            <FaTimesCircle />
          </motion.div>
          <h2 className="text-4xl font-serif font-bold text-red-600 mb-4 text-center">Booking Rejected</h2>
          <p className="text-sage-700 mb-10 text-center max-w-lg">
            Unfortunately, your payment could not be verified. Please contact support or try booking again with valid payment proof.
          </p>
        </>
      )}

      {/* Summary Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-2xl bg-white border-transparent p-8 mb-8 relative">
        <div className="flex justify-between items-center border-b border-sage-100 pb-6 mb-6">
          <h3 className="text-xl font-serif font-bold text-sage-900">Booking Summary</h3>
          <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isQueued ? 'bg-yellow-100 text-yellow-700' : 
            isAccepted ? 'bg-green-100 text-green-700' : 
            isRejected ? 'bg-red-100 text-red-700' :
            'bg-sage-200 text-sage-700'
          }`}>
            {isQueued ? '⏳ In Queue' : 
             isAccepted ? '✅ Confirmed' : 
             isRejected ? '❌ Rejected' : 
             booking.bookingStatus}
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
          {booking.transactionId && (
            <div>
              <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">TRANSACTION ID</p>
              <p className="font-medium text-sage-900">{booking.transactionId}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">PAYMENT METHOD</p>
            <p className="font-medium text-sage-900">{booking.paymentMethod}</p>
          </div>
        </div>

        {isQueued && (
          <div className="bg-yellow-50 rounded-xl p-4 flex items-start gap-4 mb-8 border border-yellow-200">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600 mt-1">
              <FaClock />
            </div>
            <div>
              <p className="font-semibold text-yellow-800">Awaiting Admin Confirmation</p>
              <p className="text-sm text-yellow-700">Your payment proof is being reviewed. Once the admin accepts your booking, your invoice will be generated and available for download.</p>
            </div>
          </div>
        )}

        {isAccepted && (
          <div className="bg-sage-50 rounded-xl p-4 flex items-start gap-4 mb-8">
            <div className="bg-sage-200 p-2 rounded-lg text-darkGreen mt-1">
              <FaMapMarkerAlt />
            </div>
            <div>
              <p className="font-semibold text-sage-900">Digital Sanctuary</p>
              <p className="text-sm text-sage-600">A secure link will be sent to your email 10 minutes before the session.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAccepted && (
            <button onClick={handleDownloadInvoice} className="btn-primary flex items-center justify-center gap-2">
              <FaDownload /> Download Invoice
            </button>
          )}
          {isQueued && (
            <button 
              onClick={() => toast.info('Invoice will be available once your booking is confirmed.')} 
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-sage-300 text-sage-500 cursor-not-allowed opacity-60"
              disabled
            >
              <FaDownload /> Invoice Not Yet Available
            </button>
          )}
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
