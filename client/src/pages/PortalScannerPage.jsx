import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Globe, ExternalLink, Zap, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const COMPANIES = [
  { name:'Google',       logo:'https://logo.clearbit.com/google.com',     sector:'Big Tech',   color:'#4285f4' },
  { name:'Microsoft',    logo:'https://logo.clearbit.com/microsoft.com',  sector:'Big Tech',   color:'#00a4ef' },
  { name:'Amazon',       logo:'https://logo.clearbit.com/amazon.com',     sector:'Big Tech',   color:'#ff9900' },
  { name:'OpenAI',       logo:'https://logo.clearbit.com/openai.com',     sector:'AI',         color:'#10a37f' },
  { name:'Anthropic',    logo:'https://logo.clearbit.com/anthropic.com',  sector:'AI',         color:'#d97706' },
  { name:'Zomato',       logo:'https://logo.clearbit.com/zomato.com',     sector:'Food Tech',  color:'#e23744' },
  { name:'Swiggy',       logo:'https://logo.clearbit.com/swiggy.com',     sector:'Food Tech',  color:'#fc8019' },
  { name:'Flipkart',     logo:'https://logo.clearbit.com/flipkart.com',   sector:'E-Commerce', color:'#2874f0' },
  { name:'Meesho',       logo:'https://logo.clearbit.com/meesho.com',     sector:'E-Commerce', color:'#f43397' },
  { name:'CRED',         logo:'https://logo.clearbit.com/cred.club',      sector:'FinTech',    color:'#1a1a2e' },
  { name:'Razorpay',     logo:'https://logo.clearbit.com/razorpay.com',   sector:'FinTech',    color:'#3395ff' },
  { name:'PhonePe',      logo:'https://logo.clearbit.com/phonepe.com',    sector:'FinTech',    color:'#6739b7' },
  { name:'Paytm',        logo:'https://logo.clearbit.com/paytm.com',      sector:'FinTech',    color:'#002970' },
  { name:'Infosys',      logo:'https://logo.clearbit.com/infosys.com',    sector:'IT Services',color:'#007cc3' },
  { name:'TCS',          logo:'https://logo.clearbit.com/tcs.com',        sector:'IT Services',color:'#0052cc' },
  { name:'Wipro',        logo:'https://logo.clearbit.com/wipro.com',      sector:'IT Services',color:'#341c7a' },
  { name:'HCL Technologies', logo:'https://logo.clearbit.com/hcltech.com',sector:'IT Services',color:'#003087' },
  { name:'Accenture',    logo:'https://logo.clearbit.com/accenture.com',  sector:'Consulting', color:'#a100ff' },
  { name:'Deloitte',     logo:'https://logo.clearbit.com/deloitte.com',   sector:'Consulting', color:'#86bc25' },
  { name:'Polygon',      logo:'https://logo.clearbit.com/polygon.technology',sector:'Web3',    color:'#8247e5' },
  { name:'Zepto',        logo:'https://logo.clearbit.com/zeptonow.com',   sector:'Q-Commerce',color:'#9b59b6' },
  { name:'Ola',          logo:'https://logo.clearbit.com/olacabs.com',    sector:'Mobility',  color:'#48c774' },
  { name:'Nykaa',        logo:'https://logo.clearbit.com/nykaa.com',      sector:'Beauty',     color:'#fc2779' },
  { name:'Byju\'s',      logo:'https://logo.clearbit.com/byjus.com',      sector:'EdTech',     color:'#2244a9' },
];

const SECTORS = ['All', 'Big Tech', 'AI', 'FinTech', 'Food Tech', 'E-Commerce', 'IT Services', 'Consulting', 'Web3', 'Q-Commerce', 'Mobility', 'EdTech', 'Beauty'];

