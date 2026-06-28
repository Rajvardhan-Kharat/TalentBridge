import { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, Plus, Minus, Search, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const faqs = [
  {
    q: 'How do I reset my password?',
    a: 'Go to the Settings page from your dashboard sidebar. Under the Account tab, you will find the Change Password section. Enter your current password and the new one to update it.'
  },
  {
    q: 'How does the Smart Pre-filling work?',
    a: 'When you use any of the 20 tools in the Career Toolkit, the platform automatically pulls relevant information (like your current role, industry, and skills) from your Profile page to save you time. Make sure your profile is up to date!'
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, you can manage or cancel your subscription at any time from the Plans & Billing page in the sidebar. Cancellations take effect at the end of your current billing cycle.'
  },
  {
    q: 'How are the Resume Builder and CV Tailor different?',
    a: 'The Resume Builder creates a standard, professional PDF resume and a shareable web link. The CV Tailor takes a specific Job Description and optimizes your existing resume to beat the ATS for that exact role.'
  }
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)' }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>{q}</span>
        {open ? <Minus size={18} color="var(--brand-primary)" /> : <Plus size={18} color="var(--text-muted)" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginTop: 12 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return toast.error('Please fill in all fields');
    
    setIsSubmitting(true);
    try {
      await api.post('/support', { subject, message });
      toast.success('Support ticket submitted successfully. We will get back to you soon!');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: 1000, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HelpCircle size={24} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Help & Support</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>Find answers or get in touch with our support team</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        {/* Left Column: FAQs */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={20} color="var(--brand-primary)" /> Frequently Asked Questions
          </h2>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', padding: '10px 24px' }}>
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>

          <div style={{ marginTop: 30, padding: 20, background: 'rgba(59,130,246,0.1)', borderRadius: 16, border: '1px solid rgba(59,130,246,0.2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Looking for tutorials?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 15 }}>Watch our comprehensive video guides to learn how to master the Career Toolkit.</p>
            <button className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              View Video Library <ExternalLink size={14} style={{ marginLeft: 6 }} />
            </button>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={20} color="var(--brand-primary)" /> Contact Support
          </h2>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Can't find what you're looking for? Submit a support ticket and our team will respond within 24 hours.
            </p>
            <form onSubmit={handleSubmitTicket}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Subject</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="E.g. Issue with payment, Feature request" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  required
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>How can we help?</label>
                <textarea 
                  className="input" 
                  placeholder="Describe your issue in detail..." 
                  style={{ minHeight: 120 }} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}
