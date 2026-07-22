import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionModal, setSessionModal] = useState(null);
  const [userDetailsModal, setUserDetailsModal] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setUsers(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, [getToken]);

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await axios.delete(`/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setUsers(users.filter(u => u._id !== id));
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const fetchUserSessions = async (user) => {
    try {
      const { data } = await axios.get(`/api/admin/bookings?userId=${user._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSessionModal({ user, bookings: data });
    } catch (error) {
      toast.error('Failed to fetch user sessions');
    }
  };

  const openUserDetails = async (user) => {
    try {
      const { data } = await axios.get(`/api/admin/bookings?userId=${user._id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUserDetailsModal({ user, bookings: data });
    } catch (error) {
      toast.error('Failed to fetch user details');
    }
  };

  const updateSessionDetails = async (bookingId, details) => {
    try {
      const { data } = await axios.put(`/api/admin/bookings/${bookingId}`, 
        details,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSessionModal(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => b._id === bookingId ? data : b)
      }));
      toast.success('Protocol updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    let styles = {
      padding: '3px 8px',
      borderRadius: '99px',
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      display: 'inline-flex',
    };

    if (status === 'Accepted' || status === 'Completed') {
      return <span style={{ ...styles, background: 'var(--clr-forest-50)', color: 'var(--clr-forest-700)' }}>{status}</span>;
    }
    if (status === 'Rejected' || status === 'Cancelled') {
      return <span style={{ ...styles, background: '#fef2f2', color: '#b91c1c' }}>{status}</span>;
    }
    return <span style={{ ...styles, background: '#fffbeb', color: '#b45309' }}>{status}</span>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 0' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '80px' }}>
      
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            User Workspace
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>Analyze registered client directories, session frequency, and transactional totals.</p>
        </div>
        <div style={{
          background: 'var(--clr-forest-700)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '99px',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}>
          {users.length} Users Registered
        </div>
      </div>

      {/* Filter search */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flexGrow: 1, maxWith: '600px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search directory records by name or email address..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#fff',
              border: '1.5px solid var(--clr-border)',
              borderRadius: 'var(--r-md)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table grid */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: 'var(--clr-forest-50)', borderBottom: '1px solid var(--clr-border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>User identity</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Location</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', textAlign: 'center' }}>Sessions</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', textAlign: 'right' }}>Total Investment</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Joined date</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.875rem', color: 'var(--clr-ink)' }}>
              {filteredUsers.map((user) => (
                <tr 
                  key={user._id} 
                  style={{ borderBottom: '1px solid var(--clr-border)', transition: 'background 150ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '20px 24px' }}>
                    <button 
                      onClick={() => openUserDetails(user)} 
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'block',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--clr-forest-750)', fontSize: '0.9375rem' }}>
                        {user.name}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--clr-warm-gray)', marginTop: '2px' }}>
                        {user.email}
                      </span>
                    </button>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontWeight: 500 }}>{user.lastLoginCountry || '—'}</span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'center', fontWeight: 700 }}>
                    {user.totalBookings || 0}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: 700 }}>
                    ₹{(user.totalSpending || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => fetchUserSessions(user)} 
                        style={{ background: '#fff', border: '1px solid var(--clr-border)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--clr-ink)' }}
                      >
                        Protocols
                      </button>
                      <button 
                        onClick={() => deleteUser(user._id)} 
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-warm-gray)' }}>
                    No matching users found in the system registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Protocol Modal */}
      {sessionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'rgba(13,26,14,0.4)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid var(--clr-border)',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '85vh',
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>Session Protocols</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)', marginTop: '4px' }}>Client: {sessionModal.user.name}</p>
              </div>
              <button 
                onClick={() => setSessionModal(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--clr-warm-gray)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--clr-forest-50)' }}>
               {sessionModal.bookings.length === 0 ? (
                 <p style={{ textAlign: 'center', fontStyle: 'italic', padding: '40px 0', color: 'var(--clr-warm-gray)' }}>
                   This user has no recorded sessions.
                 </p>
               ) : (
                 sessionModal.bookings.map((booking) => (
                   <div key={booking._id} style={{ bg: '#fff', border: '1px solid var(--clr-border)', borderRadius: 'var(--r-xl)', padding: '24px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', margin: 0 }}>Schedule Details</p>
                          <p style={{ fontWeight: 600, color: 'var(--clr-ink)', margin: '2px 0 0', fontSize: '0.875rem' }}>
                            {new Date(booking.appointmentDate).toLocaleDateString()} @ {booking.appointmentTime}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clr-ink-muted)' }}>Confirmed</span>
                          <input 
                            type="checkbox" 
                            defaultChecked={booking.isManuallyConfirmed}
                            onChange={(e) => updateSessionDetails(booking._id, { isManuallyConfirmed: e.target.checked })}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Crystals Assigned</label>
                          <textarea 
                            className="input-field"
                            style={{ minHeight: '60px', resize: 'none', padding: '8px' }}
                            placeholder="Crystals prescribed..."
                            defaultValue={booking.crystals}
                            onBlur={(e) => updateSessionDetails(booking._id, { crystals: e.target.value })}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Essence & Remedies</label>
                          <textarea 
                            className="input-field"
                            style={{ minHeight: '60px', resize: 'none', padding: '8px' }}
                            placeholder="Essence / remedies..."
                            defaultValue={booking.medicine}
                            onBlur={(e) => updateSessionDetails(booking._id, { medicine: e.target.value })}
                          />
                        </div>
                      </div>
                   </div>
                 ))
               )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--clr-border)' }}>
              <button 
                onClick={() => setSessionModal(null)}
                className="btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Close protocols
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {userDetailsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'rgba(13,26,14,0.4)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid var(--clr-border)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '85vh',
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>Seeker Profile Summary</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)', marginTop: '4px' }}>Name: {userDetailsModal.user.name}</p>
              </div>
              <button 
                onClick={() => setUserDetailsModal(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--clr-warm-gray)' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Account summary cards */}
              <div style={{
                background: 'var(--clr-forest-50)',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--r-xl)',
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '20px',
              }}>
                <div>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', display: 'block' }}>Email Primary</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)', marginTop: '2px', display: 'block' }}>{userDetailsModal.user.email}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', display: 'block' }}>Mobile Contact</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)', marginTop: '2px', display: 'block' }}>{userDetailsModal.user.phone || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', display: 'block' }}>Logged Country</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)', marginTop: '2px', display: 'block' }}>{userDetailsModal.user.lastLoginCountry || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', display: 'block' }}>Overall Spent</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--clr-forest-750)', marginTop: '2px', display: 'block' }}>₹{(userDetailsModal.user.totalSpending || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Bookings catalog list */}
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--clr-ink)', marginBottom: '16px' }}>Scheduled Session History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {userDetailsModal.bookings.length === 0 ? (
                    <p style={{ textAlign: 'center', fontStyle: 'italic', padding: '24px', color: 'var(--clr-warm-gray)' }}>No reservation history recorded.</p>
                  ) : (
                    userDetailsModal.bookings.map((booking) => (
                      <div 
                        key={booking._id} 
                        style={{
                          background: '#fff',
                          border: '1px solid var(--clr-border)',
                          borderRadius: 'var(--r-lg)',
                          padding: '16px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--clr-ink)' }}>
                            {new Date(booking.appointmentDate).toLocaleDateString()} @ {booking.appointmentTime}
                          </span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--clr-warm-gray)' }}>
                            {booking.appointmentType} • {booking.callType} • {booking.duration} mins
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          {getStatusBadge(booking.bookingStatus)}
                          <span style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', background: booking.paymentStatus === 'Completed' ? 'rgba(46,125,50,0.1)' : '#fffbeb', color: booking.paymentStatus === 'Completed' ? '#2e7d32' : '#b45309' }}>
                            Pay: {booking.paymentStatus}
                          </span>
                          <span style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--clr-ink)' }}>
                            {booking.currencySymbol || '₹'} {booking.totalAmount?.toLocaleString() || booking.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid var(--clr-border)' }}>
               <button 
                 onClick={() => setUserDetailsModal(null)}
                 className="btn-secondary"
                 style={{ width: '100%', padding: '12px' }}
               >
                 Close details
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
