import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaCheck, FaTimes, FaEye, FaTimesCircle, FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState(null); // holds the booking to show proof for
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
        toast.success('Booking accepted! Invoice generated for the customer.');
      } else if (status === 'Rejected') {
        toast.success('Booking rejected.');
      } else {
        toast.success(`Booking ${status}`);
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
      case 'Queued': return 'bg-yellow-100 text-yellow-700';
      case 'Accepted': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-sage-100 text-sage-700';
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-8 text-center text-sage-600">Loading Bookings...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-sage-900 mb-6">Booking Management</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <input 
            type="text" 
            placeholder="Search by customer name or email..." 
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
            className="w-full pl-10 pr-4 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 appearance-none bg-white text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Queued">Queued</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Payment Proof Modal */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setProofModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-sage-900">Payment Proof</h3>
              <button onClick={() => setProofModal(null)} className="text-sage-400 hover:text-red-500 transition">
                <FaTimesCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sage-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-medium text-sage-900">{proofModal.customerName}</p>
                </div>
                <div className="bg-sage-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">Amount</p>
                  <p className="font-medium text-sage-900">{proofModal.currencySymbol || '₹'}{proofModal.convertedAmount || proofModal.price}</p>
                </div>
              </div>

              <div className="bg-sage-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">Sender Account / Name</p>
                <p className="font-medium text-sage-900">{proofModal.senderAccountNumber || 'Not provided'}</p>
              </div>

              <div className="bg-sage-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">Transaction ID / UTR</p>
                <p className="font-medium text-sage-900">{proofModal.transactionId || 'Not provided'}</p>
              </div>

              <div className="bg-sage-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-1">Remarks</p>
                <p className="font-medium text-sage-900">{proofModal.paymentRemarks || 'None'}</p>
              </div>

              {proofModal.paymentScreenshot && (
                <div>
                  <p className="text-xs font-semibold text-sage-500 uppercase tracking-wider mb-2">Payment Screenshot</p>
                  <img src={proofModal.paymentScreenshot} alt="Payment Screenshot" className="w-full rounded-xl border border-sage-200 shadow-sm" />
                </div>
              )}

              {!proofModal.paymentScreenshot && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-yellow-700 text-sm">No screenshot was uploaded by the customer.</p>
                </div>
              )}
            </div>

            {proofModal.bookingStatus === 'Queued' && (
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => { updateStatus(proofModal._id, 'Accepted'); setProofModal(null); }}
                  className="flex-1 py-3 bg-darkGreen text-white rounded-xl font-semibold hover:bg-sage-800 transition flex items-center justify-center gap-2"
                >
                  <FaCheck /> Accept & Generate Invoice
                </button>
                <button 
                  onClick={() => { updateStatus(proofModal._id, 'Rejected'); setProofModal(null); }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <FaTimes /> Reject
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
                <th className="p-4 font-semibold border-b border-sage-200">Date</th>
                <th className="p-4 font-semibold border-b border-sage-200">Customer</th>
                <th className="p-4 font-semibold border-b border-sage-200">Session Type</th>
                <th className="p-4 font-semibold border-b border-sage-200">Amount</th>
                <th className="p-4 font-semibold border-b border-sage-200">Payment</th>
                <th className="p-4 font-semibold border-b border-sage-200">Status</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 text-sm text-sage-800">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="p-4">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <p className="font-semibold text-sage-900">{booking.customerName}</p>
                    <p className="text-xs text-sage-500">{booking.customerEmail}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-sage-900 capitalize">{booking.callType}</p>
                    <p className="text-xs text-sage-500">{booking.duration} Mins</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-sage-900">{booking.currencySymbol || '₹'}{booking.convertedAmount || booking.price}</p>
                    <p className="text-xs text-sage-500">Base: ₹{booking.baseINRAmount || booking.price}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 
                      booking.paymentStatus === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    {/* View Payment Proof */}
                    <button onClick={() => setProofModal(booking)} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition" title="View Payment Proof">
                      <FaEye />
                    </button>

                    {/* Accept Button — only for Queued bookings */}
                    {booking.bookingStatus === 'Queued' && (
                      <button onClick={() => updateStatus(booking._id, 'Accepted')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition" title="Accept Booking">
                        <FaCheck />
                      </button>
                    )}

                    {/* Reject Button — only for Queued bookings */}
                    {booking.bookingStatus === 'Queued' && (
                      <button onClick={() => updateStatus(booking._id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Reject Booking">
                        <FaTimes />
                      </button>
                    )}

                    {/* Mark Completed — only for Accepted bookings */}
                    {booking.bookingStatus === 'Accepted' && (
                      <button onClick={() => updateStatus(booking._id, 'Completed')} className="p-2 bg-sage-100 text-darkGreen rounded-lg hover:bg-sage-200 transition" title="Mark Completed">
                        <FaCheck />
                      </button>
                    )}

                    {/* Download Invoice — only if Accepted/Completed */}
                    {['Accepted', 'Completed'].includes(booking.bookingStatus) && (
                      <button onClick={() => downloadInvoice(booking._id, booking.bookingStatus)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Download Invoice">
                        <FaDownload />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-sage-500">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
