import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ChevronRight, ChevronLeft, CheckCircle, Sparkles, Plus, X, SkipForward, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { SKILL_TAXONOMY, SECTORS, DEGREE_OPTIONS, EXPERIENCE_OPTIONS, WORK_MODES } from '../data/skillTaxonomy';

const STEPS = ['Basic Info','Skills','Education','Experience','Projects & Research','Goals & Links'];

const CATEGORY_NAMES = Object.keys(SKILL_TAXONOMY);

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [skillQuery, setSkillQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_NAMES[0]);

  const [profile, setProfile] = useState({
    currentTitle: '', headline: '', sectors: [], experience: 'fresher',
    bio: '', phone: '', city: '', state: '', skills: [],
    targetRoles: [], targetSalaryMin: '', targetSalaryMax: '',
    preferredLocations: [], workMode: 'Hybrid',
    linkedinUrl: '', portfolioUrl: '', githubUrl: '', websiteUrl: '',
    education: [], workExperience: [], projects: [], research: [], certifications: [],
    languages: [], hobbies: [],
  });

  const up = (key, val) => setProfile(p => ({ ...p, [key]: val }));

  // Sector multi-select
  const toggleSector = (sec) => {
    setProfile(p => ({
      ...p,
      sectors: p.sectors.includes(sec) ? p.sectors.filter(s => s !== sec) : [...p.sectors, sec]
    }));
  };


  // Skills helpers
  const hasSkill = (name) => profile.skills.some(s => s.name === name);
  const addSkill = (name, category) => {
    if (!hasSkill(name)) up('skills', [...profile.skills, { name, category, level: 'Intermediate' }]);
    setSkillQuery('');
  };
  const removeSkill = (name) => up('skills', profile.skills.filter(s => s.name !== name));

  const filteredSkills = skillQuery.length > 0
    ? Object.entries(SKILL_TAXONOMY).flatMap(([cat, d]) =>
        d.skills.filter(s => s.toLowerCase().includes(skillQuery.toLowerCase())).map(s => ({ name: s, category: cat }))
      ).slice(0, 12)
    : SKILL_TAXONOMY[selectedCategory]?.skills.map(s => ({ name: s, category: selectedCategory })) || [];

  const relatedCats = SKILL_TAXONOMY[selectedCategory]?.related || [];

  // List helpers
  const addListItem = (key, item) => up(key, [...profile[key], item]);
  const removeListItem = (key, idx) => up(key, profile[key].filter((_, i) => i !== idx));
  const updateListItem = (key, idx, val) => up(key, profile[key].map((item, i) => i === idx ? { ...item, ...val } : item));

  const handleSkip = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/onboarding', { skip: true });
      updateUser(data.user);
      toast.success('Welcome! Complete your profile anytime.');
      navigate('/');
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/onboarding', { profile, skip: false });
      updateUser(data.user);
      toast.success('🎉 Profile complete! Welcome.');
      navigate('/');
    } catch { toast.error('Could not save profile'); }
    finally { setLoading(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const { data } = await api.put('/auth/avatar', { avatar: ev.target.result });
        updateUser(data.user);
        toast.success('Photo saved!');
      } catch { toast.error('Upload failed'); }
      finally { setUploadingPhoto(false); }
    };
    reader.readAsDataURL(file);
  };

  const pct = ((step + 1) / STEPS.length) * 100;
  const s = { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'24px 16px', backgroundImage:'radial-gradient(ellipse at 50% 0%,rgba(99,102,241,0.12) 0%,transparent 60%)' }}>
      <div style={{ width:'100%', maxWidth:680 }} className="animate-fade-in">
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
            <Sparkles size={16} color="#818cf8" />
            <span style={{ fontSize:12, color:'#818cf8', fontWeight:600 }}>STEP {step+1} OF {STEPS.length} · {STEPS[step].toUpperCase()}</span>
          </div>
          <h1 style={{ fontFamily:'Plus Jakarta Sans', fontSize:24, fontWeight:800, marginBottom:4 }}>Build Your Profile</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>Talent platform for all sectors — IT, Healthcare, Arts, Law, and more</p>
          <div style={{ height:4, background:'var(--bg-elevated)', borderRadius:4, marginTop:16, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius:4, transition:'width 0.4s ease' }} />
          </div>
        </div>

        <div className="glass" style={{ padding:28 }}>

          {/* ── Step 0: Basic Info ── */}
          {step === 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Photo upload */}
              <div style={{ display:'flex', alignItems:'center', gap:20, padding:16, background:'var(--bg-elevated)', borderRadius:14, border:'1px solid var(--border)' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#6366f1,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--border)' }}>
                    {user?.avatar
                      ? <img src={user.avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <span style={{ fontSize:26, fontWeight:800, color:'white' }}>{(user?.name||'U').charAt(0)}</span>}
                  </div>
                  <button type="button" onClick={() => fileRef.current.click()} disabled={uploadingPhoto}
                    style={{ position:'absolute', bottom:-2, right:-2, width:24, height:24, borderRadius:'50%', background:'#6366f1', border:'2px solid var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    {uploadingPhoto ? <div className="loader" style={{width:10,height:10}} /> : <Camera size={11} color="white" />}
                  </button>
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Profile Photo <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></p>
                  <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>Used in your resume and profile card</p>
                  <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary" style={{ fontSize:12, padding:'5px 12px' }}>
                    <Camera size={12} /> {user?.avatar ? 'Change Photo' : 'Upload Photo'}
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={s}>Current / Target Title</label>
                  <input className="input" placeholder="e.g. Cardiac Surgeon / Software Engineer" value={profile.currentTitle} onChange={e=>up('currentTitle',e.target.value)} /></div>
                <div><label style={s}>Professional Headline</label>
                  <input className="input" placeholder="e.g. AI Researcher | Speaker | Mentor" value={profile.headline} onChange={e=>up('headline',e.target.value)} /></div>
              </div>
              <div style={{ gridColumn:'span 2' }}>
                <label style={s}>Sectors / Industries <span style={{ color:'var(--text-muted)', fontSize:11 }}>(select all that apply)</span></label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {SECTORS.map(sec => {
                    const selected = profile.sectors.includes(sec);
                    return (
                      <button key={sec} type="button" onClick={() => toggleSector(sec)}
                        style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:11, fontWeight:500, cursor:'pointer', transition:'all 0.2s',
                          background: selected ? 'rgba(99,102,241,0.18)' : 'var(--bg-elevated)',
                          borderColor: selected ? '#6366f1' : 'var(--border)',
                          color: selected ? '#818cf8' : 'var(--text-muted)' }}>
                        {selected ? '✓ ' : ''}{sec}
                      </button>
                    );
                  })}
                </div>
                {profile.sectors.length > 0 && (
                  <p style={{ fontSize:11, color:'#818cf8', marginTop:6 }}>✓ Selected: {profile.sectors.join(' · ')}</p>
                )}
              </div>
              <div><label style={s}>Years of Experience</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {EXPERIENCE_OPTIONS.map(o=>(
                    <button key={o.value} type="button" onClick={()=>up('experience',o.value)}
                      style={{ padding:'7px 14px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.2s',
                        background:profile.experience===o.value?'rgba(99,102,241,0.2)':'var(--bg-elevated)',
                        borderColor:profile.experience===o.value?'#6366f1':'var(--border)',
                        color:profile.experience===o.value?'#818cf8':'var(--text-secondary)' }}>{o.label}</button>
                  ))}
                </div></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={s}>Phone</label><input className="input" placeholder="+91 XXXXX XXXXX" value={profile.phone} onChange={e=>up('phone',e.target.value)} /></div>
                <div><label style={s}>City</label><input className="input" placeholder="e.g. Mumbai" value={profile.city} onChange={e=>up('city',e.target.value)} /></div>
              </div>
              <div><label style={s}>Bio / Summary</label>
                <textarea className="input" rows={3} placeholder="Brief professional summary..." value={profile.bio} onChange={e=>up('bio',e.target.value)} /></div>
              <div><label style={s}>Work Mode</label>
                <div style={{ display:'flex', gap:8 }}>
                  {WORK_MODES.map(m=>(
                    <button key={m} type="button" onClick={()=>up('workMode',m)}
                      style={{ flex:1, padding:'8px', borderRadius:10, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.2s',
                        background:profile.workMode===m?'rgba(99,102,241,0.2)':'var(--bg-elevated)',
                        borderColor:profile.workMode===m?'#6366f1':'var(--border)',
                        color:profile.workMode===m?'#818cf8':'var(--text-secondary)' }}>{m}</button>
                  ))}
                </div></div>
            </div>
          )}

          {/* ── Step 1: Skills ── */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom:16 }}>
                <label style={s}>Search Skills (from all sectors)</label>
                <input className="input" placeholder="Type any skill — programming, surgery, painting, law..." value={skillQuery} onChange={e=>setSkillQuery(e.target.value)} />
              </div>

              {!skillQuery && (
                <div style={{ marginBottom:12 }}>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>Browse by category:</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {CATEGORY_NAMES.map(cat=>(
                      <button key={cat} type="button" onClick={()=>setSelectedCategory(cat)}
                        style={{ padding:'5px 12px', borderRadius:20, border:'1px solid', fontSize:11, fontWeight:500, cursor:'pointer', transition:'all 0.2s',
                          background:selectedCategory===cat?`${SKILL_TAXONOMY[cat].color}22`:'var(--bg-elevated)',
                          borderColor:selectedCategory===cat?SKILL_TAXONOMY[cat].color:'var(--border)',
                          color:selectedCategory===cat?SKILL_TAXONOMY[cat].color:'var(--text-muted)' }}>
                        {SKILL_TAXONOMY[cat].icon} {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {relatedCats.length > 0 && !skillQuery && (
                <div style={{ marginBottom:12, padding:'8px 12px', background:'rgba(99,102,241,0.06)', borderRadius:10, border:'1px solid rgba(99,102,241,0.12)' }}>
                  <p style={{ fontSize:11, color:'#818cf8', marginBottom:6 }}>💡 Related categories for {selectedCategory}:</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {relatedCats.map(r=>(
                      <button key={r} type="button" onClick={()=>setSelectedCategory(r)}
                        style={{ padding:'3px 10px', borderRadius:20, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', color:'#818cf8', fontSize:11, cursor:'pointer' }}>{r}</button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                {filteredSkills.filter(s=>!hasSkill(s.name)).map(s=>(
                  <button key={s.name} type="button" onClick={()=>addSkill(s.name, s.category)}
                    style={{ padding:'5px 12px', borderRadius:20, border:'1px solid var(--border)', background:'var(--bg-elevated)', fontSize:12, cursor:'pointer', color:'var(--text-secondary)', transition:'all 0.2s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.color='#818cf8'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
                    + {s.name}
                  </button>
                ))}
              </div>

              {profile.skills.length > 0 && (
                <div>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>Your selected skills ({profile.skills.length}):</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {profile.skills.map(sk=>(
                      <span key={sk.name} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', fontSize:12, color:'#818cf8' }}>
                        {sk.name}
                        <button type="button" onClick={()=>removeSkill(sk.name)} style={{ background:'none', border:'none', cursor:'pointer', color:'#818cf8', padding:0, lineHeight:1 }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Education ── */}
          {step === 2 && (
            <div>
              {profile.education.map((edu, i)=>(
                <div key={i} style={{ background:'var(--bg-elevated)', borderRadius:12, padding:16, marginBottom:12, position:'relative' }}>
                  <button type="button" onClick={()=>removeListItem('education',i)} style={{ position:'absolute', top:10, right:10, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={14} /></button>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <div><label style={s}>Degree</label>
                      <select className="input" value={edu.degree||''} onChange={e=>updateListItem('education',i,{degree:e.target.value})}>
                        <option value="">Select degree</option>
                        {DEGREE_OPTIONS.map(d=><option key={d} value={d}>{d}</option>)}
                      </select></div>
                    <div><label style={s}>Field of Study</label>
                      <input className="input" placeholder="Computer Science / Medicine" value={edu.field||''} onChange={e=>updateListItem('education',i,{field:e.target.value})} /></div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <div><label style={s}>Institution</label>
                      <input className="input" placeholder="College / School name" value={edu.institution||''} onChange={e=>updateListItem('education',i,{institution:e.target.value})} /></div>
                    <div><label style={s}>University / Board</label>
                      <input className="input" placeholder="University name" value={edu.university||''} onChange={e=>updateListItem('education',i,{university:e.target.value})} /></div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                    <div><label style={s}>Start Year</label><input className="input" placeholder="2018" value={edu.startYear||''} onChange={e=>updateListItem('education',i,{startYear:e.target.value})} /></div>
                    <div><label style={s}>End Year</label><input className="input" placeholder="2022" value={edu.endYear||''} onChange={e=>updateListItem('education',i,{endYear:e.target.value})} /></div>
                    <div><label style={s}>Grade / CGPA</label><input className="input" placeholder="8.5 / 85%" value={edu.grade||''} onChange={e=>updateListItem('education',i,{grade:e.target.value})} /></div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={()=>addListItem('education',{degree:'',field:'',institution:'',university:'',startYear:'',endYear:'',grade:''})}
                className="btn-secondary" style={{ width:'100%', justifyContent:'center' }}>
                <Plus size={14} /> Add Education
              </button>
            </div>
          )}

          {/* ── Step 3: Work Experience ── */}
          {step === 3 && (
            <div>
              {profile.workExperience.map((exp, i)=>(
                <div key={i} style={{ background:'var(--bg-elevated)', borderRadius:12, padding:16, marginBottom:12, position:'relative' }}>
                  <button type="button" onClick={()=>removeListItem('workExperience',i)} style={{ position:'absolute', top:10, right:10, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={14} /></button>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <div><label style={s}>Job Title</label><input className="input" placeholder="Software Engineer" value={exp.title||''} onChange={e=>updateListItem('workExperience',i,{title:e.target.value})} /></div>
                    <div><label style={s}>Company</label><input className="input" placeholder="Infosys / Apollo Hospital" value={exp.company||''} onChange={e=>updateListItem('workExperience',i,{company:e.target.value})} /></div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
                    <div><label style={s}>Location</label><input className="input" placeholder="Bangalore" value={exp.location||''} onChange={e=>updateListItem('workExperience',i,{location:e.target.value})} /></div>
                    <div><label style={s}>Start</label><input className="input" placeholder="Jan 2020" value={exp.startDate||''} onChange={e=>updateListItem('workExperience',i,{startDate:e.target.value})} /></div>
                    <div><label style={s}>End</label><input className="input" placeholder="Present" value={exp.endDate||''} onChange={e=>updateListItem('workExperience',i,{endDate:e.target.value})} /></div>
                  </div>
                  <div><label style={s}>Description</label>
                    <textarea className="input" rows={2} placeholder="Key responsibilities and achievements..." value={exp.description||''} onChange={e=>updateListItem('workExperience',i,{description:e.target.value})} /></div>
                </div>
              ))}
              <button type="button" onClick={()=>addListItem('workExperience',{title:'',company:'',location:'',startDate:'',endDate:'',description:''})}
                className="btn-secondary" style={{ width:'100%', justifyContent:'center' }}>
                <Plus size={14} /> Add Work Experience
              </button>
            </div>
          )}

          {/* ── Step 4: Projects & Research ── */}
          {step === 4 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <h4 style={{ fontSize:14, fontWeight:600 }}>Projects</h4>
                  <button type="button" onClick={()=>addListItem('projects',{title:'',description:'',role:'',url:'',techStack:[]})} className="btn-ghost" style={{ fontSize:12, padding:'4px 10px' }}><Plus size={12} /> Add</button>
                </div>
                {profile.projects.map((proj, i)=>(
                  <div key={i} style={{ background:'var(--bg-elevated)', borderRadius:12, padding:14, marginBottom:10, position:'relative' }}>
                    <button type="button" onClick={()=>removeListItem('projects',i)} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={13} /></button>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:8 }}>
                      <div><label style={s}>Project Title</label><input className="input" placeholder="AI Chatbot for Healthcare" value={proj.title||''} onChange={e=>updateListItem('projects',i,{title:e.target.value})} /></div>
                      <div><label style={s}>Your Role</label><input className="input" placeholder="Lead Developer / Researcher" value={proj.role||''} onChange={e=>updateListItem('projects',i,{role:e.target.value})} /></div>
                    </div>
                    <div style={{ marginBottom:8 }}><label style={s}>Description</label>
                      <textarea className="input" rows={2} placeholder="What you built and impact..." value={proj.description||''} onChange={e=>updateListItem('projects',i,{description:e.target.value})} /></div>
                    <div><label style={s}>Project URL / GitHub</label><input className="input" placeholder="https://github.com/..." value={proj.url||''} onChange={e=>updateListItem('projects',i,{url:e.target.value})} /></div>
                  </div>
                ))}
                {profile.projects.length === 0 && <div style={{ textAlign:'center', padding:'16px 0', color:'var(--text-muted)', fontSize:13 }}>No projects added yet</div>}
              </div>

              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <h4 style={{ fontSize:14, fontWeight:600 }}>Research / Publications</h4>
                  <button type="button" onClick={()=>addListItem('research',{title:'',journal:'',year:'',doi:'',type:'journal'})} className="btn-ghost" style={{ fontSize:12, padding:'4px 10px' }}>+ Add</button>
                </div>
                {profile.research.map((res, i)=>(
                  <div key={i} style={{ background:'var(--bg-elevated)', borderRadius:12, padding:14, marginBottom:10, position:'relative' }}>
                    <button type="button" onClick={()=>removeListItem('research',i)} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={13} /></button>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:8 }}>
                      <div><label style={s}>Title</label><input className="input" placeholder="Research paper title" value={res.title||''} onChange={e=>updateListItem('research',i,{title:e.target.value})} /></div>
                      <div><label style={s}>Journal / Conference</label><input className="input" placeholder="IEEE / Nature / IJSRP" value={res.journal||''} onChange={e=>updateListItem('research',i,{journal:e.target.value})} /></div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div><label style={s}>Year</label><input className="input" placeholder="2024" value={res.year||''} onChange={e=>updateListItem('research',i,{year:e.target.value})} /></div>
                      <div><label style={s}>DOI / URL</label><input className="input" placeholder="https://doi.org/..." value={res.doi||''} onChange={e=>updateListItem('research',i,{doi:e.target.value})} /></div>
                    </div>
                  </div>
                ))}
                {profile.research.length === 0 && <div style={{ textAlign:'center', padding:'8px 0', color:'var(--text-muted)', fontSize:13 }}>No research added yet</div>}
              </div>
            </div>
          )}

          {/* ── Step 5: Goals & Links ── */}
          {step === 5 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ textAlign:'center', padding:'8px 0' }}>
                <CheckCircle size={40} color="#10b981" style={{ marginBottom:8 }} />
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Almost there, {user?.name?.split(' ')[0]}!</h3>
                <p style={{ color:'var(--text-muted)', fontSize:13 }}>Final step — set your goals and links</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={s}>Target Salary Min (₹/yr)</label><input className="input" type="number" placeholder="500000" value={profile.targetSalaryMin} onChange={e=>up('targetSalaryMin',e.target.value)} /></div>
                <div><label style={s}>Target Salary Max (₹/yr)</label><input className="input" type="number" placeholder="1500000" value={profile.targetSalaryMax} onChange={e=>up('targetSalaryMax',e.target.value)} /></div>
              </div>
              <div><label style={s}>LinkedIn URL</label><input className="input" placeholder="https://linkedin.com/in/..." value={profile.linkedinUrl} onChange={e=>up('linkedinUrl',e.target.value)} /></div>
              <div><label style={s}>GitHub / Portfolio URL</label><input className="input" placeholder="https://github.com/..." value={profile.githubUrl} onChange={e=>up('githubUrl',e.target.value)} /></div>
              <div><label style={s}>Personal Website</label><input className="input" placeholder="https://yoursite.com" value={profile.websiteUrl} onChange={e=>up('websiteUrl',e.target.value)} /></div>
              <div><label style={s}>Certifications (comma separated)</label>
                <input className="input" placeholder="AWS Certified, PMP, IELTS 8.0..." /></div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24, gap:12 }}>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn-secondary" onClick={()=>setStep(s=>s-1)} disabled={step===0}><ChevronLeft size={15} /> Back</button>
              <button className="btn-ghost" onClick={handleSkip} style={{ fontSize:13 }}><SkipForward size={14} /> Skip All</button>
            </div>
            {step < STEPS.length-1
              ? <button className="btn-primary" onClick={()=>setStep(s=>s+1)}>Continue <ChevronRight size={15} /></button>
              : <button className="btn-primary" onClick={handleFinish} disabled={loading} style={{ minWidth:160, justifyContent:'center' }}>
                  {loading ? <div className="loader" /> : <><Sparkles size={14} /> Launch Dashboard</>}
                </button>}
          </div>
        </div>
      </div>
    </div>
  );
}
