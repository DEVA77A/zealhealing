import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaBoxOpen, 
  FaCalendarAlt, 
  FaUsers, 
  FaFileInvoiceDollar, 
  FaChartLine, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <FaHome /> },
    { name: 'Classes', path: '/admin/classes', icon: <FaBoxOpen /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <FaCalendarAlt /> },
    { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Invoices', path: '/admin/invoices', icon: <FaFileInvoiceDollar /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <FaChartLine /> },
  ];

  return (
    <div className="flex h-screen bg-sage-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-darkGreen text-white z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Zeal Healing Logo" className="h-10 w-10 object-contain mix-blend-screen bg-white rounded-full p-1" />
            <h2 className="text-xl font-serif font-bold tracking-widest text-gold">ZEAL HEALING</h2>
          </div>
          <button className="md:hidden text-white" onClick={toggleSidebar}>
            <FaTimes size={24} />
          </button>
        </div>

        <nav className="flex-grow px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-sage-700 text-white' : 'text-sage-200 hover:bg-sage-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sage-200 hover:bg-red-600 hover:text-white transition-colors"
          >
            <FaSignOutAlt />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full h-full">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-30 px-6 py-4 flex items-center justify-between md:justify-end">
          <button 
            className="md:hidden text-sage-800 hover:text-darkGreen transition-colors"
            onClick={toggleSidebar}
          >
            <FaBars size={24} />
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-sage-700">Admin Area</span>
            <div className="w-10 h-10 rounded-full bg-sage-200 flex items-center justify-center text-darkGreen font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
