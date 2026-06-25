import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaCopy, FaEyeSlash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { getToken } = useAuth();

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/classes');
      setClasses(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch classes');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const deleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await axios.delete(`http://localhost:5000/api/classes/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success('Class deleted');
        fetchClasses();
      } catch (error) {
        toast.error('Failed to delete class');
      }
    }
  };

  const toggleStatus = async (cls) => {
    try {
      const newStatus = cls.status === 'Active' ? 'Disabled' : 'Active';
      await axios.put(`http://localhost:5000/api/classes/${cls._id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success(`Class ${newStatus.toLowerCase()}`);
      fetchClasses();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const duplicateClass = async (cls) => {
    try {
      const newClass = { ...cls };
      delete newClass._id;
      newClass.title = `${newClass.title} (Copy)`;
      
      await axios.post(`http://localhost:5000/api/classes`, newClass, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success('Class duplicated');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to duplicate class');
    }
  };

  const filteredClasses = classes.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="p-8 text-center text-sage-600">Loading Classes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-sage-900">Class Management</h2>
        <Link to="/admin/classes/add" className="bg-darkGreen text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-sage-800 transition">
          <FaPlus />
          <span>Add New Class</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <input 
            type="text" 
            placeholder="Search by title or category..." 
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
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-50 text-sage-700 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-sage-200">Class Name</th>
                <th className="p-4 font-semibold border-b border-sage-200">Category</th>
                <th className="p-4 font-semibold border-b border-sage-200">Type</th>
                <th className="p-4 font-semibold border-b border-sage-200">Duration</th>
                <th className="p-4 font-semibold border-b border-sage-200">Base INR Price</th>
                <th className="p-4 font-semibold border-b border-sage-200">Status</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 text-sm text-sage-800">
              {filteredClasses.map((cls) => (
                <tr key={cls._id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-sage-900">{cls.title}</p>
                    <p className="text-xs text-sage-500 truncate max-w-xs">{cls.description}</p>
                  </td>
                  <td className="p-4">{cls.category}</td>
                  <td className="p-4 capitalize">{cls.type}</td>
                  <td className="p-4">{cls.duration} Mins</td>
                  <td className="p-4 font-medium text-sage-900">₹{cls.price}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      cls.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {cls.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleStatus(cls)} className="p-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition" title={cls.status === 'Active' ? 'Disable' : 'Enable'}>
                        {cls.status === 'Active' ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <Link to={`/admin/classes/edit/${cls._id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center" title="Edit">
                        <FaEdit />
                      </Link>
                      <button onClick={() => duplicateClass(cls)} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition" title="Duplicate">
                        <FaCopy />
                      </button>
                      <button onClick={() => deleteClass(cls._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition" title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-sage-500">No classes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;
