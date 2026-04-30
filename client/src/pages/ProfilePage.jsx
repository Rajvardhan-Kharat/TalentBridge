import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Edit2, Save, X, Plus, Camera, Crown, Star, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { SKILL_TAXONOMY, SECTORS, DEGREE_OPTIONS, EXPERIENCE_OPTIONS } from '../data/skillTaxonomy';
import { useNavigate } from 'react-router-dom';

const PLAN_STYLES = {
  free: { label:'Free', color:'#64748b', badge:'🆓', gradient:'linear-gradient(135deg,#475569,#64748b)', frame:false },
  gold: { label:'Gold', color:'#f59e0b', badge:'⭐', gradient:'linear-gradient(135deg,#d97706,#f59e0b)', frame:'gold' },
  platinum: { label:'Platinum', color:'#8b5cf6', badge:'💎', gradient:'linear-gradient(135deg,#6d28d9,#8b5cf6)', frame:'platinum' },
};

function PlanAvatar({ plan='free', avatar, name, size=80 }) {
  const ps = PLAN_STYLES[plan] || PLAN_STYLES.free;
  const initials = (name||'U').charAt(0).toUpperCase();
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      {/* Animated frame ring */}
      {plan === 'gold' && (
        <div style={{ position:'absolute', inset:-4, borderRadius:'50%', background:'conic-gradient(#d97706,#fbbf24,#f59e0b,#d97706)', animation:'spin 3s linear infinite' }} />
      )}
      {plan === 'platinum' && (
        <div style={{ position:'absolute', inset:-5, borderRadius:'50%', background:'conic-gradient(#6d28d9,#a78bfa,#c4b5fd,#8b5cf6,#6d28d9)', animation:'spin 2s linear infinite', boxShadow:'0 0 24px rgba(139,92,246,0.7)' }} />
      )}
      {/* Avatar */}
      <div style={{ position:'absolute', inset: plan!=='free' ? 3:0, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#6366f1,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', border: plan==='free'?'2px solid var(--border)':'none' }}>
        {avatar ? <img src={avatar} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span style={{ fontSize:size*0.35, fontWeight:800, color:'white' }}>{initials}</span>}
      </div>
      {/* Plan badge */}
      {plan !== 'free' && (
        <div style={{ position:'absolute', bottom:-4, right:-4, width:24, height:24, borderRadius:'50%', background:ps.gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, border:'2px solid var(--bg-base)', zIndex:2 }}>
          {ps.badge}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [editing, setEditing] = useState(null); // null | section key
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const plan = user?.subscription?.plan || 'free';
  const ps = PLAN_STYLES[plan];

  const [profileData, setProfileData] = useState(() => ({
    currentTitle: user?.profile?.currentTitle || '',
    headline: user?.profile?.headline || '',
    bio: user?.profile?.bio || '',
    sectors: user?.profile?.sectors || (user?.profile?.sector ? [user.profile.sector] : []),
    experience: user?.profile?.experience || '',
    phone: user?.profile?.phone || '',
    city: user?.profile?.city || '',
    state: user?.profile?.state || '',
    skills: user?.profile?.skills || [],
    targetRoles: user?.profile?.targetRoles || [],
    targetSalaryMin: user?.profile?.targetSalaryMin || '',
    targetSalaryMax: user?.profile?.targetSalaryMax || '',
    preferredLocations: user?.profile?.preferredLocations || [],
    workMode: user?.profile?.workMode || 'Hybrid',
    linkedinUrl: user?.profile?.linkedinUrl || '',
    portfolioUrl: user?.profile?.portfolioUrl || '',
    githubUrl: user?.profile?.githubUrl || '',
    websiteUrl: user?.profile?.websiteUrl || '',
    education: user?.profile?.education || [],
    workExperience: user?.profile?.workExperience || [],
    projects: user?.profile?.projects || [],
    research: user?.profile?.research || [],
    certifications: user?.profile?.certifications || [],
    achievements: user?.profile?.achievements || [],
    languages: user?.profile?.languages || [],
    hobbies: user?.profile?.hobbies || [],
  }));

  const up = (key, val) => setProfileData(p => ({ ...p, [key]: val }));

  const saveSection = async (section) => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { profile: profileData });
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(null);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result;
        const { data } = await api.put('/auth/avatar', { avatar: base64 });
        updateUser(data.user);
        toast.success('Photo updated!');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch { toast.error('Upload failed'); setUploadingAvatar(false); }
  };

  const s = { fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:4 };
  const card = { className:'glass', style:{ padding:20, marginBottom:16 } };

  const Section = ({ title, sectionKey, children, editContent }) => (
    <div className="glass" style={{ padding:20, marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <h3 style={{ fontSize:14, fontWeight:700 }}>{title}</h3>
        {editing === sectionKey
          ? <div style={{ display:'flex', gap:8 }}>
              <button className="btn-ghost" style={{ fontSize:12, padding:'4px 10px' }} onClick={()=>setEditing(null)}><X size={13} /> Cancel</button>
              <button className="btn-primary" style={{ fontSize:12, padding:'6px 12px' }} onClick={()=>saveSection(sectionKey)} disabled={saving}>
                {saving ? <div className="loader" style={{width:14,height:14}} /> : <><Save size={13} /> Save</>}
              </button>
            </div>
          : <button className="btn-ghost" style={{ fontSize:12, padding:'4px 10px' }} onClick={()=>setEditing(sectionKey)}><Edit2 size={13} /> Edit</button>}
      </div>
      {editing === sectionKey ? editContent : children}
    </div>
  );

  const addListItem = (key, item) => up(key, [...profileData[key], item]);
  const removeListItem = (key, idx) => up(key, profileData[key].filter((_,i)=>i!==idx));
  const updateListItem = (key, idx, val) => up(key, profileData[key].map((item,i)=>i===idx?{...item,...val}:item));

  const hasSkill = (n) => profileData.skills.some(sk=>sk.name===n);
  const addSkill = (name, category) => { if(!hasSkill(name)) up('skills',[...profileData.skills,{name,category,level:'Intermediate'}]); };
  const removeSkill = (name) => up('skills', profileData.skills.filter(s=>s.name!==name));

  const handleRemovePhoto = async () => {
    try {
      const { data } = await api.put('/auth/avatar', { avatar: '' });
      updateUser(data.user);
      toast.success('Photo removed');
    } catch { toast.error('Failed to remove photo'); }
  };

  return (
    <div style={{ padding:'28px 32px', maxWidth:960, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Profile hero */}
      <div className="glass" style={{ padding:28, marginBottom:20, background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:24 }}>
          {/* Avatar with plan frame + controls */}
          <div style={{ flexShrink:0 }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <PlanAvatar plan={plan} avatar={user?.avatar} name={user?.name} size={90} />
              <button onClick={()=>fileRef.current.click()} disabled={uploadingAvatar}
                style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'#6366f1', border:'2px solid var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                {uploadingAvatar ? <div className="loader" style={{width:12,height:12}} /> : <Camera size={12} color="white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} />
            </div>
            {/* Photo action buttons */}
            <div style={{ display:'flex', gap:8, marginTop:8, justifyContent:'center' }}>
              <button onClick={()=>fileRef.current.click()} style={{ fontSize:10, color:'#818cf8', background:'none', border:'none', cursor:'pointer', padding:0, fontWeight:600 }}>
                {user?.avatar ? 'Change' : 'Upload'}
              </button>
              {user?.avatar && (
                <>
                  <span style={{ fontSize:10, color:'var(--text-muted)' }}>·</span>
                  <button onClick={handleRemovePhoto} style={{ fontSize:10, color:'#ef4444', background:'none', border:'none', cursor:'pointer', padding:0, fontWeight:600 }}>
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <h1 style={{ fontSize:22, fontWeight:800, fontFamily:'Plus Jakarta Sans' }}>{user?.name}</h1>
              <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, background:ps.gradient, fontSize:11, fontWeight:700, color:'white' }}>
                {ps.badge} {ps.label}
              </div>
            </div>
            <p style={{ fontSize:14, color:'#818cf8', fontWeight:600, marginBottom:4 }}>{profileData.currentTitle || 'Add your title'}</p>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:8 }}>{profileData.headline || 'Add your headline'}</p>
            <p style={{ fontSize:12, color:'var(--text-muted)' }}>{profileData.city && `📍 ${profileData.city}`} {profileData.sectors?.length > 0 && `· ${profileData.sectors.join(' · ')}`}</p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button className="btn-primary" style={{ fontSize:12, padding:'8px 16px' }} onClick={()=>navigate('/pricing')}>
              <Crown size={13} /> Upgrade Plan
            </button>
            <button className="btn-secondary" style={{ fontSize:12, padding:'8px 16px' }} onClick={()=>navigate('/resume')}>
              📄 Build Resume
            </button>
          </div>
        </div>
      </div>

      {/* Skills section */}
      <Section title="Skills" sectionKey="skills"
        editContent={
          <div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
              {profileData.skills.map(sk=>(
                <span key={sk.name} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', fontSize:12, color:'#818cf8' }}>
                  {sk.name} <button type="button" onClick={()=>removeSkill(sk.name)} style={{ background:'none', border:'none', cursor:'pointer', color:'#818cf8', padding:0 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {Object.entries(SKILL_TAXONOMY).slice(0,6).flatMap(([cat,d])=>d.skills.slice(0,4).map(sk=>({name:sk,cat}))).filter(sk=>!hasSkill(sk.name)).slice(0,20).map(sk=>(
                <button key={sk.name} type="button" onClick={()=>addSkill(sk.name,sk.cat)} style={{ padding:'4px 10px', borderRadius:20, border:'1px solid var(--border)', background:'var(--bg-elevated)', fontSize:11, cursor:'pointer', color:'var(--text-secondary)' }}>+ {sk.name}</button>
              ))}
            </div>
          </div>
        }>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {profileData.skills.length > 0
            ? profileData.skills.map(sk=><span key={sk.name} className="chip">{sk.name}</span>)
            : <p style={{ fontSize:13, color:'var(--text-muted)' }}>No skills added yet. Click Edit to add.</p>}
        </div>
      </Section>

      {/* Basic Info */}
      <Section title="Basic Information" sectionKey="basic"
        editContent={
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              ['currentTitle','Job Title','Software Engineer'],['headline','Headline','AI Researcher | Speaker'],
              ['bio','Bio',''],['phone','Phone','+91'],['city','City','Mumbai'],['state','State','Maharashtra'],
              ['experience','Experience','fresher'],
            ].map(([key,label,ph])=>(
              <div key={key} style={{ gridColumn: key==='bio'?'span 2':'span 1' }}>
                <label style={s}>{label}</label>
                {key==='bio' ? <textarea className="input" rows={3} value={profileData[key]} onChange={e=>up(key,e.target.value)} />
                : key==='experience' ? <select className="input" value={profileData[key]} onChange={e=>up(key,e.target.value)}>{EXPERIENCE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
                : <input className="input" placeholder={ph} value={profileData[key]} onChange={e=>up(key,e.target.value)} />}
              </div>
            ))}
            <div style={{ gridColumn:'span 2' }}>
              <label style={s}>Sectors / Industries <span style={{ fontSize:11, color:'var(--text-muted)' }}>(select all that apply)</span></label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {SECTORS.map(sec => {
                  const selected = (profileData.sectors||[]).includes(sec);
                  return (
                    <button key={sec} type="button"
                      onClick={() => up('sectors', selected ? profileData.sectors.filter(s=>s!==sec) : [...(profileData.sectors||[]),sec])}
                      style={{ padding:'4px 10px', borderRadius:20, border:'1px solid', fontSize:11, fontWeight:500, cursor:'pointer', transition:'all 0.2s',
                        background: selected?'rgba(99,102,241,0.18)':'var(--bg-elevated)',
                        borderColor: selected?'#6366f1':'var(--border)',
                        color: selected?'#818cf8':'var(--text-muted)' }}>
                      {selected?'✓ ':''}{sec}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        }>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          {[['Job Title',profileData.currentTitle],['Experience',profileData.experience],['City',profileData.city],['Phone',profileData.phone]].map(([l,v])=>(
            <div key={l}><div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div><div style={{ fontSize:13, fontWeight:500 }}>{v||'—'}</div></div>
          ))}
        </div>
        {profileData.sectors?.length > 0 && (
          <div style={{ marginTop:10, display:'flex', flexWrap:'wrap', gap:6 }}>
            {profileData.sectors.map(sec=><span key={sec} className="chip">{sec}</span>)}
          </div>
        )}
        {profileData.bio && <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:12, lineHeight:1.6 }}>{profileData.bio}</p>}
      </Section>

      {/* Education */}
      <Section title="Education" sectionKey="education"
        editContent={
          <div>
            {profileData.education.map((edu,i)=>(
              <div key={i} style={{ background:'var(--bg-elevated)', borderRadius:10, padding:14, marginBottom:10, position:'relative' }}>
                <button type="button" onClick={()=>removeListItem('education',i)} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={13} /></button>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                  <div><label style={s}>Degree</label>
                    <select className="input" value={edu.degree||''} onChange={e=>updateListItem('education',i,{degree:e.target.value})}>
                      {DEGREE_OPTIONS.map(d=><option key={d} value={d}>{d}</option>)}
                    </select></div>
                  <div><label style={s}>Field</label><input className="input" placeholder="Computer Science" value={edu.field||''} onChange={e=>updateListItem('education',i,{field:e.target.value})} /></div>
                  <div><label style={s}>Institution</label><input className="input" placeholder="IIT Bombay" value={edu.institution||''} onChange={e=>updateListItem('education',i,{institution:e.target.value})} /></div>
                  <div><label style={s}>Year</label><input className="input" placeholder="2018-2022" value={`${edu.startYear||''} ${edu.endYear?'- '+edu.endYear:''}`} onChange={e=>{}} /></div>
                </div>
              </div>
            ))}
            <button type="button" onClick={()=>addListItem('education',{degree:'',field:'',institution:'',startYear:'',endYear:'',grade:''})} className="btn-secondary" style={{ width:'100%', justifyContent:'center' }}><Plus size={13} /> Add Education</button>
          </div>
        }>
        {profileData.education.length > 0
          ? profileData.education.map((edu,i)=>(
            <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:36, height:36, borderRadius:8, background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🎓</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{edu.degree} {edu.field && `in ${edu.field}`}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{edu.institution} {edu.university && `· ${edu.university}`}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{edu.startYear} {edu.endYear && `- ${edu.endYear}`} {edu.grade && `· ${edu.grade}`}</div>
              </div>
            </div>
          ))
          : <p style={{ fontSize:13, color:'var(--text-muted)' }}>No education added yet.</p>}
      </Section>

      {/* Work Experience */}
      <Section title="Work Experience" sectionKey="workExperience"
        editContent={
          <div>
            {profileData.workExperience.map((exp,i)=>(
              <div key={i} style={{ background:'var(--bg-elevated)', borderRadius:10, padding:14, marginBottom:10, position:'relative' }}>
                <button type="button" onClick={()=>removeListItem('workExperience',i)} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={13} /></button>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                  <div><label style={s}>Title</label><input className="input" value={exp.title||''} onChange={e=>updateListItem('workExperience',i,{title:e.target.value})} /></div>
                  <div><label style={s}>Company</label><input className="input" value={exp.company||''} onChange={e=>updateListItem('workExperience',i,{company:e.target.value})} /></div>
                  <div><label style={s}>Start</label><input className="input" placeholder="Jan 2020" value={exp.startDate||''} onChange={e=>updateListItem('workExperience',i,{startDate:e.target.value})} /></div>
                  <div><label style={s}>End</label><input className="input" placeholder="Present" value={exp.endDate||''} onChange={e=>updateListItem('workExperience',i,{endDate:e.target.value})} /></div>
                </div>
                <textarea className="input" rows={2} placeholder="Description..." value={exp.description||''} onChange={e=>updateListItem('workExperience',i,{description:e.target.value})} />
              </div>
            ))}
            <button type="button" onClick={()=>addListItem('workExperience',{title:'',company:'',startDate:'',endDate:'',description:''})} className="btn-secondary" style={{ width:'100%', justifyContent:'center' }}><Plus size={13} /> Add Experience</button>
          </div>
        }>
        {profileData.workExperience.length > 0
          ? profileData.workExperience.map((exp,i)=>(
            <div key={i} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:36, height:36, borderRadius:8, background:'rgba(16,185,129,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>💼</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{exp.title}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{exp.company} {exp.location && `· ${exp.location}`}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{exp.startDate} {exp.endDate && `- ${exp.endDate}`}</div>
                {exp.description && <p style={{ fontSize:12, color:'var(--text-secondary)', marginTop:4 }}>{exp.description}</p>}
              </div>
            </div>
          ))
          : <p style={{ fontSize:13, color:'var(--text-muted)' }}>No experience added yet.</p>}
      </Section>

      {/* Links */}
      <Section title="Social Links" sectionKey="links"
        editContent={
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[['linkedinUrl','LinkedIn','https://linkedin.com/in/...'],['githubUrl','GitHub','https://github.com/...'],['portfolioUrl','Portfolio','https://portfolio.com'],['websiteUrl','Website','https://yoursite.com']].map(([key,label,ph])=>(
              <div key={key}><label style={s}>{label}</label><input className="input" placeholder={ph} value={profileData[key]} onChange={e=>up(key,e.target.value)} /></div>
            ))}
          </div>
        }>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {profileData.linkedinUrl && <a href={profileData.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize:13, color:'#0ea5e9', textDecoration:'none' }}>🔗 LinkedIn</a>}
          {profileData.githubUrl && <a href={profileData.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize:13, color:'#6366f1', textDecoration:'none' }}>🐱 GitHub</a>}
          {profileData.portfolioUrl && <a href={profileData.portfolioUrl} target="_blank" rel="noreferrer" style={{ fontSize:13, color:'#10b981', textDecoration:'none' }}>🌐 Portfolio</a>}
          {!profileData.linkedinUrl && !profileData.githubUrl && <p style={{ fontSize:13, color:'var(--text-muted)' }}>No links added yet.</p>}
        </div>
      </Section>
    </div>
  );
}
