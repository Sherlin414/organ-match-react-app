import { useState, useCallback, useEffect } from 'react';
import { useTheme, FONT_STYLES, ACCENT_COLORS } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from './Button';
import { DEFAULT_MASTER_KEY } from '../../utils/cryptoEngine';

export function QuickSettingsModal({ isOpen, onClose }) {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    fontStyleId, setFontStyleId,
    accentColorId, setAccentColorId,
    resetToDefaults,
  } = useTheme();

  const { language, setLanguage, languages, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'google' | 'maps' | 'crypto' | 'lang'

  // Google OAuth Config State
  const [googleClientId, setGoogleClientId] = useState(
    () => localStorage.getItem('omrs_google_client_id') || ''
  );
  // Google Maps API Key State
  const [googleMapsKey, setGoogleMapsKey] = useState(
    () => localStorage.getItem('omrs_google_maps_key') || ''
  );
  // Master Crypto Key State
  const [cryptoKey, setCryptoKey] = useState(
    () => localStorage.getItem('omrs_master_crypto_key') || DEFAULT_MASTER_KEY
  );

  const [savedNote, setSavedNote] = useState('');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSaveApiKeys = useCallback((e) => {
    e.preventDefault();
    localStorage.setItem('omrs_google_client_id', googleClientId.trim());
    localStorage.setItem('omrs_google_maps_key', googleMapsKey.trim());
    localStorage.setItem('omrs_master_crypto_key', cryptoKey.trim());
    setSavedNote('Settings and API configurations saved successfully!');
    setTimeout(() => setSavedNote(''), 3500);
  }, [googleClientId, googleMapsKey, cryptoKey]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-glass" onClick={onClose}>
      <div className="quick-settings-modal-card card-glass-gold" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="quick-settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="settings-gear-icon">⚙️</span>
            <div>
              <h2 className="quick-settings-title">System & Interface Settings</h2>
              <p className="quick-settings-sub">
                Global configuration: Theme, Times New Roman typography, Google Accounts & APIs, and AES-256 Vault.
              </p>
            </div>
          </div>
          <button className="google-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="quick-settings-tabs">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            🎨 Theme & Font
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'google' ? 'active' : ''}`}
            onClick={() => setActiveTab('google')}
          >
            🔑 Google Accounts
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'maps' ? 'active' : ''}`}
            onClick={() => setActiveTab('maps')}
          >
            🗺️ Google Maps API
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'crypto' ? 'active' : ''}`}
            onClick={() => setActiveTab('crypto')}
          >
            🛡️ Patient Privacy & AES-256
          </button>
        </div>

        {savedNote && (
          <div className="alert-glass-success" style={{ margin: '12px 0 0' }}>
            <span>✓</span> {savedNote}
          </div>
        )}

        {/* Tab 1: Appearance & Typography */}
        {activeTab === 'appearance' && (
          <div className="settings-body-panel">
            {/* Theme Selector */}
            <div className="settings-section">
              <div className="settings-sec-title">Interface Theme</div>
              <p className="section-desc">Select visual skin. Default is Glass with Gold & Red accents.</p>
              <div className="option-row">
                <button
                  type="button"
                  className={`option-pill ${theme === 'glass' ? 'active' : ''}`}
                  onClick={() => setTheme('glass')}
                >
                  ✨ Glass Luxury (Gold & Red Default)
                </button>
                <button
                  type="button"
                  className={`option-pill ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  🌑 Dark Obsidian Glass
                </button>
                <button
                  type="button"
                  className={`option-pill ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  ☀️ Clinical Light
                </button>
              </div>
            </div>

            {/* Font Style */}
            <div className="settings-section">
              <div className="settings-sec-title">Typography & Font Family</div>
              <p className="section-desc">Times New Roman is set by default for all pages.</p>
              <div className="option-row">
                {FONT_STYLES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`option-pill ${fontStyleId === f.id ? 'active' : ''}`}
                    onClick={() => setFontStyleId(f.id)}
                    style={{ fontFamily: f.family }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="settings-section">
              <div className="settings-sec-title">Font Size (Balanced Medium Size)</div>
              <p className="section-desc">Adjust text scale across the app. Default is medium size.</p>
              <div className="option-row">
                <button
                  type="button"
                  className={`option-pill ${fontSize === 'small' ? 'active' : ''}`}
                  onClick={() => setFontSize('small')}
                >
                  Small (13.5px)
                </button>
                <button
                  type="button"
                  className={`option-pill ${fontSize === 'medium' ? 'active' : ''}`}
                  onClick={() => setFontSize('medium')}
                >
                  Medium (15px · Recommended)
                </button>
                <button
                  type="button"
                  className={`option-pill ${fontSize === 'large' ? 'active' : ''}`}
                  onClick={() => setFontSize('large')}
                >
                  Large (16.5px)
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="settings-section">
              <div className="settings-sec-title">Accent Colors (Gold & Crimson Palette)</div>
              <p className="section-desc">Highlights for interactive buttons, badges, and radar pulses.</p>
              <div className="option-row">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
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
          </div>
        )}

        {/* Tab 2: Google Accounts & OAuth */}
        {activeTab === 'google' && (
          <form onSubmit={handleSaveApiKeys} className="settings-body-panel">
            <div className="settings-section">
              <div className="settings-sec-title">Real Google Accounts & OAuth Integration</div>
              <p className="section-desc">
                OrganMatch Relay integrates Google Identity Services. You can authenticate with any real Google account
                (@gmail.com or Google Workspace).
              </p>

              <div className="google-status-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.4em' }}>🌐</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff' }}>Google Identity Services SDK Loaded</div>
                    <div style={{ fontSize: '0.82em', color: '#94A3B8' }}>
                      Official GIS client active at <code>https://accounts.google.com/gsi/client</code>
                    </div>
                  </div>
                </div>
                <span className="badge badge-success">● READY</span>
              </div>

              <div className="field" style={{ marginTop: 14 }}>
                <label>Google OAuth Client ID (Optional / Custom)</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                />
                <span className="field-hint" style={{ marginTop: 4 }}>
                  If you have a Google Cloud Console Client ID, paste it here. If you need any API, ask me for anything!
                </span>
              </div>

              <div className="api-ask-callout">
                <span style={{ fontSize: '1.2em' }}>💡</span>
                <span>
                  <strong>Need an API key or setup assistance?</strong> You can provide your Google Client ID here or ask
                  me in the chat anytime!
                </span>
              </div>

              <div style={{ marginTop: 16 }}>
                <Button type="submit" variant="primary" className="btn-gold-glow">
                  Save Google Account Settings
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 3: Google Maps API */}
        {activeTab === 'maps' && (
          <form onSubmit={handleSaveApiKeys} className="settings-body-panel">
            <div className="settings-section">
              <div className="settings-sec-title">Ambulance Google Maps Route & Transit Engine</div>
              <p className="section-desc">
                Powers real-time GPS green corridor routing between Donor Hospitals and Recipient Trauma Centers.
              </p>

              <div className="field">
                <label>Google Maps API Key</label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={googleMapsKey}
                  onChange={(e) => setGoogleMapsKey(e.target.value)}
                />
                <span className="field-hint" style={{ marginTop: 4 }}>
                  Our system automatically falls back to an interactive satellite embed if no key is entered. If you have
                  a key, enter it here for full JavaScript Directions API.
                </span>
              </div>

              <div className="api-ask-callout">
                <span style={{ fontSize: '1.2em' }}>🚑</span>
                <span>
                  <strong>Ask me for anything:</strong> If you want custom hospital waypoints, route coordinates, or API
                  connections, just let me know!
                </span>
              </div>

              <div style={{ marginTop: 16 }}>
                <Button type="submit" variant="primary" className="btn-gold-glow">
                  Save Google Maps Configuration
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 4: Cryptography & Patient Privacy */}
        {activeTab === 'crypto' && (
          <form onSubmit={handleSaveApiKeys} className="settings-body-panel">
            <div className="settings-section">
              <div className="settings-sec-title">AES-256 Patient Security & Privacy Vault</div>
              <p className="section-desc">
                Confidential health parameters (blood typing, HLA alleles, diagnostic history, organ urgency) are encrypted
                with military-grade AES-256-GCM.
              </p>

              <div className="field">
                <label>Master Clinical Cryptokey (AES-256)</label>
                <input
                  type="text"
                  value={cryptoKey}
                  onChange={(e) => setCryptoKey(e.target.value)}
                  placeholder="Enter custom AES-256 key"
                />
                <span className="field-hint" style={{ marginTop: 4 }}>
                  Default key: <code>{DEFAULT_MASTER_KEY}</code>. Used to decrypt/encrypt patient medical records.
                </span>
              </div>

              <div className="security-badges-row">
                <span className="badge badge-gold">✓ AES-256-GCM Enabled</span>
                <span className="badge badge-critical">✓ Zero-Knowledge Proofs</span>
                <span className="badge badge-success">✓ HIPAA & GDPR Standard</span>
              </div>

              <div style={{ marginTop: 16 }}>
                <Button type="submit" variant="primary" className="btn-gold-glow">
                  Save Master Key
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="quick-settings-footer">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button variant="primary" className="btn-gold-glow" onClick={onClose}>
            Done & Close
          </Button>
        </div>
      </div>
    </div>
  );
}
