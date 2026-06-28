import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, User, Bell, ShieldAlert, LogOut, CheckCircle2, ChevronRight, Lock, Trash2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateSettings, updatePassword, deleteAccount, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default settings if undefined
  const defaultSettings = {
    notifications: { jobMatches: true, applicationUpdates: true, weeklyTips: true },
    linkedAccounts: { google: false, linkedin: false }
  };
  
  const userSettings = user?.settings || defaultSettings;
  const [notifications, setNotifications] = useState(userSettings.notifications);
  const [linkedAccounts, setLinkedAccounts] = useState(userSettings.linkedAccounts);

  // Password state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleNotificationChange = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await updateSettings({ notifications: updated, linkedAccounts });
      toast.success('Notification preferences updated');
    } catch (err) {
      toast.error('Failed to update preferences');
      setNotifications(notifications); // revert on fail
    }
  };

  const handleLinkAccount = async (provider) => {
    // In a real app, this would redirect to OAuth
    // Here we just toggle the visual state to simulate the feature
    const updated = { ...linkedAccounts, [provider]: !linkedAccounts[provider] };
    setLinkedAccounts(updated);
    try {
      await updateSettings({ notifications, linkedAccounts: updated });
      toast.success(`${provider} account ${updated[provider] ? 'linked' : 'unlinked'}`);
    } catch (err) {
      toast.error('Action failed');
      setLinkedAccounts(linkedAccounts);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error('New passwords do not match');
    }
    if (passwords.new.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setIsSubmitting(true);
    try {
      await updatePassword(passwords.current, passwords.new);
      toast.success('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      return toast.error('Type DELETE to confirm');
    }
    setIsSubmitting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted');
      // context handles redirect/logout
    } catch (err) {
      toast.error('Failed to delete account');
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div style={{ padding: '30px', maxWidth: 900, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 30, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Settings & Preferences</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Manage your account settings and notification preferences</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 30, alignItems: 'flex-start' }}>
        {/* Sidebar Tabs */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12,
                background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'var(--border)' : 'transparent'}`,
                color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', padding: 30, minHeight: 400 }}>
          <AnimatePresence mode="wait">
            {/* ── ACCOUNT TAB ── */}
            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={20} color="var(--brand-primary)" /> Account Details
                </h2>

                <div style={{ marginBottom: 30 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Email Address</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="email" className="input" value={user?.email || ''} readOnly style={{ opacity: 0.7, maxWidth: 300 }} />
                    <span className="chip chip-green">Verified</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>To change your email address, please contact support.</p>
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '30px 0' }} />

                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={20} color="var(--brand-primary)" /> Change Password
                </h2>
                
                <form onSubmit={handlePasswordUpdate} style={{ maxWidth: 400 }}>
                  <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Current Password</label>
                    <input type="password" required className="input" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>New Password</label>
                    <input type="password" required className="input" minLength={6} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Confirm New Password</label>
                    <input type="password" required className="input" minLength={6} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '8px 20px' }}>
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                <div style={{ height: 1, background: 'var(--border)', margin: '30px 0' }} />

                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LinkIcon /> Linked Social Accounts
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077b5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>LinkedIn</span>
                    </div>
                    <button onClick={() => handleLinkAccount('linkedin')} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>
                      {linkedAccounts.linkedin ? 'Unlink' : 'Link'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ background: 'white', borderRadius: '50%', padding: 2 }}><img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="16" /></div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>Google</span>
                    </div>
                    <button onClick={() => handleLinkAccount('google')} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>
                      {linkedAccounts.google ? 'Unlink' : 'Link'}
                    </button>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '30px 0' }} />

                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                  <Trash2 size={20} /> Danger Zone
                </h2>
                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: 20, borderRadius: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Delete Account</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 15 }}>
                    Once you delete your account, there is no going back. Please be certain. Type <strong>DELETE</strong> to confirm.
                  </p>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input type="text" className="input" placeholder="Type DELETE" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} style={{ maxWidth: 200, borderColor: deleteConfirm === 'DELETE' ? '#ef4444' : 'var(--border)' }} />
                    <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || isSubmitting} className="btn-primary" style={{ background: '#ef4444', opacity: deleteConfirm === 'DELETE' ? 1 : 0.5 }}>
                      Delete Account
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={20} color="var(--brand-primary)" /> Email Notifications
                </h2>
                
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                  Choose which emails you'd like to receive from TalentBridge.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <ToggleOption 
                    title="New Job Matches" 
                    desc="Receive alerts when new jobs match your profile and preferences." 
                    checked={notifications.jobMatches} 
                    onChange={() => handleNotificationChange('jobMatches')} 
                  />
                  <div style={{ height: 1, background: 'var(--border)' }} />
                  <ToggleOption 
                    title="Application Status Updates" 
                    desc="Get notified when an employer views your application or changes its status." 
                    checked={notifications.applicationUpdates} 
                    onChange={() => handleNotificationChange('applicationUpdates')} 
                  />
                  <div style={{ height: 1, background: 'var(--border)' }} />
                  <ToggleOption 
                    title="Weekly Career Tips" 
                    desc="Receive our weekly newsletter with resume tips, interview prep, and career advice." 
                    checked={notifications.weeklyTips} 
                    onChange={() => handleNotificationChange('weeklyTips')} 
                  />
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Simple link icon component
function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  );
}

// Custom Toggle Switch Component
function ToggleOption({ title, desc, checked, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ flex: 1, paddingRight: 20 }}>
        <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</p>
      </div>
      <button 
        onClick={onChange} 
        style={{ 
          width: 44, height: 24, borderRadius: 12, 
          background: checked ? 'var(--brand-primary)' : 'var(--bg-card)', 
          border: `1px solid ${checked ? 'var(--brand-primary)' : 'var(--border)'}`,
          position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
        }}
      >
        <div style={{ 
          width: 18, height: 18, borderRadius: '50%', background: 'white', 
          position: 'absolute', top: 2, left: checked ? 22 : 2, 
          transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}
