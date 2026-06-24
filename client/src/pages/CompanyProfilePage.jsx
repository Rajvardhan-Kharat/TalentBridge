import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Edit2, Save, X, Camera, Building, Globe, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

export default function CompanyProfilePage() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Fallback to empty strings if profile is undefined
  const [profileData, setProfileData] = useState(() => ({
    industry: user?.profile?.industry || '',
    size: user?.profile?.size || '11-50',
    founded: user?.profile?.founded || '',
    headquarters: user?.profile?.headquarters || '',
    description: user?.profile?.description || '',
    website: user?.profile?.website || '',
    linkedin: user?.profile?.linkedin || '',
    twitter: user?.profile?.twitter || '',
  }));

  const up = (key, val) => setProfileData(p => ({ ...p, [key]: val }));

  const saveSection = async (section) => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { profile: profileData });
      updateUser(data.user);
      toast.success('Company profile updated!');
      setEditing(null);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result;
        const { data } = await api.put('/auth/avatar', { avatar: base64 });
        updateUser(data.user);
        toast.success('Company logo updated!');
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch { toast.error('Upload failed'); setUploadingLogo(false); }
  };

  const handleRemoveLogo = async () => {
    try {
      const { data } = await api.put('/auth/avatar', { avatar: '' });
      updateUser(data.user);
      toast.success('Logo removed');
    } catch { toast.error('Failed to remove logo'); }
  };

  const Section = ({ title, sectionKey, children, editContent }) => (
    <div className="glass" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700 }}>{title}</h3>
        {editing === sectionKey
          ? <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setEditing(null)}><X size={13} /> Cancel</button>
              <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => saveSection(sectionKey)} disabled={saving}>
                {saving ? <div className="loader" style={{ width: 14, height: 14 }} /> : <><Save size={13} /> Save</>}
              </button>
            </div>
          : <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setEditing(sectionKey)}><Edit2 size={13} /> Edit</button>}
      </div>
      {editing === sectionKey ? editContent : children}
    </div>
  );

  const s = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 4 };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      
      {/* Company Hero */}
      <div className="glass" style={{ padding: 28, marginBottom: 20, background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(37,99,235,0.06))' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
          {/* Logo */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ width: 90, height: 90, borderRadius: 16, background: 'var(--bg-elevated)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {user?.avatar 
                  ? <img src={user.avatar} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Building size={40} color="var(--text-muted)" />
                }
              </div>
              <button onClick={() => fileRef.current.click()} disabled={uploadingLogo}
                style={{ position: 'absolute', bottom: -5, right: -5, width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', border: '2px solid var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {uploadingLogo ? <div className="loader" style={{ width: 12, height: 12 }} /> : <Camera size={12} color="white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
            </div>
            {user?.avatar && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button onClick={handleRemoveLogo} style={{ fontSize: 10, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                  Remove Logo
                </button>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}>{user?.name}</h1>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>
                🏢 Company Profile
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#3b82f6', fontWeight: 600, marginBottom: 8 }}>
              {profileData.industry || 'Add your industry'}
            </p>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
              {profileData.headquarters && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {profileData.headquarters}</span>}
              {profileData.size && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {profileData.size} employees</span>}
              {profileData.website && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={14} /> <a href={profileData.website} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>Website</a></span>}
            </div>
          </div>
        </div>
      </div>

      {/* About Company */}
      <Section title="About Company" sectionKey="about"
        editContent={
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={s}>Industry / Sector</label><input className="input" placeholder="e.g. Technology, Healthcare" value={profileData.industry} onChange={e => up('industry', e.target.value)} /></div>
            <div>
              <label style={s}>Company Size</label>
              <select className="input" value={profileData.size} onChange={e => up('size', e.target.value)}>
                {COMPANY_SIZES.map(o => <option key={o} value={o}>{o} employees</option>)}
              </select>
            </div>
            <div><label style={s}>Founded Year</label><input className="input" placeholder="e.g. 2010" value={profileData.founded} onChange={e => up('founded', e.target.value)} /></div>
            <div><label style={s}>Headquarters</label><input className="input" placeholder="e.g. Mumbai, India" value={profileData.headquarters} onChange={e => up('headquarters', e.target.value)} /></div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={s}>Company Description</label>
              <textarea className="input" rows={4} placeholder="Describe your company, culture, and mission..." value={profileData.description} onChange={e => up('description', e.target.value)} />
            </div>
          </div>
        }>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[['Industry', profileData.industry], ['Company Size', profileData.size], ['Founded', profileData.founded], ['Headquarters', profileData.headquarters]].map(([l, v]) => (
            <div key={l}><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{v || '—'}</div></div>
          ))}
        </div>
        {profileData.description && (
          <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Description</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{profileData.description}</p>
          </div>
        )}
      </Section>

      {/* Social Links */}
      <Section title="Links & Social" sectionKey="links"
        editContent={
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            <div><label style={s}>Website URL</label><input className="input" placeholder="https://company.com" value={profileData.website} onChange={e => up('website', e.target.value)} /></div>
            <div><label style={s}>LinkedIn Page URL</label><input className="input" placeholder="https://linkedin.com/company/..." value={profileData.linkedin} onChange={e => up('linkedin', e.target.value)} /></div>
            <div><label style={s}>Twitter URL</label><input className="input" placeholder="https://twitter.com/..." value={profileData.twitter} onChange={e => up('twitter', e.target.value)} /></div>
          </div>
        }>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {profileData.website && <a href={profileData.website} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={14} /> Website</a>}
          {profileData.linkedin && <a href={profileData.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#0ea5e9', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>🔗 LinkedIn</a>}
          {profileData.twitter && <a href={profileData.twitter} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>🐦 Twitter</a>}
          {!profileData.website && !profileData.linkedin && !profileData.twitter && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No links added yet.</p>}
        </div>
      </Section>

    </div>
  );
}
