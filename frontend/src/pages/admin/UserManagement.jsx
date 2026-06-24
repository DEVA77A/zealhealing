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
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-sage-900 mb-6">User Management</h2>

      {/* Filters */}
      <div className="mb-6">
        <div className="relative max-w-md">
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
                <th className="p-4 font-semibold border-b border-sage-200">Name</th>
                <th className="p-4 font-semibold border-b border-sage-200">Email</th>
                <th className="p-4 font-semibold border-b border-sage-200">Country</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-center">Total Bookings</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Total Spending</th>
                <th className="p-4 font-semibold border-b border-sage-200">Joined</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 text-sm text-sage-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="p-4 font-semibold text-sage-900">{user.name}</td>
                  <td className="p-4 text-sage-600">{user.email}</td>
                  <td className="p-4">{user.lastLoginCountry || 'N/A'}</td>
                  <td className="p-4 text-center font-medium">{user.totalBookings || 0}</td>
                  <td className="p-4 text-right font-medium text-sage-900">₹{(user.totalSpending || 0).toLocaleString()}</td>
                  <td className="p-4 text-sage-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition" title="Disable User">
                      <FaUserSlash />
                    </button>
                    <button onClick={() => deleteUser(user._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Delete User">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-sage-500">No users found.</td>
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
