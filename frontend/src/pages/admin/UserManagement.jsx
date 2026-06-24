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
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 font-medium mt-1">Directory of spiritual seekers and practitioners</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-2xl text-xs font-black text-slate-500 border border-slate-200 shadow-sm uppercase tracking-widest">
          {users.length} Registered Souls
        </div>
      </div>

      <div className="mb-10">
        <div className="relative max-w-xl group">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform" />
          <input 
            type="text" 
            placeholder="Search by name, email, or essence..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-gold/10 text-sm shadow-sm transition-all hover:border-gold/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="p-8 border-b border-slate-100">Identity</th>
                <th className="p-8 border-b border-slate-100">Origins</th>
                <th className="p-8 border-b border-slate-100 text-center">Sessions</th>
                <th className="p-8 border-b border-slate-100 text-right">Investment</th>
                <th className="p-8 border-b border-slate-100">Joined</th>
                <th className="p-8 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/10 transition-all group">
                  <td className="p-8">
                    <button onClick={() => fetchUserSessions(user)} className="text-left group focus:outline-none">
                      <p className="font-serif font-bold text-slate-900 text-lg group-hover:text-darkGreen transition-colors underline decoration-gold/20 underline-offset-8">
                        {user.name}
                      </p>
                    </button>
                    <p className="text-xs text-slate-400 font-medium mt-1">{user.email}</p>
                  </td>
                  <td className="p-8">
                    <p className="font-bold text-slate-700">{user.lastLoginCountry || 'Celestial'}</p>
                    <div className="w-4 h-1 bg-gold/20 rounded-full mt-2" />
                  </td>
                  <td className="p-8 text-center font-black text-slate-900 text-lg">
                    {user.totalBookings || 0}
                  </td>
                  <td className="p-8 text-right font-serif font-bold text-slate-900 text-lg">
                    ₹{(user.totalSpending || 0).toLocaleString()}
                  </td>
                  <td className="p-8">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                    </p>
                  </td>
                  <td className="p-8 text-right space-x-3 whitespace-nowrap">
                    <button className="p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-90" title="Shroud User">
                      <FaUserSlash />
                    </button>
                    <button onClick={() => deleteUser(user._id)} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90" title="Sever Connection">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-32 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <FaSearch className="text-slate-200 text-2xl" />
                    </div>
                    <p className="text-slate-400 font-serif italic text-xl">No souls matching your seek.</p>
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
          <div className="bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-3xl font-serif font-bold text-slate-900">Session Protocols</h3>
                <p className="text-xs text-gold font-black uppercase tracking-[0.2em] mt-1">{sessionModal.user.name}</p>
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
                   <div key={booking._id} className="bg-white p-8 border border-slate-100 space-y-8">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-darkGreen">
                            <FaCalendarCheck size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment Date</p>
                            <p className="font-bold text-slate-900">{new Date(booking.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirmed</span>
                          <input 
                            type="checkbox" 
                            defaultChecked={booking.isManuallyConfirmed}
                            onChange={(e) => updateSessionDetails(booking._id, { isManuallyConfirmed: e.target.checked })}
                            className="w-5 h-5 border-2 border-slate-200 text-darkGreen focus:ring-darkGreen cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crystals (Prescription)</label>
                          <textarea 
                            className="w-full p-5 bg-slate-50/50 border border-slate-100 focus:ring-0 focus:outline-none focus:border-gold transition-all text-sm font-medium min-h-[80px] resize-none"
                            placeholder="Assign crystals..."
                            defaultValue={booking.crystals}
                            onBlur={(e) => updateSessionDetails(booking._id, { crystals: e.target.value })}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicine & Essence</label>
                          <textarea 
                            className="w-full p-5 bg-slate-50/50 border border-slate-100 focus:ring-0 focus:outline-none focus:border-gold transition-all text-sm font-medium min-h-[80px] resize-none"
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
                className="w-full py-5 bg-darkGreen text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-900 transition-all"
              >
                Close Repository
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
