import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGrid, 
  FiCalendar, 
  FiBookOpen, 
  FiBookmark, 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiLogOut,
  FiX,
  FiMenu
} from 'react-icons/fi';

const AdminLayout = () => {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  
  const handleLogout = async () => {
    if (await logout()) navigate('/login', { replace: true });
  };

  const handleNavClick = () => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: FiGrid },
    { name: 'Calendar', path: '/admin/calendar', icon: FiCalendar },
    { name: 'Appointments', path: '/admin/classes', icon: FiBookOpen },
    { name: 'Bookings', path: '/admin/bookings', icon: FiBookmark },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Invoices', path: '/admin/invoices', icon: FiFileText },
    { name: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--clr-parchment)', overflow: 'hidden', fontFamily: 'var(--font-body)', position: 'relative' }}>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!isDesktop && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(13,26,14,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 45,
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '260px',
          height: '100vh',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          borderRight: '1px solid var(--clr-border)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo Header */}
        <div style={{
          position: 'relative',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid var(--clr-border)',
        }}>
          <button 
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-warm-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }} 
            onClick={() => setSidebarOpen(false)}
            title="Close Sidebar"
          >
            <FiX size={20} />
          </button>
          
          <div style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate('/')}>
            <div style={{
              width: 60, height: 60,
              borderRadius: '50%',
              background: 'var(--clr-forest-50)',
              border: '1.5px solid var(--clr-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              padding: '6px',
            }}>
              <img src="/logo.png" alt="Zeal Healing" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '0.12em', marginTop: '16px', textTransform: 'uppercase' }}>
            Zeal Healing
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--clr-forest-700)' }} />
            <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
              Administration
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ flexGrow: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', paddingLeft: '12px', marginBottom: '12px' }}>
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={handleNavClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-md)',
                  background: isActive ? 'var(--clr-forest-700)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--clr-ink-muted)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--clr-forest-50)';
                    e.currentTarget.style.color = 'var(--clr-forest-750)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--clr-ink-muted)';
                  }
                }}
              >
                {/* Icon box */}
                <div style={{
                  width: 28, height: 28,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'var(--clr-forest-50)',
                  color: isActive ? '#fff' : 'var(--clr-forest-750)',
                }}>
                  <Icon size={16} />
                </div>

                <span>{item.name}</span>

                {isActive && (
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout bottom */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid var(--clr-border)' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              border: 'none',
              background: 'transparent',
              color: 'var(--clr-warm-gray)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--clr-warm-gray)';
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiLogOut size={16} />
            </div>
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        style={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          marginLeft: (isDesktop && sidebarOpen) ? '260px' : 0,
          transition: 'margin-left 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          width: '100%',
        }}
      >
        {/* Top Header */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid var(--clr-border)',
          zIndex: 30,
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
            onClick={toggleSidebar}
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <FiMenu size={22} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
            <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>Portal</Link>
            <span>/</span>
            <span style={{ color: 'var(--clr-forest-700)' }}>
              {navItems.find(n => location.pathname === n.path || (n.path !== '/admin' && location.pathname.startsWith(n.path)))?.name || 'Overview'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: 'var(--clr-forest-700)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8125rem', fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}>
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flexGrow: 1, overflowY: 'auto', padding: '40px', background: 'var(--clr-parchment)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
