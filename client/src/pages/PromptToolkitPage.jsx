import { useState } from 'react';
import api from '../services/api';
import { Wand2, Copy, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TOOLS = [
  { id:'resume-positioning',   icon:'📄', label:'Resume Positioning',        cat:'CV',          fields:[{k:'targetRole',l:'Target Role'},{k:'experience',l:'Current Experience',ta:true},{k:'achievements',l:'Key Achievements',ta:true}] },
  { id:'cover-letter',         icon:'✉️', label:'Cover Letter',               cat:'CV',          fields:[{k:'role',l:'Role'},{k:'company',l:'Company'},{k:'background',l:'Your Background',ta:true},{k:'sellingPoints',l:'Key Selling Points',ta:true}] },
  { id:'personal-pitch',       icon:'🎤', label:'Personal Pitch (60s)',       cat:'Branding',    fields:[{k:'name',l:'Your Name'},{k:'targetRole',l:'Target Role'},{k:'background',l:'Background',ta:true},{k:'strengths',l:'Key Strengths'}] },
  { id:'linkedin-upgrade',     icon:'💼', label:'LinkedIn Profile Upgrade',   cat:'Branding',    fields:[{k:'targetRole',l:'Target Role'},{k:'currentHeadline',l:'Current Headline'},{k:'currentAbout',l:'Current About',ta:true},{k:'industry',l:'Industry'}] },
  { id:'interview-kit',        icon:'❓', label:'Interview Readiness Kit',    cat:'Interview',   fields:[{k:'role',l:'Role'},{k:'company',l:'Company'},{k:'background',l:'Your Background',ta:true}] },
  { id:'behavioral-stories',   icon:'⭐', label:'Behavioral Story Builder',   cat:'Interview',   fields:[{k:'name',l:'Your Name'},{k:'targetRole',l:'Target Role'},{k:'background',l:'Background',ta:true},{k:'themes',l:'Themes (e.g. leadership, conflict)'}] },
  { id:'compensation-strategy',icon:'💰', label:'Compensation Strategy',      cat:'Negotiation', fields:[{k:'role',l:'Role'},{k:'company',l:'Company'},{k:'currentSalary',l:'Current Salary (₹)'},{k:'targetSalary',l:'Target Salary (₹)'},{k:'competingOffer',l:'Competing Offer (if any)'}] },
  { id:'company-intel',        icon:'🏢', label:'Company Intelligence Brief', cat:'Research',    fields:[{k:'company',l:'Company Name'},{k:'role',l:'Role Applying For'}] },
  { id:'networking-outreach',  icon:'🤝', label:'Networking Outreach',        cat:'Networking',  fields:[{k:'targetName',l:'Target Person Name'},{k:'company',l:'Their Company'},{k:'senderBackground',l:'Your Background',ta:true},{k:'purpose',l:'Purpose of Outreach'}] },
  { id:'skill-gap',            icon:'🎯', label:'Skill Gap Identifier',       cat:'Strategy',    fields:[{k:'targetRole',l:'Target Role'},{k:'currentSkills',l:'Your Current Skills (comma-separated)'},{k:'jobDescription',l:'Job Description (optional)',ta:true}] },
  { id:'portfolio-enhancer',   icon:'🖼️', label:'Portfolio Value Enhancer',   cat:'CV',          fields:[{k:'targetRole',l:'Target Role'},{k:'projects',l:'Your Projects (describe each)',ta:true}] },
  { id:'mock-interview',       icon:'🎭', label:'Mock Interview Simulator',   cat:'Interview',   fields:[{k:'role',l:'Role'},{k:'question',l:'Interview Question'},{k:'answer',l:'Your Answer',ta:true}] },
  { id:'career-direction',     icon:'🧭', label:'Career Direction Planner',   cat:'Strategy',    fields:[{k:'background',l:'Your Background',ta:true},{k:'skills',l:'Key Skills'},{k:'interests',l:'Interests/Passions'}] },
  { id:'job-search-system',    icon:'📋', label:'Job Search System Builder',  cat:'Strategy',    fields:[{k:'name',l:'Your Name'},{k:'targetRole',l:'Target Role'},{k:'hoursPerWeek',l:'Hours/Week Available'},{k:'targetApplications',l:'Target Applications'}] },
  { id:'personal-brand',       icon:'📣', label:'Personal Brand Builder',     cat:'Branding',    fields:[{k:'name',l:'Your Name'},{k:'industry',l:'Industry'},{k:'targetAudience',l:'Target Audience'},{k:'goals',l:'Goals'}] },
  { id:'confidence-coach',     icon:'🧠', label:'Confidence & Mindset Coach', cat:'Mindset',     fields:[{k:'fears',l:'Main Fears / Anxieties',ta:true},{k:'interviewType',l:'Interview Type (tech/HR/case)'}] },
  { id:'follow-up-writer',     icon:'📬', label:'Follow-Up Strategy Writer',  cat:'Interview',   fields:[{k:'role',l:'Role'},{k:'company',l:'Company'},{k:'interviewerName',l:'Interviewer Name'},{k:'highlights',l:'Interview Highlights',ta:true},{k:'daysSince',l:'Days Since Interview'}] },
  { id:'gap-reframer',         icon:'⏸️', label:'Career Gap Reframer',        cat:'Strategy',    fields:[{k:'gapPeriod',l:'Gap Period (e.g. Jan-Dec 2023)'},{k:'reason',l:'Reason for Gap'},{k:'activities',l:'What You Did During Gap',ta:true},{k:'targetRole',l:'Target Role'}] },
  { id:'strength-positioning', icon:'💪', label:'Strength Positioning Coach', cat:'Branding',    fields:[{k:'name',l:'Your Name'},{k:'targetRole',l:'Target Role'},{k:'background',l:'Your Background',ta:true}] },
  { id:'offer-analyzer',       icon:'⚖️', label:'Offer Decision Analyzer',    cat:'Negotiation', fields:[{k:'offers',l:'Offers (JSON or describe each)',ta:true},{k:'priorities',l:'Your Priorities (salary, WLB, growth...)'}] },
];

const CATS = ['All', 'CV', 'Branding', 'Interview', 'Negotiation', 'Research', 'Networking', 'Strategy', 'Mindset'];

const catColors = { CV:'#6366f1', Branding:'#8b5cf6', Interview:'#06b6d4', Negotiation:'#10b981', Research:'#f59e0b', Networking:'#ec4899', Strategy:'#f97316', Mindset:'#a78bfa' };

export default function PromptToolkitPage() {
  const { user } = useAuth();
  const [cat, setCat] = useState('All');
  const [active, setActive] = useState(null);
  const [inputs, setInputs] = useState({});
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const filtered = cat === 'All' ? TOOLS : TOOLS.filter(t => t.cat === cat);

  const openTool = (tool) => {
    setActive(tool); setOutput(''); setInputs({});
    // pre-fill name
    if (tool.fields.some(f => f.k === 'name')) setInputs(i => ({...i, name: user?.name || ''}));
  };

  const runTool = async () => {
    setLoading(true); setOutput('');
    try {
      const { data } = await api.post('/tools/run', { toolId: active.id, toolName: active.label, inputs });
      setOutput(data.output);
    } catch (err) { toast.error(err.response?.data?.message || 'Tool failed'); }
    finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding:'28px 32px', maxWidth:1100, margin:'0 auto' }}>
      <div style={{ marginBottom:24 }} className="animate-fade-in">
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
          <Wand2 size={18} color="#818cf8" />
          <span style={{ fontSize:12,color:'#818cf8',fontWeight:600,letterSpacing:1 }}>MODULE 4 — AI PROMPT TOOLKIT</span>
        </div>
        <h1 style={{ fontFamily:'Plus Jakarta Sans',fontSize:26,fontWeight:800,marginBottom:4 }}>AI Career Toolkit</h1>
        <p style={{ color:'var(--text-secondary)',fontSize:14 }}>20 powerful AI tools to supercharge every stage of your job search</p>
      </div>

      {/* Category filter */}
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20 }} className="animate-fade-in">
        {CATS.map(c => (
          <button key={c} type="button" onClick={() => setCat(c)}
            style={{ padding:'6px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.2s',
              background:cat===c?'rgba(99,102,241,0.2)':'var(--bg-elevated)',
              borderColor:cat===c?'#6366f1':'var(--border)',
              color:cat===c?'#818cf8':'var(--text-secondary)'
            }}>{c}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: active ? '280px 1fr' : 'repeat(4,1fr)', gap:16, transition:'all 0.3s' }}>
        {/* Tool cards */}
        <div style={{ display: active ? 'flex' : 'contents', flexDirection:'column', gap:10 }}>
          {filtered.map(tool => (
            <div key={tool.id}
              className="glass"
              onClick={() => active?.id === tool.id ? setActive(null) : openTool(tool)}
              style={{ padding: active ? '12px 14px' : '18px', cursor:'pointer', transition:'all 0.2s',
                borderColor: active?.id===tool.id ? '#6366f1' : 'var(--border)',
                background: active?.id===tool.id ? 'rgba(99,102,241,0.1)' : undefined,
              }}
              onMouseEnter={e => { if(active?.id!==tool.id) e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { if(active?.id!==tool.id) e.currentTarget.style.borderColor='var(--border)'; }}>
              <div style={{ display:'flex', alignItems: active ? 'center' : 'flex-start', gap: 10 }}>
                <span style={{ fontSize: active ? 18 : 24 }}>{tool.icon}</span>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:'var(--text-primary)' }}>{tool.label}</div>
                  {!active && (
                    <span style={{ display:'inline-block',marginTop:4,padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,
                      background:`${catColors[tool.cat]}22`,color:catColors[tool.cat] }}>{tool.cat}</span>
                  )}
                </div>
                {active && (active?.id===tool.id ? <ChevronUp size={14} color="#818cf8" /> : <ChevronDown size={14} color="var(--text-muted)" />)}
              </div>
            </div>
          ))}
        </div>

        {/* Active tool panel */}
        {active && (
          <div className="glass animate-fade-in" style={{ padding:'24px', height:'fit-content' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16, alignItems:'center' }}>
              <div>
                <span style={{ fontSize:20 }}>{active.icon}</span>
                <h3 style={{ fontSize:16, fontWeight:700, marginTop:4 }}>{active.label}</h3>
              </div>
              <button className="btn-ghost" onClick={() => setActive(null)} style={{ fontSize:12 }}>✕ Close</button>
            </div>

            {/* Fields */}
            <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:16 }}>
              {active.fields.map(f => (
                <div key={f.k}>
                  <label style={{ fontSize:12,fontWeight:500,color:'var(--text-secondary)',display:'block',marginBottom:4 }}>{f.l}</label>
                  {f.ta
                    ? <textarea className="input" rows={3} value={inputs[f.k]||''} onChange={e => setInputs(i => ({...i,[f.k]:e.target.value}))} />
                    : <input className="input" value={inputs[f.k]||''} onChange={e => setInputs(i => ({...i,[f.k]:e.target.value}))} />
                  }
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={runTool} disabled={loading} style={{ width:'100%',justifyContent:'center',padding:'10px' }}>
              {loading ? <><div className="loader" style={{width:16,height:16}} /> Generating...</> : <><Sparkles size={15} /> Generate with AI</>}
            </button>

            {output && (
              <div style={{ marginTop:16 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                  <span style={{ fontSize:12,fontWeight:600,color:'var(--text-muted)' }}>AI OUTPUT</span>
                  <button className="btn-ghost" onClick={copy} style={{ padding:'4px 10px',fontSize:12 }}>
                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <div style={{ background:'var(--bg-elevated)',borderRadius:12,padding:'16px',maxHeight:400,overflowY:'auto',border:'1px solid var(--border)' }}>
                  <pre style={{ whiteSpace:'pre-wrap',fontSize:13,lineHeight:1.7,color:'var(--text-secondary)',fontFamily:'Inter,sans-serif' }}>
                    {output}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
