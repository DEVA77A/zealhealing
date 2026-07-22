import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AddEditClass = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tarot',
    type: 'voice',
    duration: 30,
    price: 4000,
    image: '/tarot.png',
    status: 'Active',
  });

  const [imageMode, setImageMode] = useState('preset');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchClass = async () => {
        try {
          const { data } = await axios.get(`/api/classes/${id}`);
          setFormData(data);
          if (data.image) {
            if (data.image.startsWith('data:image')) {
              setImageMode('upload');
            } else if (data.image.startsWith('/') && !data.image.startsWith('//')) {
              setImageMode('preset');
            } else {
              setImageMode('url');
            }
          }
          setLoading(false);
        } catch (error) {
          toast.error('Failed to fetch class');
          navigate('/admin/classes');
        }
      };
      fetchClass();
    }
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be smaller than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
      };

      if (isEdit) {
        await axios.put(`/api/classes/${id}`, formData, config);
        toast.success('Class updated successfully');
      } else {
        await axios.post('/api/classes', formData, config);
        toast.success('Class added successfully');
      }
      navigate('/admin/classes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 0' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '80px' }}>
      
      {/* Back button plus title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link 
          to="/admin/classes" 
          style={{
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--clr-warm-gray)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Back
        </Link>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', margin: 0 }}>
          {isEdit ? 'Configure Modality' : 'Register New Modality'}
        </h2>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--r-xl)',
        padding: '40px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="md:grid-cols-2">
            
            <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
                Modality Title *
              </label>
              <input 
                type="text" 
                name="title" 
                required 
                className="input-field" 
                value={formData.title} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
                Summary Details / Description *
              </label>
              <textarea 
                name="description" 
                rows="4" 
                required 
                className="input-field" 
                style={{ resize: 'none' }}
                value={formData.description} 
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
                Modality Image / Cover Artwork *
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 140px) 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Image Preview Box */}
                <div style={{ 
                  height: '110px', 
                  borderRadius: 'var(--r-md)', 
                  border: '1px solid var(--clr-border-strong)', 
                  overflow: 'hidden',
                  background: 'var(--clr-linen)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt="Class Cover" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ 
                    display: formData.image ? 'none' : 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    color: 'var(--clr-warm-gray)',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    padding: '8px'
                  }}>
                    <span style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🔮</span>
                    No image
                  </div>
                </div>

                {/* Cover Type Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--clr-border)', paddingBottom: '8px' }}>
                    {['preset', 'upload', 'url'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setImageMode(mode)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          color: imageMode === mode ? 'var(--clr-forest-700)' : 'var(--clr-warm-gray)',
                          borderBottom: imageMode === mode ? '2px solid var(--clr-forest-700)' : '2px solid transparent',
                          transition: 'all 200ms ease',
                        }}
                      >
                        {mode === 'preset' ? 'Presets' : mode === 'upload' ? 'Upload Local' : 'Custom URL'}
                      </button>
                    ))}
                  </div>

                  {/* Preset Content */}
                  {imageMode === 'preset' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Tarot Card Cover', path: '/tarot.png' },
                        { label: 'Golden Healing Glow', path: '/about-hero.png' },
                        { label: 'Subtle Forest Path', path: '/hero-bg.png' }
                      ].map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: item.path })}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--r-sm)',
                            border: formData.image === item.path ? '1px solid var(--clr-forest-700)' : '1px solid var(--clr-border-strong)',
                            background: formData.image === item.path ? 'var(--clr-forest-50)' : '#fff',
                            color: formData.image === item.path ? 'var(--clr-forest-700)' : 'var(--clr-ink)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Upload Content */}
                  {imageMode === 'upload' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="class-image-file"
                      />
                      <label
                        htmlFor="class-image-file"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          height: '38px',
                          border: '1.5px dashed var(--clr-border-strong)',
                          borderRadius: 'var(--r-md)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--clr-forest-700)',
                          background: 'var(--clr-forest-50)',
                          transition: 'all 200ms ease',
                          textAlign: 'center',
                        }}
                      >
                        📂 Choose Image File
                      </label>
                      <span style={{ fontSize: '0.625rem', color: 'var(--clr-warm-gray)' }}>
                        Support JPG, PNG, WEBP. Under 5MB.
                      </span>
                    </div>
                  )}

                  {/* URL Content */}
                  {imageMode === 'url' && (
                    <input
                      type="text"
                      name="image"
                      placeholder="Paste image URL link here (https://...)"
                      className="input-field"
                      style={{ height: '38px', fontSize: '0.8125rem' }}
                      value={formData.image.startsWith('data:') ? '' : formData.image}
                      onChange={handleChange}
                    />
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
                Category Target *
              </label>
              <input 
                type="text" 
                name="category" 
                required 
                className="input-field" 
                value={formData.category} 
                onChange={handleChange} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
                Session Channel *
              </label>
              <select 
                name="type" 
                className="input-field" 
                value={formData.type} 
                onChange={handleChange}
              >
                <option value="voice">Voice Call Only</option>
                <option value="video">Video Interactive Call</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
                Slot Duration (Minutes) *
              </label>
              <input 
                type="number" 
                name="duration" 
                required 
                className="input-field" 
                value={formData.duration} 
                onChange={handleChange} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
                Base Honorarium (INR) *
              </label>
              <input 
                type="number" 
                name="price" 
                required 
                className="input-field" 
                value={formData.price} 
                onChange={handleChange} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
                Ledger Status
              </label>
              <select 
                name="status" 
                className="input-field" 
                value={formData.status} 
                onChange={handleChange}
              >
                <option value="Active">Active Catalog</option>
                <option value="Disabled">Disabled / Deprecated</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            marginTop: '16px',
            paddingTop: '24px',
            borderTop: '1px solid var(--clr-border)',
          }}>
            <Link 
              to="/admin/classes" 
              className="btn-secondary"
              style={{ padding: '0 24px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn-primary"
              style={{ padding: '0 28px' }}
            >
              {isEdit ? 'Save Settings' : 'Register Modality'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditClass;
