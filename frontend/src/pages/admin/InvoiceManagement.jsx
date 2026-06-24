import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaSearch, FaEye, FaTimes } from 'react-icons/fa';
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
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">Financial Ledger</h2>
          <p className="text-slate-500 font-medium mt-1">Official records of all spiritual exchanges</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-2xl text-xs font-black text-slate-500 border border-slate-200 shadow-sm uppercase tracking-widest">
          {invoices.length} Statements
        </div>
      </div>

      <div className="mb-10">
        <div className="relative max-w-xl group">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform" />
          <input 
            type="text" 
            placeholder="Search by Invoice Number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-gold/10 text-sm shadow-sm transition-all hover:border-gold/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="p-8 border-b border-slate-100">Reference</th>
                <th className="p-8 border-b border-slate-100">Date Issued</th>
                <th className="p-8 border-b border-slate-100">Subtotal</th>
                <th className="p-8 border-b border-slate-100">Tax Essence</th>
                <th className="p-8 border-b border-slate-100 text-right">Grand Total</th>
                <th className="p-8 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/10 transition-all group">
                  <td className="p-8">
                    <p className="font-serif font-bold text-slate-900 text-lg group-hover:text-darkGreen transition-colors">{inv.invoiceNumber}</p>
                    <div className="w-8 h-1 bg-gold/20 rounded-full mt-2" />
                  </td>
                  <td className="p-8">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                      {new Date(inv.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </td>
                  <td className="p-8 font-medium text-slate-600">₹{inv.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-8 font-medium text-slate-400 italic">₹{(inv.CGST + inv.SGST).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-8 text-right">
                    <p className="font-serif font-bold text-slate-900 text-xl">₹{inv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </td>
                  <td className="p-8 text-right space-x-3 whitespace-nowrap">
                    <button 
                      onClick={() => downloadInvoice(inv.bookingId?._id || inv.bookingId, inv.invoiceNumber, 'view')} 
                      className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-gold hover:text-white transition-all shadow-sm active:scale-90" 
                      title="View Artifact"
                    >
                      <FaEye size={18} />
                    </button>
                    <button 
                      onClick={() => downloadInvoice(inv.bookingId?._id || inv.bookingId, inv.invoiceNumber, 'download')} 
                      className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-darkGreen hover:text-white transition-all shadow-sm active:scale-90" 
                      title="Download Artifact"
                    >
                      <FaDownload size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-32 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <FaSearch className="text-slate-200 text-2xl" />
                    </div>
                    <p className="text-slate-400 font-serif italic text-xl">No statements matching your timeline.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingInvoice(null)} />
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 scale-in-center transition-transform">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Document Preview</h3>
                <p className="text-xs text-slate-400 font-medium tracking-widest uppercase mt-1">{viewingInvoice.number}</p>
              </div>
              <button 
                onClick={() => setViewingInvoice(null)} 
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 shadow-sm active:scale-95"
              >
                <FaTimes size={18} />
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
