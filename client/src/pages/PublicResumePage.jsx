import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ExternalLink, GitBranch, Link2, Globe, Mail, Briefcase, GraduationCap, Code, Award } from 'lucide-react';

export default function PublicResumePage() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/auth/public/${userId}`)
      .then(({ data }) => { setUserData(data.user); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [userId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loader" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
        <p style={{ color: '#818cf8', fontSize: 14 }}>Loading profile...</p>
      </div>
    </div>
  );

  if (error || !userData) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <h2 style={{ color: '#fff', fontWeight: 700 }}>Profile not found</h2>
      <p style={{ color: '#818cf8', fontSize: 14 }}>This resume link may be invalid or the user doesn't exist.</p>
      <Link to="/" style={{ color: '#6366f1', fontSize: 13, textDecoration: 'none' }}>← Go to TalentBridge</Link>
    </div>
  );

  const p = userData.profile || {};
  const skills = (p.skills || []).map(s => s.name || s).filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Header Card */}
        <div className="glass animate-fade-in" style={{ padding: '32px 36px', borderRadius: 20, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)' }} />
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {userData.avatar ? (
              <img src={userData.avatar} alt={userData.name} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(99,102,241,0.4)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {(userData.name || '?')[0].toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{userData.name}</h1>
              {p.currentTitle && <p style={{ fontSize: 15, color: '#818cf8', fontWeight: 600, marginBottom: 4 }}>{p.currentTitle}</p>}
              {p.headline && <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{p.headline}</p>}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {p.linkedinUrl && (
                  <a href={p.linkedinUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#818cf8', textDecoration: 'none', padding: '4px 10px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20 }}>
                    <Link2 size={12} /> LinkedIn
                  </a>
                )}
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#818cf8', textDecoration: 'none', padding: '4px 10px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20 }}>
                    <GitBranch size={12} /> GitHub
                  </a>
                )}
                {p.portfolioUrl && (
                  <a href={p.portfolioUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#818cf8', textDecoration: 'none', padding: '4px 10px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20 }}>
                    <Globe size={12} /> Portfolio
                  </a>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Powered by</div>
              <span style={{ fontSize: 13, fontWeight: 800, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TalentBridge</span>
            </div>
          </div>

          {p.bio && (
            <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(99,102,241,0.05)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.1)', fontSize: 13, color: '#94a3b8', lineHeight: 1.65 }}>
              {p.bio}
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="glass animate-fade-in" style={{ padding: '24px 28px', borderRadius: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code size={14} /> Skills
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map(s => (
                <span key={s} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {p.workExperience?.length > 0 && (
          <div className="glass animate-fade-in" style={{ padding: '24px 28px', borderRadius: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={14} /> Experience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {p.workExperience.map((w, i) => (
                <div key={i} style={{ borderLeft: '2px solid rgba(99,102,241,0.3)', paddingLeft: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{w.title}</div>
                  <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 600, marginBottom: 4 }}>{w.company}{w.location ? ` · ${w.location}` : ''}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                    {w.startDate} – {w.currentlyWorking ? 'Present' : (w.endDate || 'N/A')}
                  </div>
                  {w.description && <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{w.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {p.education?.length > 0 && (
          <div className="glass animate-fade-in" style={{ padding: '24px 28px', borderRadius: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={14} /> Education
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {p.education.map((e, i) => (
                <div key={i}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{e.degree} in {e.field}</div>
                  <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>{e.institution || e.university}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{e.startYear} – {e.endYear}{e.grade ? ` · Grade: ${e.grade}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {p.projects?.filter(pr => pr.title).length > 0 && (
          <div className="glass animate-fade-in" style={{ padding: '24px 28px', borderRadius: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🚀 Projects
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {p.projects.filter(pr => pr.title).map((pr, i) => (
                <div key={i} style={{ padding: '14px 16px', background: 'rgba(99,102,241,0.05)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{pr.title}</div>
                    {(pr.url || pr.githubUrl) && (
                      <a href={pr.url || pr.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, textDecoration: 'none' }}>
                        <ExternalLink size={11} /> View
                      </a>
                    )}
                  </div>
                  {pr.description && <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.55, marginBottom: pr.techStack?.length > 0 ? 8 : 0 }}>{pr.description}</p>}
                  {pr.techStack?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {pr.techStack.map(t => <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{t}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {p.certifications?.filter(c => c.name).length > 0 && (
          <div className="glass animate-fade-in" style={{ padding: '24px 28px', borderRadius: 16, marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={14} /> Certifications
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {p.certifications.filter(c => c.name).map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{c.issuer}{c.issueDate ? ` · ${c.issueDate}` : ''}</div>
                  </div>
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ExternalLink size={10} /> Verify
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 12, color: '#374151', padding: '16px 0' }}>
          Profile shared via <a href="/" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>TalentBridge</a>
        </div>
      </div>
    </div>
  );
}
