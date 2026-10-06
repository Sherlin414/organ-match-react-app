import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, FONT_STYLES, ACCENT_COLORS } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ROLE_DASHBOARD_PATH } from '../../utils/roleConfig';
import { DEFAULT_MASTER_KEY } from '../../utils/cryptoEngine';

export default function Settings() {
  const { currentUser } = useAuth();
  const {
    theme, setTheme,
    fontSize, setFontSize,
    fontStyleId, setFontStyleId,
    accentColorId, setAccentColorId,
    resetToDefaults,
  } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();

  // API Config State
  const [googleClientId, setGoogleClientId] = useState(
    () => localStorage.getItem('omrs_google_client_id') || ''
  );
  const [googleMapsKey, setGoogleMapsKey] = useState(
    () => localStorage.getItem('omrs_google_maps_key') || ''
  );
  const [cryptoKey, setCryptoKey] = useState(
    () => localStorage.getItem('omrs_master_crypto_key') || DEFAULT_MASTER_KEY
  );
  const [saveFeedback, setSaveFeedback] = useState('');

  const handleSaveApis = (e) => {
    e.preventDefault();
    localStorage.setItem('omrs_google_client_id', googleClientId.trim());
    localStorage.setItem('omrs_google_maps_key', googleMapsKey.trim());
    localStorage.setItem('omrs_master_crypto_key', cryptoKey.trim());
    setSaveFeedback('API keys and cryptographic settings saved successfully!');
    setTimeout(() => setSaveFeedback(''), 3500);
  };

  const handleReset = useCallback(() => {
    resetToDefaults();
    setLanguage('en');
    localStorage.removeItem('omrs_google_client_id');
    localStorage.removeItem('omrs_google_maps_key');
    localStorage.removeItem('omrs_master_crypto_key');
    setGoogleClientId('');
    setGoogleMapsKey('');
    setCryptoKey(DEFAULT_MASTER_KEY);
  }, [resetToDefaults, setLanguage]);

  return (
    <DashboardLayout links={[{ to: ROLE_DASHBOARD_PATH[currentUser.role], label: t('dashboard') }]}>
      <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6em', fontWeight: 800 }}>{t('settings')} & System Architecture</h1>
          <p className="text-secondary" style={{ fontSize: '0.88em', marginTop: 4 }}>
            Control visual appearance, default Times New Roman typography, Google Accounts & Maps APIs, and cryptographic privacy.
          </p>
        </div>
        <span className="badge badge-gold">Active Session: {currentUser.name}</span>
      </div>

      {saveFeedback && (
        <div className="alert-glass-success" style={{ marginBottom: 18 }}>
          <span>✓</span> {saveFeedback}
        </div>
      )}

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Left Column: Visual Theme & Typography */}
        <Card className="card-glass-gold">
          {/* Theme */}
          <div className="settings-section">
            <h3>{t('theme')} & Glassmorphism</h3>
            <p className="section-desc">Select visual skin. Default is Glass with Gold & Red accents.</p>
            <div className="option-row">
              <Pill active={theme === 'glass'} onClick={() => setTheme('glass')}>
                ✨ Glass Luxury (Gold & Red)
              </Pill>
              <Pill active={theme === 'dark'} onClick={() => setTheme('dark')}>
                🌑 Dark Obsidian
              </Pill>
              <Pill active={theme === 'light'} onClick={() => setTheme('light')}>
                ☀️ {t('light')}
              </Pill>
            </div>
          </div>

          {/* Font style */}
          <div className="settings-section">
            <h3>{t('fontStyle')} & Typography</h3>
            <p className="section-desc">Times New Roman is set by default for all pages.</p>
            <div className="option-row">
              {FONT_STYLES.map((f) => (
                <Pill
                  key={f.id}
                  active={fontStyleId === f.id}
                  onClick={() => setFontStyleId(f.id)}
                  style={{ fontFamily: f.family }}
                >
                  {f.label}
                </Pill>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div className="settings-section">
            <h3>{t('fontSize')} (Balanced Medium Size)</h3>
            <p className="section-desc">Text scaling across the app. Default is medium size.</p>
            <div className="option-row">
              <Pill active={fontSize === 'small'} onClick={() => setFontSize('small')}>
                Small (13.5px)
              </Pill>
              <Pill active={fontSize === 'medium'} onClick={() => setFontSize('medium')}>
                Medium (15px · Recommended)
              </Pill>
              <Pill active={fontSize === 'large'} onClick={() => setFontSize('large')}>
                Large (16.5px)
              </Pill>
            </div>
          </div>

          {/* Accent color */}
          <div className="settings-section">
            <h3>{t('accentColor')} (Gold & Red Palette)</h3>
            <p className="section-desc">Buttons, vital radar rings, and emergency telemetry highlights.</p>
            <div className="option-row">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.id}
                  title={c.label}
                  className={`color-swatch-pill ${accentColorId === c.id ? 'active' : ''}`}
                  onClick={() => setAccentColorId(c.id)}
                >
                  <span className="swatch-circle" style={{ background: c.value }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="settings-section" style={{ marginBottom: 8 }}>
            <h3>{t('language')}</h3>
            <p className="section-desc">Select preferred clinical interface language.</p>
            <div className="option-row">
              {languages.map((l) => (
                <Pill key={l.code} active={language === l.code} onClick={() => setLanguage(l.code)}>
                  {l.label}
                </Pill>
              ))}
            </div>
          </div>

          <hr className="divider" />
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </Card>

        {/* Right Column: Google Accounts, Maps APIs & AES-256 Vault */}
        <Card className="card-glass-gold">
          <form onSubmit={handleSaveApis}>
            {/* Google Accounts OAuth Section */}
            <div className="settings-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '1.3em' }}>🔑</span>
                <h3 style={{ margin: 0 }}>Real Google Accounts & OAuth Client ID</h3>
              </div>
              <p className="section-desc">
                OrganMatch Relay integrates Google Identity Services for real Google Accounts.
              </p>

              <div className="field" style={{ marginTop: 10 }}>
                <label>Google OAuth Client ID</label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890-xxx.apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                />
                <span className="field-hint" style={{ marginTop: 4 }}>
                  Enter your Google Cloud Console Client ID to activate One-Tap and direct Google SSO.
                </span>
              </div>
            </div>

            {/* Google Maps API Key Section */}
            <div className="settings-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '1.3em' }}>🗺️</span>
                <h3 style={{ margin: 0 }}>Google Maps Ambulance Route Key</h3>
              </div>
              <p className="section-desc">
                Powers emergency green corridor navigation and municipal signal preemption tracking.
              </p>

              <div className="field" style={{ marginTop: 10 }}>
                <label>Google Maps API Key</label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={googleMapsKey}
                  onChange={(e) => setGoogleMapsKey(e.target.value)}
                />
                <span className="field-hint" style={{ marginTop: 4 }}>
                  Built-in interactive satellite routing works automatically; enter key for full dynamic API.
                </span>
              </div>
            </div>

            {/* Patient Cryptographic Key */}
            <div className="settings-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '1.3em' }}>🛡️</span>
                <h3 style={{ margin: 0 }}>AES-256 Patient Privacy Master Key</h3>
              </div>
              <p className="section-desc">
                Controls client-side decryption for sensitive HLA typing, organ urgency, and patient identities.
              </p>

              <div className="field" style={{ marginTop: 10 }}>
                <label>Master Decryption Key</label>
                <input
                  type="text"
                  value={cryptoKey}
                  onChange={(e) => setCryptoKey(e.target.value)}
                  placeholder="Enter AES-256 secret key"
                />
                <span className="field-hint" style={{ marginTop: 4 }}>
                  Default key: <code>{DEFAULT_MASTER_KEY}</code>
                </span>
              </div>
            </div>

            {/* "Ask me for anything" API Help Box */}
            <div className="api-ask-callout" style={{ margin: '18px 0' }}>
              <span style={{ fontSize: '1.3em' }}>💬</span>
              <span>
                <strong>Need an API or custom credentials?</strong> If you want any Google API key, Maps directions API,
                or custom corridor coordinates, ask me for anything in the chat and I will configure it for you!
              </span>
            </div>

            <Button type="submit" variant="primary" className="btn-gold-glow" block>
              Save API & Security Settings
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Pill({ active, onClick, children, style }) {
  return (
    <button className={`option-pill ${active ? 'active' : ''}`} onClick={onClick} style={style}>
      {children}
    </button>
  );
}
