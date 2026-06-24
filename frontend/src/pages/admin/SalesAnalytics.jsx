import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { FaFilter } from 'react-icons/fa';

const SalesAnalytics = () => {
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
        toast.error('Failed to fetch analytics');
        setLoading(false);
      }
    };
    fetchStats();
  }, [getToken, timeRange]);

  if (loading && !stats) return <div className="p-8 text-center text-sage-600">Loading Analytics...</div>;
  if (!stats) return null;

  const { charts, overview } = stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-serif font-bold text-sage-900">Sales Analytics</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 col-span-1 lg:col-span-2">
          <h3 className="text-xl font-serif font-bold text-sage-900 mb-6">Revenue Trend (Last 6 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b4c3b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2b4c3b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="revenue" stroke="#2b4c3b" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Classes Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
          <h3 className="text-xl font-serif font-bold text-sage-900 mb-6">Top Selling Classes</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.classChart} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} width={100} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="sales" fill="#5c8065" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Info */}
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 flex flex-col justify-center space-y-8">
          <div>
            <p className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Lifetime Revenue</p>
            <p className="text-4xl font-bold text-darkGreen">₹{overview.totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-1">Average Revenue Per User (ARPU)</p>
            <p className="text-4xl font-bold text-blue-600">
              ₹{overview.totalUsers > 0 ? (overview.totalRevenue / overview.totalUsers).toFixed(0).toLocaleString() : 0}
            </p>
          </div>
          <div>
            <p className="text-sage-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Classes Conducted</p>
            <p className="text-4xl font-bold text-sage-900">{overview.completedSessions}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SalesAnalytics;
