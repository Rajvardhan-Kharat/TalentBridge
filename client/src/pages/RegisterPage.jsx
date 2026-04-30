import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const perks = ['AI-powered job matching', 'CV tailoring in seconds', '20 AI career tools', 'Application tracker'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Let\'s set up your profile.');
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '20px',
      backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: 800, display: 'flex', gap: 40, alignItems: 'center' }} className="animate-fade-in">
        {/* Left pitch */}
        <div style={{ flex: 1, display: 'none' }} className="lg-block">
          <div style={{ marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex',alignItems:'center',justifyContent:'center', marginBottom: 20 }}>
              <Sparkles size={22} color="white" />
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Plus Jakarta Sans', lineHeight: 1.2, marginBottom: 12 }}>
              Your AI-powered<br /><span style={{ background: 'linear-gradient(135deg,#818cf8,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>career co-pilot</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>Join thousands of candidates using AI to land their dream job faster.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
            {perks.map(p => (
              <div key={p} style={{ display:'flex', alignItems:'center', gap: 10 }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, maxWidth: 420, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 24, fontWeight: 800 }}>Create your account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Already have one? <Link to="/login" style={{ color: '#818cf8' }}>Sign in</Link></p>
          </div>

          <div className="glass" style={{ padding: '28px' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input className="input" type="text" placeholder="Raj Kumar" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email address</label>
                <input className="input" type="email" placeholder="raj@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={show ? 'text' : 'password'} placeholder="Min 6 characters"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                    style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShow(!show)}
                    style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)' }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%',justifyContent:'center',padding:'12px' }}>
                {loading ? <div className="loader" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
