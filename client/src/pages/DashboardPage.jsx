import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { TrendingUp, Target, Zap, Sparkles, ArrowRight, Brain, BookOpen, Star } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

// ── Generate dynamic trend data based on user's actual skills ─────────────────
const buildTrendData = (skills) => {
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  if (!skills || skills.length === 0) {
    // Default for users with no profile yet
    return {
      data: months.map((month, i) => ({ month, General: 40 + i * 5 })),
      keys: [{ key: 'General', color: '#6366f1' }],
    };
  }

  // Pick top 3 skills from the user's profile
  const top3 = skills.slice(0, 3).map((s, idx) => {
    const name = (s.name || s).replace(/\s+/g, '');
    const colors = ['#6366f1', '#10b981', '#f59e0b'];
    const baseVal = 35 + idx * 8 + Math.floor(Math.random() * 10);
    return { key: name, color: colors[idx], base: baseVal };
  });

  const data = months.map((month, i) => {
    const point = { month };
    top3.forEach(({ key, base }) => {
      point[key] = Math.min(99, base + i * (3 + Math.random() * 4));
    });
    return point;
  });

  return { data, keys: top3.map(({ key, color }) => ({ key, color })) };
};

// ── Welcome message based on time of day ─────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/applications/analytics').then(r => r.data.analytics),
  });

  const handleSkillsGap = async () => {
    setAnalyzing(true);
    try {
      const { data } = await api.post('/ai/skills-gap', {
        targetRole: user.profile?.targetRoles?.[0] || user.profile?.currentTitle || 'Software Engineer',
        industry: user.profile?.industry || user.profile?.sector || 'Technology',
      });
      setAnalysis(data.analysis);
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';
  const skills = user?.profile?.skills || [];
  const skillNames = skills.map(s => s.name || s);
  const targetRole = user?.profile?.targetRoles?.[0] || user?.profile?.currentTitle || null;
  const plan = user?.subscription?.plan || 'free';
  const planMeta = {
    free:     { label: 'Free',     color: '#64748b', badge: '🆓' },
    gold:     { label: 'Gold',     color: '#f59e0b', badge: '⭐' },
    platinum: { label: 'Platinum', color: '#8b5cf6', badge: '💎' },
  };
  const pm = planMeta[plan];

  // Build dynamic chart data from user's skills
  const { data: trendData, keys: trendKeys } = useMemo(() => buildTrendData(skills), [skills.length]);

  // Build skill proficiency bars (for radar) from user's actual skills
  const radarData = useMemo(() =>
    skills.slice(0, 6).map(s => ({
      skill: (s.name || s).length > 12 ? (s.name || s).slice(0, 12) + '…' : (s.name || s),
      level: s.level === 'expert' ? 90 : s.level === 'intermediate' ? 65 : 40,
    })),
  [skills]);

  // Is the profile complete enough to be useful?
  const isNewUser = skillNames.length === 0 && !targetRole;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} className="animate-fade-in">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={18} color="#818cf8" />
            <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, letterSpacing: 1 }}>INSIGHTS DASHBOARD</span>
          </div>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {targetRole
              ? `Targeting: ${targetRole}${user?.profile?.sector ? ` · ${user.profile.sector}` : ''}`
              : 'Complete your profile to unlock personalised insights'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isNewUser && (
            <a href="/onboarding" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
              ✨ Complete Profile
            </a>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: `${pm.color}18`, border: `1px solid ${pm.color}33` }}>
            <span style={{ fontSize: 14 }}>{pm.badge}</span>
            <span style={{ fontSize: 12, color: pm.color, fontWeight: 600 }}>{pm.label}</span>
          </div>
        </div>
      </div>

      {/* ── New User Banner ───────────────────────────────────── */}
      {isNewUser && (
        <div className="glass animate-fade-in" style={{ padding: '20px 24px', marginBottom: 24, background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Star size={22} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Your dashboard is waiting for you</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Add your skills, target role, and background in your profile. We'll personalise every chart, job suggestion, and insight specifically for you.</div>
            </div>
            <a href="/onboarding" className="btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Set Up Profile <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }} className="animate-fade-in">
        {[
          { label: 'Applications',  value: analytics?.total || 0,               icon: Target,    color: '#6366f1', sub: 'total tracked' },
          { label: 'Interviews',    value: analytics?.interviews || 0,           icon: Zap,       color: '#10b981', sub: 'secured' },
          { label: 'Avg Match',     value: `${analytics?.avgMatchScore || 0}/5`, icon: Brain,     color: '#8b5cf6', sub: 'match score' },
          { label: 'Response Rate', value: `${analytics?.responseRate || 0}%`,   icon: TrendingUp,color: '#06b6d4', sub: 'vs 2% avg' },
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

        {/* ── Skills Gap Analysis ───────────────────────────── */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Skills Gap Analysis</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                {targetRole ? `For: ${targetRole}` : 'Add a target role to personalise'}
              </p>
            </div>
            <button className="btn-primary" onClick={handleSkillsGap} disabled={analyzing} style={{ padding: '8px 14px', fontSize: 13 }}>
              {analyzing ? <div className="loader" style={{ width: 16, height: 16 }} /> : <><Brain size={14} /> Analyze</>}
            </button>
          </div>

          {!analysis && !analyzing && (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
              <Brain size={40} style={{ marginBottom: 10, opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>Click Analyze to get your personalised skills gap report</p>
              {!targetRole && <p style={{ fontSize: 11, marginTop: 6, color: '#f59e0b' }}>⚡ Add a target role in your profile for best results</p>}
            </div>
          )}

          {analyzing && (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div className="loader" style={{ width: 36, height: 36, margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Analysing market demand for {targetRole || 'your role'}...</p>
            </div>
          )}

          {analysis && (
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{analysis.matchRateWithSkills}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>With your skills</div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(100,116,139,0.08)', borderRadius: 10, border: '1px solid rgba(100,116,139,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-secondary)' }}>{analysis.matchRateWithoutSkills}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Title-based match</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>{analysis.insights}</p>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>ADD THESE SKILLS NEXT:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.skillsGap?.slice(0, 8).map(s => <span key={s} className="chip chip-red">{s}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Dynamic Skills Trend Chart ────────────────────── */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            {skillNames.length > 0 ? 'Your Skills — Market Demand' : 'Market Demand Trends'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
            {skillNames.length > 0
              ? `Demand index for your top skills (${trendKeys.map(k => k.key).join(', ')})`
              : 'Complete your profile to see trends for YOUR skills'}
          </p>

          {skillNames.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <BookOpen size={40} style={{ opacity: 0.2, marginBottom: 10 }} />
              <p style={{ fontSize: 13 }}>Add skills to your profile to see personalised trends</p>
              <a href="/onboarding" style={{ fontSize: 12, color: '#818cf8', marginTop: 8, display: 'inline-block' }}>→ Add Skills</a>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <defs>
                    {trendKeys.map(({ key, color }) => (
                      <linearGradient key={key} id={`g_${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  {trendKeys.map(({ key, color }) => (
                    <Area key={key} type="monotone" dataKey={key} stroke={color} fill={`url(#g_${key})`} strokeWidth={2} name={key} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                {trendKeys.map(({ key, color }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{key}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Skill Proficiency (only if user has skills) ─────── */}
      {radarData.length > 0 && (
        <div className="glass animate-fade-in" style={{ padding: '24px', marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Your Skill Proficiency</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>Based on your profile — {radarData.length} skills tracked</p>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <ResponsiveContainer width={220} height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Radar dataKey="level" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {radarData.map(({ skill, level }) => (
                <div key={skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{skill}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{level >= 80 ? 'Expert' : level >= 55 ? 'Intermediate' : 'Beginner'}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${level}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions ──────────────────────────────────── */}
      <div className="glass" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Find Jobs',     sub: skillNames.length > 0 ? `Matched to your ${skillNames[0]} skills` : 'Browse all jobs', href: '/jobs',      color: '#6366f1' },
            { label: 'Evaluate Job',  sub: 'Paste JD for smart score',   href: '/evaluator', color: '#8b5cf6' },
            { label: 'Tailor CV',     sub: 'ATS-optimize resume',         href: '/cv-tailor', color: '#06b6d4' },
            { label: 'Career Toolkit',sub: '20 smart tools',              href: '/toolkit',   color: '#10b981' },
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
