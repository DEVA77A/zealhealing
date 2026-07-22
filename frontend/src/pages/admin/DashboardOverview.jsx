import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#208a74', '#2ca289', '#46b89f', '#74ccb7'];

const DashboardOverview = () => {
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
        toast.error('Failed to fetch dashboard statistics');
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

  const { overview, charts, topClasses } = stats;

  const rankMedal = (rank) => {
    if (rank === 1) return { emoji: '#1', bg: 'rgba(217, 119, 6, 0.08)', text: '#d97706', border: '1px solid #fcd34d' };
    if (rank === 2) return { emoji: '#2', bg: 'rgba(100, 116, 139, 0.08)', text: '#64748b', border: '1px solid #cbd5e1' };
    if (rank === 3) return { emoji: '#3', bg: 'rgba(194, 65, 12, 0.08)', text: '#c2410c', border: '1px solid #fed7aa' };
    return { emoji: `#${rank}`, bg: 'var(--clr-forest-50)', text: 'var(--clr-warm-gray)', border: '1px solid var(--clr-border)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '80px' }}>
      
      {/* Head section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Dashboard Overview
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>A summary review of the clinic operations, revenue channels, and visitor actions.</p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <select 
            value={timeRange} 
            onChange={e => { setLoading(true); setTimeRange(e.target.value); }}
            style={{
              padding: '10px 36px 10px 16px',
              background: '#fff',
              border: '1.5px solid var(--clr-border-strong)',
              borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--clr-forest-750)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="365">Last Year</option>
          </select>
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.75rem', color: 'var(--clr-warm-gray)' }}>▼</span>
        </div>
      </div>
      
      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {[
          { label: 'Total Revenue', value: `₹${overview.totalRevenue.toLocaleString()}`, dark: true },
          { label: 'Monthly Revenue', value: `₹${overview.monthlyRevenue.toLocaleString()}`, dark: false },
          { label: 'Total Bookings', value: overview.totalBookings, dark: false },
          { label: 'Total Users', value: overview.totalUsers, dark: false },
        ].map((item, idx) => (
          <div key={idx} style={{
            background: item.dark ? 'var(--clr-forest-700)' : '#fff',
            border: item.dark ? '1px solid var(--clr-forest-700)' : '1px solid var(--clr-border)',
            borderRadius: 'var(--r-xl)',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: item.dark ? 'rgba(255,255,255,0.6)' : 'var(--clr-warm-gray)',
              marginBottom: '8px',
            }}>
              {item.label}
            </h3>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              fontWeight: 600,
              color: item.dark ? '#fff' : 'var(--clr-forest-750)',
              lineHeight: 1.1,
            }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Grid secondary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {[
          { label: "Today's Revenue", val: overview.todaysRevenue, prefix: '₹', highlight: true },
          { label: 'Pending Bookings', val: overview.pendingBookings, prefix: '', highlight: false },
          { label: 'Completed Sessions', val: overview.completedSessions, prefix: '', highlight: false },
          { label: 'Classes Sold', val: overview.totalClassesSold, prefix: '', highlight: false },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--r-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', display: 'block', marginBottom: '4px' }}>
              {s.label}
            </span>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: s.highlight ? 'var(--clr-forest-700)' : 'var(--clr-ink)',
            }}>
              {s.prefix}{s.val.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Visual Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-5">
        <div style={{
          gridColumn: 'span 3',
          background: '#fff',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-xl)',
          padding: '40px',
          boxShadow: 'var(--shadow-sm)',
        }} className="lg:col-span-3">
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 500, color: 'var(--clr-ink)' }}>
              Revenue Performance
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--clr-warm-gray)', marginTop: '2px' }}>
              Historical cash inflows over the trailing 6 months.
            </p>
          </div>
          <div style={{ height: 280, marginLeft: '-20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueChart}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--clr-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--clr-warm-gray)', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--clr-warm-gray)', fontSize: 10, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  cursor={{fill: 'var(--clr-forest-50)'}} 
                  contentStyle={{borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)', boxShadow: 'var(--shadow-sm)', padding: '12px', fontSize: '12px', fontFamily: 'var(--font-body)'}}
                />
                <Bar dataKey="revenue" fill="var(--clr-forest-700)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{
          gridColumn: 'span 2',
          background: '#fff',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-xl)',
          padding: '40px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
        }} className="lg:col-span-2">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 500, color: 'var(--clr-ink)' }}>
              Geographic Division
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--clr-warm-gray)', marginTop: '2px' }}>
              Sales split distribution mapping country segment values.
            </p>
          </div>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={charts.countryChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {charts.countryChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.8)" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)', fontSize: '12px', fontFamily: 'var(--font-body)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Classes */}
      {topClasses && topClasses.length > 0 && (
        <div style={{
          background: '#fff',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 500, color: 'var(--clr-ink)' }}>
                Top Performing Categories
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--clr-warm-gray)', marginTop: '2px' }}>
                Catalog ranking metrics based on total completed schedule slots.
              </p>
            </div>
            <span style={{
              padding: '6px 14px',
              background: 'var(--clr-forest-50)',
              color: 'var(--clr-forest-700)',
              border: '1px solid var(--clr-border)',
              borderRadius: '99px',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Leaderboard Value
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {topClasses.map((cls) => {
              const medal = rankMedal(cls.rank);
              return (
                <div 
                  key={cls.rank} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px 32px',
                    borderBottom: '1px solid var(--clr-border)',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  {/* Rank Badge */}
                  <div style={{
                    width: 38, height: 38,
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: medal.bg,
                    color: medal.text,
                    border: medal.border,
                    flexShrink: 0,
                  }}>
                    {medal.emoji}
                  </div>

                  {/* Class Info */}
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--clr-ink)', margin: 0 }}>{cls.title}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--clr-warm-gray)', marginTop: '3px', textTransform: 'capitalize' }}>
                      {cls.type} Call · {cls.duration} mins · ₹{cls.price?.toLocaleString()}
                    </p>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '32px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>Bookings</p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--clr-ink)', margin: 0 }}>{cls.bookings}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>Revenue</p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 650, color: 'var(--clr-forest-750)', margin: 0 }}>₹{cls.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topClasses && topClasses.length === 0 && (
        <div style={{
          background: '#fff',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-xl)',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', margin: 0 }}>
            No bookings records found to map categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
