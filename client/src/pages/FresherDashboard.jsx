import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, BookOpen, Star, Target, Compass, Sparkles } from 'lucide-react';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function FresherDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const targetRole = user?.profile?.targetRoles?.[0] || user?.profile?.currentTitle || null;
  const skillNames = user?.profile?.skills?.map(s => s.name || s) || [];
  
  const isNewUser = skillNames.length === 0 && !targetRole;
  
  const plan = user?.subscription?.plan || 'free';
  const planMeta = {
    free:     { label: 'Free',     color: '#64748b', badge: '🆓' },
    gold:     { label: 'Gold',     color: '#f59e0b', badge: '⭐' },
    platinum: { label: 'Platinum', color: '#8b5cf6', badge: '💎' },
  };
  const pm = planMeta[plan];

  const sector = user?.profile?.sectors?.[0] || 'General';
  let recommendedSkills = ['Effective Communication', 'Data Literacy', 'Industry Fundamentals'];
  
  if (sector.includes('Software') || sector.includes('IT')) {
    recommendedSkills = ['Version Control (Git)', 'Basic REST APIs', 'Agile Methodologies'];
  } else if (sector.includes('Healthcare') || sector.includes('Medical')) {
    recommendedSkills = ['Patient Care Fundamentals', 'Healthcare Compliance', 'Medical Terminology'];
  } else if (sector.includes('Design') || sector.includes('Arts')) {
    recommendedSkills = ['Design Thinking', 'Wireframing Basics', 'User Research'];
  } else if (sector.includes('Engineering')) {
    recommendedSkills = ['Core Engineering Principles', 'CAD Software Basics', 'Safety Protocols'];
  } else if (sector.includes('Research') || sector.includes('Science') || sector.includes('Education')) {
    recommendedSkills = ['Data Analysis', 'Research Methodology', 'Scientific Writing'];
  } else if (sector.includes('Finance') || sector.includes('Banking')) {
    recommendedSkills = ['Financial Modeling', 'Risk Assessment', 'Excel / Spreadsheets'];
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} className="animate-fade-in">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <GraduationCap size={18} color="#10b981" />
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, letterSpacing: 1 }}>EARLY CAREER DASHBOARD</span>
          </div>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            {getGreeting()}, {firstName}! 🌱
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {targetRole
              ? `Kickstarting your career as a ${targetRole}`
              : 'Complete your profile to unlock entry-level job matches'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isNewUser && (
            <a href="/onboarding" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
              ✨ Complete Profile
            </a>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: `${pm.color}18`, border: `1px solid ${pm.color}33` }}>
            <span style={{ fontSize: 14 }}>{pm.badge}</span>
            <span style={{ fontSize: 12, color: pm.color, fontWeight: 600 }}>{pm.label}</span>
          </div>
        </div>
      </div>

      {/* ── Welcome Banner for Freshers ───────────────────────── */}
      <div className="glass animate-fade-in" style={{ padding: '20px 24px', marginBottom: 24, background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(52,211,153,0.05))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#059669,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Compass size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#047857' }}>Welcome to your Career Launchpad</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>As an early career professional, focus on building a strong resume, acquiring key skills, and applying to entry-level or graduate roles.</div>
          </div>
        </div>
      </div>

      {/* ── Fresher Stat Cards ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }} className="animate-fade-in">
        {[
          { label: 'Profile Strength',  value: isNewUser ? '20%' : '85%',  icon: Star,      color: '#f59e0b', sub: 'completeness' },
          { label: 'Skills Tracked',    value: skillNames.length,          icon: Target,    color: '#10b981', sub: 'added to profile' },
          { label: 'Entry Jobs',        value: '1.2K+',                    icon: Compass,   color: '#0ea5e9', sub: 'matching roles' },
          { label: 'Learning Paths',    value: '3',                        icon: BookOpen,  color: '#8b5cf6', sub: 'suggested for you' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="glass" style={{ padding: '20px', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        
        {/* ── Skill Building Focus ───────────────────────────── */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Skill Building Recommendations</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>Top skills requested for entry-level {targetRole || 'roles'}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recommendedSkills.map((skill, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{skill}</span>
                </div>
                <button style={{ background: 'none', border: '1px solid #10b981', color: '#10b981', padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Start Learning</button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Next Steps ─────────────────────────────────────── */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Your Career Checklist</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>Complete these to stand out to employers</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { text: 'Add education and projects to profile', done: !isNewUser },
              { text: 'Generate an ATS-friendly Resume', done: false, link: '/resume' },
              { text: 'Practice common interview questions', done: false, link: '/toolkit' },
            ].map((task, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1px solid ${task.done ? '#10b981' : 'var(--text-muted)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: task.done ? '#10b981' : 'transparent' }}>
                  {task.done && <Star size={12} color="white" />}
                </div>
                <div style={{ fontSize: 13, color: task.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none', flex: 1 }}>
                  {task.text}
                </div>
                {task.link && (
                  <a href={task.link} style={{ fontSize: 12, color: '#0ea5e9', textDecoration: 'none' }}>Go →</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <div className="glass" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Fresher Toolkit</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Resume Builder', sub: 'Create your first professional CV', href: '/resume', color: '#10b981' },
            { label: 'Learning Roadmap', sub: 'Guided paths for beginners', href: '/learning-roadmap', color: '#8b5cf6' },
            { label: 'Entry-Level Jobs', sub: 'Discover graduate roles', href: '/jobs', color: '#0ea5e9' },
            { label: 'Interview Prep', sub: 'Nail your first interview', href: '/toolkit', color: '#f59e0b' },
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
