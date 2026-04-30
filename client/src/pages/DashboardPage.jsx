import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { TrendingUp, Target, Zap, BarChart2, Sparkles, ArrowRight, Brain, AlertCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const trendData = [
  { month: 'Nov', AI: 45, Cloud: 60, FullStack: 72 },
  { month: 'Dec', AI: 52, Cloud: 62, FullStack: 70 },
  { month: 'Jan', AI: 61, Cloud: 65, FullStack: 74 },
  { month: 'Feb', AI: 70, Cloud: 68, FullStack: 76 },
  { month: 'Mar', AI: 82, Cloud: 71, FullStack: 78 },
  { month: 'Apr', AI: 91, Cloud: 75, FullStack: 80 },
];

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
        targetRole: user.profile?.targetRoles?.[0] || 'Software Engineer',
        industry: user.profile?.industry || 'Technology',
      });
      setAnalysis(data.analysis);
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';
  const skills = user?.profile?.skills || [];
  const skillNames = skills.map(s => s.name || s);
  const targetRole = user?.profile?.targetRoles?.[0] || user?.profile?.currentTitle || 'your target role';
  const plan = user?.subscription?.plan || 'free';
  const planMeta = { free:{label:'Free',color:'#64748b',badge:'🆓'}, gold:{label:'Gold',color:'#f59e0b',badge:'⭐'}, platinum:{label:'Platinum',color:'#8b5cf6',badge:'💎'} };
  const pm = planMeta[plan];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 28, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }} className="animate-fade-in">
        <div>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
            <Sparkles size={18} color="#818cf8" />
            <span style={{ fontSize:12,color:'#818cf8',fontWeight:600,letterSpacing:1 }}>INSIGHTS DASHBOARD</span>
          </div>
          <h1 style={{ fontFamily:'Plus Jakarta Sans',fontSize:28,fontWeight:800,marginBottom:4 }}>
            Good morning, {firstName}! 👋
          </h1>
          <p style={{ color:'var(--text-secondary)',fontSize:14 }}>
            {user?.profile?.sector ? `${user.profile.sector} Professional · ` : ''}{user?.profile?.currentTitle || 'Your smart career intelligence'}
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {skillNames.length === 0 && (
            <a href="/onboarding" style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:10, padding:'8px 14px', fontSize:12, color:'#818cf8', textDecoration:'none', fontWeight:600 }}>
              ✨ Complete Profile
            </a>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:10, background:`${pm.color}18`, border:`1px solid ${pm.color}33` }}>
            <span style={{ fontSize:14 }}>{pm.badge}</span>
            <span style={{ fontSize:12, color:pm.color, fontWeight:600 }}>{pm.label}</span>
          </div>
        </div>
      </div>


      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28 }} className="animate-fade-in">
        {[
          { label:'Applications', value: analytics?.total || 0,        icon: Target,    color:'#6366f1', sub:'total tracked' },
          { label:'Interviews',   value: analytics?.interviews || 0,   icon: Zap,       color:'#10b981', sub:'secured' },
          { label:'Avg Match',    value: `${analytics?.avgMatchScore || 0}/5`, icon: Brain, color:'#8b5cf6', sub:'score' },
          { label:'Response Rate',value: `${analytics?.responseRate || 0}%`,   icon: TrendingUp, color:'#06b6d4', sub:'vs 2% industry avg' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="glass" style={{ padding:'20px',transition:'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:`${color}22`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <div style={{ fontSize:28,fontWeight:800,color:'var(--text-primary)',marginBottom:2 }}>{value}</div>
            <div style={{ fontSize:13,fontWeight:600,color:'var(--text-secondary)' }}>{label}</div>
            <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:2 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24 }}>
        {/* ── Skills Gap Analysis ──────────────────────────── */}
        <div className="glass" style={{ padding:'24px' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <div>
              <h3 style={{ fontSize:16,fontWeight:700 }}>Skills Gap Analysis</h3>
              <p style={{ color:'var(--text-muted)',fontSize:12,marginTop:2 }}>Smart market intelligence</p>
            </div>
            <button className="btn-primary" onClick={handleSkillsGap} disabled={analyzing} style={{ padding:'8px 14px',fontSize:13 }}>
              {analyzing ? <div className="loader" style={{width:16,height:16}} /> : <><Brain size={14} /> Analyze</>}
            </button>
          </div>

          {!analysis && !analyzing && (
            <div style={{ textAlign:'center',padding:'28px 0',color:'var(--text-muted)' }}>
              <Brain size={40} style={{ marginBottom:10,opacity:0.3 }} />
              <p style={{ fontSize:13 }}>Click Analyze to get your smart skills gap report</p>
            </div>
          )}

          {analyzing && (
            <div style={{ textAlign:'center',padding:'28px 0' }}>
              <div className="loader" style={{ width:36,height:36,margin:'0 auto 12px' }} />
              <p style={{ fontSize:13,color:'var(--text-muted)' }}>Analyzing market demand for {targetRole}...</p>
            </div>
          )}

          {analysis && (
            <div>
              <div style={{ display:'flex',gap:12,marginBottom:16 }}>
                <div style={{ flex:1,padding:'12px',background:'rgba(16,185,129,0.08)',borderRadius:10,border:'1px solid rgba(16,185,129,0.15)',textAlign:'center' }}>
                  <div style={{ fontSize:24,fontWeight:800,color:'#10b981' }}>{analysis.matchRateWithSkills}%</div>
                  <div style={{ fontSize:11,color:'var(--text-muted)' }}>With smart skills match</div>
                </div>
                <div style={{ flex:1,padding:'12px',background:'rgba(100,116,139,0.08)',borderRadius:10,border:'1px solid rgba(100,116,139,0.15)',textAlign:'center' }}>
                  <div style={{ fontSize:24,fontWeight:800,color:'var(--text-secondary)' }}>{analysis.matchRateWithoutSkills}%</div>
                  <div style={{ fontSize:11,color:'var(--text-muted)' }}>Title-based match</div>
                </div>
              </div>
              <p style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:12,lineHeight:1.6 }}>{analysis.insights}</p>
              <div>
                <p style={{ fontSize:12,fontWeight:600,color:'var(--text-muted)',marginBottom:8 }}>SKILLS TO ADD NOW:</p>
                <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                  {analysis.skillsGap?.slice(0,8).map(s => <span key={s} className="chip chip-red">{s}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Skills Trend ─────────────────────────────────── */}
        <div className="glass" style={{ padding:'24px' }}>
          <h3 style={{ fontSize:16,fontWeight:700,marginBottom:4 }}>Skills Demand Trends</h3>
          <p style={{ color:'var(--text-muted)',fontSize:12,marginBottom:16 }}>Job postings mentioning these skills (index)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCloud" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,fontSize:12 }} />
              <Area type="monotone" dataKey="AI" stroke="#6366f1" fill="url(#gAI)" strokeWidth={2} name="AI/ML" />
              <Area type="monotone" dataKey="Cloud" stroke="#06b6d4" fill="url(#gCloud)" strokeWidth={2} name="Cloud" />
              <Area type="monotone" dataKey="FullStack" stroke="#10b981" strokeWidth={2} fillOpacity={0} name="Full Stack" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:'flex',gap:16,marginTop:8 }}>
            {[['AI/ML','#6366f1'],['Cloud','#06b6d4'],['Full Stack','#10b981']].map(([l,c]) => (
              <div key={l} style={{ display:'flex',alignItems:'center',gap:5 }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:c }} />
                <span style={{ fontSize:11,color:'var(--text-muted)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────── */}
      <div className="glass" style={{ padding:'20px' }}>
        <h3 style={{ fontSize:15,fontWeight:700,marginBottom:14 }}>Quick Actions</h3>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
          {[
            { label:'Find Jobs', sub:'Browse matches', href:'/jobs', color:'#6366f1' },
            { label:'Evaluate Job', sub:'Paste JD for smart score', href:'/evaluator', color:'#8b5cf6' },
            { label:'Tailor CV', sub:'ATS-optimize resume', href:'/cv-tailor', color:'#06b6d4' },
            { label:'Career Toolkit', sub:'20 career tools', href:'/toolkit', color:'#10b981' },
          ].map(({ label, sub, href, color }) => (
            <a key={label} href={href} style={{ textDecoration:'none' }}>
              <div style={{ padding:'14px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-elevated)',
                transition:'all 0.2s',cursor:'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=color; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}>
                <div style={{ fontSize:14,fontWeight:700,color:'var(--text-primary)',marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:12,color:'var(--text-muted)' }}>{sub}</div>
                <ArrowRight size={14} color={color} style={{ marginTop:8 }} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
