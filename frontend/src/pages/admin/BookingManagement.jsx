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
  const [adminModal, setAdminModal] = useState(null);
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

  const updateAdminDetails = async (id, details) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/admin/bookings/${id}`, 
        details,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setBookings(bookings.map(b => b._id === id ? data : b));
      toast.success('Session details updated');
      setAdminModal(null);
    } catch (error) {
      toast.error('Update failed');
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
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-sage-900">Booking Management</h2>
        <div className="bg-darkGreen text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm">
          {bookings.length} Total Records
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <input 
            type="text" 
            placeholder="Search by client name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
          />
        </div>
        <div className="w-full md:w-64 relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 appearance-none bg-white text-sm text-sage-700"
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

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-50 text-sage-700 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-sage-200">Slot</th>
                <th className="p-4 font-semibold border-b border-sage-200">Customer</th>
                <th className="p-4 font-semibold border-b border-sage-200">Session Type</th>
                <th className="p-4 font-semibold border-b border-sage-200">Financials</th>
                <th className="p-4 font-semibold border-b border-sage-200">Status</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 text-sm text-sage-800">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                       <span className="font-bold text-sage-900">{new Date(booking.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                       <span className="text-xs text-gold font-bold">{formatTime12h(booking.appointmentTime)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button onClick={() => setAdminModal(booking)} className="text-left group focus:outline-none block">
                      <span className="font-semibold text-sage-900 group-hover:text-darkGreen transition-colors block leading-tight">
                        {booking.customerName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-sage-500">
                         <FaWhatsapp size={10} className="text-green-500" />
                         <span className="text-[11px]">{booking.customerWhatsApp || booking.customerPhone}</span>
                      </div>
                    </button>
                  </td>
                  <td className="p-4">
                    <p className="text-[10px] font-bold text-sage-400 uppercase tracking-wider mb-0.5">{booking.callType}</p>
                    <p className="text-xs font-semibold text-sage-700">{booking.duration} MIN</p>
                  </td>
                  <td className="p-4 text-sage-900">
                    <p className="font-bold">{booking.currencySymbol || '₹'}{(booking.convertedAmount || booking.price).toLocaleString()}</p>
                    <p className="text-[10px] text-sage-400 font-medium">{booking.paymentMethod === 'Manual' ? 'Bank' : 'Card'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    {['Queued'].includes(booking.bookingStatus) && (
                      <button onClick={() => updateStatus(booking._id, 'Accepted')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition shadow-sm" title="Accept">
                        <FaCheck />
                      </button>
                    )}

                    {['Accepted'].includes(booking.bookingStatus) && (
                      <button onClick={() => updateStatus(booking._id, 'Completed')} className="p-2 bg-darkGreen/10 text-darkGreen rounded-lg hover:bg-darkGreen hover:text-white transition shadow-sm" title="Complete">
                        <FaCheck />
                      </button>
                    )}

                    {['Accepted', 'Completed'].includes(booking.bookingStatus) && (
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'view')} 
                          className="p-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition shadow-sm" 
                          title="View Invoice"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'download')} 
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm" 
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center">
                      <FaSearch className="text-sage-200 text-3xl mb-4" />
                      <p className="text-sage-400 font-serif italic text-lg">No sessions match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Session Management Modal (Admin Click User Name) */}
      {adminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={() => setAdminModal(null)}>
          <div className="bg-white shadow-2xl w-full max-w-xl rounded-[2rem] overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-10">
               <div className="flex justify-between items-start mb-8">
                 <div>
                   <h3 className="text-3xl font-serif font-bold text-slate-900">Session Protocol</h3>
                   <p className="text-xs text-gold font-black uppercase tracking-[0.2em] mt-1">{adminModal.customerName}</p>
                 </div>
                 <button onClick={() => setAdminModal(null)} className="text-slate-300 hover:text-rose-500 transition-colors">
                   <FaTimesCircle size={28} />
                 </button>
               </div>

               <div className="space-y-8">
                 {/* Appointment Sync */}
                 <div className="bg-slate-50 p-6 border border-slate-100 flex items-center justify-between rounded-2xl">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-darkGreen shadow-sm">
                       <FaCalendarCheck size={20} />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Scheduled Path & Time</p>
                       <p className="font-bold text-slate-900">
                        {new Date(adminModal.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        <span className="text-gold ml-2 font-black">@ {adminModal.appointmentTime}</span>
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Confirm Execution</span>
                     <input 
                       type="checkbox" 
                       defaultChecked={adminModal.isManuallyConfirmed}
                       onChange={(e) => updateAdminDetails(adminModal._id, { isManuallyConfirmed: e.target.checked })}
                       className="w-6 h-6 rounded border-2 border-slate-200 text-darkGreen focus:ring-darkGreen cursor-pointer"
                     />
                   </div>
                 </div>

                 {/* Treatment Boxes */}
                 <div className="grid grid-cols-1 gap-6">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Spiritual Artifacts (Crystals)</label>
                     <textarea 
                       id="crystals-box"
                       className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-0 focus:outline-none focus:border-gold transition-all text-sm font-medium min-h-[100px] resize-none"
                       placeholder="Assign crystals for this session..."
                       defaultValue={adminModal.crystals}
                       onBlur={(e) => updateAdminDetails(adminModal._id, { crystals: e.target.value })}
                     />
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Essence & Remedies (Medicine)</label>
                     <textarea 
                       id="medicine-box"
                       className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-0 focus:outline-none focus:border-gold transition-all text-sm font-medium min-h-[100px] resize-none"
                       placeholder="Recommended spiritual remedies..."
                       defaultValue={adminModal.medicine}
                       onBlur={(e) => updateAdminDetails(adminModal._id, { medicine: e.target.value })}
                     />
                   </div>
                 </div>
               </div>

               <div className="mt-10 flex gap-4">
                 <button 
                   onClick={() => setAdminModal(null)}
                   className="flex-1 py-5 bg-darkGreen text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all rounded-2xl active:scale-95 shadow-lg shadow-darkGreen/20"
                 >
                   Archive Protocol
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
