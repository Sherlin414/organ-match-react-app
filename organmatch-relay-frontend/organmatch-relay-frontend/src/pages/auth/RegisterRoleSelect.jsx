import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS } from '../../utils/roleConfig';
import { GoogleButton } from '../../components/common/GoogleButton';
import { GoogleSignInModal } from '../../components/common/GoogleSignInModal';
import { QuickSettingsModal } from '../../components/common/QuickSettingsModal';
import { handleGoogleLoginSubmit } from '../../controllers/authController';
import { PulseIcon } from '../../assets/organIcons';

const ROLE_EMOJIS = {
  [ROLES.PATIENT]: '👤',
  [ROLES.DOCTOR]: '🩺',
  [ROLES.HOSPITAL_ADMIN]: '🏥',
  [ROLES.DONOR_COORDINATOR]: '🧬',
  [ROLES.AMBULANCE]: '🚑',
  [ROLES.POLICE]: '🚨',
  [ROLES.SYSTEM_ADMIN]: '⚙️',
};

export default function RegisterRoleSelect() {
  const { t } = useLanguage();
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedGoogleRole, setSelectedGoogleRole] = useState(null);

  const handleGoogleSignUp = useCallback(
    async (googleProfile) => {
      setIsGoogleModalOpen(false);
      await handleGoogleLoginSubmit({
        googleProfile: {
          ...googleProfile,
          role: selectedGoogleRole || googleProfile.role || ROLES.PATIENT,
        },
        loginWithGoogle,
        navigate,
      });
    },
    [loginWithGoogle, navigate, selectedGoogleRole]
  );

  function openGoogleWithRole(role) {
    setSelectedGoogleRole(role);
    setIsGoogleModalOpen(true);
  }

  return (
    <div className="auth-page auth-page-enhanced">
      <div className="auth-glow-orb auth-glow-orb-1" />
      <div className="auth-glow-orb auth-glow-orb-2" />

      <div className="auth-card" style={{ maxWidth: 860, width: '100%' }}>
        <div className="auth-logo-box">
          <Link to="/" className="auth-logo-link">
            <div className="auth-pulse-badge">
              <PulseIcon size={70} color="var(--omrs-accent)" />
            </div>
            <h1 className="auth-system-title">{t('appName')}</h1>
          </Link>
          <p className="auth-system-sub">Decentralized Organ Relay System · New Account</p>
        </div>

        <div className="card auth-glass-panel">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.4em', fontWeight: 800, letterSpacing: '-0.01em' }}>
                {t('selectYourRole')}
              </h2>
              <p className="text-secondary" style={{ fontSize: '0.9em', marginTop: 4 }}>
                Choose your operational role in the organ allocation & transit chain.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                className="btn-settings-pill"
                onClick={() => setIsSettingsOpen(true)}
              >
                ⚙️ Quick Settings
              </button>
              <GoogleButton
                onClick={() => openGoogleWithRole(ROLES.PATIENT)}
                text="Quick Sign Up with Google"
                style={{ padding: '8px 16px', fontSize: '0.85em' }}
              />
            </div>
          </div>

          <div className="role-grid role-grid-enhanced">
            {Object.values(ROLES).map((role) => (
              <div key={role} className="role-card-enhanced-wrapper">
                <Link to={`/register/${role}`} className="role-card role-card-enhanced">
                  <div className="role-card-header">
                    <span className="role-emoji">{ROLE_EMOJIS[role]}</span>
                    <div
                      className="role-card-dot"
                      style={{ background: ROLE_COLORS[role], boxShadow: `0 0 10px ${ROLE_COLORS[role]}` }}
                    />
                  </div>
                  <h3>{ROLE_LABELS[role]}</h3>
                  <p>{ROLE_DESCRIPTIONS[role]}</p>
                  <div className="role-card-footer">
                    <span className="role-arrow-label">Register with Form →</span>
                  </div>
                </Link>
                <button
                  type="button"
                  className="role-google-shortcut"
                  onClick={() => openGoogleWithRole(role)}
                  title={`Sign up as ${ROLE_LABELS[role]} with Google`}
                >
                  Sign up with Google
                </button>
              </div>
            ))}
          </div>

          <div className="auth-footer-link" style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--omrs-border)' }}>
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
        defaultRole={selectedGoogleRole}
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
