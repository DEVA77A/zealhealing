import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PricingProvider } from './context/PricingContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CategorySelection from './pages/CategorySelection';
import PackagesListing from './pages/PackagesListing';
import AppointmentDetails from './pages/AppointmentDetails';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import About from './pages/About';
import UserProfile from './pages/UserProfile';

// Admin Pages
import DashboardOverview from './pages/admin/DashboardOverview';
import ClassManagement from './pages/admin/ClassManagement';
import AddEditClass from './pages/admin/AddEditClass';
import BookingManagement from './pages/admin/BookingManagement';
import UserManagement from './pages/admin/UserManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import SalesAnalytics from './pages/admin/SalesAnalytics';

const AppContent = () => {
  const location = useLocation();
  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {!isAuthRoute && !isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Public / User Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><CategorySelection /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><PackagesListing /></ProtectedRoute>} />
          <Route path="/book/:id" element={<ProtectedRoute><AppointmentDetails /></ProtectedRoute>} />
          <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/success/:id" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="classes/add" element={<AddEditClass />} />
            <Route path="classes/edit/:id" element={<AddEditClass />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="analytics" element={<SalesAnalytics />} />
          </Route>
        </Routes>
      </main>
      {!isAuthRoute && !isAdminRoute && <Footer />}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

function App() {
  return (
    <PricingProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </PricingProvider>
  );
}

export default App;
