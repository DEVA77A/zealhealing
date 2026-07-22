import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const SalesAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`/api/admin/stats?range=${timeRange}`, {
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

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 0' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }
  if (!stats) return null;

  const { charts, overview } = stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '80px' }}>
      
      {/* Page Title & Timeframe Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Analytics Workspace
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>Review financial volume, modalities performance, and general platform growth metrics.</p>
        </div>
        <div style={{ position: 'relative', width: '200px' }}>
          <select 
            value={timeRange} 
            onChange={e => { setLoading(true); setTimeRange(e.target.value); }}
            style={{
              width: '100%',
              padding: '12px 36px 12px 16px',
              background: '#fff',
              border: '1.5px solid var(--clr-border)',
              borderRadius: 'var(--r-md)',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            <option value="all">All time records</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Current calendar year</option>
          </select>
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.75rem', color: 'var(--clr-warm-gray)' }}>▼</span>
        </div>
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-3">
        
        {/* Revenue chart - spanning 2 columns */}
        <div 
          className="lg:col-span-2"
          style={{
            background: '#fff',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--r-xl)',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--clr-ink)', margin: 0 }}>Revenue Chronology</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--clr-warm-gray)', marginTop: '4px' }}>Gross transaction flow over the configured cycle duration.</p>
          </div>
          <div style={{ height: '340px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a1f" stopOpacity={0.06}/>
                    <stop offset="95%" stopColor="#1e3a1f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--clr-border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--clr-warm-gray)', fontSize: 11 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--clr-warm-gray)', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${val/1000}k` : val}`}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ stroke: 'var(--clr-border)', strokeWidth: 1 }} 
                  contentStyle={{
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid var(--clr-border)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '12px',
                    fontSize: '13px',
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--clr-forest-700)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{
            background: 'var(--clr-forest-700)',
            color: '#fff',
            borderRadius: 'var(--r-xl)',
            padding: '32px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-forest-200)' }}>Energy Exchange Volume</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, letterSpacing: '-0.02em' }}>₹{overview.totalRevenue.toLocaleString()}</span>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--r-xl)',
            padding: '32px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Average Seeker Volume</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em' }}>
              ₹{overview.totalUsers > 0 ? (overview.totalRevenue / overview.totalUsers).toFixed(0).toLocaleString() : 0}
            </span>
          </div>

          <div style={{
            background: '#fff',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--r-xl)',
            padding: '32px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Completed Prescriptions</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-forest-750)', letterSpacing: '-0.02em' }}>{overview.completedSessions}</span>
          </div>

        </div>

        {/* Category distribution bar chart */}
        <div 
          className="lg:col-span-3"
          style={{
            background: '#fff',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--r-xl)',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--clr-ink)', margin: 0 }}>Modality Popularity</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--clr-warm-gray)', marginTop: '4px' }}>Distribution of sessions across registered classes.</p>
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.classChart} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="var(--clr-border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--clr-warm-gray)', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--clr-ink)', fontSize: 12, fontWeight: 600 }} width={140} />
                <Tooltip 
                  cursor={{ fill: 'var(--clr-forest-50)' }} 
                  contentStyle={{
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid var(--clr-border)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '12px',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="sales" fill="var(--clr-forest-800)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SalesAnalytics;
