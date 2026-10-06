import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-page auth-page-enhanced">
      <div className="auth-glow-orb auth-glow-orb-1" />
      <div className="card auth-glass-panel" style={{ textAlign: 'center', maxWidth: 440, padding: '40px 32px' }}>
        <div style={{ fontSize: '3.5em', marginBottom: 12 }}>🧭</div>
        <h1 style={{ fontSize: '1.6em', fontWeight: 800, marginBottom: 8 }}>404 · Relay Node Not Found</h1>
        <p className="text-secondary" style={{ marginBottom: 24, fontSize: '0.92em', lineHeight: 1.5 }}>
          The requested clinical endpoint or route does not exist or requires authenticated credentials.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">Return to Home</Link>
          <Link to="/login" className="btn btn-outline">Go to Login</Link>
        </div>
      </div>
    </div>
  );
}
