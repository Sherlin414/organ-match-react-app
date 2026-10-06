import { Component } from 'react';

// This is a genuine, idiomatic use of a class component in modern React —
// error boundaries (componentDidCatch / getDerivedStateFromError) have no
// hook equivalent, so this is one of the few places React still requires a
// class rather than a function component.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In a real deployment this is where you'd log to an error-tracking
    // service (Sentry, LogRocket, etc.) rather than just the console.
    console.error('OrganMatch Relay System crashed:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-page">
          <div className="card" style={{ textAlign: 'center', maxWidth: 440 }}>
            <h1 style={{ fontSize: '1.3em', marginBottom: 10 }}>Something went wrong</h1>
            <p className="text-secondary" style={{ marginBottom: 20, fontSize: '0.9em' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button className="btn btn-primary" onClick={this.handleReset}>
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
