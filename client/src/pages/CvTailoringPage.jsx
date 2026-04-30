import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { FileText, Upload, Wand2, Trash2, Download, Eye, Clock, FileDown } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

const SimplePDF = ({ text, title }) => {
  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.6, color: '#333' },
    title: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 20, color: '#4F46E5', borderBottom: '1px solid #e5e7eb', paddingBottom: 10 },
    content: { fontSize: 10, fontFamily: 'Helvetica' }
  });
  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.content}>{text}</Text>
      </Page>
    </Document>
  );
};

export default function CvTailoringPage() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState({ jobDescription:'', jobTitle:'', company:'' });

  const { data: vault, isLoading } = useQuery({
    queryKey: ['cv-vault'],
    queryFn: () => api.get('/cv/vault').then(r => r.data.versions),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    onDrop: async ([file]) => {
      setUploading(true);
      try {
        const fd = new FormData(); fd.append('cv', file);
        await api.post('/cv/upload', fd, { headers:{'Content-Type':'multipart/form-data'} });
        toast.success('CV uploaded and parsed!');
        qc.invalidateQueries(['cv-vault']);
      } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
      finally { setUploading(false); }
    }
  });

  const handleTailor = async () => {
    if (!form.jobDescription.trim()) { toast.error('Paste a job description'); return; }
    setTailoring(true);
    try {
      await api.post('/cv/tailor', form);
      toast.success('Tailored CV created and saved to vault!');
      qc.invalidateQueries(['cv-vault']);
      setForm({ jobDescription:'', jobTitle:'', company:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Tailoring failed'); }
    finally { setTailoring(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/cv/${id}`); qc.invalidateQueries(['cv-vault']); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ padding:'28px 32px',maxWidth:1000,margin:'0 auto' }}>
      <div style={{ marginBottom:24 }} className="animate-fade-in">
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
          <FileText size={18} color="#818cf8" />
          <span style={{ fontSize:12,color:'#818cf8',fontWeight:600,letterSpacing:1 }}>MODULE 3 — CV TAILORING ENGINE</span>
        </div>
        <h1 style={{ fontFamily:'Plus Jakarta Sans',fontSize:26,fontWeight:800,marginBottom:4 }}>CV Tailoring Engine</h1>
        <p style={{ color:'var(--text-secondary)',fontSize:14 }}>System generates ATS-optimized resumes tailored per job</p>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24 }}>
        {/* Upload Base CV */}
        <div className="glass animate-fade-in" style={{ padding:'24px' }}>
          <h3 style={{ fontSize:15,fontWeight:700,marginBottom:4 }}>Upload Base CV</h3>
          <p style={{ color:'var(--text-muted)',fontSize:12,marginBottom:16 }}>PDF or TXT — System will parse and use this as the source</p>
          <div {...getRootProps()} style={{
            border:`2px dashed ${isDragActive?'#6366f1':'var(--border)'}`,
            borderRadius:12, padding:'28px', textAlign:'center', cursor:'pointer',
            background:isDragActive?'rgba(99,102,241,0.05)':'var(--bg-elevated)', transition:'all 0.2s'
          }}>
            <input {...getInputProps()} />
            {uploading
              ? <div className="loader" style={{ margin:'0 auto' }} />
              : <>
                  <Upload size={32} color="var(--text-muted)" style={{ marginBottom:10 }} />
                  <p style={{ fontSize:13,color:'var(--text-secondary)',fontWeight:500 }}>
                    {isDragActive ? 'Drop it here!' : 'Drag & drop your CV'}
                  </p>
                  <p style={{ fontSize:11,color:'var(--text-muted)',marginTop:4 }}>or click to browse • PDF, TXT (max 10MB)</p>
                </>
            }
          </div>
        </div>

        {/* Tailor for Job */}
        <div className="glass animate-fade-in" style={{ padding:'24px' }}>
          <h3 style={{ fontSize:15,fontWeight:700,marginBottom:4 }}>Tailor for a Job</h3>
          <p style={{ color:'var(--text-muted)',fontSize:12,marginBottom:12 }}>System rewrites your CV to match this specific JD</p>
          <div style={{ display:'flex',gap:10,marginBottom:10 }}>
            <input className="input" placeholder="Job Title" value={form.jobTitle}
              onChange={e => setForm(f => ({...f,jobTitle:e.target.value}))} style={{ flex:1 }} />
            <input className="input" placeholder="Company" value={form.company}
              onChange={e => setForm(f => ({...f,company:e.target.value}))} style={{ flex:1 }} />
          </div>
          <textarea className="input" rows={5} placeholder="Paste the job description..."
            value={form.jobDescription} onChange={e => setForm(f => ({...f,jobDescription:e.target.value}))} />
          <button className="btn-primary" onClick={handleTailor} disabled={tailoring} style={{ width:'100%',justifyContent:'center',marginTop:10,padding:'10px' }}>
            {tailoring ? <><div className="loader" style={{width:16,height:16}} /> Tailoring...</> : <><Wand2 size={15} /> Tailor My CV</>}
          </button>
        </div>
      </div>

      {/* CV Vault */}
      <div className="glass animate-fade-in" style={{ padding:'24px' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <h3 style={{ fontSize:15,fontWeight:700 }}>CV Vault</h3>
          <span style={{ fontSize:12,color:'var(--text-muted)' }}>{vault?.length || 0} versions</span>
        </div>

        {isLoading && <div className="skeleton" style={{ height:120,borderRadius:12 }} />}

        {!isLoading && vault?.length === 0 && (
          <div style={{ textAlign:'center',padding:'32px',color:'var(--text-muted)' }}>
            <FileText size={40} style={{ opacity:0.2,marginBottom:8 }} />
            <p style={{ fontSize:13 }}>No CV versions yet. Upload your base CV and tailor it for jobs.</p>
          </div>
        )}

        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {vault?.map(v => (
            <div key={v._id} style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 16px',background:'var(--bg-elevated)',borderRadius:12,border:'1px solid var(--border)' }}>
              <div style={{ width:40,height:40,borderRadius:10,background:v.isBase?'rgba(99,102,241,0.15)':'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <FileText size={18} color={v.isBase?'#818cf8':'#10b981'} />
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:14,fontWeight:600 }}>{v.label || 'Untitled CV'}</div>
                <div style={{ display:'flex',gap:10,marginTop:2 }}>
                  {v.isBase && <span className="chip" style={{ fontSize:10 }}>BASE</span>}
                  <span style={{ fontSize:11,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:3 }}>
                    <Clock size={10} /> {fmtDate(v.createdAt)}
                  </span>
                  {v.company && <span style={{ fontSize:11,color:'var(--text-muted)' }}>@{v.company}</span>}
                </div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button className="btn-ghost" style={{ padding:'6px 10px' }} onClick={() => setViewing(viewing?._id===v._id?null:v)}>
                  <Eye size={14} />
                </button>
                {v.pdfUrl ? (
                  <a href={v.pdfUrl} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding:'6px 10px' }} title="Download Base PDF">
                    <Download size={14} />
                  </a>
                ) : (
                  <>
                    <button className="btn-ghost" style={{ padding:'6px 10px' }} title="Download Text" onClick={() => {
                      const blob = new Blob([v.tailoredContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = `${v.label}.txt`; a.click();
                    }}>
                      <FileText size={14} />
                    </button>
                    <PDFDownloadLink document={<SimplePDF text={v.tailoredContent} title={v.label} />} fileName={`${v.label}.pdf`} style={{ textDecoration: 'none' }}>
                      {({ loading }) => (
                        <button className="btn-ghost" style={{ padding:'6px 10px', opacity: loading ? 0.5 : 1 }} title="Download PDF" disabled={loading}>
                          <FileDown size={14} />
                        </button>
                      )}
                    </PDFDownloadLink>
                  </>
                )}
                {!v.isBase && (
                  <button className="btn-ghost" style={{ padding:'6px 10px',color:'#ef4444' }} onClick={() => handleDelete(v._id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viewer */}
      {viewing && (
        <div className="glass animate-fade-in" style={{ padding:'24px',marginTop:16 }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:12 }}>
            <h4 style={{ fontSize:14,fontWeight:700 }}>{viewing.label}</h4>
            <button className="btn-ghost" onClick={() => setViewing(null)} style={{ fontSize:12 }}>Close ×</button>
          </div>
          <pre style={{ whiteSpace:'pre-wrap',fontSize:13,color:'var(--text-secondary)',lineHeight:1.7,fontFamily:'Inter,monospace',maxHeight:500,overflowY:'auto' }}>
            {viewing.tailoredContent || 'No content available'}
          </pre>
        </div>
      )}
    </div>
  );
}
