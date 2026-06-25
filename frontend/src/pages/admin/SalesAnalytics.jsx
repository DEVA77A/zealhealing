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
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-sage-900">Analytics Insights</h2>
          <p className="text-sm text-sage-500 mt-1">Measuring the growth and flow of energy</p>
        </div>
        <div className="relative group">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <select 
            value={timeRange} 
            onChange={e => { setLoading(true); setTimeRange(e.target.value); }}
            className="pl-10 pr-10 py-2 bg-white border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 appearance-none font-medium text-sage-700 shadow-sm cursor-pointer hover:border-sage-300 transition-all text-sm"
          >
            <option value="all">All Time Records</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Current Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-8 col-span-1 lg:col-span-2 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-darkGreen transition-all group-hover:w-2"></div>
          <div className="mb-8 ml-3">
            <h3 className="text-xl font-serif font-bold text-sage-900">Revenue Orbit</h3>
            <p className="text-sm text-sage-500 mt-1">Monetary flows over selected cycle</p>
          </div>
          <div className="h-[340px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E3EBE3" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#759E75', fontSize: 11, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#759E75', fontSize: 11, fontWeight: 600}}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${val/1000}k` : val}`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{stroke: '#759E75', strokeWidth: 1, strokeDasharray: '4 4'}} 
                  contentStyle={{borderRadius: '12px', border: '1px solid #C7D9C7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px', fontSize: '13px'}} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Info */}
        <div className="flex flex-col gap-6">
          <div className="bg-darkGreen rounded-xl shadow-md p-8 flex flex-col justify-center relative overflow-hidden flex-1 group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors" />
            <div className="relative z-10 space-y-1">
              <p className="text-sage-200 text-xs font-bold uppercase tracking-wider">Total Energy Exchange</p>
              <p className="text-4xl font-serif font-bold text-white tracking-tight">₹{overview.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white border border-sage-100 rounded-xl shadow-sm p-8 flex flex-col justify-center relative overflow-hidden flex-1 group hover:-translate-y-1 transition-transform">
            <div className="relative z-10 space-y-1">
              <p className="text-sage-500 text-xs font-bold uppercase tracking-wider">Avg Exchange Rate</p>
              <p className="text-4xl font-serif font-bold text-sage-900 tracking-tight">
                ₹{overview.totalUsers > 0 ? (overview.totalRevenue / overview.totalUsers).toFixed(0).toLocaleString() : 0}
              </p>
            </div>
          </div>
          <div className="bg-white border border-sage-100 rounded-xl shadow-sm p-8 flex flex-col justify-center relative overflow-hidden flex-1 group hover:-translate-y-1 transition-transform">
            <div className="relative z-10 space-y-1">
              <p className="text-sage-500 text-xs font-bold uppercase tracking-wider">Fulfilled Prophecies</p>
              <p className="text-4xl font-serif font-bold text-darkGreen tracking-tight">{overview.completedSessions}</p>
            </div>
          </div>
        </div>

        {/* Popular Classes Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-8 col-span-1 lg:col-span-3 mt-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold transition-all group-hover:w-2"></div>
          <div className="mb-8 ml-3 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-serif font-bold text-sage-900">Most Sought Paths</h3>
              <p className="text-sm text-sage-500 mt-1">Class popularity matrix</p>
            </div>
          </div>
          <div className="h-80 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.classChart} layout="vertical" margin={{top: 5, right: 30, left: 10, bottom: 5}}>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#E3EBE3" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#759E75', fontSize: 11, fontWeight: 600}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#2E7D32', fontSize: 13, fontWeight: 700}} width={140} />
                <Tooltip 
                  cursor={{fill: '#F4F7F4'}} 
                  contentStyle={{borderRadius: '12px', border: '1px solid #C7D9C7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px', fontSize: '13px'}}
                />
                <Bar dataKey="sales" fill="#D4AF37" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SalesAnalytics;
