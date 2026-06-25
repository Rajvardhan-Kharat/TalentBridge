import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Star, Crown, Briefcase, GraduationCap, TrendingUp, Globe2, Users, Award, Zap } from 'lucide-react';

export const CAREER_TIERS = {
  fresher: {
    id: 'fresher',
    label: 'Freshers & Early Career',
    sub: 'Up to 5 Years Experience',
    icon: GraduationCap,
    emoji: '🌱',
    description: 'Launch your career with confidence. Discover entry-level roles, internships, graduate programs, and early-career opportunities across India and globally.',
    tags: ['Entry Level', 'Graduate Programs', 'Internships', 'Trainee Roles'],
    color: '#10b981',
    colorDim: 'rgba(16,185,129,0.12)',
    colorBorder: 'rgba(16,185,129,0.25)',
    colorGlow: 'rgba(16,185,129,0.3)',
    gradient: 'linear-gradient(135deg, #059669, #10b981, #34d399)',
    gradientBg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,214,160,0.04) 100%)',
    stats: [
      { icon: Briefcase, label: 'Entry Roles', value: '12K+' },
      { icon: Globe2,    label: 'Companies',   value: '2,400+' },
      { icon: Star,      label: 'Avg. Package', value: '₹4-8L' },
    ],
  },
  midlevel: {
    id: 'midlevel',
    label: 'Mid-Level Careers',
    sub: 'Up to 15 Years Experience',
    icon: TrendingUp,
    emoji: '🚀',
    description: 'Accelerate your growth. Find leadership, managerial, and specialist roles that match your expertise across top-tier organizations in India and worldwide.',
    tags: ['Manager', 'Team Lead', 'Senior Specialist', 'Technical Lead'],
    color: '#818cf8',
    colorDim: 'rgba(99,102,241,0.12)',
    colorBorder: 'rgba(99,102,241,0.25)',
    colorGlow: 'rgba(99,102,241,0.35)',
    gradient: 'linear-gradient(135deg, #4f46e5, #6366f1, #818cf8)',
    gradientBg: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)',
    stats: [
      { icon: Briefcase, label: 'Mid Roles',    value: '28K+' },
      { icon: Globe2,    label: 'Companies',    value: '5,100+' },
      { icon: Star,      label: 'Avg. Package', value: '₹15-45L' },
    ],
  },
  senior: {
    id: 'senior',
    label: 'Senior & Executive',
    sub: 'More than 15 Years Experience',
    icon: Crown,
    emoji: '👑',
    description: 'Command the C-Suite. Exclusive CXO, President, VP, and Board-level opportunities. Confidential executive search across Fortune 500s and global conglomerates.',
    tags: ['CXO', 'President', 'Vice President', 'Director', 'Board Member'],
    color: '#f59e0b',
    colorDim: 'rgba(245,158,11,0.12)',
    colorBorder: 'rgba(245,158,11,0.25)',
    colorGlow: 'rgba(245,158,11,0.35)',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)',
    gradientBg: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(251,191,36,0.04) 100%)',
    stats: [
      { icon: Briefcase, label: 'C-Suite Roles', value: '3,200+' },
      { icon: Globe2,    label: 'Organizations',  value: '900+' },
      { icon: Award,     label: 'Avg. Package',   value: '₹1Cr+' },
    ],
  },
};

export function useCareerTier() {
  const [tier, setTierState] = useState(() => localStorage.getItem('hi_career_tier') || null);
  const setTier = (t) => {
    localStorage.setItem('hi_career_tier', t);
    setTierState(t);
  };
  return [tier, setTier];
}

