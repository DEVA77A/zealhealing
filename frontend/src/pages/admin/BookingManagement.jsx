import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [adminModal, setAdminModal] = useState(null);
  // Draft of the guidance note shown to the client, edited in the modal.
  const [suggestionDraft, setSuggestionDraft] = useState('');
  const [savingSuggestion, setSavingSuggestion] = useState(false);
  const { getToken } = useAuth();

  /** Open the session modal for a booking, seeding the suggestion draft. */
  const openAdminModal = (booking) => {
    setSuggestionDraft(booking.adminSuggestion || '');
    setAdminModal(booking);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/api/admin/bookings', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const sorted = data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        setBookings(sorted);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch bookings');
        setLoading(false);
      }
    };
    fetchBookings();
  }, [getToken]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`/api/admin/bookings/${id}`, 
        { bookingStatus: status },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setBookings(bookings.map(b => b._id === id ? data : b));
      
      if (status === 'Accepted') {
        toast.success('Booking accepted! Notification & Zoom meeting triggers initiated.');
      } else {
        toast.success(`Booking status changed to ${status}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  /**
   * Persist admin-only fields on a booking.
   * @param {object} options
   * @param {boolean} [options.keepOpen] leave the modal open after saving
   * @param {string}  [options.message]  toast text
   */
  const updateAdminDetails = async (id, details, { keepOpen = false, message = 'Session details updated' } = {}) => {
    try {
      const { data } = await axios.put(`/api/admin/bookings/${id}`, 
        details,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setBookings(bookings.map(b => b._id === id ? data : b));
      toast.success(message);
      if (keepOpen) {
        // Keep the modal mounted but refresh it with the saved document.
        setAdminModal(data);
      } else {
        setAdminModal(null);
      }
      return data;
    } catch (error) {
      toast.error('Update failed');
      return null;
    }
  };

  const saveSuggestion = async (id) => {
    setSavingSuggestion(true);
    try {
      await updateAdminDetails(
        id,
        { adminSuggestion: suggestionDraft },
        { keepOpen: true, message: suggestionDraft.trim() ? 'Suggestion sent to client' : 'Suggestion cleared' }
      );
    } finally {
      setSavingSuggestion(false);
    }
  };

  const downloadInvoice = async (id, bookingStatus, mode = 'download') => {
    if (!['Accepted', 'Completed'].includes(bookingStatus)) {
      toast.info('Invoice is only available after accepting the booking.');
      return;
    }
    try {
      const response = await axios.get(`/api/invoice/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      if (mode === 'view') {
        setViewingInvoice({ url, number: id.substring(0, 8) });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${id.substring(0, 8)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      toast.error(`Failed to ${mode} invoice`);
    }
  };

  const getStatusBadge = (status) => {
    let styles = {
      padding: '4px 10px',
      borderRadius: '99px',
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      display: 'inline-flex',
    };

    switch (status) {
      case 'Queued':
        return <span style={{ ...styles, background: '#fffbeb', color: '#b45309' }}>⏳ Queued</span>;
      case 'Accepted':
        return <span style={{ ...styles, background: 'var(--clr-forest-50)', color: 'var(--clr-forest-700)' }}>✓ Active</span>;
      case 'Completed':
        return <span style={{ ...styles, background: '#e8f5e9', color: '#2e7d32' }}>✓ Completed</span>;
      case 'Rejected':
      case 'Cancelled':
        return <span style={{ ...styles, background: '#fef2f2', color: '#b91c1c' }}>✕ {status}</span>;
      default:
        return <span style={{ ...styles, background: 'var(--clr-forest-5)0', color: 'var(--clr-warm-gray)' }}>{status}</span>;
    }
  };

  const formatTime12h = (time24) => {
    if (!time24) return 'N/A';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            Bookings Ledger
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>Track incoming schedules, configure crystals, and confirm payments.</p>
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
          {bookings.length} Records
        </div>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flexGrow: 1, minWidth: '240px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search client record by name or email address..." 
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
              transition: 'border-color 200ms ease',
            }}
          />
        </div>
        <div style={{ width: '220px', position: 'relative' }}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="All">All statuses</option>
            <option value="Queued">Queued (New)</option>
            <option value="Accepted">Accepted (Active)</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.75rem', color: 'var(--clr-warm-gray)' }}>▼</span>
        </div>
      </div>

      {/* Table grid container */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--clr-forest-50)', borderBottom: '1px solid var(--clr-border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Slot Timestamp</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Consultant Profile</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Details</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Financials</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.875rem', color: 'var(--clr-ink)' }}>
              {filteredBookings.map((booking) => (
                <tr 
                  key={booking._id} 
                  style={{ borderBottom: '1px solid var(--clr-border)', transition: 'background 150ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontWeight: 700, color: 'var(--clr-ink)' }}>{new Date(booking.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                       <span style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)', marginTop: '2px' }}>{formatTime12h(booking.appointmentTime)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <button 
                      onClick={() => openAdminModal(booking)} 
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
                        {booking.customerName}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--clr-warm-gray)', marginTop: '2px' }}>
                        {booking.customerWhatsApp || booking.customerPhone}
                      </span>
                    </button>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{booking.callType}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--clr-ink-muted)' }}>{booking.duration} mins</p>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{booking.currencySymbol || '₹'}{(booking.convertedAmount || booking.price).toLocaleString()}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--clr-warm-gray)' }}>{booking.paymentMethod === 'Manual' ? 'Bank Wire' : 'Gateway'}</p>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    {getStatusBadge(booking.bookingStatus)}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {['Queued'].includes(booking.bookingStatus) && (
                        <button 
                          onClick={() => updateStatus(booking._id, 'Accepted')} 
                          style={{ background: 'var(--clr-forest-700)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          Accept
                        </button>
                      )}

                      {['Accepted'].includes(booking.bookingStatus) && (
                        <button 
                          onClick={() => updateStatus(booking._id, 'Completed')} 
                          style={{ background: 'var(--clr-forest-750)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          Complete
                        </button>
                      )}

                      {['Accepted', 'Completed'].includes(booking.bookingStatus) && (
                        <>
                          <button 
                            onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'view')} 
                            style={{ background: '#fff', border: '1px solid var(--clr-border)', color: 'var(--clr-ink)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            👁 View
                          </button>
                          <button 
                            onClick={() => downloadInvoice(booking._id, booking.bookingStatus, 'download')} 
                            style={{ background: 'var(--clr-forest-50)', border: '1px solid var(--clr-border)', color: 'var(--clr-forest-700)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            📥 PDF
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--clr-warm-gray)' }}>
                    No bookings record matching target filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      {viewingInvoice && (
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
            position: 'relative',
            width: '100%',
            maxWidth: '1000px',
            height: '85vh',
            background: '#fff',
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--clr-border)',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>Invoice Snapshot</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)', margin: '2px 0 0' }}>Ref: {viewingInvoice.number}</p>
              </div>
              <button 
                onClick={() => setViewingInvoice(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--clr-warm-gray)' }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{ flexGrow: 1, bg: '#f9f9f9' }}>
              <iframe 
                src={`${viewingInvoice.url}#toolbar=0`} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Invoice Viewer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Session Management Modal */}
      {adminModal && (
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
            maxWidth: '560px',
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{ padding: '32px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                 <div>
                   <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--clr-ink)', margin: 0 }}>Session Detail Config</h3>
                   <p style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)', marginTop: '4px' }}>Client: {adminModal.customerName}</p>
                 </div>
                 <button 
                   onClick={() => setAdminModal(null)} 
                   style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--clr-warm-gray)' }}
                 >
                   ✕
                 </button>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 {/* Appointment Sync info */}
                 <div style={{
                   background: 'var(--clr-forest-50)',
                   padding: '16px 20px',
                   borderRadius: 'var(--r-md)',
                   border: '1px solid var(--clr-border)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'space-between',
                 }}>
                   <div>
                     <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', margin: 0 }}>Proposed Schedule</p>
                     <p style={{ fontWeight: 600, color: 'var(--clr-ink)', margin: '2px 0 0', fontSize: '0.875rem' }}>
                      {new Date(adminModal.appointmentDate).toLocaleDateString()} @ {formatTime12h(adminModal.appointmentTime)}
                     </p>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clr-ink-muted)' }}>Confirmed</label>
                     <input 
                       type="checkbox" 
                       defaultChecked={adminModal.isManuallyConfirmed}
                       onChange={(e) => updateAdminDetails(adminModal._id, { isManuallyConfirmed: e.target.checked })}
                       style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                     />
                   </div>
                 </div>

                 {/* Textareas */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                     <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Assigned Crystals / Stones</label>
                     <textarea 
                       className="input-field"
                       style={{ minHeight: '80px', resize: 'none', padding: '12px' }}
                       placeholder="Enter assigned crystal details..."
                       defaultValue={adminModal.crystals}
                       onBlur={(e) => updateAdminDetails(adminModal._id, { crystals: e.target.value })}
                     />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                     <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Recommended Bach Flower Remedies</label>
                     <textarea 
                       className="input-field"
                       style={{ minHeight: '80px', resize: 'none', padding: '12px' }}
                       placeholder="Enter remedy essence details..."
                       defaultValue={adminModal.medicine}
                       onBlur={(e) => updateAdminDetails(adminModal._id, { medicine: e.target.value })}
                     />
                   </div>

                   {/* Guidance for the client. Unlike the fields above, this is
                       shown to the user on their appointment. */}
                   <div style={{
                     display: 'flex',
                     flexDirection: 'column',
                     gap: '6px',
                     paddingTop: '16px',
                     borderTop: '1px solid var(--clr-border)',
                   }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                       <label htmlFor="admin-suggestion" style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-forest-700)' }}>
                         Suggestion for Client
                       </label>
                       <span style={{ fontSize: '0.625rem', color: 'var(--clr-warm-gray)' }}>
                         Visible to the client
                       </span>
                     </div>

                     <textarea
                       id="admin-suggestion"
                       className="input-field"
                       style={{ minHeight: '110px', resize: 'vertical', padding: '12px' }}
                       placeholder="Type your guidance for this client. They will see it on their appointment…"
                       value={suggestionDraft}
                       onChange={(e) => setSuggestionDraft(e.target.value)}
                     />

                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                       <button
                         type="button"
                         onClick={() => saveSuggestion(adminModal._id)}
                         disabled={savingSuggestion || suggestionDraft === (adminModal.adminSuggestion || '')}
                         className="btn-primary"
                         style={{
                           padding: '10px 18px',
                           fontSize: '0.8125rem',
                           borderRadius: 'var(--r-md)',
                           opacity: savingSuggestion || suggestionDraft === (adminModal.adminSuggestion || '') ? 0.55 : 1,
                           cursor: savingSuggestion || suggestionDraft === (adminModal.adminSuggestion || '') ? 'not-allowed' : 'pointer',
                         }}
                       >
                         {savingSuggestion ? 'Sending…' : 'Send Suggestion'}
                       </button>

                       {adminModal.adminSuggestion ? (
                         <span style={{ fontSize: '0.6875rem', color: 'var(--clr-forest-700)', fontWeight: 600 }}>
                           Sent{adminModal.adminSuggestionAt ? ` on ${new Date(adminModal.adminSuggestionAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                         </span>
                       ) : (
                         <span style={{ fontSize: '0.6875rem', color: 'var(--clr-warm-gray)' }}>
                           No suggestion sent yet
                         </span>
                       )}
                     </div>
                   </div>
                 </div>
               </div>

               <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                 <button 
                   onClick={() => setAdminModal(null)}
                   className="btn-primary"
                   style={{ flexGrow: 1, padding: '12px' }}
                 >
                   Save & Close
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
