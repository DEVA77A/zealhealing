import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaUserSlash, FaSearch, FaCalendarCheck, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionModal, setSessionModal] = useState(null);
  const [userDetailsModal, setUserDetailsModal] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setUsers(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, [getToken]);

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setUsers(users.filter(u => u._id !== id));
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const fetchUserSessions = async (user) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/admin/bookings?userId=${user._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSessionModal({ user, bookings: data });
    } catch (error) {
      toast.error('Failed to fetch user sessions');
    }
  };

  const openUserDetails = async (user) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/admin/bookings?userId=${user._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUserDetailsModal({ user, bookings: data });
    } catch (error) {
      toast.error('Failed to fetch user details');
    }
  };

  const updateSessionDetails = async (bookingId, details) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/api/admin/bookings/${bookingId}`, 
        details,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSessionModal(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => b._id === bookingId ? data : b)
      }));
      toast.success('Protocol updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-sage-600">Loading Users...</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-sage-900">User Management</h2>
        <div className="bg-darkGreen text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm">
          {users.length} Total Users
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-50 text-sage-700 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-sage-200">Identity</th>
                <th className="p-4 font-semibold border-b border-sage-200">Location</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-center">Sessions</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Investment</th>
                <th className="p-4 font-semibold border-b border-sage-200">Joined</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 text-sm text-sage-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="p-4">
                    <button onClick={() => openUserDetails(user)} className="text-left group focus:outline-none block">
                      <span className="font-semibold text-sage-900 group-hover:text-darkGreen transition-colors block leading-tight">
                        {user.name}
                      </span>
                      <span className="text-xs text-sage-500 block mt-0.5">{user.email}</span>
                    </button>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-sage-700">{user.lastLoginCountry || 'N/A'}</span>
                  </td>
                  <td className="p-4 text-center font-bold text-sage-900">
                    {user.totalBookings || 0}
                  </td>
                  <td className="p-4 text-right font-bold text-sage-900">
                    ₹{(user.totalSpending || 0).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-sage-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => fetchUserSessions(user)} className="p-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition" title="Protocols">
                      <FaCalendarCheck />
                    </button>
                    <button onClick={() => deleteUser(user._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-sage-500">
                    <div className="flex flex-col items-center">
                      <FaSearch className="text-sage-200 text-3xl mb-4" />
                      <p>No seekers matching your query.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Protocol Modal */}
      {sessionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={() => setSessionModal(null)}>
          <div className="bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] rounded-[2rem] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-3xl font-serif font-bold text-slate-900">Session Protocols</h3>
                <p className="text-xs text-gold font-bold uppercase tracking-[0.2em] mt-1">{sessionModal.user.name}</p>
              </div>
              <button onClick={() => setSessionModal(null)} className="text-slate-300 hover:text-rose-500 transition-colors">
                <FaTimesCircle size={28} />
              </button>
            </div>

            <div className="flex-1 p-10 overflow-y-auto space-y-12 bg-slate-50/30">
               {sessionModal.bookings.length === 0 ? (
                 <div className="text-center py-20">
                   <p className="text-slate-400 font-serif italic text-lg text-center">This soul has no registered sessions yet.</p>
                 </div>
               ) : (
                 sessionModal.bookings.map((booking) => (
                   <div key={booking._id} className="bg-white p-8 border border-slate-100 space-y-8 rounded-3xl">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-darkGreen">
                            <FaCalendarCheck size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Appointment Date & Time</p>
                            <p className="font-bold text-slate-900">
                              {new Date(booking.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'medium' })} 
                              <span className="text-gold ml-2 font-bold">@ {booking.appointmentTime}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Confirmed</span>
                          <input 
                            type="checkbox" 
                            defaultChecked={booking.isManuallyConfirmed}
                            onChange={(e) => updateSessionDetails(booking._id, { isManuallyConfirmed: e.target.checked })}
                            className="w-5 h-5 rounded border-2 border-slate-200 text-darkGreen focus:ring-darkGreen cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Crystals (Prescription)</label>
                          <textarea 
                            className="w-full p-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-0 focus:outline-none focus:border-gold transition-all text-sm font-medium min-h-[80px] resize-none"
                            placeholder="Assign crystals..."
                            defaultValue={booking.crystals}
                            onBlur={(e) => updateSessionDetails(booking._id, { crystals: e.target.value })}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Medicine & Essence</label>
                          <textarea 
                            className="w-full p-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-0 focus:outline-none focus:border-gold transition-all text-sm font-medium min-h-[80px] resize-none"
                            placeholder="Spiritual remedies..."
                            defaultValue={booking.medicine}
                            onBlur={(e) => updateSessionDetails(booking._id, { medicine: e.target.value })}
                          />
                        </div>
                      </div>
                   </div>
                 ))
               )}
            </div>

            <div className="p-8 border-t border-slate-50 bg-white">
              <button 
                onClick={() => setSessionModal(null)}
                className="w-full py-5 bg-darkGreen text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all rounded-2xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {userDetailsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={() => setUserDetailsModal(null)}>
          <div className="bg-white shadow-2xl w-full max-w-4xl max-h-[90vh] rounded-[2rem] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10 w-full min-h-[100px]">
              <div>
                <h3 className="text-3xl font-serif font-bold text-slate-900">User Details</h3>
                <p className="text-xs text-gold font-black uppercase tracking-[0.2em] mt-1">{userDetailsModal.user.name}</p>
              </div>
              <button onClick={() => setUserDetailsModal(null)} className="text-slate-300 hover:text-rose-500 transition-colors">
                <FaTimesCircle size={28} />
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-slate-50/30">
              <div className="bg-white rounded-2xl border border-sage-100 p-6 mb-8 shadow-sm">
                <h4 className="text-lg font-bold text-sage-900 mb-4 border-b pb-2 text-left">Profile Info</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  <div>
                    <p className="text-xs text-sage-500 uppercase tracking-wider font-bold">Email</p>
                    <p className="text-sm font-medium text-slate-700">{userDetailsModal.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage-500 uppercase tracking-wider font-bold">Phone</p>
                    <p className="text-sm font-medium text-slate-700">{userDetailsModal.user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage-500 uppercase tracking-wider font-bold">Location</p>
                    <p className="text-sm font-medium text-slate-700">{userDetailsModal.user.lastLoginCountry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sage-500 uppercase tracking-wider font-bold">Total Investment</p>
                    <p className="text-sm font-bold text-darkGreen">₹{(userDetailsModal.user.totalSpending || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-bold text-sage-900 mb-4 text-left">Booking History</h4>
              <div className="space-y-4 text-left">
                {userDetailsModal.bookings.length === 0 ? (
                  <p className="text-center text-sage-500 italic py-8 bg-white rounded-2xl shadow-sm border border-sage-100">No booking history available.</p>
                ) : (
                  userDetailsModal.bookings.map((booking) => (
                    <div key={booking._id} className="bg-white rounded-xl border border-sage-100 p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 border-b border-sage-50 pb-2">
                          <span className="font-bold text-sage-900">
                            {new Date(booking.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                          <span className="text-sm text-gold font-bold bg-gold/10 px-2 py-0.5 rounded-lg border border-gold/20">@ {booking.appointmentTime}</span>
                        </div>
                        <p className="text-sm text-sage-700 font-medium pt-1">
                          {booking.appointmentType} • {booking.callType} • {booking.duration} mins
                        </p>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2 text-left md:text-right w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-none border-sage-50">
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded font-bold border ${
                            booking.bookingStatus === 'Accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                            booking.bookingStatus === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {booking.bookingStatus}
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded font-bold border ${
                            booking.paymentStatus === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            booking.paymentStatus === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            Pay: {booking.paymentStatus}
                          </span>
                        </div>
                        <span className="text-base font-black text-sage-900">
                          {booking.currencySymbol || '₹'} {booking.totalAmount?.toLocaleString() || booking.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-50 bg-white">
               <button 
                 onClick={() => setUserDetailsModal(null)}
                 className="w-full py-4 bg-sage-100 text-sage-900 font-black text-xs uppercase tracking-[0.2em] hover:bg-sage-200 transition-all rounded-xl"
               >
                 Close Details
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
