import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Brain, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Plus, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const DIMENSIONS = [
  { key:'skills_match',             label:'Skills Match' },
  { key:'experience_level_fit',     label:'Experience Level' },
  { key:'salary_alignment',         label:'Salary Alignment' },
  { key:'role_title_relevance',     label:'Role Title' },
  { key:'company_culture_fit',      label:'Culture Fit' },
  { key:'growth_potential',         label:'Growth Potential' },
  { key:'location_remote_compatibility', label:'Location/Remote' },
  { key:'industry_relevance',       label:'Industry Fit' },
  { key:'ats_keyword_density',      label:'ATS Keywords' },
  { key:'overall_opportunity_score',label:'Opportunity Score' },
];

const ScoreBar = ({ score }) => {
  const pct = (score / 5) * 100;
  const color = score >= 4 ? '#10b981' : score >= 3 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
      <div style={{ flex:1,height:6,background:'var(--bg-elevated)',borderRadius:3,overflow:'hidden' }}>
        <div style={{ height:'100%',width:`${pct}%`,background:color,borderRadius:3,transition:'width 1s ease' }} />
      </div>
      <span style={{ fontSize:12,fontWeight:700,color,width:30,textAlign:'right' }}>{score?.toFixed(1)}</span>
    </div>
  );
};

