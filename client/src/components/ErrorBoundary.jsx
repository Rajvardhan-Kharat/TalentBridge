import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#0a0a0f', color: '#f1f5f9', gap: 16, padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#ef4444', margin: 0 }}>Something went wrong</h2>
          <p style={{ color: '#94a3b8', maxWidth: 400, margin: 0, fontSize: 14 }}>
            {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            style={{
              padding: '10px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', marginTop: 8,
            }}
          >
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
