import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaFilter } from 'react-icons/fa';

const COLORS = ['#2E7D32', '#538253', '#a1bfa1', '#e3ebe3'];

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

  const { overview, charts, topClasses } = stats;

  const rankMedal = (rank) => {
    if (rank === 1) return { emoji: '🥇', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' };
    if (rank === 2) return { emoji: '🥈', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100' };
    if (rank === 3) return { emoji: '🥉', bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-100' };
    return { emoji: `#${rank}`, bg: 'bg-sage-50', text: 'text-sage-600', border: 'border-sage-100' };
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-sage-900">Dashboard</h2>
          <p className="text-sm text-sage-500 mt-1">Operational insights and performance metrics</p>
        </div>
        
        <div className="relative group">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <select 
            value={timeRange} 
            onChange={e => { setLoading(true); setTimeRange(e.target.value); }}
            className="pl-10 pr-10 py-2 bg-white border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 appearance-none font-medium text-sage-700 shadow-sm transition-all cursor-pointer hover:border-sage-300 text-sm"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${overview.totalRevenue.toLocaleString()}` },
          { label: 'Monthly Revenue', value: `₹${overview.monthlyRevenue.toLocaleString()}` },
          { label: 'Total Bookings', value: overview.totalBookings },
          { label: 'Total Users', value: overview.totalUsers },
        ].map((item, idx) => (
          <div key={idx} className={`rounded-xl border p-6 flex flex-col justify-center transition-all ${idx === 0 ? 'bg-darkGreen border-darkGreen shadow-md' : 'bg-white border-sage-100 shadow-sm'}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${idx === 0 ? 'text-sage-200' : 'text-sage-500'}`}>{item.label}</h3>
            <p className={`text-3xl font-bold font-serif ${idx === 0 ? 'text-white' : 'text-sage-900'}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Today's Revenue", val: overview.todaysRevenue, prefix: '₹', highlight: true },
          { label: 'Pending Bookings', val: overview.pendingBookings, prefix: '', highlight: false },
          { label: 'Completed Sessions', val: overview.completedSessions, prefix: '', highlight: false },
          { label: 'Classes Sold', val: overview.totalClassesSold, prefix: '', highlight: false },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-sage-100 shadow-sm flex flex-col transition-all hover:bg-sage-50/50">
            <span className="text-xs font-bold text-sage-500 uppercase tracking-wider mb-1">{s.label}</span>
            <span className={`text-xl font-bold ${s.highlight ? 'text-darkGreen' : 'text-sage-900'}`}>{s.prefix}{s.val.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-sage-100 p-8 overflow-hidden relative">
          <div className="mb-8">
            <h3 className="text-xl font-serif font-bold text-sage-900">Revenue Growth</h3>
            <p className="text-sm text-sage-500 mt-1">Performance over last 6 months</p>
          </div>
          <div className="h-80 -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueChart}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E3EBE3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#759E75', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#759E75', fontSize: 11, fontWeight: 600}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#F4F7F4'}} 
                  contentStyle={{borderRadius: '12px', border: '1px solid #C7D9C7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px', fontSize: '13px'}}
                />
                <Bar dataKey="revenue" fill="#2E7D32" radius={[6, 6, 6, 6]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-sage-100 p-8 flex flex-col">
          <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">Global Reach</h3>
          <p className="text-sm text-sage-500 mb-8">Sales distribution by country</p>
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.countryChart}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {charts.countryChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.8)" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid #C7D9C7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Classes */}
      {topClasses && topClasses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
          <div className="p-6 border-b border-sage-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-sage-900">Top Performing Classes</h3>
              <p className="text-sm text-sage-500 mt-1">Ranked by total bookings across all time</p>
            </div>
            <span className="text-xs font-bold text-darkGreen bg-darkGreen/10 px-3 py-1.5 rounded-full border border-darkGreen/20 uppercase tracking-wider">
              All Time Ranking
            </span>
          </div>
          <div className="divide-y divide-sage-50">
            {topClasses.map((cls) => {
              const medal = rankMedal(cls.rank);
              return (
                <div key={cls.rank} className={`flex items-center gap-5 px-6 py-4 hover:bg-sage-50/50 transition-colors ${cls.rank === 1 ? 'bg-yellow-50/30' : ''}`}>
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 border ${medal.bg} ${medal.text} ${medal.border}`}>
                    {medal.emoji}
                  </div>

                  {/* Class Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sage-900 truncate">{cls.title}</p>
                    <p className="text-xs text-sage-500 mt-0.5 capitalize">{cls.type} Call · {cls.duration} min · ₹{cls.price?.toLocaleString()}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-sage-400 uppercase tracking-wider mb-0.5">Bookings</p>
                      <p className={`text-xl font-bold font-serif ${cls.rank === 1 ? 'text-darkGreen' : 'text-sage-900'}`}>{cls.bookings}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-sage-400 uppercase tracking-wider mb-0.5">Revenue</p>
                      <p className="text-xl font-bold font-serif text-sage-900">₹{cls.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topClasses && topClasses.length === 0 && (
        <div className="bg-white rounded-xl border border-sage-100 shadow-sm p-10 text-center">
          <p className="text-sage-400 font-medium">No completed bookings yet to rank classes.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
