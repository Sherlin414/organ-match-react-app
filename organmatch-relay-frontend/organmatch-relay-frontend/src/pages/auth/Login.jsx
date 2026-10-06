import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../../components/common/Button';
import { GoogleButton } from '../../components/common/GoogleButton';
import { GoogleSignInModal } from '../../components/common/GoogleSignInModal';
import { QuickSettingsModal } from '../../components/common/QuickSettingsModal';
import { handleLoginSubmit, handleGoogleLoginSubmit } from '../../controllers/authController';
import { PulseIcon } from '../../assets/organIcons';
import { ROLES, ROLE_LABELS, ROLE_COLORS, ROLE_DASHBOARD_PATH } from '../../utils/roleConfig';
import { SEED_USERS } from '../../data/seedUsers';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const emailInputRef = useRef(null);

  const { login, loginWithGoogle, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await handleLoginSubmit({ email, password, login, navigate, setError });
    },
    [email, password, login, navigate]
  );

  const handleGoogleSignIn = useCallback(
    async (googleProfile) => {
      setIsGoogleModalOpen(false);
      await handleGoogleLoginSubmit({
        googleProfile,
        loginWithGoogle,
        navigate,
        setError,
      });
    },
    [loginWithGoogle, navigate]
  );

  // Quick 1-click login handler for any demo persona
  const handleQuickDemoLogin = useCallback(
    async (roleKey) => {
      const demoUser = SEED_USERS.find((u) => u.role === roleKey);
      if (demoUser) {
        setEmail(demoUser.email);
        setPassword(demoUser.password);
        setError('');
        await handleLoginSubmit({
          email: demoUser.email,
          password: demoUser.password,
          login,
          navigate,
          setError,
        });
      }
    },
    [login, navigate]
  );

  return (
    <div className="auth-page auth-page-enhanced">
      {/* Background ambient glowing orbs */}
      <div className="auth-glow-orb auth-glow-orb-1" />
      <div className="auth-glow-orb auth-glow-orb-2" />

      <div className="auth-card auth-card-enhanced">
        {/* Brand identity header */}
        <div className="auth-logo-box">
          <Link to="/" className="auth-logo-link">
            <div className="auth-pulse-badge">
              <PulseIcon size={80} color="var(--omrs-accent)" />
            </div>
            <h1 className="auth-system-title">{t('appName')}</h1>
          </Link>
          <p className="auth-system-sub">Secure Clinical & Emergency Dispatch Gateway</p>
        </div>

        <div className="card auth-glass-panel">
          <div className="auth-card-topbar">
            <div>
              <h2 className="auth-welcome-text">{t('welcomeBack')}</h2>
              <p className="text-secondary" style={{ fontSize: '0.86em', marginTop: 3 }}>
                Access the prioritized organ matching & transit network.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span className="badge badge-success">● Network Active</span>
              <button
                type="button"
                className="btn-settings-pill"
                onClick={() => setIsSettingsOpen(true)}
                title="Configure Theme, Times New Roman, Google Accounts & Maps"
              >
                ⚙️ Quick Settings
              </button>
            </div>
          </div>

          {/* Continue with Google button — Primary user requirement */}
          <div className="auth-google-wrapper">
            <GoogleButton
              onClick={() => setIsGoogleModalOpen(true)}
              text="Continue with Google"
              loading={isLoading}
            />
          </div>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          {error && (
            <div className="form-error auth-alert-fade">
              <span style={{ marginRight: 6 }}>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-body">
            <div className="field">
              <label htmlFor="email">
                <span>{t('email')}</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org or dev account"
                />
              </div>
            </div>

            <div className="field">
              <div className="flex-between">
                <label htmlFor="password">{t('password')}</label>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex-between" style={{ fontSize: '0.85em', margin: '4px 0 16px' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this device</span>
              </label>
              <span className="text-secondary" style={{ cursor: 'pointer', fontSize: '0.9em' }}>
                Default: password123
              </span>
            </div>

            <Button type="submit" block disabled={isLoading} className="btn-auth-submit">
              {isLoading ? (
                <span className="btn-loading-content">
                  <span className="mini-spinner" /> Authenticating…
                </span>
              ) : (
                <span>Log In to Dashboard →</span>
              )}
            </Button>
          </form>

          {/* Quick 1-Click Role Switcher for Evaluators / Testers */}
          <div className="quick-demo-section">
            <div className="quick-demo-label">
              <span>⚡ Fast 1-Click Persona Login:</span>
            </div>
            <div className="quick-demo-pills">
              {Object.values(ROLES).map((role) => (
                <button
                  key={role}
                  type="button"
                  className="quick-demo-btn"
                  onClick={() => handleQuickDemoLogin(role)}
                  title={`Instant login as ${ROLE_LABELS[role]}`}
                >
                  <span
                    className="quick-demo-dot"
                    style={{ background: ROLE_COLORS[role] }}
                  />
                  <span>{ROLE_LABELS[role]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="auth-footer-link">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="auth-accent-link">
              {t('register')}
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" className="text-secondary" style={{ fontSize: '0.86em' }}>
            ← Back to OrganMatch Home
          </Link>
        </div>
      </div>

      {/* Google Sign-in Modal */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSignIn={handleGoogleSignIn}
      />

      {/* Global Quick Settings Modal */}
      <QuickSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
