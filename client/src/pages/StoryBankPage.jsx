import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { BookOpen, Search, Plus, Trash2, Download, Star, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const SKILL_TAGS = ['Leadership', 'Problem Solving', 'Collaboration', 'Conflict', 'Failure', 'Innovation', 'Delivery', 'Communication', 'Mentorship', 'Growth'];

const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const StoryCard = ({ story, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass animate-fade-in" style={{ padding: '18px', marginBottom: 12, transition: 'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <h3 style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {story.title || 'Untitled Story'}
            </h3>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            {story.skills?.map(s => (
              <span key={s} className="chip chip-yellow" style={{ fontSize: 10 }}>{s}</span>
            ))}
            {story.tool && (
              <span className="chip" style={{ fontSize: 10 }}>via {story.tool}</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
              📅 {fmtDate(story.createdAt)}
            </span>
          </div>

          {/* STAR preview */}
          {story.situation && !expanded && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 0 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>S:</strong> {story.situation.slice(0, 120)}{story.situation.length > 120 ? '...' : ''}
            </p>
          )}

          {/* Full STAR expanded */}
          {expanded && (
            <div style={{ marginTop: 10 }}>
              {story.situation && (
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>Situation</span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 3 }}>{story.situation}</p>
                </div>
              )}
              {story.task && (
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase' }}>Task</span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 3 }}>{story.task}</p>
                </div>
              )}
              {story.action && (
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Action</span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 3, whiteSpace: 'pre-wrap' }}>{story.action}</p>
                </div>
              )}
              {story.result && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>Result</span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 3 }}>{story.result}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn-ghost" style={{ padding: '6px 10px' }} onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button className="btn-ghost" style={{ padding: '6px 10px', color: '#ef4444' }} onClick={() => onDelete(story._id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AddStoryModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ title: '', situation: '', task: '', action: '', result: '', skills: [] });
  const [tagInput, setTagInput] = useState('');

  const addTag = (t) => {
    if (t && !form.skills.includes(t)) setForm(f => ({ ...f, skills: [...f.skills, t] }));
    setTagInput('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="glass" style={{ width: '100%', maxWidth: 600, maxHeight: '85vh', overflowY: 'auto', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add STAR Story</h2>
          <button className="btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Story Title</label>
            <input className="input" placeholder="e.g. Led cross-team migration project" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          {[
            { k: 'situation', l: 'Situation', hint: 'Set the context — what was happening?', color: '#6366f1' },
            { k: 'task',      l: 'Task',      hint: 'What was your responsibility?',          color: '#06b6d4' },
            { k: 'action',    l: 'Action',    hint: 'What specific steps did you take?',      color: '#10b981' },
            { k: 'result',    l: 'Result',    hint: 'What was the measurable outcome?',       color: '#f59e0b' },
          ].map(({ k, l, hint, color }) => (
            <div key={k}>
              <label style={{ fontSize: 12, fontWeight: 700, color, display: 'block', marginBottom: 5 }}>
                {l} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— {hint}</span>
              </label>
              <textarea className="input" rows={3} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
              Tags / Skills
            </label>
            <input className="input" placeholder="Type a tag and press Enter" value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {SKILL_TAGS.filter(t => !form.skills.includes(t)).map(t => (
                <button key={t} type="button" className="btn-ghost"
                  style={{ padding: '3px 10px', fontSize: 11, borderRadius: 20, border: '1px solid var(--border)' }}
                  onClick={() => addTag(t)}>{t}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {form.skills.map(s => (
                <span key={s} className="chip chip-yellow" style={{ cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))}>
                  {s} ×
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { onSave(form); onClose(); }}>
            Save Story
          </button>
        </div>
      </div>
    </div>
  );
};

// Export to plain text (download)
const exportStories = (stories) => {
  const content = stories.map(s => `
═══════════════════════════════════════
${s.title || 'Story'}
Tags: ${s.skills?.join(', ') || 'None'}
Date: ${fmtDate(s.createdAt)}
═══════════════════════════════════════

SITUATION:
${s.situation || '—'}

TASK:
${s.task || '—'}

ACTION:
${s.action || '—'}

RESULT:
${s.result || '—'}
`).join('\n');

  const blob = new Blob([`HIREINDIA — STAR STORY BANK\nExported: ${new Date().toLocaleDateString()}\n${content}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'star-stories.txt'; a.click();
  URL.revokeObjectURL(url);
};

export default function StoryBankPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories', filterTag],
    queryFn: () => {
      const params = filterTag ? `?skill=${filterTag}` : '';
      return api.get(`/tools/stories${params}`).then(r => r.data.stories);
    },
  });

  const handleSave = async (form) => {
    try {
      await api.post('/tools/stories', form);
      qc.invalidateQueries(['stories']);
      toast.success('Story saved to bank!');
    } catch { toast.error('Failed to save story'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tools/stories/${id}`);
      qc.invalidateQueries(['stories']);
      toast.success('Story deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = stories.filter(s =>
    !search || s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.situation?.toLowerCase().includes(search.toLowerCase()) ||
    s.skills?.some(sk => sk.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <BookOpen size={18} color="#818cf8" />
          <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, letterSpacing: 1 }}>MODULE 7 — INTERVIEW STORY BANK</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Interview Story Bank</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Your STAR story library — searchable, exportable, interview-ready
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {stories.length > 0 && (
              <button className="btn-secondary" onClick={() => exportStories(stories)} style={{ padding: '8px 14px', fontSize: 12 }}>
                <Download size={14} /> Export All
              </button>
            )}
            <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', fontSize: 13 }}>
              <Plus size={14} /> Add Story
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="glass animate-fade-in" style={{ padding: '16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="input" placeholder="Search stories by title, content, skill..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          {search && (
            <button className="btn-ghost" onClick={() => setSearch('')} style={{ padding: '8px 12px' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tag filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <Tag size={13} color="var(--text-muted)" />
          <button onClick={() => setFilterTag('')}
            style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: !filterTag ? 'rgba(99,102,241,0.2)' : 'var(--bg-elevated)',
              borderColor: !filterTag ? '#6366f1' : 'var(--border)',
              color: !filterTag ? '#818cf8' : 'var(--text-secondary)' }}>
            All
          </button>
          {SKILL_TAGS.map(t => (
            <button key={t} onClick={() => setFilterTag(filterTag === t ? '' : t)}
              style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: filterTag === t ? 'rgba(245,158,11,0.2)' : 'var(--bg-elevated)',
                borderColor: filterTag === t ? '#f59e0b' : 'var(--border)',
                color: filterTag === t ? '#f59e0b' : 'var(--text-secondary)' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {stories.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Stories',   value: stories.length,             color: '#6366f1' },
            { label: 'Auto Generated',    value: stories.filter(s => s.tool).length, color: '#8b5cf6' },
            { label: 'Showing',         value: filtered.length,            color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '10px 18px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color }}>{value}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
        </div>
      )}

      {!isLoading && stories.length === 0 && (
        <div className="glass" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookOpen size={52} style={{ opacity: 0.2, marginBottom: 14 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>No stories yet</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 380, margin: '0 auto 20px' }}>
            Stories are automatically saved when you use the <strong style={{ color: '#818cf8' }}>Behavioral Story Builder</strong> in the Career Toolkit, or add them manually here.
          </p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Add Your First Story
          </button>
        </div>
      )}

      {!isLoading && stories.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Search size={36} style={{ opacity: 0.2, marginBottom: 10 }} />
          <p>No stories match your search or filter.</p>
          <button className="btn-ghost" onClick={() => { setSearch(''); setFilterTag(''); }} style={{ marginTop: 8 }}>
            Clear filters
          </button>
        </div>
      )}

      {filtered.map(story => (
        <StoryCard key={story._id} story={story} onDelete={handleDelete} />
      ))}

      {/* Add modal */}
      {showAdd && <AddStoryModal onClose={() => setShowAdd(false)} onSave={handleSave} />}

      {/* Tips */}
      {stories.length > 0 && (
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            💡 <strong>Pro tip:</strong> Go to <strong style={{ color: '#818cf8' }}>Career Toolkit → Behavioral Story Builder</strong> to auto-generate 3 STAR stories tailored to your target role — they'll appear here automatically. Export all stories as a PDF prep sheet before your next interview.
          </p>
        </div>
      )}
    </div>
  );
}
