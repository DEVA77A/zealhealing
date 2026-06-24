import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const downloadInvoice = async (bookingId, invoiceNumber) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/invoice/${bookingId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-sage-600">Loading Invoices...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif font-bold text-sage-900 mb-6">Invoice Management</h2>

      {/* Filters */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400" />
          <input 
            type="text" 
            placeholder="Search by Invoice #..." 
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
                <th className="p-4 font-semibold border-b border-sage-200">Invoice #</th>
                <th className="p-4 font-semibold border-b border-sage-200">Date</th>
                <th className="p-4 font-semibold border-b border-sage-200">Subtotal</th>
                <th className="p-4 font-semibold border-b border-sage-200">GST (18%)</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Grand Total</th>
                <th className="p-4 font-semibold border-b border-sage-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 text-sm text-sage-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-sage-50/50 transition-colors">
                  <td className="p-4 font-medium text-sage-900">{inv.invoiceNumber}</td>
                  <td className="p-4 text-sage-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">₹{inv.subtotal.toFixed(2)}</td>
                  <td className="p-4">₹{(inv.CGST + inv.SGST).toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-sage-900">₹{inv.grandTotal.toFixed(2)}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => downloadInvoice(inv.bookingId?._id || inv.bookingId, inv.invoiceNumber)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Download">
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-sage-500">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;
