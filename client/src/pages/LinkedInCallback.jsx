import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LinkedInCallback() {
  const { linkedinLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
      toast.error('LinkedIn authentication failed');
      navigate('/login');
      return;
    }

    const processLogin = async () => {
      try {
        const role = state === 'login-company' ? 'company' : 'jobseeker';
        const redirectUri = `${window.location.origin}/auth/linkedin/callback`;
        const user = await linkedinLogin(code, redirectUri, role);
        
        toast.success(`Welcome, ${user.name}!`);
        if (user.role === 'company') {
          navigate('/company-portal');
        } else {
          navigate(user.onboardingComplete ? '/' : '/onboarding');
        }
      } catch (err) {
        toast.error('LinkedIn authentication failed');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    processLogin();
  }, [location, linkedinLogin, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ width: 40, height: 40, margin: '0 auto 20px auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>Authenticating with LinkedIn...</p>
        </div>
      ) : null}
    </div>
  );
}