function TierCard({ tier, onSelect, isSelected }) {
  const Icon = tier.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(tier.id)}
      style={{
        position: 'relative',
        padding: '32px 28px',
        borderRadius: 20,
        border: `1.5px solid ${isSelected || hovered ? tier.colorBorder : 'rgba(255,255,255,0.06)'}`,
        background: isSelected || hovered ? tier.gradientBg : 'rgba(255,255,255,0.02)',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 20px 60px ${tier.colorGlow}, 0 0 0 1px ${tier.colorBorder}` : 'none',
        overflow: 'hidden',
        flex: 1,
        minWidth: 280,
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: tier.colorDim,
        filter: 'blur(40px)',
        opacity: hovered ? 1 : 0.3,
        transition: 'opacity 0.4s',
        pointerEvents: 'none',
      }} />

      {/* Emoji + Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: tier.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 24px ${tier.colorGlow}`,
          transition: 'transform 0.3s',
          transform: hovered ? 'rotate(-6deg) scale(1.1)' : 'rotate(0) scale(1)',
          fontSize: 28,
        }}>
          {tier.emoji}
        </div>
        {isSelected && (
          <div style={{
            marginLeft: 'auto', padding: '4px 12px', borderRadius: 20,
            background: tier.colorDim, border: `1px solid ${tier.colorBorder}`,
            fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: 0.5,
          }}>
            ✓ ACTIVE
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ marginBottom: 6 }}>
        <h2 style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: 20, fontWeight: 800,
          color: hovered || isSelected ? tier.color : '#f1f5f9',
          transition: 'color 0.3s', marginBottom: 4,
        }}>
          {tier.label}
        </h2>
        <div style={{
          fontSize: 12, fontWeight: 600, color: tier.color,
          opacity: 0.8, letterSpacing: 0.3,
        }}>
          {tier.sub}
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 13, color: '#94a3b8', lineHeight: 1.65,
        marginBottom: 20, marginTop: 10,
      }}>
        {tier.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
        {tier.tags.map(tag => (
          <span key={tag} style={{
            padding: '3px 10px', borderRadius: 20,
            background: tier.colorDim, color: tier.color,
            border: `1px solid ${tier.colorBorder}`,
            fontSize: 11, fontWeight: 600,
          }}>{tag}</span>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8, marginBottom: 24,
        padding: '14px', borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {tier.stats.map(({ icon: StatIcon, label, value }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: tier.color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button style={{
        width: '100%', padding: '13px', borderRadius: 12,
        background: hovered || isSelected ? tier.gradient : 'rgba(255,255,255,0.05)',
        border: `1px solid ${hovered || isSelected ? 'transparent' : tier.colorBorder}`,
        color: hovered || isSelected ? 'white' : tier.color,
        fontSize: 14, fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: hovered || isSelected ? `0 8px 24px ${tier.colorGlow}` : 'none',
      }}>
        Enter Portal <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default function CareerPortalSelector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useCareerTier();
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 50);
  }, []);

  const handleSelect = (tierId) => {
    setSelectedTier(tierId);
    setTimeout(() => navigate('/'), 300);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, #0a0a0f 60%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Floating orbs */}
      <div style={{ position:'absolute', top:'15%', left:'8%', width:300, height:300, borderRadius:'50%', background:'rgba(16,185,129,0.06)', filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'20%', right:'8%', width:250, height:250, borderRadius:'50%', background:'rgba(245,158,11,0.06)', filter:'blur(60px)', pointerEvents:'none' }} />

      <div style={{
        maxWidth: 1100, width: '100%', position: 'relative', zIndex: 1,
        opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            }}>
              <Sparkles size={20} color="white" />
            </div>
            <span style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 800, fontSize: 20, color: '#f1f5f9',
            }}>TalentBridge</span>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 20,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            marginBottom: 18,
          }}>
            <Zap size={11} color="#818cf8" />
            <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 700, letterSpacing: 1 }}>TALENT ACQUISITION PORTAL</span>
          </div>

          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 'clamp(28px, 5vw, 46px)',
            fontWeight: 900, color: '#f1f5f9', lineHeight: 1.15,
            marginBottom: 14,
          }}>
            Choose Your Career Path
          </h1>

          <p style={{
            fontSize: 16, color: '#64748b', maxWidth: 520, margin: '0 auto',
            lineHeight: 1.6,
          }}>
            {user?.name ? `Welcome, ${user.name.split(' ')[0]}! Select` : 'Select'} the portal that matches your experience level to unlock personalized job opportunities.
          </p>
        </div>

        {/* Career Tier Cards */}
        <div style={{
          display: 'flex', gap: 20, flexWrap: 'wrap',
          justifyContent: 'center', alignItems: 'stretch',
        }}>
          {Object.values(CAREER_TIERS).map((tier, i) => (
            <div key={tier.id} style={{
              flex: '1 1 280px', maxWidth: 360,
              opacity: animIn ? 1 : 0,
              transform: animIn ? 'translateY(0)' : 'translateY(32px)',
              transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1 + 0.2}s`,
            }}>
              <TierCard
                tier={tier}
                onSelect={handleSelect}
                isSelected={selectedTier === tier.id}
              />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: 36, color: '#475569', fontSize: 12 }}>
          <Users size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />
          You can switch your career portal anytime from the sidebar
          {selectedTier && (
            <button
              onClick={() => navigate('/')}
              style={{
                marginLeft: 14, color: '#818cf8', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}
            >
              Continue with current tier →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
