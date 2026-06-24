import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaCheck, FaTimes, FaEye, FaTimesCircle, FaSearch, FaFilter, FaWhatsapp, FaMapMarkerAlt, FaCalendarCheck } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/admin/bookings', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const sorted = data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        setBookings(sorted);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch bookings');
        setLoading(false);
      }
    };
    fetchBookings();
  }, [getToken]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/admin/bookings/${id}`, 
        { bookingStatus: status },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setBookings(bookings.map(b => b._id === id ? data : b));
      
      if (status === 'Accepted') {
        toast.success('Booking accepted! Notification & Zoom meeting triggers initiated.');
      } else {
        toast.success(`Booking status changed to ${status}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const downloadInvoice = (id, bookingStatus) => {
    if (!['Accepted', 'Completed'].includes(bookingStatus)) {
      toast.info('Invoice is only available after accepting the booking.');
      return;
    }
    window.open(`http://localhost:5000/api/invoice/${id}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Queued': return 'bg-yellow-100 text-yellow-700 font-bold';
      case 'Accepted': return 'bg-blue-100 text-blue-700 font-bold';
      case 'Completed': return 'bg-green-100 text-green-700 font-bold';
      case 'Rejected': return 'bg-red-100 text-red-700 font-bold';
      case 'Cancelled': return 'bg-red-100 text-red-700 font-bold';
      default: return 'bg-sage-100 text-sage-700';
    }
  };

  const formatTime12h = (time24) => {
    if (!time24) return 'N/A';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-8 text-center text-sage-600 font-serif animate-pulse">Accessing Secure Records...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-3xl font-serif font-bold text-sage-900">Appointment Ledger</h2>
         <div className="bg-sage-100 px-4 py-1.5 rounded-full text-xs font-bold text-sage-600 border border-sage-200">
            {bookings.length} Total Records
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative shadow-sm">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <input 
            type="text" 
            placeholder="Search by client name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-transparent rounded-xl focus:ring-2 focus:ring-darkGreen/20 text-sm bg-white shadow-sm transition-all"
          />
        </div>
        <div className="w-full md:w-64 relative shadow-sm">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-transparent rounded-xl focus:ring-2 focus:ring-darkGreen/20 appearance-none bg-white text-sm shadow-sm transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Queued">Queued (New)</option>
            <option value="Accepted">Accepted (Active)</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {proofModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 scroll-hidden" onClick={() => setProofModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[95vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-sage-900 border-b-2 border-darkGreen pb-2">Client Dossier</h3>
              <button onClick={() => setProofModal(null)} className="text-sage-400 hover:text-red-500 transition">
                <FaTimesCircle size={28} />
              </button>
            </div>
            
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sage-50 rounded-2xl p-4 border border-sage-100">
                  <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="font-bold text-sage-900">{proofModal.customerName}</p>
                </div>
                <div className="bg-sage-50 rounded-2xl p-4 border border-sage-100">
                  <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1">WhatsApp</p>
                  <p className="font-bold text-darkGreen flex items-center gap-2"><FaWhatsapp /> {proofModal.customerWhatsApp || proofModal.customerPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sage-50 rounded-2xl p-4 border border-sage-100">
                  <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1">Requested slot</p>
                  <p className="font-bold text-sage-900 flex items-center gap-2"><FaCalendarCheck /> {new Date(proofModal.appointmentDate).toLocaleDateString()}</p>
                  <p className="text-xs font-bold text-darkGreen mt-1">{formatTime12h(proofModal.appointmentTime)}</p>
                </div>
                <div className="bg-sage-50 rounded-2xl p-4 border border-sage-100">
                  <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1">Settlement</p>
                  <p className="font-bold text-sage-900">{proofModal.currencySymbol || '₹'}{(proofModal.convertedAmount || proofModal.price).toFixed(2)}</p>
                  <p className="text-[10px] text-sage-500 mt-1 uppercase">Method: {proofModal.paymentMethod}</p>
                </div>
              </div>

              <div className="bg-sage-50 rounded-2xl p-4 border border-sage-100">
                <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1">Location Dossier</p>
                <p className="font-bold text-sage-900 flex items-center gap-2"><FaMapMarkerAlt /> {proofModal.district}, {proofModal.state}</p>
                <p className="text-xs text-sage-500 mt-1 uppercase tracking-wider">{proofModal.country}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-darkGreen/5 rounded-2xl p-4 border border-darkGreen/10">
                   <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1">Transaction ID</p>
                   <p className="font-mono text-darkGreen text-[11px] break-all">{proofModal.transactionId || 'NOT_FOUND'}</p>
                </div>
                <div className="bg-darkGreen/5 rounded-2xl p-4 border border-darkGreen/10">
                   <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1">Notes</p>
                   <p className="text-xs text-sage-600 line-clamp-2 italic">"{proofModal.notes || 'No remarks provided'}"</p>
                </div>
              </div>

              {proofModal.paymentScreenshot && (
                <div>
                  <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-2 px-1">Payment Verification Artifact</p>
                  <img src={proofModal.paymentScreenshot} alt="Payment Proof" className="w-full rounded-2xl border-4 border-white shadow-xl" />
                </div>
              )}
            </div>

            {proofModal.bookingStatus === 'Queued' && (
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => { updateStatus(proofModal._id, 'Accepted'); setProofModal(null); }}
                  className="flex-1 py-4 bg-darkGreen text-white rounded-2xl font-bold hover:bg-sage-800 transition shadow-lg shadow-darkGreen/20 flex items-center justify-center gap-2"
                >
                  <FaCheck /> Accept & Trigger Notification
                </button>
                <button 
                  onClick={() => { updateStatus(proofModal._id, 'Rejected'); setProofModal(null); }}
                  className="px-6 py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-sage-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-50/50 text-sage-600 text-xs uppercase tracking-[0.15em] font-bold">
                <th className="p-5 border-b border-sage-100 text-center">Slot</th>
                <th className="p-5 border-b border-sage-100">Customer</th>
                <th className="p-5 border-b border-sage-100">Service Path</th>
                <th className="p-5 border-b border-sage-100">Financials</th>
                <th className="p-5 border-b border-sage-100">Geography</th>
                <th className="p-5 border-b border-sage-100">Status</th>
                <th className="p-5 border-b border-sage-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-50 text-sm text-sage-800">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-sage-50/30 transition-all group">
                  <td className="p-5 text-center">
                    <div className="w-20 mx-auto">
                       <p className="font-bold text-darkGreen">{new Date(booking.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                       <p className="text-[10px] text-sage-400 font-bold uppercase">{formatTime12h(booking.appointmentTime)}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-sage-900 group-hover:text-darkGreen transition-colors">{booking.customerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <FaWhatsapp className="text-green-500 text-[10px]" />
                       <span className="text-[11px] text-sage-500 font-medium">{booking.customerWhatsApp || booking.customerPhone}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-sage-700 text-xs uppercase tracking-wider">{booking.callType}</p>
                    <p className="text-[11px] text-sage-500 font-bold">{booking.duration} MIN JOURNEY</p>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-sage-900">{booking.currencySymbol || '₹'}{(booking.convertedAmount || booking.price).toFixed(2)}</p>
                    <p className="text-[11px] text-sage-400 font-medium italic">{booking.paymentMethod === 'Manual' ? 'Bank' : 'Card'}</p>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-sage-700 text-xs">{booking.district}</p>
                    <p className="text-[10px] text-sage-400 font-bold uppercase">{booking.countryCategory}</p>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => setProofModal(booking)} className="p-2.5 bg-sage-50 text-sage-600 rounded-xl hover:bg-darkGreen hover:text-white transition-all shadow-sm" title="View Records">
                      <FaEye />
                    </button>

                    {booking.bookingStatus === 'Queued' && (
                      <button onClick={() => updateStatus(booking._id, 'Accepted')} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Accept & Initiate">
                        <FaCheck />
                      </button>
                    )}

                    {['Accepted'].includes(booking.bookingStatus) && (
                      <button onClick={() => updateStatus(booking._id, 'Completed')} className="p-2.5 bg-sage-100 text-darkGreen rounded-xl hover:bg-darkGreen hover:text-white transition-all shadow-sm" title="Mark Cycle Complete">
                        <FaCheck />
                      </button>
                    )}

                    {['Accepted', 'Completed'].includes(booking.bookingStatus) && (
                      <button onClick={() => downloadInvoice(booking._id, booking.bookingStatus)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Generate Receipt">
                        <FaDownload />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="p-20 text-center">
               <FaSearch className="mx-auto text-4xl text-sage-100 mb-4" />
               <p className="text-sage-400 font-serif italic text-lg">No records matched your search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
