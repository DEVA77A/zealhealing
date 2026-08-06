import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { getToken } = useAuth();

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get('/api/classes');
      setClasses(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const deleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`/api/classes/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success('Appointment deleted');
        fetchClasses();
      } catch (error) {
        toast.error('Failed to delete appointment');
      }
    }
  };

  const toggleStatus = async (cls) => {
    try {
      const newStatus = cls.status === 'Active' ? 'Disabled' : 'Active';
      await axios.put(`/api/classes/${cls._id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success(`Appointment ${newStatus.toLowerCase()}`);
      fetchClasses();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const duplicateClass = async (cls) => {
    try {
      const newClass = { ...cls };
      delete newClass._id;
      newClass.title = `${newClass.title} (Copy)`;
      
      await axios.post(`/api/classes`, newClass, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success('Appointment duplicated');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to duplicate appointment');
    }
  };

  const filteredClasses = classes.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

    if (status === 'Active') {
      return <span style={{ ...styles, background: 'var(--clr-forest-50)', color: 'var(--clr-forest-700)' }}>Active</span>;
    }
    return <span style={{ ...styles, background: '#fef2f2', color: '#b91c1c' }}>Disabled</span>;
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
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Appointment Catalog
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>Manage session types, configure pricing parameters, and configure active categories.</p>
        </div>
        <Link to="/admin/classes/add" className="btn-primary" style={{ display: 'inline-flex', borderRadius: 'var(--r-md)', textDecoration: 'none' }}>
          ＋ Add Appointment
        </Link>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flexGrow: 1, minWidth: '240px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search appointment titles or category fields..." 
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
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.75rem', color: 'var(--clr-warm-gray)' }}>▼</span>
        </div>
      </div>

      {/* Card Table list */}
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
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Appointment name / Description</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Category</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Type</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Duration</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Base Honorarium</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.875rem', color: 'var(--clr-ink)' }}>
              {filteredClasses.map((cls) => (
                <tr 
                  key={cls._id} 
                  style={{ borderBottom: '1px solid var(--clr-border)', transition: 'background 150ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '20px 24px', maxWidth: '320px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--r-sm)',
                        overflow: 'hidden',
                        background: 'var(--clr-linen)',
                        flexShrink: 0,
                        border: '1px solid var(--clr-border)'
                      }}>
                        <img 
                          src={cls.image || '/tarot.png'} 
                          alt="" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/tarot.png'; }}
                        />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 700, color: 'var(--clr-ink)', margin: 0 }}>{cls.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)', marginTop: '4px', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cls.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>{cls.category}</td>
                  <td style={{ padding: '20px 24px', textTransform: 'capitalize' }}>{cls.type}</td>
                  <td style={{ padding: '20px 24px' }}>{cls.duration} mins</td>
                  <td style={{ padding: '20px 24px', fontWeight: 650 }}>₹{cls.price}</td>
                  <td style={{ padding: '20px 24px' }}>
                    {getStatusBadge(cls.status)}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => toggleStatus(cls)} 
                        style={{ background: '#fff', border: '1px solid var(--clr-border)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--clr-ink)' }}
                        title={cls.status === 'Active' ? 'Disable' : 'Enable'}
                      >
                        {cls.status === 'Active' ? '👁 Hide' : '👁 Show'}
                      </button>
                      <Link 
                        to={`/admin/classes/edit/${cls._id}`} 
                        className="btn-secondary" 
                        style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', textDecoration: 'none' }}
                        title="Edit"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => duplicateClass(cls)} 
                        style={{ background: '#fff', border: '1px solid var(--clr-border)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--clr-ink)' }}
                        title="Duplicate"
                      >
                        Duplicate
                      </button>
                      <button 
                        onClick={() => deleteClass(cls._id)} 
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444' }}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-warm-gray)' }}>
                    No appointments matching system parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;
