import { useState } from 'react';
import api from '../services/api';
import { Wand2, Copy, Check, ChevronDown, ChevronUp, Sparkles, Download, RefreshCw, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TOOLS = [
  { id:'resume-positioning',   icon:'📄', label:'Resume Positioning',        cat:'CV',          fields:[{k:'targetRole',l:'Target Role',ph:'e.g. Senior Frontend Developer'},{k:'experience',l:'Current Experience',ta:true,ph:'Describe your current role and responsibilities...'},{k:'achievements',l:'Key Achievements',ta:true,ph:'e.g. Led team of 5, reduced load time by 40%...'}] },
  { id:'cover-letter',         icon:'✉️', label:'Cover Letter',               cat:'CV',          fields:[{k:'role',l:'Role Applying For',ph:'e.g. Product Manager'},{k:'company',l:'Company Name',ph:'e.g. Google'},{k:'background',l:'Your Background',ta:true,ph:'Brief career summary...'},{k:'sellingPoints',l:'Key Selling Points',ta:true,ph:'Why you are the best fit...'}] },
  { id:'personal-pitch',       icon:'🎤', label:'Personal Pitch (60s)',       cat:'Branding',    fields:[{k:'name',l:'Your Name',ph:'Your full name'},{k:'targetRole',l:'Target Role',ph:'e.g. Data Scientist'},{k:'background',l:'Background',ta:true,ph:'Your experience summary...'},{k:'strengths',l:'Key Strengths',ph:'e.g. Python, ML, communication'}] },
  { id:'linkedin-upgrade',     icon:'💼', label:'LinkedIn Profile Upgrade',   cat:'Branding',    fields:[{k:'targetRole',l:'Target Role',ph:'e.g. Full Stack Developer'},{k:'currentHeadline',l:'Current Headline',ph:'Your current LinkedIn headline'},{k:'currentAbout',l:'Current About Section',ta:true,ph:'Paste your current LinkedIn about...'},{k:'industry',l:'Industry',ph:'e.g. SaaS, Fintech'}] },
  { id:'interview-kit',        icon:'❓', label:'Interview Readiness Kit',    cat:'Interview',   fields:[{k:'role',l:'Role',ph:'e.g. Backend Engineer'},{k:'company',l:'Company',ph:'e.g. Flipkart'},{k:'background',l:'Your Background',ta:true,ph:'Paste your resume summary or experience...'}] },
  { id:'behavioral-stories',   icon:'⭐', label:'Behavioral Story Builder',   cat:'Interview',   fields:[{k:'name',l:'Your Name',ph:'Your full name'},{k:'targetRole',l:'Target Role',ph:'e.g. Team Lead'},{k:'background',l:'Background',ta:true,ph:'Describe your career story...'},{k:'themes',l:'Themes',ph:'e.g. leadership, conflict resolution, failure'}] },
  { id:'compensation-strategy',icon:'💰', label:'Compensation Strategy',      cat:'Negotiation', fields:[{k:'role',l:'Role',ph:'e.g. Senior SDE'},{k:'company',l:'Company',ph:'e.g. Amazon'},{k:'currentSalary',l:'Current Salary (₹)',ph:'e.g. 12,00,000'},{k:'targetSalary',l:'Target Salary (₹)',ph:'e.g. 20,00,000'},{k:'competingOffer',l:'Competing Offer (if any)',ph:'e.g. 18L at Microsoft'}] },
  { id:'company-intel',        icon:'🏢', label:'Company Intelligence Brief', cat:'Research',    fields:[{k:'company',l:'Company Name',ph:'e.g. Zomato'},{k:'role',l:'Role Applying For',ph:'e.g. Product Analyst'}] },
  { id:'networking-outreach',  icon:'🤝', label:'Networking Outreach',        cat:'Networking',  fields:[{k:'targetName',l:'Target Person Name',ph:'e.g. Priya Sharma'},{k:'company',l:'Their Company',ph:'e.g. Razorpay'},{k:'senderBackground',l:'Your Background',ta:true,ph:'Your 2-3 line summary...'},{k:'purpose',l:'Purpose of Outreach',ph:'e.g. Referral, mentorship, collaboration'}] },
  { id:'skill-gap',            icon:'🎯', label:'Skill Gap Identifier',       cat:'Strategy',    fields:[{k:'targetRole',l:'Target Role',ph:'e.g. DevOps Engineer'},{k:'currentSkills',l:'Your Current Skills',ph:'e.g. Python, Docker, Linux'},{k:'jobDescription',l:'Job Description (optional)',ta:true,ph:'Paste a JD to get specific gaps...'}] },
  { id:'portfolio-enhancer',   icon:'🖼️', label:'Portfolio Value Enhancer',   cat:'CV',          fields:[{k:'targetRole',l:'Target Role',ph:'e.g. UI/UX Designer'},{k:'projects',l:'Your Projects',ta:true,ph:'Describe each project briefly, include tech used and impact...'}] },
  { id:'mock-interview',       icon:'🎭', label:'Mock Interview Simulator',   cat:'Interview',   fields:[{k:'role',l:'Role',ph:'e.g. Data Analyst'},{k:'question',l:'Interview Question',ph:'e.g. Tell me about a time you failed...'},{k:'answer',l:'Your Answer',ta:true,ph:'Write your answer attempt here...'}] },
  { id:'career-direction',     icon:'🧭', label:'Career Direction Planner',   cat:'Strategy',    fields:[{k:'background',l:'Your Background',ta:true,ph:'Degree, experience, certifications...'},{k:'skills',l:'Key Skills',ph:'e.g. Excel, SQL, Communication'},{k:'interests',l:'Interests/Passions',ph:'e.g. data, design, teaching'}] },
  { id:'job-search-system',    icon:'📋', label:'Job Search System Builder',  cat:'Strategy',    fields:[{k:'name',l:'Your Name',ph:'Your full name'},{k:'targetRole',l:'Target Role',ph:'e.g. Marketing Manager'},{k:'hoursPerWeek',l:'Hours/Week Available',ph:'e.g. 10'},{k:'targetApplications',l:'Target Applications',ph:'e.g. 5 per week'}] },
  { id:'personal-brand',       icon:'📣', label:'Personal Brand Builder',     cat:'Branding',    fields:[{k:'name',l:'Your Name',ph:'Your full name'},{k:'industry',l:'Industry',ph:'e.g. EdTech, Healthcare'},{k:'targetAudience',l:'Target Audience',ph:'e.g. Recruiters, startup founders'},{k:'goals',l:'Goals',ph:'e.g. Get hired, freelance, build authority'}] },
  { id:'confidence-coach',     icon:'🧠', label:'Confidence & Mindset Coach', cat:'Mindset',     fields:[{k:'fears',l:'Main Fears / Anxieties',ta:true,ph:'e.g. Imposter syndrome, rejection fear...'},{k:'interviewType',l:'Interview Type',ph:'e.g. Technical, HR, case study'}] },
  { id:'follow-up-writer',     icon:'📬', label:'Follow-Up Strategy Writer',  cat:'Interview',   fields:[{k:'role',l:'Role',ph:'e.g. Software Engineer'},{k:'company',l:'Company',ph:'e.g. Infosys'},{k:'interviewerName',l:'Interviewer Name',ph:'e.g. Rahul Mehta'},{k:'highlights',l:'Interview Highlights',ta:true,ph:'Key moments from the interview...'},{k:'daysSince',l:'Days Since Interview',ph:'e.g. 3'}] },
  { id:'gap-reframer',         icon:'⏸️', label:'Career Gap Reframer',        cat:'Strategy',    fields:[{k:'gapPeriod',l:'Gap Period',ph:'e.g. Jan–Dec 2023'},{k:'reason',l:'Reason for Gap',ph:'e.g. Health, family, upskilling'},{k:'activities',l:'What You Did',ta:true,ph:'Courses, projects, volunteering...'},{k:'targetRole',l:'Target Role',ph:'e.g. UX Researcher'}] },
  { id:'strength-positioning', icon:'💪', label:'Strength Positioning Coach', cat:'Branding',    fields:[{k:'name',l:'Your Name',ph:'Your full name'},{k:'targetRole',l:'Target Role',ph:'e.g. Project Manager'},{k:'background',l:'Your Background',ta:true,ph:'Career summary and key wins...'}] },
  { id:'offer-analyzer',       icon:'⚖️', label:'Offer Decision Analyzer',    cat:'Negotiation', fields:[{k:'offers',l:'Offers (describe each)',ta:true,ph:'Offer 1: Startup, ₹18L, remote, equity...\nOffer 2: MNC, ₹22L, hybrid, no equity...'},{k:'priorities',l:'Your Priorities',ph:'e.g. Salary > WLB > growth > brand'}] },
];

const CATS = ['All', 'CV', 'Branding', 'Interview', 'Negotiation', 'Research', 'Networking', 'Strategy', 'Mindset'];
const catColors = { CV:'#6366f1', Branding:'#8b5cf6', Interview:'#06b6d4', Negotiation:'#10b981', Research:'#f59e0b', Networking:'#ec4899', Strategy:'#f97316', Mindset:'#a78bfa' };

// ── Smart output renderer: converts markdown-like text into rich HTML ─────────
const RichOutput = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 8 }} />;

        // H1: ## or # or ALL CAPS line
        if (/^#{1,2}\s/.test(trimmed)) {
          const content = trimmed.replace(/^#{1,2}\s/, '');
          return (
            <div key={i} style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 12, marginBottom: 2, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
              {content}
            </div>
          );
        }
        // H2: ### heading
        if (/^###\s/.test(trimmed)) {
          return <div key={i} style={{ fontSize: 13, fontWeight: 700, color: '#818cf8', marginTop: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>{trimmed.replace(/^###\s/, '')}</div>;
        }
        // Bold key: text
        if (/^\*\*(.+?)\*\*:/.test(trimmed)) {
          const [, key, ...rest] = trimmed.match(/^\*\*(.+?)\*\*:(.*)/);
          return (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ color: '#818cf8', fontWeight: 700, minWidth: 120, flexShrink: 0 }}>{key}:</span>
              <span style={{ color: 'var(--text-secondary)' }}>{rest.join('').trim()}</span>
            </div>
          );
        }
        // Bullet
        if (/^[-•*]\s/.test(trimmed)) {
          return (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, padding: '2px 0' }}>
              <span style={{ color: '#818cf8', fontWeight: 700, marginTop: 2, flexShrink: 0 }}>▸</span>
              <span>{trimmed.replace(/^[-•*]\s/, '')}</span>
            </div>
          );
        }
        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          const [num, ...rest] = trimmed.split('. ');
          return (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              <span style={{ color: '#6366f1', fontWeight: 800, minWidth: 20, flexShrink: 0 }}>{num}.</span>
              <span>{rest.join('. ')}</span>
            </div>
          );
        }
        // Default paragraph
        return <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{trimmed}</p>;
      })}
    </div>
  );
};

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
    // Smart pre-fill from user profile
    const pre = {};
    if (tool.fields.some(f => f.k === 'name')) pre.name = user?.name || '';
    if (tool.fields.some(f => f.k === 'targetRole')) pre.targetRole = user?.profile?.targetRoles?.[0] || user?.profile?.currentTitle || '';
    if (tool.fields.some(f => f.k === 'industry')) pre.industry = user?.profile?.industry || user?.profile?.sector || '';
    if (tool.fields.some(f => f.k === 'currentSkills')) pre.currentSkills = (user?.profile?.skills || []).map(s => s.name || s).join(', ');
    setInputs(pre);
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
    toast.success('Copied to clipboard!');
  };

  const downloadTxt = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${active.label}.txt`; a.click();
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Wand2 size={18} color="#818cf8" />
          <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, letterSpacing: 1 }}>MODULE 4 — CAREER TOOLKIT</span>
        </div>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Career Toolkit</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {user?.name ? `Hi ${user.name.split(' ')[0]} — ` : ''}20 smart tools to supercharge every stage of your job search
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }} className="animate-fade-in">
        {CATS.map(c => (
          <button key={c} type="button" onClick={() => setCat(c)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: cat === c ? 'rgba(99,102,241,0.2)' : 'var(--bg-elevated)',
              borderColor: cat === c ? '#6366f1' : 'var(--border)',
              color: cat === c ? '#818cf8' : 'var(--text-secondary)',
            }}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: active ? '300px 1fr' : 'repeat(4,1fr)', gap: 16, transition: 'all 0.3s' }}>

        {/* ── Tool cards ── */}
        <div style={{ display: active ? 'flex' : 'contents', flexDirection: 'column', gap: 8, overflowY: active ? 'auto' : undefined, maxHeight: active ? '80vh' : undefined }}>
          {filtered.map(tool => (
            <div key={tool.id} className="glass"
              onClick={() => active?.id === tool.id ? setActive(null) : openTool(tool)}
              style={{ padding: active ? '12px 14px' : '18px', cursor: 'pointer', transition: 'all 0.2s',
                borderColor: active?.id === tool.id ? '#6366f1' : 'var(--border)',
                background: active?.id === tool.id ? 'rgba(99,102,241,0.1)' : undefined,
              }}
              onMouseEnter={e => { if (active?.id !== tool.id) e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { if (active?.id !== tool.id) e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', alignItems: active ? 'center' : 'flex-start', gap: 10 }}>
                <span style={{ fontSize: active ? 18 : 24 }}>{tool.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{tool.label}</div>
                  {!active && (
                    <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: `${catColors[tool.cat]}22`, color: catColors[tool.cat] }}>{tool.cat}</span>
                  )}
                </div>
                {active && (active?.id === tool.id ? <ChevronUp size={14} color="#818cf8" /> : <ChevronDown size={14} color="var(--text-muted)" />)}
              </div>
            </div>
          ))}
        </div>

        {/* ── Active tool panel ── */}
        {active && (
          <div className="glass animate-fade-in" style={{ padding: '28px', height: 'fit-content' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${catColors[active.cat]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {active.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>{active.label}</h3>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: `${catColors[active.cat]}22`, color: catColors[active.cat] }}>{active.cat}</span>
                </div>
              </div>
              <button className="btn-ghost" onClick={() => { setActive(null); setOutput(''); }} style={{ fontSize: 12 }}>✕ Close</button>
            </div>

            {/* Pre-fill hint */}
            {(user?.profile?.targetRoles?.length > 0 || user?.profile?.skills?.length > 0) && (
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '8px 12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={13} color="#818cf8" />
                <span style={{ fontSize: 11, color: '#818cf8' }}>Fields pre-filled from your profile. Edit as needed.</span>
              </div>
            )}

            {/* Input fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
              {active.fields.map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{f.l}</label>
                  {f.ta
                    ? <textarea className="input" rows={3} placeholder={f.ph || ''} value={inputs[f.k] || ''} onChange={e => setInputs(i => ({ ...i, [f.k]: e.target.value }))} style={{ resize: 'vertical', minHeight: 80 }} />
                    : <input className="input" placeholder={f.ph || ''} value={inputs[f.k] || ''} onChange={e => setInputs(i => ({ ...i, [f.k]: e.target.value }))} />
                  }
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={runTool} disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>
                {loading
                  ? <><div className="loader" style={{ width: 16, height: 16 }} /> Generating...</>
                  : <><Sparkles size={15} /> Generate Output</>}
              </button>
              {output && (
                <button className="btn-ghost" onClick={() => { setOutput(''); }} title="Clear output" style={{ padding: '11px 14px' }}>
                  <RefreshCw size={14} />
                </button>
              )}
            </div>

            {/* ── Animated loading state ── */}
            {loading && (
              <div style={{ marginTop: 24, padding: '24px', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generating your personalised {active.label}...</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>This usually takes 5–15 seconds</p>
                <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }`}</style>
              </div>
            )}

            {/* ── Rich output ── */}
            {output && !loading && (
              <div style={{ marginTop: 20 }} className="animate-fade-in">
                {/* Output header bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>OUTPUT READY</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" onClick={copy} style={{ padding: '5px 12px', fontSize: 12 }}>
                      {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                    <button className="btn-ghost" onClick={downloadTxt} style={{ padding: '5px 12px', fontSize: 12 }}>
                      <Download size={12} /> .txt
                    </button>
                  </div>
                </div>

                {/* Rendered output */}
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 14, padding: '20px', maxHeight: 500, overflowY: 'auto', border: '1px solid var(--border)', lineHeight: 1.7 }}>
                  <RichOutput text={output} />
                </div>

                {/* Usage tip */}
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(99,102,241,0.05)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <BookOpen size={13} color="#818cf8" style={{ marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <strong style={{ color: '#818cf8' }}>Pro tip:</strong> Copy this output and customise it before using. Tools work best when you edit the result to match your authentic voice.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
