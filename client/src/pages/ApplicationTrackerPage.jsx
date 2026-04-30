import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Kanban, Plus, Trash2, Edit2, X, Check, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

const COLUMNS = [
  { key:'discovered', label:'Discovered',  color:'#6366f1' },
  { key:'applied',    label:'Applied',     color:'#06b6d4' },
  { key:'interview',  label:'Interview',   color:'#f59e0b' },
  { key:'offer',      label:'Offer',       color:'#10b981' },
  { key:'rejected',   label:'Rejected',    color:'#ef4444' },
];

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '';

const AddCard = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState({ jobTitle:'', company:'', notes:'' });
  return (
    <div style={{ background:'var(--bg-elevated)',borderRadius:12,padding:'12px',border:'1px solid #6366f1' }}>
      <input className="input" placeholder="Job Title" value={form.jobTitle}
        onChange={e => setForm(f=>({...f,jobTitle:e.target.value}))} style={{ marginBottom:8 }} />
      <input className="input" placeholder="Company" value={form.company}
        onChange={e => setForm(f=>({...f,company:e.target.value}))} style={{ marginBottom:8 }} />
      <textarea className="input" rows={2} placeholder="Notes..." value={form.notes}
        onChange={e => setForm(f=>({...f,notes:e.target.value}))} style={{ marginBottom:8 }} />
      <div style={{ display:'flex',gap:6 }}>
        <button className="btn-primary" style={{ flex:1,justifyContent:'center',padding:'7px',fontSize:12 }}
          onClick={() => onAdd(form)}><Check size={13} /> Add</button>
        <button className="btn-ghost" style={{ padding:'7px 10px' }} onClick={onCancel}><X size={13} /></button>
      </div>
    </div>
  );
};

const AppCard = ({ app, onStatusChange, onDelete, onNote }) => {
  const [editNote, setEditNote] = useState(false);
  const [note, setNote] = useState(app.notes || '');
  const grade = app.matchGrade;
  return (
    <div style={{ background:'var(--bg-elevated)',borderRadius:12,padding:'12px',border:'1px solid var(--border)',marginBottom:8,transition:'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(99,102,241,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6 }}>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ fontSize:13,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{app.jobTitle || app.job?.title}</div>
          <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:1 }}>{app.company || app.job?.company}</div>
        </div>
        {grade && (
          <span className={`grade-${grade}`} style={{ padding:'2px 7px',borderRadius:20,fontSize:10,fontWeight:700,flexShrink:0,marginLeft:6 }}>{grade}</span>
        )}
      </div>
      {fmtDate(app.appliedAt || app.createdAt) && (
        <div style={{ fontSize:10,color:'var(--text-muted)',marginBottom:6 }}>📅 {fmtDate(app.appliedAt || app.createdAt)}</div>
      )}
      {editNote ? (
        <div>
          <textarea className="input" rows={2} value={note} onChange={e => setNote(e.target.value)} style={{ fontSize:12 }} />
          <div style={{ display:'flex',gap:4,marginTop:4 }}>
            <button className="btn-primary" style={{ padding:'4px 8px',fontSize:11 }} onClick={() => { onNote(app._id, note); setEditNote(false); }}><Check size={11} /></button>
            <button className="btn-ghost" style={{ padding:'4px 8px' }} onClick={() => setEditNote(false)}><X size={11} /></button>
          </div>
        </div>
      ) : (
        note && <p style={{ fontSize:11,color:'var(--text-muted)',marginBottom:6,lineHeight:1.4 }}>{note}</p>
      )}
      <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginTop:4 }}>
        {COLUMNS.filter(c => c.key !== app.status).slice(0,2).map(c => (
          <button key={c.key} style={{ padding:'3px 7px',borderRadius:20,fontSize:10,fontWeight:600,cursor:'pointer',background:`${c.color}22`,color:c.color,border:`1px solid ${c.color}44` }}
            onClick={() => onStatusChange(app._id, c.key)}>→ {c.label}</button>
        ))}
        <button className="btn-ghost" style={{ padding:'3px 7px',fontSize:10 }} onClick={() => setEditNote(true)}><Edit2 size={10} /></button>
        <button style={{ padding:'3px 7px',borderRadius:20,fontSize:10,color:'#ef4444',background:'rgba(239,68,68,0.1)',border:'none',cursor:'pointer',marginLeft:'auto' }}
          onClick={() => onDelete(app._id)}><Trash2 size={10} /></button>
      </div>
    </div>
  );
};

