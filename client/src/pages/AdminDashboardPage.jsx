import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Users, DollarSign, TrendingUp, Building2, Crown, Shield,
  Search, Trash2, RefreshCw, BarChart3, Star, Gem, UserCheck,
  ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle,
  Sparkles, LogOut, Moon, Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN').format(n || 0);
const fmtCurr = (n) => `₹${fmt(n)}`;

const ROLE_COLORS = {
  admin: { bg: '#ef444420', color: '#ef4444', label: 'Admin' },
  company: { bg: '#3b82f620', color: '#3b82f6', label: 'Company' },
  jobseeker: { bg: '#10b98120', color: '#10b981', label: 'Job Seeker' },
};

const PLAN_COLORS = {
  free: { bg: '#64748b20', color: '#94a3b8', label: 'Free', badge: '🆓' },
  gold: { bg: '#f59e0b20', color: '#f59e0b', label: 'Gold', badge: '⭐' },
  platinum: { bg: '#8b5cf620', color: '#8b5cf6', label: 'Platinum', badge: '💎' },
  company_basic: { bg: '#3b82f620', color: '#3b82f6', label: 'Company Basic', badge: '🏢' },
  company_pro: { bg: '#10b98120', color: '#10b981', label: 'Company Pro', badge: '🚀' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color, gradient }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16,
      padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 16,
      transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: gradient || `${color}10`, borderRadius: '0 16px 0 80px',
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ type, value, map }) {
  const meta = map[value] || { bg: '#33333320', color: '#999', label: value || '—' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      background: meta.bg, color: meta.color,
      fontSize: 11, fontWeight: 700,
    }}>
      {meta.badge && <span>{meta.badge}</span>}
      {meta.label}
    </span>
  );
}

