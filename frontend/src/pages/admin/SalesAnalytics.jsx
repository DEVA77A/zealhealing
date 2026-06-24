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
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">Analytics Insights</h2>
          <p className="text-slate-500 font-medium mt-1">Measuring the growth and flow of energy</p>
        </div>
        <div className="relative group">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform" />
          <select 
            value={timeRange} 
            onChange={e => { setLoading(true); setTimeRange(e.target.value); }}
            className="pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gold/10 appearance-none font-bold text-slate-700 shadow-sm cursor-pointer hover:border-gold/30 transition-all text-sm"
          >
            <option value="all">All Time Records</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Current Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 p-10 col-span-1 lg:col-span-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-8 bg-gold rounded-full" />
            <h3 className="text-2xl font-serif font-bold text-slate-900">Revenue Orbit (Last 6 Months)</h3>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#107c41" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#107c41" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${val/1000}k` : val}`}
                />
                <Tooltip 
                  cursor={{stroke: '#107c41', strokeWidth: 1, strokeDasharray: '5 5'}} 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '1rem'}} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#107c41" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Classes Bar Chart */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
            <h3 className="text-2xl font-serif font-bold text-slate-900">Most Sought Paths</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.classChart} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 800}} width={120} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem'}}
                />
                <Bar dataKey="sales" fill="#b99351" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Info */}
        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 p-10 flex flex-col justify-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10">
            <p className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-3">Existence Revenue</p>
            <p className="text-5xl font-serif font-bold text-white">₹{overview.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Avg Energy Exchange</p>
            <p className="text-4xl font-serif font-bold text-white">
              ₹{overview.totalUsers > 0 ? (overview.totalRevenue / overview.totalUsers).toFixed(0).toLocaleString() : 0}
            </p>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Fulfilled Prophecies</p>
            <p className="text-4xl font-serif font-bold text-gold">{overview.completedSessions}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SalesAnalytics;
