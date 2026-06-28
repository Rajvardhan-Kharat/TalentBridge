import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

const perks = ['Smart job matching', 'CV tailoring in seconds', '20 career tools', 'Application tracker'];

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const user = await googleLogin(tokenResponse.credential || tokenResponse.access_token, 'jobseeker');
        toast.success(`Welcome back, ${user.name}!`);
        navigate(user.onboardingComplete ? '/' : '/onboarding');
      } catch (err) {
        toast.error('Google login failed');
      } finally { setLoading(false); }
    },
    onError: () => toast.error('Google login failed')
  });

  const handleLinkedInLogin = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/linkedin/callback`);
    const state = 'login-jobseeker';
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile%20email`;
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
              Your smart<br /><span style={{ background: 'linear-gradient(135deg,#818cf8,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>career co-pilot</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>Join thousands of candidates using smart tools to land their dream job faster.</p>
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

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ padding: '0 12px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => handleGoogleLogin()}
                  disabled={loading}
                  style={{ flex: 1, justifyContent: 'center', padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleLinkedInLogin}
                  disabled={loading}
                  style={{ flex: 1, justifyContent: 'center', padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
                  </svg>
                  LinkedIn
                </button>
              </div>

              <div style={{ textAlign:'center', marginTop:18, fontSize:12, color:'var(--text-muted)' }}>
                Are you a company?{' '}
                <Link to="/register/company" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}>Register as Employer →</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