function RevenueBar({ data }) {
  if (!data || data.length === 0) return null;
  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{fmtCurr(d.revenue)}</div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'flex-end', height: 120 }}>
            {d.companyPro > 0 && (
              <div style={{ height: Math.max(4, (d.companyPro * 4999 / maxRev) * 120), background: 'linear-gradient(180deg,#10b981,#059669)', borderRadius: 4 }} title={`Company Pro: ${d.companyPro} users`} />
            )}
            {d.companyBasic > 0 && (
              <div style={{ height: Math.max(4, (d.companyBasic * 1999 / maxRev) * 120), background: 'linear-gradient(180deg,#3b82f6,#2563eb)', borderRadius: 4 }} title={`Company Basic: ${d.companyBasic} users`} />
            )}
            {d.platinum > 0 && (
              <div style={{ height: Math.max(4, (d.platinum * 999 / maxRev) * 120), background: 'linear-gradient(180deg,#8b5cf6,#6d28d9)', borderRadius: 4 }} title={`Platinum: ${d.platinum} users`} />
            )}
            {d.gold > 0 && (
              <div style={{ height: Math.max(4, (d.gold * 499 / maxRev) * 120), background: 'linear-gradient(180deg,#fbbf24,#d97706)', borderRadius: 4 }} title={`Gold: ${d.gold} users`} />
            )}
            {d.revenue === 0 && (
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 4 }} />
            )}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');

  const [isDark, setIsDark] = useState(() => localStorage.getItem('hi_theme') !== 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('hi_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // ── Fetch Stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      toast.error('Failed to load stats: ' + (err.response?.data?.message || err.message));
    } finally { setLoadingStats(false); }
  }, []);

  const fetchRevenue = useCallback(async () => {
    setLoadingRevenue(true);
    try {
      const { data } = await api.get('/admin/revenue');
      setRevenue(data.revenue || []);
    } catch (err) {
      console.error('Revenue fetch failed:', err);
    } finally { setLoadingRevenue(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (filterRole) params.set('role', filterRole);
      if (filterPlan) params.set('plan', filterPlan);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      toast.error('Failed to load users');
    } finally { setLoadingUsers(false); }
  }, [page, search, filterRole, filterPlan]);

  useEffect(() => { fetchStats(); fetchRevenue(); }, [fetchStats, fetchRevenue]);
  useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [fetchUsers, activeTab]);

  // ── User Actions ─────────────────────────────────────────────────────────
  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Delete user "${u.name}" (${u.email})? This is irreversible.`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      toast.success('User deleted');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleChangePlan = async (u, plan) => {
    try {
      await api.put(`/admin/users/${u._id}/plan`, { plan });
      toast.success(`${u.name}'s plan updated to ${plan}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Plan update failed');
    }
  };

  const handleChangeRole = async (u, role) => {
    try {
      await api.put(`/admin/users/${u._id}/role`, { role });
      toast.success(`${u.name}'s role updated to ${role}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role update failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Search with debounce ─────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Render ───────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Nav ── */}
      <header style={{
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={15} color="white" />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>TalentBridge</span>
            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginLeft: 8, background: '#ef444420', padding: '2px 8px', borderRadius: 20 }}>ADMIN</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Signed in as <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong></span>
          <button onClick={() => setIsDark(d => !d)} className="btn-ghost" style={{ padding: '6px' }}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px', color: '#ef4444' }}>
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, padding: '28px 28px 48px', maxWidth: 1300, margin: '0 auto', width: '100%' }}>
        {/* ── Page Title ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>Monitor users, revenue, and platform health</p>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-surface)', padding: 4, borderRadius: 12, width: 'fit-content', border: '1px solid var(--border)' }}>
          {tabs.map(t => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
                borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                color: active ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}>
                <t.icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ─────────── OVERVIEW TAB ─────────── */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            {loadingStats ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 28 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ height: 100, background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 28 }}>
                <StatCard icon={Users} label="Total Users" value={fmt(stats?.totalUsers)} sub={`${fmt(stats?.totalJobseekers)} job seekers`} color="#6366f1" />
                <StatCard icon={Building2} label="Companies" value={fmt(stats?.totalCompanies)} color="#3b82f6" />
                <StatCard icon={Star} label="Gold Members" value={fmt(stats?.goldUsers)} sub="₹499/mo each" color="#f59e0b" />
                <StatCard icon={Gem} label="Platinum Members" value={fmt(stats?.platinumUsers)} sub="₹999/mo each" color="#8b5cf6" />
                <StatCard icon={Building2} label="Company Basic" value={fmt(stats?.companyBasicUsers)} sub="₹1999/mo each" color="#3b82f6" />
                <StatCard icon={Building2} label="Company Pro" value={fmt(stats?.companyProUsers)} sub="₹4999/mo each" color="#10b981" />
                <StatCard icon={DollarSign} label="Monthly Revenue" value={fmtCurr(stats?.monthlyRevenue)} sub="Estimated MRR" color="#10b981" />
                <StatCard icon={UserCheck} label="Applications" value={fmt(stats?.totalApplications)} color="#f97316" />
              </div>
            )}

            {/* Two column: recent signups + plan distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
              {/* Recent Signups */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Signups</h3>
                  <button onClick={fetchStats} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <RefreshCw size={14} />
                  </button>
                </div>
                {loadingStats ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>Loading…</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(stats?.recentSignups || []).map(u => (
                      <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          {u.avatar
                            ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{(u.name || '?').charAt(0).toUpperCase()}</span>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                        </div>
                        <Badge value={u.role} map={ROLE_COLORS} />
                        <Badge value={u['subscription']?.plan || 'free'} map={PLAN_COLORS} />
                      </div>
                    ))}
                    {!stats?.recentSignups?.length && (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24, fontSize: 13 }}>No users yet</div>
                    )}
                  </div>
                )}
              </div>

              {/* Plan Distribution */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
                <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Plan Distribution</h3>
                {loadingStats ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>Loading…</div> : (() => {
                  const total = (stats?.totalUsers || 0) || 1;
                  const plans = [
                    { label: 'Free', count: stats?.freeUsers || 0, color: '#64748b', badge: '🆓' },
                    { label: 'Gold', count: stats?.goldUsers || 0, color: '#f59e0b', badge: '⭐' },
                    { label: 'Platinum', count: stats?.platinumUsers || 0, color: '#8b5cf6', badge: '💎' },
                  ];
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {plans.map(p => {
                        const pct = Math.round((p.count / total) * 100);
                        return (
                          <div key={p.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.badge} {p.label}</span>
                              <span style={{ color: p.color, fontWeight: 700 }}>{fmt(p.count)} ({pct}%)</span>
                            </div>
                            <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Admin count */}
                <div style={{ marginTop: 20, padding: '12px 14px', background: '#ef444415', border: '1px solid #ef444430', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={15} color="#ef4444" />
                  <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                    {fmt(stats?.totalAdmins || 0)} Admin{stats?.totalAdmins !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────── USERS TAB ─────────── */}
        {activeTab === 'users' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search by name or email…"
                  style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}
                style={{ padding: '9px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}>
                <option value="">All Roles</option>
                <option value="jobseeker">Job Seeker</option>
                <option value="company">Company</option>
                <option value="admin">Admin</option>
              </select>
              <select value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }}
                style={{ padding: '9px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}>
                <option value="">All Plans</option>
                <option value="free">Free</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
              <button onClick={fetchUsers} style={{ padding: '9px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <RefreshCw size={13} /> Refresh
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>
                {fmt(pagination.total)} user{pagination.total !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Email', 'Role', 'Plan', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      [...Array(8)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(6)].map((_, j) => (
                            <td key={j} style={{ padding: '12px 16px' }}>
                              <div style={{ height: 16, background: 'var(--bg-elevated)', borderRadius: 6, animation: 'pulse 1.5s infinite', width: j === 0 ? 120 : j === 1 ? 160 : 60 }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Name + Avatar */}
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                {u.avatar
                                  ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{(u.name || '?').charAt(0).toUpperCase()}</span>
                                }
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</span>
                            </div>
                          </td>
                          {/* Email */}
                          <td style={{ padding: '10px 16px', color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                          {/* Role selector */}
                          <td style={{ padding: '10px 16px' }}>
                            {u.email === 'admin@talentbridge.com' ? (
                              <Badge value="admin" map={ROLE_COLORS} />
                            ) : (
                              <select
                                value={u.role}
                                onChange={e => handleChangeRole(u, e.target.value)}
                                style={{ padding: '3px 8px', background: ROLE_COLORS[u.role]?.bg || 'var(--bg-elevated)', border: `1px solid ${ROLE_COLORS[u.role]?.color || 'var(--border)'}`, borderRadius: 8, color: ROLE_COLORS[u.role]?.color || 'var(--text-primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                              >
                                <option value="jobseeker">Job Seeker</option>
                                <option value="company">Company</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                          </td>
                          {/* Plan selector */}
                          <td style={{ padding: '10px 16px' }}>
                            <select
                              value={u.subscription?.plan || 'free'}
                              onChange={e => handleChangePlan(u, e.target.value)}
                              style={{ padding: '3px 8px', background: PLAN_COLORS[u.subscription?.plan || 'free']?.bg || 'var(--bg-elevated)', border: `1px solid ${PLAN_COLORS[u.subscription?.plan || 'free']?.color || 'var(--border)'}`, borderRadius: 8, color: PLAN_COLORS[u.subscription?.plan || 'free']?.color || 'var(--text-primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                            >
                              <option value="free">🆓 Free</option>
                              <option value="gold">⭐ Gold</option>
                              <option value="platinum">💎 Platinum</option>
                            </select>
                          </td>
                          {/* Joined */}
                          <td style={{ padding: '10px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                          </td>
                          {/* Actions */}
                          <td style={{ padding: '10px 16px' }}>
                            {u.email !== 'admin@talentbridge.com' && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                title="Delete user"
                                style={{ padding: '5px 8px', background: '#ef444415', border: '1px solid #ef444430', borderRadius: 8, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                      style={{ padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <ChevronLeft size={13} /> Prev
                    </button>
                    <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                      style={{ padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: page >= pagination.pages ? 'var(--text-muted)' : 'var(--text-primary)', cursor: page >= pagination.pages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────── REVENUE TAB ─────────── */}
        {activeTab === 'revenue' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
            {/* Bar chart */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Revenue (Last 6 Months)</h3>
                <button onClick={fetchRevenue} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <RefreshCw size={14} />
                </button>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg,#fbbf24,#d97706)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gold (₹499/mo)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Platinum (₹999/mo)</span>
                </div>
              </div>
              {loadingRevenue
                ? <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading chart…</div>
                : <RevenueBar data={revenue} />
              }
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Gold Subscriptions', count: stats?.goldUsers || 0, rate: 499, color: '#f59e0b', badge: '⭐' },
                    { label: 'Platinum Subscriptions', count: stats?.platinumUsers || 0, rate: 999, color: '#8b5cf6', badge: '💎' },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '12px 14px', background: `${item.color}12`, border: `1px solid ${item.color}30`, borderRadius: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{item.badge} {item.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{fmtCurr(item.count * item.rate)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fmt(item.count)} users × ₹{item.rate}/mo</div>
                    </div>
                  ))}
                  <div style={{ padding: '12px 14px', background: '#10b98115', border: '1px solid #10b98130', borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>💰 Total MRR</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{fmtCurr(stats?.monthlyRevenue)}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', border: '1px solid #f59e0b30', borderRadius: 16, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <TrendingUp size={15} color="#f59e0b" />
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>ARR Estimate</h3>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{fmtCurr((stats?.monthlyRevenue || 0) * 12)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Based on current subscribers × 12 months</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
