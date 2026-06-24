import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';

const AddEditClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tarot',
    type: 'voice',
    duration: 30,
    price: 4000,
    status: 'Active',
  });

  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchClass = async () => {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/classes/${id}`);
          setFormData(data);
          setLoading(false);
        } catch (error) {
          toast.error('Failed to fetch class');
          navigate('/admin/classes');
        }
      };
      fetchClass();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
      };

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/classes/${id}`, formData, config);
        toast.success('Class updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/classes', formData, config);
        toast.success('Class added successfully');
      }
      navigate('/admin/classes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  if (loading) return <div className="p-8 text-center text-sage-600">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/admin/classes" className="text-sage-500 hover:text-darkGreen transition">
          <FaArrowLeft size={20} />
        </Link>
        <h2 className="text-3xl font-serif font-bold text-sage-900">
          {isEdit ? 'Edit Class' : 'Add New Class'}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sage-800 font-medium mb-1">Class Title *</label>
              <input type="text" name="title" required className="input-field w-full" value={formData.title} onChange={handleChange} />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sage-800 font-medium mb-1">Description *</label>
              <textarea name="description" rows="3" required className="input-field w-full" value={formData.description} onChange={handleChange}></textarea>
            </div>

            <div>
              <label className="block text-sage-800 font-medium mb-1">Category *</label>
              <input type="text" name="category" required className="input-field w-full" value={formData.category} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sage-800 font-medium mb-1">Type *</label>
              <select name="type" className="input-field w-full" value={formData.type} onChange={handleChange}>
                <option value="voice">Voice Call</option>
                <option value="video">Video Call</option>
              </select>
            </div>

            <div>
              <label className="block text-sage-800 font-medium mb-1">Duration (Minutes) *</label>
              <input type="number" name="duration" required className="input-field w-full" value={formData.duration} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sage-800 font-medium mb-1">Base INR Price *</label>
              <input type="number" name="price" required className="input-field w-full" value={formData.price} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sage-800 font-medium mb-1">Status</label>
              <select name="status" className="input-field w-full" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-sage-100 flex justify-end space-x-4">
            <Link to="/admin/classes" className="px-6 py-2 rounded-lg font-semibold border border-sage-300 text-sage-600 hover:bg-sage-50 transition">
              Cancel
            </Link>
            <button type="submit" className="px-6 py-2 rounded-lg font-semibold bg-darkGreen text-white hover:bg-sage-800 transition shadow-sm">
              {isEdit ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditClass;
