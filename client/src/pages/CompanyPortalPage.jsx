import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, Building, MapPin, DollarSign, Users, Eye, EyeOff, Briefcase, Globe, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_JOB = {
  title: '', description: '', requirements: '', skills: '',
  location: '', locationType: 'onsite', salaryMin: '', salaryMax: '',
  jobType: 'full-time', industry: '', experience: '1-3 years',
  applyUrl: '', closingDate: '',
};

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'];
const LOCATION_TYPES = ['onsite', 'remote', 'hybrid'];
const EXPERIENCE_OPTIONS = ['fresher', '1-3 years', '3-5 years', '5-10 years', '10+ years'];

function JobFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_JOB, ...(initial || {}) });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Title and description are required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        requirements: form.requirements ? form.requirements.split('\n').filter(Boolean) : [],
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error('Failed to save job');
    } finally { setSaving(false); }
  };

  const inputStyle = { marginBottom: 12 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 999, overflowY: 'auto', padding: '24px 16px' }}>
      <div className="glass" style={{ width: '100%', maxWidth: 620, borderRadius: 20, padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>{initial ? 'Edit Job' : 'Post a New Job'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Job Title *</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior React Developer" required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Industry</label>
              <input className="input" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. Technology, Finance" />
            </div>
          </div>

          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Job Description *</label>
          <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the role, responsibilities, and what makes it exciting..." rows={5} style={{ marginBottom: 12, resize: 'vertical', fontFamily: 'inherit' }} required />

          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Requirements (one per line)</label>
          <textarea className="input" value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder={"3+ years of React experience\nStrong TypeScript skills\nFamiliarity with REST APIs"} rows={3} style={{ marginBottom: 12, resize: 'vertical', fontFamily: 'inherit' }} />

          <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Skills (comma-separated)</label>
          <input className="input" value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="React, TypeScript, Node.js, AWS" style={{ marginBottom: 12 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Job Type</label>
              <select className="input" value={form.jobType} onChange={e => set('jobType', e.target.value)}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Work Mode</label>
              <select className="input" value={form.locationType} onChange={e => set('locationType', e.target.value)}>
                {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Experience</label>
              <select className="input" value={form.experience} onChange={e => set('experience', e.target.value)}>
                {EXPERIENCE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Bangalore, India" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Min Salary (₹)</label>
              <input className="input" type="number" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} placeholder="500000" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Max Salary (₹)</label>
              <input className="input" type="number" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} placeholder="1200000" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Apply URL (optional)</label>
              <input className="input" value={form.applyUrl} onChange={e => set('applyUrl', e.target.value)} placeholder="https://yourcompany.com/careers/..." />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>Closing Date (optional)</label>
              <input className="input" type="date" value={form.closingDate} onChange={e => set('closingDate', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 2, justifyContent: 'center' }}>
              {saving ? <><div className="loader" style={{ width: 14, height: 14 }} /> Saving...</> : <><CheckCircle size={14} /> {initial ? 'Update Job' : 'Post Job'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompanyPortalPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data } = await api.get('/company/jobs');
      setJobs(data.jobs || []);
    } catch { toast.error('Could not load your jobs'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (payload) => {
    const { data } = await api.post('/company/jobs', payload);
    setJobs(prev => [data.job, ...prev]);
    toast.success('Job posted successfully!');
  };

  const handleUpdate = async (payload) => {
    const { data } = await api.put(`/company/jobs/${editingJob._id}`, payload);
    setJobs(prev => prev.map(j => j._id === editingJob._id ? data.job : j));
    toast.success('Job updated!');
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Remove this job posting?')) return;
    try {
      await api.delete(`/company/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success('Job removed');
    } catch { toast.error('Could not remove job'); }
  };

  const toggleActive = async (job) => {
    try {
      const { data } = await api.put(`/company/jobs/${job._id}`, { isActive: !job.isActive });
      setJobs(prev => prev.map(j => j._id === job._id ? data.job : j));
      toast.success(data.job.isActive ? 'Job is now live' : 'Job hidden from seekers');
    } catch { toast.error('Failed'); }
  };

  const cp = user?.companyProfile || {};

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }} className="animate-fade-in">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Building size={18} color="#818cf8" />
            <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, letterSpacing: 1 }}>COMPANY PORTAL</span>
          </div>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {cp.companyName || user?.name || 'Company'} Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {jobs.length} active job{jobs.length !== 1 ? 's' : ''} posted · Visible to thousands of job seekers
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingJob(null); setShowModal(true); }}>
          <Plus size={15} /> Post a Job
        </button>
      </div>

      {/* Company info bar */}
      <div className="glass animate-fade-in" style={{ padding: '16px 20px', borderRadius: 14, marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {cp.logo ? (
          <img src={cp.logo} alt="logo" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8 }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff' }}>🏢</div>
        )}
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{cp.companyName || user?.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {cp.industry && <span>🏭 {cp.industry}</span>}
            {cp.headquarters && <span><MapPin size={10} style={{ verticalAlign: 'middle' }} /> {cp.headquarters}</span>}
            {cp.size && <span><Users size={10} style={{ verticalAlign: 'middle' }} /> {cp.size} employees</span>}
            {cp.website && <a href={cp.website} target="_blank" rel="noreferrer" style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}><Globe size={10} /> Website</a>}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#818cf8' }}>{cp.totalJobsPosted || 0}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total Posted</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{jobs.filter(j => j.isActive).length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Live Now</div>
          </div>
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass animate-fade-in" style={{ padding: '60px 32px', textAlign: 'center', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No jobs posted yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Post your first job and start reaching top talent on TalentBridge</p>
          <button className="btn-primary" onClick={() => { setEditingJob(null); setShowModal(true); }}>
            <Plus size={14} /> Post Your First Job
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map(job => (
            <div key={job._id} className="glass animate-fade-in" style={{ padding: '18px 22px', borderRadius: 14, display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'transform 0.2s', borderLeft: `3px solid ${job.isActive ? '#10b981' : '#374151'}` }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{job.title}</h3>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700, background: job.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', color: job.isActive ? '#10b981' : '#64748b' }}>
                    {job.isActive ? '● LIVE' : '○ HIDDEN'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{job.location}</span>}
                  <span className={`chip chip-${job.locationType === 'remote' ? 'green' : 'yellow'}`} style={{ fontSize: 10 }}>{job.locationType}</span>
                  <span className="chip" style={{ fontSize: 10 }}>{job.jobType}</span>
                  {(job.salaryMin || job.salaryMax) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <DollarSign size={11} />
                      {job.salaryMin ? `₹${(job.salaryMin/100000).toFixed(1)}L` : ''}
                      {job.salaryMin && job.salaryMax ? ' – ' : ''}
                      {job.salaryMax ? `₹${(job.salaryMax/100000).toFixed(1)}L` : ''}
                    </span>
                  )}
                </div>
                {job.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                    {job.skills.slice(0, 6).map(s => <span key={s} className="chip" style={{ fontSize: 10 }}>{s}</span>)}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <button onClick={() => toggleActive(job)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 11 }} title={job.isActive ? 'Hide job' : 'Make live'}>
                  {job.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => { setEditingJob(job); setShowModal(true); }} className="btn-secondary" style={{ padding: '6px 10px', fontSize: 11 }}>
                  <Edit3 size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(job._id)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 11, color: '#ef4444' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <JobFormModal
          initial={editingJob ? {
            ...editingJob,
            skills: (editingJob.skills || []).join(', '),
            requirements: (editingJob.requirements || []).join('\n'),
          } : null}
          onSave={editingJob ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setEditingJob(null); }}
        />
      )}
    </div>
  );
}