const fmtSalary = (min, max) => {
  const f = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n}`;
  if (!min && !max) return 'N/A';
  if (min && max) return `${f(min)}–${f(max)}`;
  return min ? `From ${f(min)}` : `Up to ${f(max)}`;
};

export default function PortalScannerPage() {
  const [sector, setSector] = useState('All');
  const [selected, setSelected] = useState(null);
  const [batchEval, setBatchEval] = useState({});

  const filtered = sector === 'All' ? COMPANIES : COMPANIES.filter(c => c.sector === sector);

  const { data: jobs, isFetching } = useQuery({
    queryKey: ['company-jobs', selected?.name],
    queryFn: () => selected ? api.get(`/jobs/company/${encodeURIComponent(selected.name)}`).then(r => r.data.jobs) : [],
    enabled: !!selected,
  });

  const batchEvaluate = async () => {
    if (!jobs?.length) return;
    const todo = jobs.slice(0, 5);
    for (const job of todo) {
      setBatchEval(b => ({...b, [job._id]: 'loading'}));
      try {
        const { data } = await api.post('/ai/evaluate-job', { jobDescription: `${job.title} at ${job.company}. ${job.description} Skills: ${job.skills?.join(', ')}` });
        setBatchEval(b => ({...b, [job._id]: data.evaluation}));
      } catch {
        setBatchEval(b => ({...b, [job._id]: 'error'}));
      }
    }
    toast.success('Batch evaluation complete!');
  };

  return (
    <div style={{ padding:'28px 32px', maxWidth:1100, margin:'0 auto' }}>
      <div style={{ marginBottom:24 }} className="animate-fade-in">
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
          <Globe size={18} color="#818cf8" />
          <span style={{ fontSize:12,color:'#818cf8',fontWeight:600,letterSpacing:1 }}>MODULE 5 — PORTAL SCANNER</span>
        </div>
        <h1 style={{ fontFamily:'Plus Jakarta Sans',fontSize:26,fontWeight:800,marginBottom:4 }}>Portal Scanner</h1>
        <p style={{ color:'var(--text-secondary)',fontSize:14 }}>Browse 24 top Indian & global company job boards in one place</p>
      </div>

      {/* Sector filter */}
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20 }}>
        {SECTORS.map(s => (
          <button key={s} type="button" onClick={() => setSector(s)}
            style={{ padding:'5px 12px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.2s',
              background:sector===s?'rgba(99,102,241,0.2)':'var(--bg-elevated)',
              borderColor:sector===s?'#6366f1':'var(--border)',
              color:sector===s?'#818cf8':'var(--text-secondary)'
            }}>{s}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '300px 1fr' : 'repeat(4,1fr)', gap:16 }}>
        {/* Company grid */}
        <div style={{ display: selected ? 'flex' : 'contents', flexDirection:'column', gap:10 }}>
          {filtered.map(co => (
            <div key={co.name}
              className="glass"
              onClick={() => setSelected(selected?.name===co.name ? null : co)}
              style={{ padding: selected ? '12px' : '18px', cursor:'pointer', transition:'all 0.2s',
                borderColor: selected?.name===co.name ? co.color : 'var(--border)',
                background: selected?.name===co.name ? `${co.color}10` : undefined,
              }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <img src={co.logo} alt={co.name} style={{ width:32,height:32,objectFit:'contain',borderRadius:6 }}
                  onError={e => e.target.style.display='none'} />
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{co.name}</div>
                  {!selected && <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:1 }}>{co.sector}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs panel */}
        {selected && (
          <div className="animate-fade-in">
            <div className="glass" style={{ padding:'20px',marginBottom:14 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10 }}>
                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <img src={selected.logo} alt={selected.name} style={{ width:44,height:44,objectFit:'contain',borderRadius:10 }}
                    onError={e => e.target.style.display='none'} />
                  <div>
                    <h3 style={{ fontSize:17,fontWeight:800 }}>{selected.name}</h3>
                    <span className="chip" style={{ fontSize:11 }}>{selected.sector}</span>
                  </div>
                </div>
                <div style={{ display:'flex',gap:10 }}>
                  <button className="btn-secondary" onClick={batchEvaluate} style={{ fontSize:12,padding:'8px 14px' }}>
                    <Zap size={13} /> Batch Evaluate
                  </button>
                </div>
              </div>
            </div>

            {isFetching && (
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:90,borderRadius:12 }} />)}
              </div>
            )}

            {!isFetching && jobs?.length === 0 && (
              <div className="glass" style={{ padding:'40px',textAlign:'center',color:'var(--text-muted)' }}>
                <Building size={40} style={{ opacity:0.2,marginBottom:8 }} />
                <p>No open roles found for {selected.name} in our database.</p>
                <p style={{ fontSize:12,marginTop:4 }}>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(selected.name+' careers jobs')}`} target="_blank" rel="noreferrer" style={{ color:'#818cf8' }}>
                    Search careers page <ExternalLink size={12} />
                  </a>
                </p>
              </div>
            )}

            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {jobs?.map(job => {
                const eval_ = batchEval[job._id];
                return (
                  <div key={job._id} className="glass" style={{ padding:'16px' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8 }}>
                      <div>
                        <div style={{ fontSize:14,fontWeight:700 }}>{job.title}</div>
                        <div style={{ fontSize:12,color:'var(--text-muted)',marginTop:3 }}>
                          {job.location} • {fmtSalary(job.salaryMin,job.salaryMax)} • {job.locationType}
                        </div>
                        <div style={{ display:'flex',flexWrap:'wrap',gap:4,marginTop:6 }}>
                          {job.skills?.slice(0,4).map(s => <span key={s} className="chip" style={{fontSize:10}}>{s}</span>)}
                        </div>
                      </div>
                      <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                        {eval_ === 'loading' && <div className="loader" style={{width:16,height:16}} />}
                        {eval_ && eval_ !== 'loading' && eval_ !== 'error' && (
                          <span className={`grade-${eval_.grade}`} style={{ padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700 }}>
                            {eval_.grade} {eval_.overallScore?.toFixed(1)}
                          </span>
                        )}
                        {job.applyUrl && (
                          <a href={job.applyUrl} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding:'6px 10px',fontSize:12 }}>
                            Apply <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
