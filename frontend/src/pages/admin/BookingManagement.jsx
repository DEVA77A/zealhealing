import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaCheck, FaTimes, FaEye, FaTimesCircle, FaSearch, FaFilter, FaWhatsapp, FaMapMarkerAlt, FaCalendarCheck, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingInvoice, setViewingInvoice] = useState(null);
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

  const downloadInvoice = async (id, bookingStatus, mode = 'download') => {
    if (!['Accepted', 'Completed'].includes(bookingStatus)) {
      toast.info('Invoice is only available after accepting the booking.');
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
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">Appointment Ledger</h2>
          <p className="text-sage-600 font-medium mt-1">Detailed record of all spiritual sessions</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-2xl text-xs font-black text-slate-500 border border-slate-200 shadow-sm uppercase tracking-widest">
          {bookings.length} Total Records
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 relative group">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform" />
          <input 
            type="text" 
            placeholder="Search by client name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-gold/10 text-sm shadow-sm transition-all hover:border-gold/30"
          />
        </div>
        <div className="w-full md:w-72 relative">
          <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-gold/10 appearance-none text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-gold/30 cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setProofModal(null)}>
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setProofModal(null)} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-colors">
              <FaTimesCircle size={32} />
            </button>

            <div className="flex flex-col gap-1 mb-10">
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Session Dossier</span>
              <h3 className="font-serif font-bold text-4xl text-slate-900 leading-tight">Details & Verification</h3>
              <div className="w-16 h-1.5 bg-gold rounded-full mt-3" />
            </div>
            
            <div className="space-y-8 text-sm">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-sans">Full Name</p>
                  <p className="text-xl font-bold text-slate-900 font-serif">{proofModal.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-sans">Direct Contact</p>
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <FaWhatsapp /> 
                    </div>
                    {proofModal.customerWhatsApp || proofModal.customerPhone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Temporal Path</p>
                  <div className="flex items-center gap-3 mb-2">
                    <FaCalendarCheck className="text-gold" />
                    <span className="font-bold text-slate-900">{new Date(proofModal.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaClock className="text-gold" />
                    <span className="text-lg font-black text-darkGreen">{formatTime12h(proofModal.appointmentTime)}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Financial Nexus</p>
                  <p className="text-3xl font-serif font-bold text-slate-900 mb-2">
                    {proofModal.currencySymbol || '₹'}{(proofModal.convertedAmount || proofModal.price).toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Method: {proofModal.paymentMethod}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Location Context</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gold shadow-sm">
                    <FaMapMarkerAlt size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{proofModal.district}, {proofModal.state}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{proofModal.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {proofModal.bookingStatus === 'Queued' && (
              <div className="flex gap-4 mt-12">
                <button 
                  onClick={() => { updateStatus(proofModal._id, 'Accepted'); setProofModal(null); }}
                  className="flex-1 py-5 bg-gradient-to-r from-darkGreen to-[#2d4d3a] text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-darkGreen/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <FaCheck /> Accept Session
                </button>
                <button 
                  onClick={() => { updateStatus(proofModal._id, 'Rejected'); setProofModal(null); }}
                  className="px-10 py-5 bg-white border-2 border-red-50 text-red-500 rounded-[2rem] font-bold hover:bg-red-50 transition-all active:scale-95"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="p-8 border-b border-slate-100 text-center">Slot</th>
                <th className="p-8 border-b border-slate-100">Customer</th>
                <th className="p-8 border-b border-slate-100">Journey Path</th>
                <th className="p-8 border-b border-slate-100">Financials</th>
                <th className="p-8 border-b border-slate-100 text-center">Status</th>
                <th className="p-8 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-800">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-slate-50/10 transition-all group">
                  <td className="p-8 text-center">
                    <div className="w-24 mx-auto">
                       <p className="font-bold text-slate-900 text-lg">{new Date(booking.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                       <p className="text-[10px] text-gold font-black uppercase tracking-widest mt-1">{formatTime12h(booking.appointmentTime)}</p>
                    </div>
                  </td>
                  <td className="p-8">
                    <p className="font-serif font-bold text-slate-900 text-lg group-hover:text-darkGreen transition-colors">{booking.customerName}</p>
                    <div className="flex items-center gap-2 mt-1.5 opacity-60">
                       <FaWhatsapp className="text-emerald-500 text-xs" />
                       <span className="text-[11px] font-bold">{booking.customerWhatsApp || booking.customerPhone}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.15em] mb-1">{booking.callType}</p>
                    <p className="text-xs font-bold text-slate-700">{booking.duration} MIN JOURNEY</p>
                  </td>
                  <td className="p-8">
                    <p className="font-serif font-bold text-slate-900 text-lg mb-1">{booking.currencySymbol || '₹'}{(booking.convertedAmount || booking.price).toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 opacity-50 font-black text-[9px] uppercase tracking-tighter">
                      <div className="w-1 h-1 rounded-full bg-slate-400" />
                      {booking.paymentMethod === 'Manual' ? 'Bank Settlement' : 'Card Nexus'}
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] tracking-[0.2em] font-black uppercase shadow-sm ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="p-8 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => setProofModal(booking)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-gold hover:text-white transition-all shadow-sm active:scale-90" title="Examine Dossier">
                      <FaSearch />
                    </button>

                    {['Queued'].includes(booking.bookingStatus) && (
                      <button onClick={() => updateStatus(booking._id, 'Accepted')} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90" title="Initiate Path">
                        <FaCheck />
                      </button>
                    )}

                    {['Accepted'].includes(booking.bookingStatus) && (
                      <button onClick={() => updateStatus(booking._id, 'Completed')} className="p-3 bg-darkGreen/10 text-darkGreen rounded-2xl hover:bg-darkGreen hover:text-white transition-all shadow-sm active:scale-90" title="Consummate Session">
                        <FaCheck />
                      </button>
                    )}

                    {['Accepted', 'Completed'].includes(booking.bookingStatus) && (
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'view')} 
                          className="p-3 bg-gold/10 text-gold rounded-2xl hover:bg-gold hover:text-white transition-all shadow-sm active:scale-95" 
                          title="View Invoice"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'download')} 
                          className="p-3 bg-darkGreen/10 text-darkGreen rounded-2xl hover:bg-darkGreen hover:text-white transition-all shadow-sm active:scale-95" 
                          title="Download Invoice"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                <FaSearch className="text-slate-200 text-3xl" />
               </div>
               <p className="text-slate-400 font-serif italic text-2xl">The ledger is silent for your query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingInvoice(null)} />
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 scale-in-center transition-transform">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Document Preview</h3>
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

export default BookingManagement;
