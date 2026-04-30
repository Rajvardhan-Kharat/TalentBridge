import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Download, Eye, EyeOff, FileDown, Camera, Trash2, Wand2 } from 'lucide-react';
import {
  Document, Page, Text, View, StyleSheet, Link, PDFDownloadLink, PDFViewer, Image as PDFImage
} from '@react-pdf/renderer';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// ── Built-in PDF fonts — no network needed, no CORS issues ──────────────────
const TEMPLATES = [
  { id: 'modern',    name: 'Modern Pro',    color: '#4F46E5', accent2: '#818CF8', headerBg: '#4F46E5', headerText: '#FFFFFF', lightBg: '#EEF2FF' },
  { id: 'classic',   name: 'Classic Elite', color: '#0369A1', accent2: '#38BDF8', headerBg: '#F0F9FF', headerText: '#0C4A6E', lightBg: '#E0F2FE' },
  { id: 'creative',  name: 'Creative Bold', color: '#7C3AED', accent2: '#A78BFA', headerBg: '#7C3AED', headerText: '#FFFFFF', lightBg: '#EDE9FE' },
  { id: 'minimal',   name: 'Minimal Clean', color: '#059669', accent2: '#34D399', headerBg: '#F0FDF4', headerText: '#064E3B', lightBg: '#DCFCE7' },
  { id: 'executive', name: 'Executive',     color: '#1E293B', accent2: '#475569', headerBg: '#1E293B', headerText: '#FFFFFF', lightBg: '#F1F5F9' },
];

