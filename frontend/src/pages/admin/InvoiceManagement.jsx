import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaSearch, FaEye, FaTimesCircle } from 'react-icons/fa';
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
        const { data } = await axios.get('http://localhost:5000/api/admin/invoices', {
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
      const res = await axios.get(`http://localhost:5000/api/invoice/${bookingId}`, {
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

  if (loading) return <div className="p-8 text-center text-sage-600">Loading Invoices...</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-sage-900">Financial Ledger</h2>
          <p className="text-sm text-sage-500">Official records of all spiritual exchanges</p>
        </div>
        <div className="bg-darkGreen text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm">
          {invoices.length} Total Statements
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <input 
            type="text" 
            placeholder="Search by Invoice Number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-50 text-sage-700 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-sage-200">Reference</th>
                <th className="p-4 font-semibold border-b border-sage-200">Date Issued</th>
                <th className="p-4 font-semibold border-b border-sage-200">Subtotal</th>
                <th className="p-4 font-semibold border-b border-sage-200">Tax Essence</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Grand Total</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 text-sm text-sage-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-sage-900 block leading-tight">{inv.invoiceNumber}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-sage-500 whitespace-nowrap">
                      {new Date(inv.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-sage-700">₹{inv.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 font-medium text-sage-500">₹{(inv.CGST + inv.SGST).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-right font-bold text-sage-900">₹{inv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => downloadInvoice(inv.bookingId?._id || inv.bookingId, inv.invoiceNumber, 'view')} 
                      className="p-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition" 
                      title="View Artifact"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => downloadInvoice(inv.bookingId?._id || inv.bookingId, inv.invoiceNumber, 'download')} 
                      className="p-2 bg-darkGreen text-white rounded-lg hover:bg-emerald-800 transition" 
                      title="Download Artifact"
                    >
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-sage-500">
                    <div className="flex flex-col items-center">
                      <FaSearch className="text-sage-200 text-3xl mb-4" />
                      <p>No statements matching your query.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4" onClick={() => setViewingInvoice(null)}>
          <div className="bg-white shadow-2xl w-full max-w-5xl h-[85vh] rounded-[2rem] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10 w-full">
              <div>
                <h3 className="text-3xl font-serif font-bold text-slate-900">Document Preview</h3>
                <p className="text-xs text-gold font-black uppercase tracking-[0.2em] mt-1">{viewingInvoice.number}</p>
              </div>
              <button 
                onClick={() => setViewingInvoice(null)} 
                className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                <FaTimesCircle size={28} />
              </button>
            </div>
            <div className="flex-1 bg-slate-50 relative">
              <iframe 
                src={`${viewingInvoice.url}#toolbar=0`} 
                className="w-full h-full border-none"
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
