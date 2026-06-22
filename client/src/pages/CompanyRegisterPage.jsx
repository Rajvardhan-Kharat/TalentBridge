import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building, User, Mail, Lock, Globe, MapPin, Users, Briefcase, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const INDUSTRIES = ['Technology', 'Finance & Banking', 'Healthcare', 'E-commerce', 'Education', 'Manufacturing', 'Consulting', 'Media & Entertainment', 'Real Estate', 'Startup', 'Other'];

export default function CompanyRegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    // Account
    name: '', email: '', password: '', confirmPassword: '',
    // Company
    companyName: '', website: '', industry: '', size: '', headquarters: '', description: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.password) { toast.error('All fields are required'); return false; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.industry) { toast.error('Company name and industry are required'); return; }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'company',
        companyProfile: {
          companyName: form.companyName,
          website: form.website,
          industry: form.industry,
          size: form.size,
          headquarters: form.headquarters,
          description: form.description,
        },
      });
      toast.success('Company account created! Welcome to TalentBridge.');
      navigate('/company-portal');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputStyle = { marginBottom: 14 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🏢</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
            TalentBridge for Companies
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Find top talent. Post jobs. Grow your team.</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {[{ n: 1, label: 'Account', icon: <User size={13} /> }, { n: 2, label: 'Company', icon: <Building size={13} /> }].map(s => (
            <div key={s.n} style={{
              flex: 1, padding: '10px 0', textAlign: 'center', fontSize: 12, fontWeight: 700,
              background: step === s.n ? 'rgba(99,102,241,0.15)' : step > s.n ? 'rgba(16,185,129,0.08)' : 'var(--bg-elevated)',
              color: step === s.n ? '#818cf8' : step > s.n ? '#10b981' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              borderRight: s.n < 2 ? '1px solid var(--border)' : 'none',
              transition: 'all 0.3s',
            }}>
              {step > s.n ? <CheckCircle size={13} /> : s.icon}
              {s.n}. {s.label}
            </div>
          ))}
        </div>

        <div className="glass animate-fade-in" style={{ padding: '28px 32px', borderRadius: 20 }}>
          {step === 1 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} color="#818cf8" /> Create Your Account</h2>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Your Name</label>
              <input id="company-reg-name" className="input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} />
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Work Email</label>
              <input id="company-reg-email" className="input" type="email" placeholder="hr@yourcompany.com" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} />
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Password</label>
              <input id="company-reg-password" className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} style={inputStyle} />
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Confirm Password</label>
              <input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} style={{ marginBottom: 20 }} />
              <button className="btn-primary" onClick={() => { if (validateStep1()) setStep(2); }} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}>
                Next — Company Details <ChevronRight size={14} />
              </button>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Building size={16} color="#818cf8" /> Company Details</h2>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Company Name *</label>
              <input id="company-reg-companyname" className="input" placeholder="Acme Technologies Pvt. Ltd." value={form.companyName} onChange={e => set('companyName', e.target.value)} style={inputStyle} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Industry *</label>
                  <select className="input" value={form.industry} onChange={e => set('industry', e.target.value)} required>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Company Size</label>
                  <select className="input" value={form.size} onChange={e => set('size', e.target.value)}>
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Website</label>
                  <input className="input" placeholder="https://yourcompany.com" value={form.website} onChange={e => set('website', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Headquarters</label>
                  <input className="input" placeholder="Bangalore, India" value={form.headquarters} onChange={e => set('headquarters', e.target.value)} />
                </div>
              </div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>About Your Company (optional)</label>
              <textarea className="input" rows={3} placeholder="Brief description of your company, mission, and culture..." value={form.description} onChange={e => set('description', e.target.value)} style={{ marginBottom: 20, resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>
                  <ChevronLeft size={13} /> Back
                </button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', padding: '12px', fontSize: 14 }}>
                  {loading ? <><div className="loader" style={{ width: 14, height: 14 }} /> Creating...</> : <><CheckCircle size={14} /> Create Company Account</>}
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#64748b' }}>
          Looking for a job instead?{' '}
          <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Sign up as Job Seeker</Link>
          {' · '}
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}
