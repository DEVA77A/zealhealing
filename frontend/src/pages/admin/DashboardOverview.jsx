import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaFilter } from 'react-icons/fa';

const COLORS = ['#2b4c3b', '#5c8065', '#9ab5a1', '#d4e0d7'];

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/admin/stats?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setStats(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch dashboard statistics');
        setLoading(false);
      }
    };
    fetchStats();
  }, [getToken, timeRange]);

  if (loading && !stats) return <div className="p-8 text-center text-sage-600">Loading Dashboard...</div>;
  if (!stats) return null;

  const { overview, charts } = stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-serif font-bold text-sage-900">Dashboard Overview</h2>
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <select 
            value={timeRange} 
            onChange={e => { setLoading(true); setTimeRange(e.target.value); }}
            className="pl-10 pr-8 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 appearance-none bg-white font-medium text-sage-700 shadow-sm"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 border-l-4 border-l-darkGreen">
          <h3 className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-sage-900">₹{overview.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 border-l-4 border-l-sage-500">
          <h3 className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-sage-900">₹{overview.monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 border-l-4 border-l-blue-500">
          <h3 className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold text-sage-900">{overview.totalBookings}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 border-l-4 border-l-purple-500">
          <h3 className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-sage-900">{overview.totalUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
          <p className="text-sage-500 text-sm font-semibold">Today's Revenue</p>
          <p className="text-xl font-bold text-sage-900">₹{overview.todaysRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
          <p className="text-sage-500 text-sm font-semibold">Pending Bookings</p>
          <p className="text-xl font-bold text-yellow-600">{overview.pendingBookings}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
          <p className="text-sage-500 text-sm font-semibold">Completed Sessions</p>
          <p className="text-xl font-bold text-green-600">{overview.completedSessions}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
          <p className="text-sage-500 text-sm font-semibold">Total Classes Sold</p>
          <p className="text-xl font-bold text-sage-900">{overview.totalClassesSold}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
          <h3 className="text-xl font-serif font-bold text-sage-900 mb-6">Revenue Growth (Last 6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="revenue" fill="#2b4c3b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
          <h3 className="text-xl font-serif font-bold text-sage-900 mb-6">Sales by Country</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.countryChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {charts.countryChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
