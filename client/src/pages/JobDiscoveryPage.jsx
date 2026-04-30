import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Building, DollarSign, ExternalLink, Bookmark, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const fmtSalary = (min, max) => {
  const f = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n?.toLocaleString()}`;
  if (!min && !max) return 'Salary not disclosed';
  if (min && max) return `${f(min)} – ${f(max)}`;
  return min ? `From ${f(min)}` : `Up to ${f(max)}`;
};

const GradeBadge = ({ grade, score }) => (
  <span className={`grade-${grade || 'C'}`} style={{ padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700 }}>
    {grade || 'C'} {score?.toFixed(1)}/5
  </span>
);

const JobCard = ({ job, onTrack }) => {
  const [expanded, setExpanded] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [readiness, setReadiness] = useState(null);
  const [showReadiness, setShowReadiness] = useState(false);

  const handleReadyCheck = async () => {
    if (readiness) { setShowReadiness(v => !v); return; }
    if (!job.description || job.description.length < 50) {
      toast.error('Not enough job description to analyse'); return;
    }
    setCheckLoading(true);
    try {
      const { data } = await api.post('/ai/ready-check', { jobDescription: job.description });
      setReadiness(data.result);
      setShowReadiness(true);
    } catch { toast.error('Could not run check'); }
    finally { setCheckLoading(false); }
  };

  const verdictBg = readiness?.verdictColor === 'green' ? 'rgba(16,185,129,0.08)'
    : readiness?.verdictColor === 'yellow' ? 'rgba(245,158,11,0.08)'
    : 'rgba(239,68,68,0.08)';
  const verdictBorder = readiness?.verdictColor === 'green' ? 'rgba(16,185,129,0.25)'
    : readiness?.verdictColor === 'yellow' ? 'rgba(245,158,11,0.25)'
    : 'rgba(239,68,68,0.25)';
  const verdictColor = readiness?.verdictColor === 'green' ? '#10b981'
    : readiness?.verdictColor === 'yellow' ? '#f59e0b'
    : '#ef4444';

  return (
    <div className="glass animate-fade-in" style={{ padding:'20px',transition:'transform 0.2s,box-shadow 0.2s',marginBottom:12 }}
      onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
      onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
      <div style={{ display:'flex',gap:14,alignItems:'flex-start' }}>
        {/* Logo */}
        <div style={{ width:48,height:48,borderRadius:12,background:'var(--bg-elevated)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden' }}>
          {job.companyLogo
            ? <img src={job.companyLogo} alt={job.company} style={{ width:36,height:36,objectFit:'contain' }} onError={e => e.target.style.display='none'} />
            : <Building size={22} color="var(--text-muted)" />}
        </div>

        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8 }}>
            <div>
              <h3 style={{ fontSize:15,fontWeight:700,color:'var(--text-primary)',marginBottom:3 }}>{job.title}</h3>
              <p style={{ fontSize:13,color:'var(--text-secondary)',fontWeight:500 }}>{job.company}</p>
            </div>
            <GradeBadge grade={job.matchGrade} score={job.matchScore} />
          </div>

          <div style={{ display:'flex',flexWrap:'wrap',gap:12,marginTop:8,fontSize:12,color:'var(--text-muted)' }}>
            <span style={{ display:'flex',alignItems:'center',gap:4 }}><MapPin size={12} />{job.location || 'Location N/A'}</span>
            <span style={{ display:'flex',alignItems:'center',gap:4 }}><DollarSign size={12} />{fmtSalary(job.salaryMin, job.salaryMax)}</span>
            <span className={`chip ${job.locationType==='remote'?'chip-green':job.locationType==='hybrid'?'chip-yellow':''}`} style={{ fontSize:11 }}>
              {job.locationType}
            </span>
            <span className="chip" style={{ fontSize:11 }}>{job.jobType}</span>
          </div>

          {/* Skills */}
          <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginTop:10 }}>
            {job.skills?.slice(0,6).map(s => <span key={s} className="chip" style={{ fontSize:11 }}>{s}</span>)}
            {job.skills?.length > 6 && <span style={{ fontSize:11,color:'var(--text-muted)',padding:'3px 0' }}>+{job.skills.length-6} more</span>}
          </div>

          {/* Expanded description */}
          {expanded && (
            <div style={{ marginTop:12,padding:'12px',background:'var(--bg-elevated)',borderRadius:10,fontSize:13,color:'var(--text-secondary)',lineHeight:1.6 }}>
              {job.description}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex',gap:8,marginTop:14,alignItems:'center',flexWrap:'wrap' }}>
            {job.applyUrl && (
              <a href={job.applyUrl} target="_blank" rel="noreferrer noopener" className="btn-primary" style={{ padding:'7px 14px',fontSize:12,textDecoration:'none' }}>
                {job.sourcePortal === 'Adzuna' ? 'View Job' : 'Apply Now'} <ExternalLink size={12} />
              </a>
            )}
            {/* Fallback: always provide a Google Jobs search link */}
            <a href={`https://www.google.com/search?q=${encodeURIComponent(`${job.title} ${job.company} job`)}+site:linkedin.com+OR+site:naukri.com+OR+site:indeed.co.in`}
              target="_blank" rel="noreferrer noopener"
              style={{ padding:'7px 12px',fontSize:12,textDecoration:'none',color:'var(--text-muted)',border:'1px solid var(--border)',borderRadius:8,display:'flex',alignItems:'center',gap:5,transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#6366f1'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
              title="Search this job on LinkedIn, Naukri, Indeed">
              🔍 Find on Job Sites
            </a>
            <button className="btn-secondary" onClick={() => onTrack(job)} style={{ padding:'7px 14px',fontSize:12 }}>
              <Bookmark size={12} /> Track
            </button>
            <button className="btn-ghost" onClick={handleReadyCheck} disabled={checkLoading}
              style={{ padding:'7px 12px',fontSize:12,color: readiness ? verdictColor : undefined }}
              title="Check if you are ready for this job">
              {checkLoading ? <><div className="loader" style={{width:12,height:12}} /> Checking...</>
                : <><ShieldCheck size={12} /> {readiness ? readiness.readinessScore+'% Ready' : 'Am I Ready?'}</> }
            </button>
            <button className="btn-ghost" onClick={() => setExpanded(!expanded)} style={{ padding:'7px 12px',fontSize:12 }}>
              <ChevronDown size={12} style={{ transform:expanded?'rotate(180deg)':'none',transition:'transform 0.2s' }} /> Details
            </button>
            {job.shouldSkip && (
              <span style={{ fontSize:11,color:'#f59e0b',display:'flex',alignItems:'center',gap:3,marginLeft:'auto' }}>
                ⚡ Low match — consider skipping
              </span>
            )}
          </div>

          {/* Am I Ready? Result Panel */}
          {showReadiness && readiness && (
            <div className="animate-fade-in" style={{ marginTop:14,padding:'16px',background:verdictBg,borderRadius:12,border:`1px solid ${verdictBorder}` }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ position:'relative',width:52,height:52 }}>
                    <svg viewBox="0 0 36 36" style={{ width:52,height:52,transform:'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-elevated)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke={verdictColor} strokeWidth="3"
                        strokeDasharray={`${(readiness.readinessScore/100)*100.5} 100.5`} strokeLinecap="round" />
                    </svg>
                    <span style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:11,fontWeight:800,color:verdictColor }}>{readiness.readinessScore}%</span>
                  </div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:800,color:verdictColor }}>{readiness.verdict}</div>
                    <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:2 }}>{readiness.applyAdvice}</div>
                  </div>
                </div>
                <button className="btn-ghost" onClick={() => setShowReadiness(false)} style={{ fontSize:12,padding:'4px 8px' }}>✕</button>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                {readiness.matchedRequirements?.length > 0 && (
                  <div>
                    <div style={{ fontSize:11,fontWeight:700,color:'#10b981',marginBottom:5 }}>✅ You have</div>
                    {readiness.matchedRequirements.slice(0,3).map(r => <div key={r} style={{ fontSize:11,color:'var(--text-secondary)',padding:'2px 0' }}>• {r}</div>)}
                  </div>
                )}
                {readiness.missingRequirements?.length > 0 && (
                  <div>
                    <div style={{ fontSize:11,fontWeight:700,color:'#f59e0b',marginBottom:5 }}>⚠️ Missing</div>
                    {readiness.missingRequirements.slice(0,3).map(r => <div key={r} style={{ fontSize:11,color:'var(--text-secondary)',padding:'2px 0' }}>• {r}</div>)}
                  </div>
                )}
              </div>
              {readiness.quickWins?.length > 0 && (
                <div style={{ marginTop:10,padding:'8px 10px',background:'rgba(99,102,241,0.06)',borderRadius:8,border:'1px solid rgba(99,102,241,0.1)' }}>
                  <div style={{ fontSize:11,fontWeight:700,color:'#818cf8',marginBottom:4 }}>🚀 Quick Wins</div>
                  {readiness.quickWins.slice(0,2).map(w => <div key={w} style={{ fontSize:11,color:'var(--text-muted)',padding:'2px 0' }}>→ {w}</div>)}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default function JobDiscoveryPage() {
  const { user } = useAuth();
  const userSkillNames = (user?.profile?.skills || []).map(s => s.name || s);
  const userTargetRoles = user?.profile?.targetRoles || [];

  // Auto-build a smart default query from user's profile
  const defaultQuery = userTargetRoles[0] || userSkillNames.slice(0, 2).join(' ') || '';
  const isPersonalised = !!defaultQuery;

  const [filters, setFilters] = useState({ q: defaultQuery, location: '', locationType: '', jobType: '', minMatch: '' });
  const [applied, setApplied] = useState({ q: defaultQuery, location: '', locationType: '', jobType: '', minMatch: '' });
  const [showHigh, setShowHigh] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Re-init when user profile loads
  useEffect(() => {
    if (user && !hasSearched) {
      const q = userTargetRoles[0] || userSkillNames.slice(0, 2).join(' ') || '';
      setFilters(f => ({ ...f, q }));
      setApplied(f => ({ ...f, q }));
    }
  }, [user?.profile]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', applied],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(applied).forEach(([k, v]) => { if (v) params.set(k, v); });
      if (showHigh) params.set('minMatch', '4');
      return api.get(`/jobs?${params}`).then(r => r.data);
    },
  });

  const handleTrack = async (job) => {
    try {
      await api.post('/applications', { job: job._id, jobTitle: job.title, company: job.company, matchScore: job.matchScore, matchGrade: job.matchGrade });
      toast.success(`${job.title} added to tracker!`);
    } catch { toast.error('Could not add to tracker'); }
  };

  const jobs = data?.jobs || [];
  const total = data?.total || 0;

  return (
    <div style={{ padding:'28px 32px', maxWidth:900, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Search size={18} color="#818cf8" />
          <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, letterSpacing: 1 }}>MODULE 1 — JOB DISCOVERY</span>
        </div>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Find Your Perfect Job</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {isPersonalised
            ? <><Sparkles size={13} style={{ verticalAlign: 'middle', color: '#818cf8' }} /> Showing jobs matched to your profile — {userSkillNames.slice(0, 3).join(', ')}</>
            : 'Smart skills-based matching — not just keywords'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass" style={{ padding:'16px',marginBottom:16 }} className="animate-fade-in">
        <div style={{ display:'flex',gap:10 }}>
          <div style={{ flex:1,position:'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)' }} />
            <input className="input" placeholder="Search roles, skills, companies..." value={filters.q}
              onChange={e => setFilters(f => ({...f,q:e.target.value}))}
              onKeyDown={e => e.key==='Enter' && setApplied(filters)}
              style={{ paddingLeft:36 }} />
          </div>
          <div style={{ width:200 }}>
            <div style={{ position:'relative' }}>
              <MapPin size={14} color="var(--text-muted)" style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)' }} />
              <input className="input" placeholder="Location" value={filters.location}
                onChange={e => setFilters(f => ({...f,location:e.target.value}))}
                onKeyDown={e => e.key==='Enter' && setApplied(filters)}
                style={{ paddingLeft:30 }} />
            </div>
          </div>
          <button className="btn-primary" onClick={() => setApplied(filters)} style={{ flexShrink:0 }}>
            <Search size={15} /> Search
          </button>
        </div>

        {/* Filters row */}
        <div style={{ display:'flex',gap:10,marginTop:10,flexWrap:'wrap',alignItems:'center' }}>
          <select className="input" value={filters.locationType} onChange={e => { setFilters(f=>({...f,locationType:e.target.value})); setApplied(f=>({...f,locationType:e.target.value})); }}
            style={{ width:'auto',flex:'0 0 auto',minWidth:120,fontSize:12 }}>
            <option value="">All Work Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
          <select className="input" value={filters.jobType} onChange={e => { setFilters(f=>({...f,jobType:e.target.value})); setApplied(f=>({...f,jobType:e.target.value})); }}
            style={{ width:'auto',flex:'0 0 auto',minWidth:130,fontSize:12 }}>
            <option value="">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
          <label style={{ display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:13,color:'var(--text-secondary)' }}>
            <input type="checkbox" checked={showHigh} onChange={e => setShowHigh(e.target.checked)}
              style={{ accentColor:'#6366f1' }} />
            High match only (≥4.0)
          </label>
          <div style={{ marginLeft:'auto',fontSize:12,color:'var(--text-muted)' }}>
            {total} jobs found
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:160,borderRadius:16 }} />)}
        </div>
      )}

      {error && (
        <div style={{ textAlign:'center',padding:'48px',color:'var(--text-muted)' }}>
          <p>Could not load jobs. Make sure the server is running.</p>
        </div>
      )}

      {!isLoading && jobs.length === 0 && !error && (
        <div style={{ textAlign:'center',padding:'60px',color:'var(--text-muted)' }}>
          <Search size={48} style={{ opacity:0.2,marginBottom:12 }} />
          <p style={{ fontSize:16,fontWeight:600,marginBottom:4 }}>No jobs found</p>
          <p style={{ fontSize:13 }}>Try adjusting your filters or search terms</p>
        </div>
      )}

      {jobs.map(job => <JobCard key={job._id} job={job} onTrack={handleTrack} />)}
    </div>
  );
}
