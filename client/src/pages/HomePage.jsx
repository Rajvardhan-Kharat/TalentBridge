import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { user, loading } = useAuth();

  // If user is already logged in, redirect them to the dashboard
  if (user) return <Navigate to="/dashboard" replace />;
  
  if (loading && !user) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-base)' }}>
      <div className="loader" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>TalentBridge</span>
        </div>
        <div style={{ display: 'flex', gap: 15 }}>
          <Link to="/login" style={{ textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Login</Link>
          <Link to="/register" style={{ textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, background: '#6366f1', color: 'white' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ padding: '80px 20px', textAlign: 'center', maxWidth: 1000, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: 20, fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            <Sparkles size={16} /> The Future of Career Navigation
          </div>
          
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
            Bridge the gap to your <br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              dream career
            </span>
          </h1>
          
          <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            TalentBridge offers a comprehensive suite of AI-powered tools, from smart CV tailoring to advanced job discovery, helping you land your next big role faster.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '16px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 700, fontSize: 16, transition: 'transform 0.2s' }}>
              Start for free <ArrowRight size={18} />
            </Link>
            <Link to="/register/company" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '16px 32px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 16 }}>
              I'm hiring
            </Link>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 80, textAlign: 'left' }}
        >
          <div style={{ padding: 30, background: 'var(--bg-elevated)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Zap size={24} color="#818cf8" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>AI-Powered Tools</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>Tailor your CV instantly, evaluate your skills, and generate cover letters using state-of-the-art AI models.</p>
          </div>

          <div style={{ padding: 30, background: 'var(--bg-elevated)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <CheckCircle2 size={24} color="#10b981" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Application Tracking</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>Keep track of all your job applications in one organized Kanban board. Never miss a follow-up.</p>
          </div>

          <div style={{ padding: 30, background: 'var(--bg-elevated)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Shield size={24} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>For Companies</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>Post jobs, discover top talent, and manage candidates seamlessly through our dedicated company portal.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
