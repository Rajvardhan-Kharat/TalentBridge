import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Search, Brain, FileText, Wand2,
  Globe, Kanban, BookOpen, LogOut, Sparkles, ChevronRight,
  User, Crown, Star, FileDown, Moon, Sun
} from 'lucide-react';

const navItems = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard',      sub: 'Overview & Insights' },
  { to: '/jobs',           icon: Search,          label: 'Job Discovery',  sub: 'Find & Match Jobs' },
  { to: '/evaluator',      icon: Brain,           label: 'AI Evaluator',   sub: 'Score Any Job' },
  { to: '/cv-tailor',      icon: FileText,        label: 'CV Tailor',      sub: 'ATS-Optimized CVs' },
  { to: '/resume',         icon: FileDown,        label: 'Resume Builder', sub: 'Professional PDF' },
  { to: '/toolkit',        icon: Wand2,           label: 'AI Toolkit',     sub: '20 AI Career Tools' },
  { to: '/portal-scanner', icon: Globe,           label: 'Portal Scanner', sub: 'Company Job Boards' },
  { to: '/tracker',        icon: Kanban,          label: 'App Tracker',    sub: 'Kanban Pipeline' },
  { to: '/story-bank',     icon: BookOpen,        label: 'Story Bank',     sub: 'STAR Stories' },
];

const PLAN_META = {
  free:     { label:'Free',     badge:'🆓', color:'#64748b', gradient:'linear-gradient(135deg,#475569,#64748b)' },
  gold:     { label:'Gold',     badge:'⭐', color:'#f59e0b', gradient:'linear-gradient(135deg,#d97706,#f59e0b)' },
  platinum: { label:'Platinum', badge:'💎', color:'#8b5cf6', gradient:'linear-gradient(135deg,#6d28d9,#8b5cf6)' },
};

function PlanAvatarSmall({ plan='free', avatar, name }) {
  const size = 34;
  const initials = (name||'U').charAt(0).toUpperCase();
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      {plan === 'gold' && (
        <div style={{ position:'absolute', inset:-2, borderRadius:'50%', background:'conic-gradient(#d97706,#fbbf24,#f59e0b,#d97706)', animation:'spin 3s linear infinite' }} />
      )}
      {plan === 'platinum' && (
        <div style={{ position:'absolute', inset:-3, borderRadius:'50%', background:'conic-gradient(#6d28d9,#a78bfa,#c4b5fd,#8b5cf6,#6d28d9)', animation:'spin 2s linear infinite', boxShadow:'0 0 10px rgba(139,92,246,0.7)' }} />
      )}
      <div style={{ position:'absolute', inset: plan!=='free'?2:0, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:plan==='free'?'2px solid var(--border)':'none' }}>
        {avatar
          ? <img src={avatar} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span style={{ fontSize:13, fontWeight:700, color:'white' }}>{initials}</span>}
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const plan = user?.subscription?.plan || 'free';
  const pm = PLAN_META[plan];
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('hi_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('hi_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {/* Sidebar */}
      <aside style={{ width: 260, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        {/* Brand */}
        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom:10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={17} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>TalentBridge</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI Talent Platform · All Sectors</div>
            </div>
          </div>
          {/* Upgrade banner for free users */}
          {plan === 'free' && (
            <NavLink to="/pricing" style={{ textDecoration:'none', display:'block' }}>
              <div style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8, padding:'6px 10px', display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                <Crown size={12} color="#818cf8" />
                <span style={{ fontSize:11, color:'#818cf8', fontWeight:600 }}>Upgrade to Gold/Platinum →</span>
              </div>
            </NavLink>
          )}
          {plan !== 'free' && (
            <NavLink to="/pricing" style={{ textDecoration:'none', display:'block' }}>
              <div style={{ background:`linear-gradient(135deg,${pm.color}22,${pm.color}11)`, border:`1px solid ${pm.color}33`, borderRadius:8, padding:'5px 10px', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:11 }}>{pm.badge}</span>
                <span style={{ fontSize:11, color:pm.color, fontWeight:600 }}>{pm.label} Member</span>
              </div>
            </NavLink>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {navItems.map(({ to, icon: Icon, label, sub }) => (
            <NavLink key={to} to={to} end={to === '/'} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, marginBottom: 2, background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent', border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: isActive ? 'rgba(99,102,241,0.2)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={isActive ? '#818cf8' : 'var(--text-muted)'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#818cf8' : 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>
                  </div>
                  {isActive && <ChevronRight size={13} color="#818cf8" />}
                </div>
              )}
            </NavLink>
          ))}

          {/* Divider */}
          <div style={{ borderTop:'1px solid var(--border)', margin:'8px 0' }} />

          {/* Profile & Pricing */}
          {[
            { to:'/profile', icon:User, label:'My Profile', sub:'Edit & view profile' },
            { to:'/pricing', icon:Crown, label:'Plans & Billing', sub:'Upgrade / manage' },
          ].map(({ to, icon: Icon, label, sub }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, marginBottom: 2, background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent', border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: isActive ? 'rgba(99,102,241,0.2)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={isActive ? '#818cf8' : 'var(--text-muted)'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#818cf8' : 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sub}</div>
                  </div>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-elevated)' }}>
            <PlanAvatarSmall plan={plan} avatar={user?.avatar} name={user?.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: pm.color, fontWeight: 600 }}>{pm.badge} {pm.label}</div>
            </div>
            <button onClick={() => setIsDark(!isDark)} className="btn-ghost" style={{ padding: '5px', color: isDark ? 'var(--text-muted)' : '#f59e0b' }}>
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button onClick={handleLogout} className="btn-ghost" style={{ padding: '5px' }}><LogOut size={13} /></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
        <Outlet />
      </main>
    </div>
  );
}