export default function JobEvaluatorPage() {
  const { user } = useAuth();
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [saved, setSaved] = useState(false);

  const skills = (user?.profile?.skills || []).map(s => s.name || s);
  const targetRole = user?.profile?.targetRoles?.[0] || user?.profile?.currentTitle || null;

  const evaluate = async () => {
    if (!jd.trim()) { toast.error('Please paste a job description'); return; }
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/ai/evaluate-job', { jobDescription: jd });
      setResult(data.evaluation);
      toast.success('Evaluation complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed. Check server & API key.');
    } finally { setLoading(false); }
  };

  const trackApplication = async () => {
    try {
      await api.post('/applications', {
        jobTitle: 'Evaluated Job', company: 'Unknown',
        matchScore: result.overallScore, matchGrade: result.grade,
        aiEvaluation: { ...result, evaluatedAt: new Date() },
        notes: result.summary,
      });
      setSaved(true); toast.success('Added to Application Tracker!');
    } catch { toast.error('Could not save to tracker'); }
  };

  const toggleDim = (k) => setExpanded(e => ({...e, [k]: !e[k]}));

  return (
    <div style={{ padding:'28px 32px',maxWidth:800,margin:'0 auto' }}>
      <div style={{ marginBottom:24 }} className="animate-fade-in">
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
          <Brain size={18} color="#818cf8" />
          <span style={{ fontSize:12,color:'#818cf8',fontWeight:600,letterSpacing:1 }}>MODULE 2 — SMART JOB EVALUATOR</span>
        </div>
        <h1 style={{ fontFamily:'Plus Jakarta Sans',fontSize:26,fontWeight:800,marginBottom:4 }}>Job Evaluator</h1>
        <p style={{ color:'var(--text-secondary)',fontSize:14 }}>Score any job across 10 dimensions against your profile</p>
      </div>

      {/* Input */}
      <div className="glass animate-fade-in" style={{ padding:'24px',marginBottom:20 }}>
        {/* Profile context bar */}
        {(skills.length > 0 || targetRole) && (
          <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:10,marginBottom:14,flexWrap:'wrap',gap:8 }}>
            <User size={13} color="#818cf8" />
            <span style={{ fontSize:11,color:'#818cf8',fontWeight:600 }}>Evaluating against your profile:</span>
            {targetRole && <span style={{ fontSize:11,color:'var(--text-muted)',background:'var(--bg-elevated)',padding:'2px 8px',borderRadius:20 }}>🎯 {targetRole}</span>}
            {skills.slice(0,4).map(s => <span key={s} style={{ fontSize:11,color:'var(--text-muted)',background:'var(--bg-elevated)',padding:'2px 8px',borderRadius:20 }}>{s}</span>)}
            {skills.length > 4 && <span style={{ fontSize:11,color:'var(--text-muted)' }}>+{skills.length-4} more skills</span>}
          </div>
        )}
        <label style={{ fontSize:13,fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:8 }}>
          Paste Job Description
        </label>
        <textarea className="input" rows={8} placeholder="Paste the full job description here... Include requirements, responsibilities, company info, and any salary information for the most accurate evaluation."
          value={jd} onChange={e => setJd(e.target.value)} style={{ minHeight:180 }} />
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12 }}>
          <span style={{ fontSize:12,color:'var(--text-muted)' }}>{jd.length} characters {jd.length < 200 && jd.length > 0 ? '⚠️ Add more for accurate results' : ''}</span>
          <button className="btn-primary" onClick={evaluate} disabled={loading || !jd.trim()} style={{ minWidth:160,justifyContent:'center' }}>
            {loading ? <><div className="loader" style={{width:16,height:16}} /> Analyzing...</> : <><Brain size={16} /> Evaluate Job</>}
          </button>
        </div>
      </div>

      {/* Loading animation */}
      {loading && (
        <div className="glass animate-fade-in" style={{ padding:'40px',textAlign:'center',marginBottom:20 }}>
          <div style={{ display:'flex',justifyContent:'center',gap:10,marginBottom:16 }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ width:10,height:10,borderRadius:'50%',background:'#818cf8',animation:`pulse 1.4s ${i*0.15}s infinite` }} />
            ))}
          </div>
          <p style={{ fontSize:14,fontWeight:600,color:'var(--text-primary)',marginBottom:6 }}>Evaluating this job against your profile...</p>
          <p style={{ fontSize:12,color:'var(--text-muted)' }}>Scoring 10 dimensions — skills, culture, salary, ATS, and more</p>
          <style>{`@keyframes pulse{0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}`}</style>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-fade-in">
          {/* Overall score */}
          <div className="glass" style={{ padding:'24px',marginBottom:16,background:'var(--bg-surface)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16 }}>
              <div>
                <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:8 }}>
                  <div style={{
                    width:72,height:72,borderRadius:20,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',
                    background: result.grade==='A'?'rgba(16,185,129,0.15)':result.grade==='B'?'rgba(99,102,241,0.15)':result.grade==='C'?'rgba(245,158,11,0.15)':'rgba(239,68,68,0.15)',
                    border:`2px solid ${result.grade==='A'?'#10b981':result.grade==='B'?'#818cf8':result.grade==='C'?'#f59e0b':'#ef4444'}`,
                  }}>
                    <span style={{ fontSize:28,fontWeight:900,color:result.grade==='A'?'#10b981':result.grade==='B'?'#818cf8':result.grade==='C'?'#f59e0b':'#ef4444' }}>{result.grade}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:22,fontWeight:800 }}>{result.overallScore?.toFixed(1)}<span style={{ fontSize:14,color:'var(--text-muted)' }}>/5.0</span></div>
                    <div style={{ fontSize:14,color:'var(--text-secondary)' }}>Overall Match Score</div>
                  </div>
                </div>
                <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.6,maxWidth:400 }}>{result.summary}</p>
              </div>

              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                <div style={{ padding:'12px 20px',borderRadius:12,textAlign:'center',
                  background: result.recommendation==='Apply'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.1)',
                  border: `1px solid ${result.recommendation==='Apply'?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.2)'}` }}>
                  {result.recommendation==='Apply'
                    ? <><CheckCircle size={20} color="#10b981" /><div style={{fontSize:14,fontWeight:700,color:'#10b981',marginTop:4}}>Recommended: Apply</div></>
                    : <><XCircle size={20} color="#ef4444" /><div style={{fontSize:14,fontWeight:700,color:'#ef4444',marginTop:4}}>Recommendation: Skip</div></>
                  }
                </div>
                {!saved && (
                  <button className="btn-secondary" onClick={trackApplication} style={{ fontSize:12,padding:'8px 14px' }}>
                    <Plus size={14} /> Add to Tracker
                  </button>
                )}
                {saved && <span style={{ fontSize:12,color:'#10b981',textAlign:'center' }}>✓ Saved to tracker</span>}
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
            <div className="glass" style={{ padding:'16px' }}>
              <h4 style={{ fontSize:13,fontWeight:700,color:'#10b981',marginBottom:10 }}>✅ Strong Matches</h4>
              {result.strongMatches?.map(m => <div key={m} style={{ fontSize:12,color:'var(--text-secondary)',padding:'4px 0',borderBottom:'1px solid var(--border)' }}>• {m}</div>)}
            </div>
            <div className="glass" style={{ padding:'16px' }}>
              <h4 style={{ fontSize:13,fontWeight:700,color:'#f59e0b',marginBottom:10 }}>⚠️ Skills to Bridge</h4>
              {result.missingSkills?.map(m => <div key={m} style={{ fontSize:12,color:'var(--text-secondary)',padding:'4px 0',borderBottom:'1px solid var(--border)' }}>• {m}</div>)}
            </div>
          </div>

          {/* 10 Dimensions */}
          <div className="glass" style={{ padding:'20px' }}>
            <h3 style={{ fontSize:15,fontWeight:700,marginBottom:16 }}>10-Dimension Breakdown</h3>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {DIMENSIONS.map(({ key, label }) => {
                const dim = result.dimensions?.[key];
                if (!dim) return null;
                return (
                  <div key={key} style={{ borderBottom:'1px solid var(--border)',paddingBottom:12 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,cursor:'pointer' }}
                      onClick={() => toggleDim(key)}>
                      <span style={{ fontSize:13,fontWeight:600 }}>{label}</span>
                      {expanded[key] ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                    </div>
                    <ScoreBar score={dim.score} />
                    {expanded[key] && (
                      <p style={{ fontSize:12,color:'var(--text-muted)',marginTop:8,lineHeight:1.6,padding:'8px',background:'var(--bg-elevated)',borderRadius:8 }}>
                        {dim.reasoning}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
