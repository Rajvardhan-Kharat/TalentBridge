import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Map, BookOpen, ExternalLink, ChevronDown, ChevronUp, Sparkles, Clock, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const typeColors = { YouTube: '#ef4444', Docs: '#6366f1', Course: '#10b981', Book: '#f59e0b', default: '#8b5cf6' };

export default function LearningRoadmapPage() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState(
    user?.profile?.targetRoles?.[0] || user?.profile?.currentTitle || ''
  );
  const [weeks, setWeeks] = useState(8);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [openPhase, setOpenPhase] = useState(0);

  const skills = (user?.profile?.skills || []).map(s => s.name || s);

  const generate = async () => {
    if (!targetRole.trim()) { toast.error('Please enter a target role'); return; }
    setLoading(true); setRoadmap(null);
    try {
      const { data } = await api.post('/ai/learning-roadmap', { targetRole, timelineWeeks: weeks });
      setRoadmap(data.roadmap);
      setOpenPhase(0);
      toast.success('Your personalised roadmap is ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate roadmap');
    } finally { setLoading(false); }
  };

  const phaseColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Map size={18} color="#818cf8" />
          <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, letterSpacing: 1 }}>FREE LEARNING ROADMAP</span>
        </div>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Your Learning Roadmap</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Get a free, week-by-week study plan built specifically for your target role — only free resources
        </p>
      </div>

      {/* Input Panel */}
      <div className="glass animate-fade-in" style={{ padding: '24px', marginBottom: 24 }}>
        {skills.length > 0 && (
          <div style={{ padding: '8px 12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, marginBottom: 16, fontSize: 11, color: '#818cf8' }}>
            🎯 Building roadmap based on your existing skills: <strong>{skills.slice(0, 4).join(', ')}{skills.length > 4 ? ` +${skills.length - 4} more` : ''}</strong>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              What role do you want to get? *
            </label>
            <input className="input" value={targetRole} onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Developer, Data Analyst, DevOps Engineer..."
              onKeyDown={e => e.key === 'Enter' && generate()} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Weeks</label>
            <select className="input" value={weeks} onChange={e => setWeeks(Number(e.target.value))} style={{ width: 90 }}>
              {[4, 6, 8, 12, 16].map(w => <option key={w} value={w}>{w} wks</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={generate} disabled={loading || !targetRole.trim()} style={{ height: 42, whiteSpace: 'nowrap' }}>
            {loading ? <><div className="loader" style={{ width: 16, height: 16 }} /> Generating...</> : <><Sparkles size={15} /> Build Roadmap</>}
          </button>
        </div>
      </div>

      {/* Loading animation */}
      {loading && (
        <div className="glass animate-fade-in" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            {phaseColors.map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, animation: `bounce 1.4s ${i * 0.15}s infinite` }} />
            ))}
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Building your personalised {weeks}-week roadmap...</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Selecting the best FREE resources for {targetRole}</p>
          <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}}`}</style>
        </div>
      )}

      {/* Roadmap Result */}
      {roadmap && !loading && (
        <div className="animate-fade-in">

          {/* Overview banner */}
          <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Target size={18} color="#818cf8" />
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{roadmap.targetRole}</span>
                  <span style={{ fontSize: 11, color: '#818cf8', padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', fontWeight: 600 }}>
                    {roadmap.totalWeeks} weeks
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{roadmap.overview}</p>
              </div>
              <div style={{ flexShrink: 0, padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, textAlign: 'center', minWidth: 120 }}>
                <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginBottom: 4 }}>OUTCOME</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{roadmap.finalOutcome}</div>
              </div>
            </div>
          </div>

          {/* Phase timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {(roadmap.phases || []).map((phase, idx) => {
              const color = phaseColors[idx % phaseColors.length];
              const isOpen = openPhase === idx;
              return (
                <div key={idx} style={{ borderRadius: 14, border: `1px solid ${isOpen ? color : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  {/* Phase header */}
                  <div onClick={() => setOpenPhase(isOpen ? -1 : idx)}
                    style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isOpen ? `${color}10` : 'var(--bg-elevated)', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{phase.title}</div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> {phase.weeks}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{phase.focus}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {(phase.skills || []).slice(0, 3).map(s => (
                          <span key={s} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: `${color}18`, color, fontWeight: 600 }}>{s}</span>
                        ))}
                      </div>
                      {isOpen ? <ChevronUp size={16} color={color} /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Phase body */}
                  {isOpen && (
                    <div style={{ padding: '20px', background: 'var(--bg-surface)', borderTop: `1px solid ${color}20` }}>
                      {/* Resources */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <BookOpen size={13} /> FREE RESOURCES
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(phase.resources || []).map((res, ri) => {
                            const tc = typeColors[res.type] || typeColors.default;
                            return (
                              <a key={ri} href={res.url} target="_blank" rel="noreferrer noopener"
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = tc; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: `${tc}18`, color: tc, fontWeight: 700, flexShrink: 0 }}>{res.type}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{res.title}</span>
                                {res.duration && <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{res.duration}</span>}
                                <ExternalLink size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                              </a>
                            );
                          })}
                        </div>
                      </div>

                      {/* Milestone */}
                      {phase.milestone && (
                        <div style={{ padding: '10px 14px', background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Zap size={14} color={color} />
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color, marginRight: 6 }}>MILESTONE:</span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{phase.milestone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pro Tips */}
          {roadmap.proTips?.length > 0 && (
            <div className="glass" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={15} color="#f59e0b" /> Pro Tips to Stay on Track
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {roadmap.proTips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
