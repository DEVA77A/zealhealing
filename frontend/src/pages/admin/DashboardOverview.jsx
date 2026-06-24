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
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">Dashboard</h2>
          <p className="text-sage-600 font-medium mt-1">Operational insights and performance metrics</p>
        </div>
        
        <div className="relative group">
          <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold group-hover:scale-110 transition-transform" />
          <select 
            value={timeRange} 
            onChange={e => { setLoading(true); setTimeRange(e.target.value); }}
            className="pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gold/10 appearance-none font-bold text-slate-700 shadow-sm transition-all cursor-pointer hover:border-gold/30"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>
      
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Revenue', value: `₹${overview.totalRevenue.toLocaleString()}`, color: 'from-darkGreen to-[#1a2f23]', icon: '💰' },
          { label: 'Monthly Revenue', value: `₹${overview.monthlyRevenue.toLocaleString()}`, color: 'from-[#2d4d3a] to-[#3a5d4a]', icon: '📈' },
          { label: 'Bookings', value: overview.totalBookings, color: 'from-gold to-[#c5a037]', icon: '📅' },
          { label: 'Total Users', value: overview.totalUsers, color: 'from-[#4a6b5a] to-[#5a7b6a]', icon: '👥' },
        ].map((item, idx) => (
          <div key={idx} className="relative group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-transparent rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative flex flex-col items-center text-center transition-all duration-500 group-hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{item.label}</h3>
              <p className="text-3xl font-bold font-serif text-slate-900">{item.value}</p>
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 rounded-b-[2rem] bg-gradient-to-r ${item.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Today's Revenue", val: overview.todaysRevenue, prefix: '₹', color: 'text-darkGreen' },
          { label: 'Pending', val: overview.pendingBookings, prefix: '', color: 'text-amber-500' },
          { label: 'Completed', val: overview.completedSessions, prefix: '', color: 'text-emerald-500' },
          { label: 'Classes Sold', val: overview.totalClassesSold, prefix: '', color: 'text-slate-800' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</span>
            <span className={`text-xl font-bold ${s.color}`}>{s.prefix}{s.val.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 p-10 overflow-hidden relative">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">Revenue Growth</h3>
              <p className="text-sm text-slate-500 font-medium">Performance over last 6 months</p>
            </div>
          </div>
          <div className="h-80 -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueChart}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2b4c3b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 p-10 flex flex-col">
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Global Reach</h3>
          <p className="text-sm text-slate-500 font-medium mb-8">Sales distribution by country</p>
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.countryChart}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {charts.countryChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