// ── PDF Document — uses Helvetica (built-in, no download needed) ─────────────
function ResumePDF({ user, profile, tpl, withPhoto }) {
  const c = tpl.color;
  const isLight = tpl.id === 'classic' || tpl.id === 'minimal';
  const skills = (profile?.skills || []).map(s => s.name || s).filter(Boolean);
  const sectors = (profile?.sectors || []).concat(profile?.sector ? [profile.sector] : []).filter(Boolean);
  const uniqueSectors = [...new Set(sectors)];

  const s = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b', backgroundColor: '#ffffff' },
    header: { backgroundColor: tpl.headerBg, padding: '22 32', flexDirection: 'row', alignItems: 'center', gap: 16 },
    photo: { width: 68, height: 68, borderRadius: 34, borderWidth: 2.5, borderColor: isLight ? c : 'rgba(255,255,255,0.4)', flexShrink: 0 },
    nameBox: { flex: 1 },
    name: { fontSize: 21, fontFamily: 'Helvetica-Bold', color: tpl.headerText, marginBottom: 3 },
    titleLine: { fontSize: 10.5, color: isLight ? c : 'rgba(255,255,255,0.88)', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
    sectorLine: { fontSize: 8, color: isLight ? '#64748b' : 'rgba(255,255,255,0.65)', marginBottom: 5 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    contactTxt: { fontSize: 8, color: isLight ? '#374151' : 'rgba(255,255,255,0.75)' },
    linkTxt: { fontSize: 8, color: isLight ? c : '#BEF264', textDecoration: 'underline' },
    body: { padding: '16 32' },
    section: { marginBottom: 11 },
    sectionTitle: {
      fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: c, textTransform: 'uppercase', letterSpacing: 1.3,
      borderBottomWidth: 1.5, borderBottomColor: c, paddingBottom: 3, marginBottom: 7,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
    eTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
    eSub: { fontSize: 8.5, color: c, fontFamily: 'Helvetica-Bold' },
    eMeta: { fontSize: 8, color: '#64748b' },
    eDate: { fontSize: 8, color: '#94a3b8', flexShrink: 0 },
    eDesc: { fontSize: 8.5, color: '#374151', marginTop: 3, lineHeight: 1.55 },
    skillChip: {
      fontSize: 8, color: c, fontFamily: 'Helvetica-Bold',
      backgroundColor: tpl.lightBg, borderWidth: 0.5, borderColor: c,
      paddingHorizontal: 6, paddingVertical: 2.5, borderRadius: 3,
    },
    skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    summaryTxt: { fontSize: 9, color: '#374151', lineHeight: 1.65 },
  });

  return (
    <Document title={`${user?.name} - Resume`} author={user?.name}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          {withPhoto && user?.avatar && (
            <PDFImage src={user.avatar} style={s.photo} />
          )}
          <View style={s.nameBox}>
            <Text style={s.name}>{user?.name || 'Your Name'}</Text>
            {(profile?.currentTitle || profile?.headline) && (
              <Text style={s.titleLine}>
                {profile.currentTitle}{profile.headline ? ` · ${profile.headline}` : ''}
              </Text>
            )}
            {uniqueSectors.length > 0 && (
              <Text style={s.sectorLine}>{uniqueSectors.join('  ·  ')}</Text>
            )}
            <View style={s.contactRow}>
              {/* Build a flat list of items separated by  |  so the row looks clean */}
              {[
                user?.email,
                profile?.phone ? `Tel: ${profile.phone}` : null,
                profile?.city ? `${profile.city}${profile.state ? `, ${profile.state}` : ''}` : null,
              ].filter(Boolean).map((item, i, arr) => (
                <Text key={i} style={s.contactTxt}>
                  {item}{i < arr.length - 1 ? '   |' : ''}
                </Text>
              ))}
              {/* Links with plain labels, no arrows */}
              {profile?.linkedinUrl && (
                <Text style={s.contactTxt}>  |   <Link src={profile.linkedinUrl} style={s.linkTxt}>LinkedIn</Link></Text>
              )}
              {profile?.githubUrl && (
                <Text style={s.contactTxt}>  |   <Link src={profile.githubUrl} style={s.linkTxt}>GitHub</Link></Text>
              )}
              {profile?.portfolioUrl && (
                <Text style={s.contactTxt}>  |   <Link src={profile.portfolioUrl} style={s.linkTxt}>Portfolio</Link></Text>
              )}
              {profile?.websiteUrl && (
                <Text style={s.contactTxt}>  |   <Link src={profile.websiteUrl} style={s.linkTxt}>Website</Link></Text>
              )}
            </View>
          </View>
        </View>

        <View style={s.body}>
          {/* Summary */}
          {profile?.bio && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Professional Summary</Text>
              <Text style={s.summaryTxt}>{profile.bio}</Text>
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Skills</Text>
              <View style={s.skillRow}>
                {skills.map((sk, i) => <Text key={i} style={s.skillChip}>{sk}</Text>)}
              </View>
            </View>
          )}

          {/* Experience */}
          {profile?.workExperience?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Work Experience</Text>
              {profile.workExperience.map((exp, i) => (
                <View key={i} style={{ marginBottom: 9 }}>
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.eTitle}>{exp.title}</Text>
                      <Text style={s.eSub}>{exp.company}{exp.location ? `  ·  ${exp.location}` : ''}</Text>
                    </View>
                    <Text style={s.eDate}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</Text>
                  </View>
                  {exp.description && <Text style={s.eDesc}>{exp.description}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {profile?.education?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Education</Text>
              {profile.education.map((edu, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.eTitle}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</Text>
                      <Text style={s.eMeta}>{edu.institution}{edu.university ? ` · ${edu.university}` : ''}</Text>
                      {edu.grade && <Text style={{ ...s.eMeta, color: c, fontFamily: 'Helvetica-Bold' }}>Grade: {edu.grade}</Text>}
                    </View>
                    <Text style={s.eDate}>{edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ''}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {profile?.projects?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Projects</Text>
              {profile.projects.map((proj, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.eTitle}>{proj.title}</Text>
                      {proj.role && <Text style={s.eMeta}>Role: {proj.role}</Text>}
                    </View>
                    {proj.url && (
                      <Link src={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} style={s.linkTxt}>View</Link>
                    )}
                  </View>
                  {proj.description && <Text style={s.eDesc}>{proj.description}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Research */}
          {profile?.research?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Research &amp; Publications</Text>
              {profile.research.map((res, i) => (
                <View key={i} style={{ marginBottom: 7 }}>
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.eTitle}>{res.title}</Text>
                      <Text style={s.eMeta}>{res.journal}{res.year ? ` (${res.year})` : ''}</Text>
                    </View>
                    {res.doi && <Link src={res.doi.startsWith('http') ? res.doi : `https://doi.org/${res.doi}`} style={s.linkTxt}>DOI</Link>}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Certifications */}
          {profile?.certifications?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Certifications</Text>
              <View style={s.skillRow}>
                {profile.certifications.map((cert, i) => (
                  <Text key={i} style={s.skillChip}>{cert.name || cert}{cert.issuer ? ` · ${cert.issuer}` : ''}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Languages */}
          {profile?.languages?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Languages</Text>
              <View style={s.skillRow}>
                {profile.languages.map((lang, i) => (
                  <Text key={i} style={s.skillChip}>{lang.language || lang}{lang.proficiency ? ` (${lang.proficiency})` : ''}</Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ResumeBuilderPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const profile = user?.profile || {};
  const fileRef = useRef();

  const [template, setTemplate] = useState('modern');
  const [includePhoto, setIncludePhoto] = useState(!!user?.avatar);
  const [showPreview, setShowPreview] = useState(true);
  const [photoPrompt, setPhotoPrompt] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const { data } = await api.post('/ai/enhance-profile');
      if (data.success) {
        updateUser({ ...user, profile: data.profile });
        toast.success('Resume enhanced by System!');
      }
    } catch (err) {
      toast.error('Enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  };

  const tpl = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
  const hasPhoto = !!user?.avatar;
  const fileName = `${(user?.name || 'Resume').replace(/\s+/g, '_')}_CV.pdf`;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const { data } = await api.put('/auth/avatar', { avatar: ev.target.result });
        updateUser(data.user);
        toast.success('Photo updated!');
      } catch { toast.error('Upload failed'); }
      finally { setUploadingAvatar(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    try {
      const { data } = await api.put('/auth/avatar', { avatar: '' });
      updateUser(data.user);
      setIncludePhoto(false);
      toast.success('Photo removed');
    } catch { toast.error('Failed'); }
  };

  const pdfDoc = (
    <ResumePDF user={user} profile={profile} tpl={tpl} withPhoto={includePhoto && hasPhoto} />
  );

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="animate-fade-in">
        <div>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Resume Builder</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Choose a template, preview your resume, and download as PDF.</p>
        </div>
        <button className="btn-primary" onClick={handleEnhance} disabled={isEnhancing}>
          {isEnhancing ? <><div className="loader" style={{width: 16, height: 16}} /> Enhancing...</> : <><Wand2 size={16} /> Enhance with System</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
        {/* ── Left Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Templates */}
          <div className="glass" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}>Template</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} type="button" onClick={() => setTemplate(t.id)}
                  style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    border: `2px solid ${template === t.id ? t.color : 'var(--border)'}`,
                    background: template === t.id ? `${t.color}14` : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: template === t.id ? t.color : 'var(--text-primary)' }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div className="glass" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}>Profile Photo</p>
            {hasPhoto ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <img src={user.avatar} alt="avatar" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>Photo uploaded</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => fileRef.current.click()} style={{ fontSize: 11, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Change
                      </button>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>·</span>
                      <button onClick={handleRemovePhoto} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={includePhoto} onChange={e => setIncludePhoto(e.target.checked)} />
                  Include in resume
                </label>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>No photo uploaded yet</p>
                <button onClick={() => fileRef.current.click()} disabled={uploadingAvatar}
                  className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '8px' }}>
                  {uploadingAvatar ? <div className="loader" style={{ width: 14, height: 14 }} /> : <><Camera size={13} /> Upload Photo</>}
                </button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>

          {/* Actions */}
          <PDFDownloadLink document={pdfDoc} fileName={fileName} style={{ textDecoration: 'none' }}>
            {({ loading }) => (
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14 }}>
                {loading ? <><div className="loader" style={{ width: 14, height: 14 }} /> Building...</> : <><Download size={15} /> Download PDF</>}
              </button>
            )}
          </PDFDownloadLink>

          <button className="btn-secondary" onClick={() => setShowPreview(p => !p)}
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13 }}>
            {showPreview ? <><EyeOff size={14} /> Hide Preview</> : <><Eye size={14} /> Show Preview</>}
          </button>

          <button className="btn-ghost" onClick={() => navigate('/profile')}
            style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
            ✏️ Edit Profile Data
          </button>
        </div>

        {/* ── Right: PDF Preview ── */}
        <div style={{ background: '#2a2a3e', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {showPreview ? (
            <PDFViewer width="100%" height="800" style={{ border: 'none', display: 'block' }}>
              {pdfDoc}
            </PDFViewer>
          ) : (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
              <FileDown size={48} color="var(--text-muted)" style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Preview hidden</p>
              <button className="btn-secondary" onClick={() => setShowPreview(true)} style={{ fontSize: 13 }}>
                <Eye size={13} /> Show Preview
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo prompt */}
      {photoPrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div className="glass" style={{ width: 360, padding: 28, borderRadius: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📸</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Include a photo?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>You haven't uploaded a profile photo yet.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setPhotoPrompt(false)}>Continue without</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('/profile')}>
                <Camera size={13} /> Upload Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
