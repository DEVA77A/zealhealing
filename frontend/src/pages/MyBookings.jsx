import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaVideo, FaPhone, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaDownload, FaEye, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/bookings/mybookings', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setBookings(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch your bookings');
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, [getToken]);

  const downloadInvoice = async (id, bookingStatus, mode = 'download') => {
    if (!['Accepted', 'Completed'].includes(bookingStatus)) {
      toast.info('Invoice is only available after admin approval.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/invoice/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      if (mode === 'view') {
        setViewingInvoice({ url, number: id.substring(0, 8) });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${id.substring(0, 8)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      toast.error(`Failed to ${mode} invoice`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Queued': return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold flex items-center gap-1.5"><FaHourglassHalf size={10} /> Pending Approval</span>;
      case 'Accepted': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1.5"><FaCheckCircle size={10} /> Confirmed</span>;
      case 'Completed': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1.5"><FaCheckCircle size={10} /> Completed</span>;
      case 'Rejected': 
      case 'Cancelled': return <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold flex items-center gap-1.5"><FaTimesCircle size={10} /> {status}</span>;
      default: return <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-darkGreen border-t-transparent rounded-full animate-spin" />
        <p className="font-serif italic text-darkGreen">Fetching your spiritual sessions...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sage-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4">My Spiritual Journeys</h1>
          <p className="text-slate-500 font-medium">History of your booked tarot sessions and classes</p>
          <div className="w-24 h-1.5 bg-darkGreen mx-auto mt-6 rounded-full" />
        </div>

        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-white"
          >
            <div className="w-24 h-24 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-8 text-darkGreen">
              <FaCalendarAlt size={40} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">No sessions found</h2>
            <p className="text-slate-500 mb-10 max-w-md mx-auto">Your journey is just beginning. Book your first session to see it appear here in your spiritual records.</p>
            <a href="/sessions" className="btn-primary px-10 py-4 inline-block">Book Your First Session</a>
          </motion.div>
        ) : (
          <div className="grid gap-8">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white overflow-hidden group hover:border-darkGreen/20 transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="p-8 md:p-10 flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        {getStatusBadge(booking.bookingStatus)}
                        <h3 className="text-2xl font-serif font-bold text-slate-900 mt-4">{booking.appointmentType}</h3>
                        <div className="flex items-center gap-6 mt-3 text-sm font-medium text-slate-500">
                           <div className="flex items-center gap-2">
                             <FaCalendarAlt className="text-darkGreen" />
                             {new Date(booking.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
                           </div>
                           <div className="flex items-center gap-2">
                             <FaClock className="text-darkGreen" />
                             {booking.appointmentTime} ({booking.duration} min)
                           </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Session Value</p>
                        <p className="text-3xl font-serif font-bold text-slate-900">
                          {booking.currencySymbol || '₹'}{(booking.totalAmount || booking.convertedAmount || booking.price).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-50">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${booking.callType === 'Video Call' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'} text-xs font-black uppercase tracking-wider`}>
                        {booking.callType === 'Video Call' ? <FaVideo /> : <FaPhone />}
                        {booking.callType}
                      </div>

                      {booking.bookingStatus === 'Accepted' && booking.zoomMeetingLink && (
                        <a 
                          href={booking.zoomMeetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-darkGreen text-white px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-darkGreen/30 transition-all active:scale-95"
                        >
                          Join Zoom Meeting
                        </a>
                      )}

                      {['Accepted', 'Completed'].includes(booking.bookingStatus) && (
                        <div className="flex gap-2 ml-auto">
                          <button 
                            onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'view')} 
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-gold hover:text-white transition-all shadow-sm active:scale-95" 
                            title="View Invoice"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'download')} 
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-darkGreen hover:text-white transition-all shadow-sm active:scale-95" 
                            title="Download Invoice"
                          >
                            <FaDownload />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Viewer Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingInvoice(null)} />
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Invoice Statement</h3>
                <p className="text-xs text-slate-400 font-medium tracking-widest uppercase mt-1">Ref: {viewingInvoice.number}</p>
              </div>
              <button 
                onClick={() => setViewingInvoice(null)} 
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 shadow-sm active:scale-95"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="flex-1 bg-slate-50 relative">
              <iframe 
                src={`${viewingInvoice.url}#toolbar=0`} 
                className="w-full h-full border-none"
                title="Invoice Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