export default function ApplicationTrackerPage() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(null);
  const [view, setView] = useState('kanban');

  const { data: apps=[], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.get('/applications').then(r => r.data.applications),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/applications/analytics').then(r => r.data.analytics),
  });

  const handleAdd = async (colKey, form) => {
    try {
      await api.post('/applications', { ...form, status: colKey });
      qc.invalidateQueries(['applications']); qc.invalidateQueries(['analytics']);
      setAdding(null); toast.success('Application added!');
    } catch { toast.error('Failed to add'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/applications/${id}`, { status });
      qc.invalidateQueries(['applications']); qc.invalidateQueries(['analytics']);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/applications/${id}`);
      qc.invalidateQueries(['applications']); qc.invalidateQueries(['analytics']);
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleNote = async (id, notes) => {
    try { await api.put(`/applications/${id}`, { notes }); qc.invalidateQueries(['applications']); }
    catch { toast.error('Failed to save note'); }
  };

  const colApps = (col) => apps.filter(a => a.status === col);

  return (
    <div style={{ padding:'28px 32px', display:'flex',flexDirection:'column',height:'100%' }}>
      <div style={{ marginBottom:20 }} className="animate-fade-in">
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
          <Kanban size={18} color="#818cf8" />
          <span style={{ fontSize:12,color:'#818cf8',fontWeight:600,letterSpacing:1 }}>MODULE 6 — APPLICATION TRACKER</span>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'Plus Jakarta Sans',fontSize:26,fontWeight:800,marginBottom:4 }}>Application Tracker</h1>
            <p style={{ color:'var(--text-secondary)',fontSize:14 }}>Kanban pipeline to track your full job search journey</p>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            <button className={view==='kanban'?'btn-primary':'btn-secondary'} style={{ padding:'7px 14px',fontSize:12 }} onClick={() => setView('kanban')}>Kanban</button>
            <button className={view==='analytics'?'btn-primary':'btn-secondary'} style={{ padding:'7px 14px',fontSize:12 }} onClick={() => setView('analytics')}>
              <BarChart2 size={13} /> Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Analytics view */}
      {view === 'analytics' && analytics && (
        <div className="animate-fade-in" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20 }}>
          {[
            { l:'Total Applications',    v: analytics.total,                    c:'#6366f1' },
            { l:'Response Rate',         v: `${analytics.responseRate}%`,        c:'#10b981' },
            { l:'Avg Match Score',        v: `${analytics.avgMatchScore}/5.0`,    c:'#8b5cf6' },
            { l:'Interviews Secured',    v: analytics.interviews,               c:'#f59e0b' },
            { l:'Offers Received',       v: analytics.offers,                   c:'#10b981' },
            { l:'Applied (not Discovered)',v: analytics.applied,                c:'#06b6d4' },
          ].map(({ l, v, c }) => (
            <div key={l} className="glass" style={{ padding:'20px' }}>
              <div style={{ fontSize:28,fontWeight:800,color:c,marginBottom:4 }}>{v}</div>
              <div style={{ fontSize:13,color:'var(--text-secondary)' }}>{l}</div>
            </div>
          ))}
          <div className="glass" style={{ gridColumn:'1/-1',padding:'20px' }}>
            <h3 style={{ fontSize:14,fontWeight:700,marginBottom:12 }}>Pipeline Breakdown</h3>
            <div style={{ display:'flex',gap:0,height:24,borderRadius:12,overflow:'hidden' }}>
              {COLUMNS.map(col => {
                const cnt = analytics.byStatus?.[col.key] || 0;
                const pct = analytics.total > 0 ? (cnt/analytics.total*100) : 0;
                return pct > 0 ? (
                  <div key={col.key} style={{ width:`${pct}%`,background:col.color,display:'flex',alignItems:'center',justifyContent:'center' }}
                    title={`${col.label}: ${cnt}`}>
                    <span style={{ fontSize:10,fontWeight:700,color:'white' }}>{cnt}</span>
                  </div>
                ) : null;
              })}
            </div>
            <div style={{ display:'flex',gap:12,marginTop:8,flexWrap:'wrap' }}>
              {COLUMNS.map(col => (
                <div key={col.key} style={{ display:'flex',alignItems:'center',gap:5 }}>
                  <div style={{ width:10,height:10,borderRadius:2,background:col.color }} />
                  <span style={{ fontSize:11,color:'var(--text-muted)' }}>{col.label}: {analytics.byStatus?.[col.key]||0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kanban board */}
      {view === 'kanban' && (
        <div style={{ display:'flex',gap:16,overflowX:'auto',flex:1,paddingBottom:8 }} className="animate-fade-in">
          {COLUMNS.map(col => (
            <div key={col.key} style={{ flex:'0 0 240px',display:'flex',flexDirection:'column',minWidth:240 }}>
              {/* Column header */}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'var(--bg-surface)',borderRadius:'12px 12px 0 0',border:'1px solid var(--border)',borderBottom:'none' }}>
                <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                  <div style={{ width:8,height:8,borderRadius:'50%',background:col.color }} />
                  <span style={{ fontSize:12,fontWeight:700 }}>{col.label}</span>
                </div>
                <span style={{ fontSize:11,background:`${col.color}22`,color:col.color,padding:'1px 7px',borderRadius:20,fontWeight:700 }}>
                  {colApps(col.key).length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ flex:1,overflowY:'auto',padding:'10px',background:'var(--bg-surface)',border:'1px solid var(--border)',borderTop:'none',borderRadius:'0 0 12px 12px',minHeight:300 }}>
                {isLoading && <div className="skeleton" style={{ height:80,borderRadius:10 }} />}
                {colApps(col.key).map(app => (
                  <AppCard key={app._id} app={app}
                    onStatusChange={handleStatusChange} onDelete={handleDelete} onNote={handleNote} />
                ))}
                {adding === col.key
                  ? <AddCard onAdd={(form) => handleAdd(col.key, form)} onCancel={() => setAdding(null)} />
                  : <button className="btn-ghost" onClick={() => setAdding(col.key)}
                      style={{ width:'100%',justifyContent:'center',padding:'8px',fontSize:12,borderRadius:10,border:'1px dashed var(--border)' }}>
                      <Plus size={13} /> Add
                    </button>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
