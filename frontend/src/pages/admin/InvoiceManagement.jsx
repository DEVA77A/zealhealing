import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await axios.get('/api/admin/invoices', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setInvoices(sorted);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch invoices');
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [getToken]);

  const downloadInvoice = async (bookingId, invoiceNumber, mode = 'download') => {
    try {
      const res = await axios.get(`/api/invoice/${bookingId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      if (mode === 'view') {
        setViewingInvoice({ url, number: invoiceNumber });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      toast.error(`Failed to ${mode} invoice`);
    }
  };

  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 0' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '80px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Financial Ledger
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>Verify statement releases, taxes, subtotals, and transaction details.</p>
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
          {invoices.length} Files
        </div>
      </div>

      {/* Filter range */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flexGrow: 1, maxWidth: '600px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search by exact invoice number sequence (e.g. ZH-2026-)..." 
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

      {/* Data Table */}
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
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Statement Reference</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Date Released</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Subtotal</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Taxes (GST)</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', textAlign: 'right' }}>Grand Total</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.875rem', color: 'var(--clr-ink)' }}>
              {filteredInvoices.map((inv) => (
                <tr 
                  key={inv._id} 
                  style={{ borderBottom: '1px solid var(--clr-border)', transition: 'background 150ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontWeight: 650, color: 'var(--clr-ink)' }}>{inv.invoiceNumber}</span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)' }}>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    ₹{inv.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '20px 24px', color: 'var(--clr-warm-gray)' }}>
                    ₹{(inv.CGST + inv.SGST).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: 700 }}>
                    ₹{inv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => downloadInvoice(inv.bookingId?._id || inv.bookingId, inv.invoiceNumber, 'view')} 
                        style={{ background: '#fff', border: '1px solid var(--clr-border)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--clr-ink)' }}
                      >
                        👁 View
                      </button>
                      <button 
                        onClick={() => downloadInvoice(inv.bookingId?._id || inv.bookingId, inv.invoiceNumber, 'download')} 
                        style={{ background: 'var(--clr-forest-50)', border: '1px solid var(--clr-border)', color: 'var(--clr-forest-700)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        📥 PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-warm-gray)' }}>
                    No statement records matching search criteria.
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
                <p style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)', marginTop: '2px' }}>Ref: {viewingInvoice.number}</p>
              </div>
              <button 
                onClick={() => setViewingInvoice(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--clr-warm-gray)' }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{ flexGrow: 1, background: '#f9f9f9' }}>
              <iframe 
                src={`${viewingInvoice.url}#toolbar=0`} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Invoice Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
