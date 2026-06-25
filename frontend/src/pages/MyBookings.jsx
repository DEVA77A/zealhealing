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
      case 'Queued': return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><FaHourglassHalf size={10} /> Pending</span>;
      case 'Accepted': return <span className="px-3 py-1 bg-darkGreen/10 text-darkGreen border border-darkGreen/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><FaCheckCircle size={10} /> Confirmed</span>;
      case 'Completed': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><FaCheckCircle size={10} /> Completed</span>;
      case 'Rejected': 
      case 'Cancelled': return <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><FaTimesCircle size={10} /> {status}</span>;
      default: return <span className="px-3 py-1 bg-sage-50 text-sage-600 border border-sage-100 rounded-full text-[10px] font-bold uppercase tracking-widest">{status}</span>;
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
    <div className="min-h-screen bg-sage-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-serif font-bold text-sage-900 mb-3 tracking-tight">My Spiritual Journeys</h1>
          <p className="text-sage-500 font-medium">History of your booked tarot sessions and classes</p>
          <div className="w-16 h-1 bg-gold mx-auto mt-6 rounded-full" />
        </div>

        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-16 text-center shadow-sm border border-sage-200 mt-6 max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-6 text-darkGreen">
              <FaCalendarAlt size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-sage-900 mb-4">No sessions found</h2>
            <p className="text-sage-500 mb-8 max-w-md mx-auto">Your journey is just beginning. Book your first session to see it appear here in your spiritual records.</p>
            <a href="/packages" className="bg-darkGreen text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a3826] transition-colors inline-block shadow-sm">Reserve Your Spot</a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl shadow-sm border border-sage-200 overflow-hidden group hover:shadow-xl hover:shadow-darkGreen/10 transition-all duration-300 flex flex-col relative"
              >
                <div className="h-2 w-full bg-sage-200 group-hover:bg-darkGreen transition-colors" />
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {getStatusBadge(booking.bookingStatus)}
                    <span className={`px-3 py-1 rounded-full border ${booking.callType === 'Video Call' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5`}>
                      {booking.callType === 'Video Call' ? <FaVideo size={10} /> : <FaPhone size={10} />}
                      {booking.callType}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-serif font-bold text-sage-900 mb-2 leading-tight group-hover:text-darkGreen transition-colors">
                    {booking.appointmentType}
                  </h3>
                  
                  <div className="flex flex-col gap-4 my-8">
                    <div className="flex items-center gap-4 text-sage-700 font-medium text-sm">
                      <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center text-darkGreen shrink-0 border border-sage-100">
                        <FaCalendarAlt size={16} />
                      </div>
                      {new Date(booking.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                    <div className="flex items-center gap-4 text-sage-700 font-medium text-sm">
                      <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center text-darkGreen shrink-0 border border-sage-100">
                        <FaClock size={16} />
                      </div>
                      <span>
                        {booking.appointmentTime} <span className="text-sage-400 font-normal">({booking.duration} minutes)</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="bg-sage-50/70 rounded-2xl p-5 border border-sage-100 flex items-center justify-between mb-6 group-hover:border-sage-200 transition-colors">
                      <div>
                        <p className="text-[10px] font-bold text-sage-500 uppercase tracking-widest mb-1">Session Value</p>
                        <p className="text-2xl font-serif font-bold text-darkGreen">
                          {booking.currencySymbol || '₹'}{(booking.totalAmount || booking.convertedAmount || booking.price).toLocaleString()}
                        </p>
                      </div>
                      
                      {booking.zoomMeetingLink && booking.bookingStatus === 'Accepted' && (
                        <a 
                          href={booking.zoomMeetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-darkGreen text-white rounded-full flex items-center justify-center hover:bg-[#1a3826] transition-transform hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
                          title="Join Zoom Meeting"
                        >
                          <FaVideo size={16} />
                        </a>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {['Accepted', 'Completed'].includes(booking.bookingStatus) ? (
                        <>
                          <button 
                            onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'view')} 
                            className="flex-1 py-3.5 bg-white text-sage-700 border border-sage-200 rounded-xl hover:bg-sage-50 hover:border-sage-300 transition-all font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                          >
                            <FaEye size={14} /> View
                          </button>
                          <button 
                            onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'download')} 
                            className="flex-1 py-3.5 bg-white text-sage-700 border border-sage-200 rounded-xl hover:bg-sage-50 hover:border-sage-300 transition-all font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm" 
                          >
                            <FaDownload size={14} /> Save
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center py-3.5 text-[11px] font-bold text-sage-400 uppercase tracking-widest border border-dashed border-sage-200 rounded-xl bg-white/50">
                          Invoice Pending
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
          <div className="absolute inset-0 bg-sage-900/60 backdrop-blur-sm" onClick={() => setViewingInvoice(null)} />
          <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-sage-200">
            <div className="p-5 border-b border-sage-100 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="text-xl font-serif font-bold text-sage-900">Invoice Statement</h3>
                <p className="text-xs text-sage-500 font-bold tracking-widest uppercase mt-1">Ref: {viewingInvoice.number}</p>
              </div>
              <button 
                onClick={() => setViewingInvoice(null)} 
                className="p-2.5 bg-sage-50 text-sage-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-sage-100 shadow-sm active:scale-95"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="flex-1 bg-sage-50/50 p-2 md:p-4 relative">
              <iframe 
                src={`${viewingInvoice.url}#toolbar=0`} 
                className="w-full h-full bg-white rounded-xl border border-sage-200 shadow-sm"
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
