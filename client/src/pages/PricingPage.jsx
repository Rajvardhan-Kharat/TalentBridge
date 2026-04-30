import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Check, Zap, Crown, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, color: '#64748b',
    gradient: 'linear-gradient(135deg,#475569,#64748b)',
    badge: '🆓', frame: 'none',
    features: ['Basic profile','5 applications/month','3 smart searches/day','1 resume template','Community access'],
    limits: ['No priority listing','No direct messaging','Basic analytics only'],
  },
  {
    id: 'gold', name: 'Gold', price: 499, color: '#f59e0b',
    gradient: 'linear-gradient(135deg,#d97706,#f59e0b,#fbbf24)',
    badge: '⭐', frame: 'gold', popular: true,
    features: ['Unlimited applications','20 smart searches/day','5 resume templates','Gold profile frame','Priority listing','Advanced analytics','Email job alerts','LinkedIn optimization tips'],
    limits: [],
  },
  {
    id: 'platinum', name: 'Platinum', price: 999, color: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#6d28d9,#8b5cf6,#a78bfa)',
    badge: '💎', frame: 'platinum',
    features: ['Everything in Gold','Unlimited smart searches','All 15+ templates','Diamond profile frame','Featured candidate','Direct recruiter messaging','Career coach','5 interview prep sessions/month','Salary negotiation toolkit','24/7 priority support'],
    limits: [],
  },
];

function PlanFrame({ plan, size = 60 }) {
  if (plan === 'gold') return (
    <div style={{ position:'relative', width:size, height:size }}>
      <div style={{ position:'absolute', inset:-3, borderRadius:'50%', background:'linear-gradient(135deg,#d97706,#fbbf24,#d97706)', animation:'spin 3s linear infinite' }} />
      <div style={{ position:'absolute', inset:2, borderRadius:'50%', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.4 }}>⭐</div>
    </div>
  );
  if (plan === 'platinum') return (
    <div style={{ position:'relative', width:size, height:size }}>
      <div style={{ position:'absolute', inset:-4, borderRadius:'50%', background:'linear-gradient(135deg,#6d28d9,#a78bfa,#6d28d9,#c4b5fd)', animation:'spin 2s linear infinite', boxShadow:'0 0 20px rgba(139,92,246,0.6)' }} />
      <div style={{ position:'absolute', inset:2, borderRadius:'50%', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.4 }}>💎</div>
    </div>
  );
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'var(--bg-elevated)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.4 }}>🆓</div>
  );
}

