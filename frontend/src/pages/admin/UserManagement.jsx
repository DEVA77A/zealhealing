import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaUserSlash, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
                    <p className="font-serif font-bold text-slate-900 text-lg group-hover:text-darkGreen transition-colors">{user.name}</p>
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
    </div>
  );
};

export default UserManagement;
