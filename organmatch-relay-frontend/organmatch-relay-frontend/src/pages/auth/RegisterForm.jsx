import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../../components/common/Button';
import { GoogleButton } from '../../components/common/GoogleButton';
import { GoogleSignInModal } from '../../components/common/GoogleSignInModal';
import { QuickSettingsModal } from '../../components/common/QuickSettingsModal';
import { ROLES, ROLE_LABELS, ROLE_COLORS, ROLE_REGISTER_FIELDS } from '../../utils/roleConfig';
import { handleRegisterSubmit, handleGoogleLoginSubmit } from '../../controllers/authController';
import { PulseIcon } from '../../assets/organIcons';

const COMMON_FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Dr. Priya Nair' },
  { name: 'email', label: 'Work / Official Email', type: 'email', placeholder: 'priya@hospital.org' },
  { name: 'password', label: 'Create Secure Password', type: 'password', placeholder: 'Minimum 8 characters' },
  { name: 'contactNumber', label: 'Emergency Contact Phone', type: 'text', placeholder: '+91 98765 43210' },
];

export default function RegisterForm() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { register, loginWithGoogle, isLoading } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const roleIsValid = Object.values(ROLES).includes(role);

  const fields = useMemo(() => {
    if (!roleIsValid) return [];
    return [...COMMON_FIELDS, ...(ROLE_REGISTER_FIELDS[role] || [])];
  }, [role, roleIsValid]);

  const handleChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await handleRegisterSubmit({ role, fields, formData, register, navigate, setError });
    },
    [role, fields, formData, register, navigate]
  );

  const handleGoogleSignUp = useCallback(
    async (googleProfile) => {
      setIsGoogleModalOpen(false);
      await handleGoogleLoginSubmit({
        googleProfile: { ...googleProfile, role },
        loginWithGoogle,
        navigate,
        setError,
      });
    },
    [role, loginWithGoogle, navigate]
  );

  if (!roleIsValid) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="auth-page auth-page-enhanced">
      <div className="auth-glow-orb auth-glow-orb-1" />
      <div className="auth-glow-orb auth-glow-orb-2" />

      <div className="auth-card" style={{ maxWidth: 540, width: '100%' }}>
        <div className="auth-logo-box">
          <Link to="/" className="auth-logo-link">
            <div className="auth-pulse-badge">
              <PulseIcon size={64} color="var(--omrs-accent)" />
            </div>
            <h1 className="auth-system-title">{t('appName')}</h1>
          </Link>
        </div>

        <div className="card auth-glass-panel">
          <div className="flex-between" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: ROLE_COLORS[role] || 'var(--omrs-accent)',
                  }}
                />
                <span style={{ fontSize: '0.8em', fontWeight: 700, color: ROLE_COLORS[role], letterSpacing: '0.04em' }}>
                  ROLE ONBOARDING
                </span>
              </div>
              <h2 style={{ fontSize: '1.35em', fontWeight: 800 }}>
                Register as {ROLE_LABELS[role]}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn-settings-pill"
                onClick={() => setIsSettingsOpen(true)}
              >
                ⚙️ Quick Settings
              </button>
              <Link
                to="/register"
                className="text-secondary"
                style={{ fontSize: '0.82em', textDecoration: 'underline' }}
              >
                Change role
              </Link>
            </div>
          </div>

          <p className="text-secondary" style={{ fontSize: '0.86em', marginBottom: 20 }}>
            Create your authenticated credentials for the verified medical relay directory.
          </p>

          {/* Quick Sign up with Google for this role */}
          <div className="auth-google-wrapper">
            <GoogleButton
              onClick={() => setIsGoogleModalOpen(true)}
              text={`Fast Sign up as ${ROLE_LABELS[role]} with Google`}
            />
          </div>

          <div className="auth-divider">
            <span>or complete manual form</span>
          </div>

          {error && (
            <div className="form-error auth-alert-fade">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-body">
            {fields.map((field) => (
              <div className="field" key={field.name}>
                <div className="flex-between">
                  <label htmlFor={field.name}>{field.label}</label>
                  {field.type === 'password' && (
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required
                  >
                    <option value="" disabled>Select {field.label.toLowerCase()}</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    type={field.type === 'password' ? (showPassword ? 'text' : 'password') : field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required
                  />
                )}
              </div>
            ))}

            <Button type="submit" block disabled={isLoading} className="btn-auth-submit" style={{ marginTop: 12 }}>
              {isLoading ? 'Creating credential profile…' : `Complete ${ROLE_LABELS[role]} Registration →`}
            </Button>
          </form>

          <div className="auth-footer-link">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="auth-accent-link">
              {t('login')}
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" className="text-secondary" style={{ fontSize: '0.86em' }}>
            ← Back to OrganMatch Home
          </Link>
        </div>
      </div>

      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        defaultRole={role}
        onClose={() => setIsGoogleModalOpen(false)}
        onSignIn={handleGoogleSignUp}
      />

      <QuickSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
