import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { Dropdown } from '../common/Dropdown';
import { QuickSettingsModal } from '../common/QuickSettingsModal';
import { ROLE_LABELS, ROLE_COLORS, ROLE_DASHBOARD_PATH } from '../../utils/roleConfig';
import { PulseIcon } from '../../assets/organIcons';

export function Navbar({ links = [] }) {
  const { currentUser, logout } = useAuth();
  const { t, language, setLanguage, languages } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const initials = currentUser?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('') || '?';

  const roleColor = ROLE_COLORS[currentUser?.role] || 'var(--omrs-accent)';

  return (
    <>
      <nav className="navbar navbar-glass">
        <div className="navbar-brand-section">
          <Link to={currentUser ? ROLE_DASHBOARD_PATH[currentUser.role] : '/'} className="navbar-logo">
            <span className="navbar-pulse-dot" />
            <span className="navbar-brand-text">{t('appName')}</span>
          </Link>
          <span className="nav-grid-badge">
            <span className="live-ping-dot" />
            <span>Relay Grid Active</span>
          </span>
        </div>

        <div className="navbar-links">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link-item">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          {/* Quick Settings trigger accessible inside login */}
          <button
            type="button"
            className="btn btn-settings-nav"
            onClick={() => setIsSettingsOpen(true)}
            title="Open System Settings (Theme, Font, APIs, Vault)"
          >
            <span>⚙️ Settings</span>
          </button>

          {/* Quick Theme Toggle directly in navbar */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '✨'}
          </button>

        {/* Quick Language Toggle */}
        <button
          type="button"
          className="nav-icon-btn lang-btn"
          onClick={() => {
            const nextIdx = (languages.findIndex((l) => l.code === language) + 1) % languages.length;
            setLanguage(languages[nextIdx].code);
          }}
          title="Change Interface Language"
        >
          {language.toUpperCase()}
        </button>

        {/* User Profile Chip & Menu */}
        <Dropdown
          trigger={
            <button className="profile-chip profile-chip-enhanced">
              <span className="profile-avatar" style={{ background: roleColor }}>
                {initials}
              </span>
              <div className="profile-chip-text">
                <span className="profile-chip-name">{currentUser?.name}</span>
                <span
                  className="profile-chip-role"
                  style={{ color: roleColor }}
                >
                  {ROLE_LABELS[currentUser?.role]}
                </span>
              </div>
              <span className="profile-chevron">▼</span>
            </button>
          }
        >
          <div className="profile-menu profile-menu-enhanced">
            <div className="profile-menu-header">
              <div className="pm-name">{currentUser?.name}</div>
              <div className="pm-email">{currentUser?.email}</div>
              <div
                className="pm-badge"
                style={{ background: `${roleColor}22`, color: roleColor }}
              >
                {ROLE_LABELS[currentUser?.role]}
              </div>
            </div>

            <div className="profile-menu-divider" />

            <Link to="/profile" className="profile-menu-item">
              <span>👤 {t('profile')}</span>
            </Link>
            <Link to="/settings" className="profile-menu-item">
              <span>⚙️ {t('settings')}</span>
            </Link>
            <button
              type="button"
              className="profile-menu-item"
              onClick={toggleTheme}
            >
              <span>{theme === 'light' ? '🌙 Switch to Dark' : '☀️ Switch to Light'}</span>
            </button>

            <div className="profile-menu-divider" />

            <button
              type="button"
              className="profile-menu-item pm-logout"
              onClick={handleLogout}
            >
              <span>🚪 {t('logout')}</span>
            </button>
          </div>
        </Dropdown>
      </div>
    </nav>
    <QuickSettingsModal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
    />
  </>
  );
}