export default function PricingPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(null);
  const [showDemo, setShowDemo] = useState(null);
  const currentPlan = user?.subscription?.plan || 'free';

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const { data } = await api.post('/subscription/create-order', { planId });
      setShowDemo({ planId, orderId: data.order.id, plan: PLANS.find(p => p.id === planId) });
    } catch { toast.error('Could not initiate payment'); }
    finally { setLoading(null); }
  };

  const handleDemoConfirm = async () => {
    if (!showDemo) return;
    setLoading('confirm');
    try {
      const { data } = await api.post('/subscription/verify', {
        planId: showDemo.planId,
        orderId: showDemo.orderId,
        paymentId: `pay_DEMO_${Date.now()}`,
        signature: 'DEMO_SIG',
      });
      updateUser(data.user);
      toast.success(`🎉 Welcome to ${showDemo.plan.name}!`);
      setShowDemo(null);
    } catch { toast.error('Payment failed'); }
    finally { setLoading(null); }
  };

  return (
    <div style={{ padding:'32px', maxWidth:1100, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes glow{0%,100%{opacity:0.7}50%{opacity:1}}`}</style>

      <div style={{ textAlign:'center', marginBottom:48 }} className="animate-fade-in">
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:20, padding:'6px 16px', marginBottom:16 }}>
          <Sparkles size={14} color="#818cf8" /><span style={{ fontSize:12, color:'#818cf8', fontWeight:600 }}>UPGRADE YOUR PLAN</span>
        </div>
        <h1 style={{ fontSize:36, fontWeight:800, fontFamily:'Plus Jakarta Sans', marginBottom:12 }}>
          Unlock Your <span style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Full Potential</span>
        </h1>
        <p style={{ color:'var(--text-secondary)', fontSize:16 }}>Choose the plan that matches your career ambition. Cancel anytime.</p>
      </div>

      {/* Current plan badge */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'12px 24px' }}>
          <PlanFrame plan={currentPlan} size={40} />
          <div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>CURRENT PLAN</div>
            <div style={{ fontSize:15, fontWeight:700, textTransform:'capitalize' }}>{currentPlan}</div>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, marginBottom:48 }}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} className="glass" style={{
              padding:28, position:'relative', transition:'all 0.3s',
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border)',
              transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
              boxShadow: plan.popular ? `0 0 40px ${plan.color}33` : 'none',
            }}
              onMouseEnter={e => { if(!plan.popular) e.currentTarget.style.transform='translateY(-4px)'; }}
              onMouseLeave={e => { if(!plan.popular) e.currentTarget.style.transform='translateY(0)'; }}>

              {plan.popular && (
                <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:plan.gradient, color:'white', fontSize:11, fontWeight:700, padding:'4px 16px', borderRadius:20, letterSpacing:1 }}>
                  MOST POPULAR
                </div>
              )}

              {/* Plan header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <PlanFrame plan={plan.frame} size={44} />
                <div>
                  <div style={{ fontSize:18, fontWeight:800 }}>{plan.badge} {plan.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{plan.id === 'free' ? 'Always free' : 'per month'}</div>
                </div>
              </div>

              <div style={{ marginBottom:24 }}>
                <span style={{ fontSize:40, fontWeight:900, background:plan.gradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  {plan.price === 0 ? '₹0' : `₹${plan.price}`}
                </span>
                {plan.price > 0 && <span style={{ color:'var(--text-muted)', fontSize:14 }}>/mo</span>}
              </div>

              <div style={{ marginBottom:24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                    <Check size={14} color={plan.color} style={{ flexShrink:0, marginTop:2 }} />
                    <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
                {plan.limits.map(l => (
                  <div key={l} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                    <X size={14} color="#64748b" style={{ flexShrink:0, marginTop:2 }} />
                    <span style={{ fontSize:13, color:'var(--text-muted)' }}>{l}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || loading === plan.id}
                style={{
                  width:'100%', padding:'12px', borderRadius:12, border:'none', cursor: isCurrent ? 'not-allowed' : 'pointer',
                  background: isCurrent ? 'var(--bg-elevated)' : plan.gradient,
                  color: isCurrent ? 'var(--text-muted)' : 'white',
                  fontWeight:700, fontSize:14, transition:'all 0.2s',
                  opacity: (isCurrent) ? 0.6 : 1,
                }}>
                {isCurrent ? '✓ Current Plan' : loading === plan.id ? 'Processing...' : plan.id === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Demo modal */}
      {showDemo && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(8px)' }}>
          <div className="glass" style={{ width:420, padding:32, borderRadius:20, border:`1px solid ${showDemo.plan.color}44` }}>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>{showDemo.plan.badge}</div>
              <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Demo Payment</h2>
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>This is a demo Razorpay integration. In production, real payment UI appears here.</p>
            </div>
            <div style={{ background:'var(--bg-elevated)', borderRadius:12, padding:16, marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ color:'var(--text-muted)', fontSize:13 }}>Plan</span>
                <span style={{ fontWeight:600 }}>{showDemo.plan.name}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ color:'var(--text-muted)', fontSize:13 }}>Amount</span>
                <span style={{ fontWeight:600 }}>₹{showDemo.plan.price}/month</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text-muted)', fontSize:13 }}>Order ID</span>
                <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'monospace' }}>{showDemo.orderId.slice(0,24)}…</span>
              </div>
            </div>
            <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:12, marginBottom:20 }}>
              <p style={{ fontSize:12, color:'#f59e0b' }}>⚠️ DEMO MODE — Click "Pay Now" to simulate a successful payment and activate your plan.</p>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn-secondary" onClick={() => setShowDemo(null)} style={{ flex:1 }}>Cancel</button>
              <button className="btn-primary" onClick={handleDemoConfirm} disabled={loading === 'confirm'}
                style={{ flex:1, justifyContent:'center', background:showDemo.plan.gradient }}>
                {loading === 'confirm' ? <div className="loader" style={{width:16,height:16}} /> : `💳 Pay ₹${showDemo.plan.price}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature comparison note */}
      <div style={{ textAlign:'center', padding:20, color:'var(--text-muted)', fontSize:13 }}>
        🔒 Secure payments via Razorpay · Cancel anytime · No hidden charges
      </div>
    </div>
  );
}
