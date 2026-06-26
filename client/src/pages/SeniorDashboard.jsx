import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Crown, ArrowRight, Shield, Award, Briefcase, TrendingUp, BarChart2 } from 'lucide-react';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function SeniorDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Executive';
  const targetRole = user?.profile?.targetRoles?.[0] || user?.profile?.currentTitle || 'CXO';
  
  const plan = user?.subscription?.plan || 'platinum';
  const planMeta = {
    free:     { label: 'Standard', color: '#64748b', badge: '👔' },
    gold:     { label: 'Gold',     color: '#f59e0b', badge: '⭐' },
    platinum: { label: 'Platinum', color: '#f59e0b', badge: '👑' }, // Gold theme for senior
  };
  const pm = planMeta[plan] || planMeta.platinum;

  const sector = user?.profile?.sectors?.[0] || 'General';
  
  let confidentialRoles = [
    { title: 'Chief Executive Officer', type: 'High-Growth Startup', location: 'Mumbai / Remote' },
    { title: 'Chief Operating Officer', type: 'Enterprise Firm', location: 'Bangalore' },
    { title: 'Independent Board Member', type: 'Multinational Conglomerate', location: 'Delhi NCR' },
  ];

  if (sector.includes('Software') || sector.includes('IT')) {
    confidentialRoles = [
      { title: 'Chief Technology Officer', type: 'AI Startup (Series C)', location: 'Mumbai / Remote' },
      { title: 'VP of Engineering', type: 'Enterprise SaaS', location: 'Bangalore' },
      { title: 'Chief Information Security Officer', type: 'Global FinTech', location: 'Delhi NCR' },
    ];
  } else if (sector.includes('Healthcare') || sector.includes('Medical')) {
    confidentialRoles = [
      { title: 'Chief Medical Officer', type: 'National Hospital Chain', location: 'Mumbai' },
      { title: 'VP of Clinical Research', type: 'Biotech Innovator', location: 'Bangalore / Remote' },
      { title: 'Hospital Administrator', type: 'Specialty Care Network', location: 'Delhi NCR' },
    ];
  } else if (sector.includes('Finance') || sector.includes('Banking')) {
    confidentialRoles = [
      { title: 'Chief Financial Officer', type: 'Private Equity Firm', location: 'Mumbai' },
      { title: 'VP of Investments', type: 'Global Hedge Fund', location: 'Singapore / Remote' },
      { title: 'Head of Risk Management', type: 'Retail Bank', location: 'Delhi NCR' },
    ];
  } else if (sector.includes('Engineering') || sector.includes('Manufacturing')) {
    confidentialRoles = [
      { title: 'VP of Manufacturing', type: 'Automotive Conglomerate', location: 'Pune' },
      { title: 'Chief Engineer', type: 'Aerospace Startup', location: 'Bangalore' },
      { title: 'Supply Chain Director', type: 'Global Logistics Firm', location: 'Mumbai' },
    ];
  } else if (sector.includes('Research') || sector.includes('Education')) {
    confidentialRoles = [
      { title: 'Dean of Research', type: 'Top Tier University', location: 'Remote / Hybrid' },
      { title: 'Principal Investigator', type: 'Govt Research Facility', location: 'Delhi' },
      { title: 'VP of R&D', type: 'Global Conglomerate', location: 'Bangalore' },
    ];
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} className="animate-fade-in">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Crown size={18} color="#f59e0b" />
            <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, letterSpacing: 1 }}>EXECUTIVE DASHBOARD</span>
          </div>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            {getGreeting()}, {firstName}.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Confidential executive search and leadership opportunities.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Shield size={14} color="#f59e0b" />
            <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>Confidential Mode Active</span>
          </div>
        </div>
      </div>

      {/* ── Welcome Banner for Senior ───────────────────────── */}
      <div className="glass animate-fade-in" style={{ padding: '24px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,0,0,0))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={28} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#f59e0b' }}>Executive Placement Insights</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your profile is currently visible only to vetted executive search consultants and hiring boards for roles matching <b>{targetRole}</b>. We prioritize your privacy and strategic fit.
            </div>
          </div>
        </div>
      </div>

      {/* ── Senior Stat Cards ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }} className="animate-fade-in">
        {[
          { label: 'Profile Views',     value: '14',           icon: Shield,      color: '#f59e0b', sub: 'by verified recruiters' },
          { label: 'Leadership Score',  value: '92/100',       icon: TrendingUp,  color: '#10b981', sub: 'based on impact' },
          { label: 'Exclusive Roles',   value: '8',            icon: Briefcase,   color: '#8b5cf6', sub: 'matching your criteria' },
          { label: 'Market Demand',     value: 'High',         icon: BarChart2,   color: '#0ea5e9', sub: 'for CXO positions' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="glass" style={{ padding: '20px', transition: 'transform 0.2s', borderTop: `2px solid ${color}` }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        
        {/* ── Cultural & Leadership Fit ───────────────────────────── */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Leadership Trait Analysis</h3>
            <span style={{ fontSize: 12, padding: '4px 10px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: 12, fontWeight: 600 }}>Top 5%</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>Based on your past organizational impact and strategic initiatives.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { trait: 'Strategic Vision', score: 95 },
              { trait: 'Operational Excellence', score: 88 },
              { trait: 'Change Management', score: 92 },
              { trait: 'Board Communication', score: 85 },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{item.trait}</span>
                  <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>{item.score}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.score}%`, background: 'linear-gradient(90deg, #d97706, #f59e0b)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Board & Executive Network ─────────────────────────────────────── */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Confidential Opportunities</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>Curated roles not available on public job boards</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {confidentialRoles.map((job, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'border 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{job.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{job.type}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.location}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <div className="glass" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Executive Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Executive Search', sub: 'Browse confidential roles', href: '/jobs', color: '#f59e0b' },
            { label: 'Board Profile', sub: 'Update your executive bio', href: '/profile', color: '#8b5cf6' },
            { label: 'Compensation', sub: 'Market benchmarking', href: '/evaluator', color: '#10b981' },
            { label: 'Consultants', sub: 'Connect with partners', href: '/toolkit', color: '#0ea5e9' },
          ].map(({ label, sub, href, color }) => (
            <a key={label} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-elevated)', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
                <ArrowRight size={14} color={color} style={{ marginTop: 8 }} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
