import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { MOCK_NETWORK_STATS } from '../data/mockData';
import { ORGAN_ICONS, OrganIcon, HospitalIcon, AmbulanceIcon, ShieldIcon, PulseIcon } from '../assets/organIcons';
import { GoogleIcon, SparklesIcon, ShieldCheckIcon, BoltIcon, NavigationIcon } from '../assets/brandIcons';
import { GoogleSignInModal } from '../components/common/GoogleSignInModal';
import { QuickSettingsModal } from '../components/common/QuickSettingsModal';
import { handleGoogleLoginSubmit } from '../controllers/authController';
import { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS, ROLE_DASHBOARD_PATH } from '../utils/roleConfig';
import { SEED_USERS } from '../data/seedUsers';

const HOW_IT_WORKS = [
  {
    step: '01',
    badge: 'RAPID REGISTRATION',
    title: 'Waitlist & Organ Intake',
    text: 'Doctors register waitlisted patients with HLA typing and urgency scores. When a donor organ becomes available, viability decay timers start automatically.',
  },
  {
    step: '02',
    badge: 'ALGORITHMIC ALLOCATION',
    title: 'Priority Matching Engine',
    text: 'Multi-parameter matching algorithm ranks compatible recipients by biological compatibility, cold ischemia time limits, and clinical urgency score.',
  },
  {
    step: '03',
    badge: 'SECURE VERIFICATION',
    title: 'Hospital Admin Confirmation',
    text: 'The recipient hospital admin reviews the ranked candidate with complete clinical history and authorizes the dispatch within the critical window.',
  },
  {
    step: '04',
    badge: 'SYNCHRONIZED TRANSIT',
    title: 'Automated Green Corridor',
    text: 'Traffic police and ambulance units receive synced corridor telemetry, preemptively clearing signals along the route for zero-delay arrival.',
  },
];

const ORGAN_DETAILS = {
  Heart: { window: '4 – 6 Hours', temp: '4°C Hypothermic', urgency: 'High Urgency Decay', color: '#EF4444' },
  Lung: { window: '6 – 8 Hours', temp: '4°C Cold Storage', urgency: 'Strict Ischemia Limit', color: '#6366F1' },
  Liver: { window: '8 – 12 Hours', temp: '2-4°C Perfusion', urgency: 'Time-Critical Window', color: '#F97316' },
  Pancreas: { window: '12 – 18 Hours', temp: 'Standard Cold Stasis', urgency: 'Priority Queued', color: '#EAB308' },
  Kidney: { window: '24 – 36 Hours', temp: 'Pulsatile Perfusion', urgency: 'Extended Viability', color: '#10B981' },
};

export default function Home() {
  const { t } = useLanguage();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [activeRoleTab, setActiveRoleTab] = useState(ROLES.DOCTOR);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  async function handleGoogleLogin(profile) {
    setIsGoogleModalOpen(false);
    await handleGoogleLoginSubmit({
      googleProfile: profile,
      loginWithGoogle,
      navigate,
    });
  }

  async function handleInstantDemoLogin(roleKey) {
    setQuickLoginLoading(true);
    const demo = SEED_USERS.find((u) => u.role === roleKey);
    if (demo) {
      const res = await login(demo.email, demo.password);
      if (res.success) {
        navigate(ROLE_DASHBOARD_PATH[roleKey] || '/');
      }
    }
    setQuickLoginLoading(false);
  }

  return (
    <div className="app-shell landing-page-wrapper">
      {/* Dynamic Background Glow Elements */}
      <div className="landing-ambient-glow glow-top" />
      <div className="landing-ambient-glow glow-bottom" />

      {/* Public Navbar */}
      <nav className="navbar navbar-glass">
        <div className="navbar-brand-section">
          <Link to="/" className="navbar-logo">
            <span className="navbar-pulse-dot" />
            <span className="navbar-brand-text">{t('appName')}</span>
          </Link>
          <span className="network-status-chip">
            <span className="live-ping-dot" />
            <span>Relay Grid Active · 14 Hospitals</span>
          </span>
        </div>

        <div className="navbar-right">
          <button
            type="button"
            className="btn btn-settings-nav"
            onClick={() => setIsSettingsOpen(true)}
            title="Open System & Interface Settings"
          >
            <span>⚙️ Settings</span>
          </button>
          <button
            type="button"
            className="btn btn-google-nav"
            onClick={() => setIsGoogleModalOpen(true)}
          >
            <GoogleIcon size={18} />
            <span>Continue with Google</span>
          </button>
          <Link to="/login" className="btn btn-outline nav-login-btn">
            {t('login')}
          </Link>
          <Link to="/register" className="btn btn-primary nav-register-btn">
            {t('register')}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero landing-hero-v2">
        <div className="hero-announcement-pill">
          <SparklesIcon size={15} color="#10B981" />
          <span>v2.4 Intelligent Green Corridor & Viability Engine Active</span>
        </div>

        <h1 className="landing-hero-title-v2">
          Every Second Counts.<br />
          <span className="hero-title-gradient">Every Match Saves a Life.</span>
        </h1>

        <p className="landing-hero-sub-v2">
          OrganMatch Relay replaces delayed manual coordination with a real-time,
          AI-prioritized allocation queue and an automated traffic-synchronized green corridor.
        </p>

        {/* Hero Interactive Call to Action */}
        <div className="hero-action-group">
          <button
            type="button"
            className="btn btn-google-hero"
            onClick={() => setIsGoogleModalOpen(true)}
          >
            <GoogleIcon size={22} />
            <span>Continue with Google</span>
          </button>
          <Link to="/login" className="btn btn-primary btn-hero-primary">
            <span>Explore All 7 Dashboards</span>
            <span className="hero-btn-arrow">→</span>
          </Link>
          <Link to="/register" className="btn btn-outline btn-hero-outline">
            Join the Network
          </Link>
        </div>

        {/* Animated Heartbeat & Radar Visual Banner */}
        <div className="hero-monitor-card">
          <div className="monitor-header">
            <div className="monitor-dots">
              <span className="monitor-dot red" />
              <span className="monitor-dot yellow" />
              <span className="monitor-dot green" />
            </div>
            <span className="monitor-title">LIVE RELAY SYSTEM TELEMETRY · EN-ROUTE CORRIDOR</span>
            <span className="monitor-badge">LIVE 200ms FEED</span>
          </div>

          <div className="monitor-body">
            <div className="monitor-telemetry-col">
              <div className="telemetry-item">
                <span className="telemetry-label">ACTIVE MATCH</span>
                <span className="telemetry-val">#M-9402 · Kidney</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">DISPATCH ROUTE</span>
                <span className="telemetry-val">St. Xavier ➔ City General</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">ESTIMATED TRANSIT</span>
                <span className="telemetry-val accent-val">12m 40s (Target: &lt;20m)</span>
              </div>
            </div>

            <div className="monitor-center-wave">
              <div className="ekg-container">
                <svg className="ekg-svg" viewBox="0 0 500 80" preserveAspectRatio="none">
                  <path
                    className="ekg-path"
                    d="M0 40 L100 40 L115 15 L130 65 L145 25 L160 45 L175 40 L280 40 L295 10 L310 70 L325 20 L340 50 L355 40 L500 40"
                  />
                </svg>
                <div className="ekg-scanner-beam" />
              </div>
              <div className="ekg-label-row">
                <span>Signal Pre-emption: ACTIVE</span>
                <span>Corridor Clearance: 100%</span>
                <span>Cold Ischemia Margin: SAFE (34h remaining)</span>
              </div>
            </div>

            <div className="monitor-telemetry-col">
              <div className="telemetry-item">
                <span className="telemetry-label">AMBULANCE UNIT</span>
                <span className="telemetry-val">AMB-114 (Priority Alpha)</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">POLICE SIGNALS</span>
                <span className="telemetry-val" style={{ color: '#10B981' }}>🟢 4/4 Intersections Cleared</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">BLOCKCHAIN AUDIT</span>
                <span className="telemetry-val" style={{ fontFamily: 'monospace' }}>0x8a92... Verified ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Live Stats Strip */}
      <section className="page-content" style={{ paddingTop: 20 }}>
        <div className="grid-4 stats-grid-v2">
          {MOCK_NETWORK_STATS.map((s, idx) => (
            <div className="card stat-card-v2" key={s.label}>
              <div className="stat-card-glow" />
              <div className="stat-top-row">
                <span className="stat-index-badge">0{idx + 1}</span>
                <BoltIcon size={18} color="var(--omrs-accent)" />
              </div>
              <div className="stat-value-v2">{s.value}</div>
              <div className="stat-label-v2">{s.label}</div>
              <div className="stat-trend-bar">
                <span className="stat-trend-fill" style={{ width: `${75 + idx * 7}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Organs Tracked & Viability Window Showcase */}
        <div className="section-block" style={{ marginTop: 64 }}>
          <div className="section-header-row">
            <div>
              <span className="section-eyebrow">BIOLOGICAL DECAY PROTOCOL</span>
              <h2 className="section-title">Critical Organ Viability Windows</h2>
            </div>
            <p className="section-desc-right">
              Different organs have strict ischemic limits. Our engine accounts for transport duration,
              cold storage method, and decay curves when ranking waitlist matches.
            </p>
          </div>

          <div className="organ-cards-grid">
            {Object.keys(ORGAN_ICONS).map((organ) => {
              const details = ORGAN_DETAILS[organ] || { window: '12-24h', temp: '4°C', urgency: 'Standard', color: '#10B981' };
              return (
                <div className="organ-feature-card" key={organ}>
                  <div className="organ-card-top">
                    <OrganIcon organ={organ} size={50} />
                    <span className="organ-window-badge" style={{ borderColor: details.color, color: details.color }}>
                      {details.window}
                    </span>
                  </div>
                  <h3 className="organ-card-name">{organ}</h3>
                  <div className="organ-spec-row">
                    <span className="spec-label">Preservation:</span>
                    <span className="spec-val">{details.temp}</span>
                  </div>
                  <div className="organ-spec-row">
                    <span className="spec-label">Urgency Model:</span>
                    <span className="spec-val" style={{ color: details.color, fontWeight: 600 }}>{details.urgency}</span>
                  </div>
                  <div className="organ-decay-bar">
                    <div className="organ-decay-fill" style={{ background: details.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive 7-Role Actor Preview & Instant Demo Launcher */}
        <div className="section-block" style={{ marginTop: 72 }}>
          <div className="section-header-center">
            <span className="section-eyebrow">MULTI-ROLE ECOSYSTEM</span>
            <h2 className="section-title">Seven Specialized Portals. One United Relay.</h2>
            <p className="text-secondary" style={{ maxWidth: 660, margin: '8px auto 0' }}>
              Every actor in the emergency chain has their own role-tailored dashboard with strict, verified access controls.
            </p>
          </div>

          <div className="role-tabs-container">
            <div className="role-tabs-list">
              {Object.values(ROLES).map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-tab-btn ${activeRoleTab === role ? 'active' : ''}`}
                  onClick={() => setActiveRoleTab(role)}
                >
                  <span className="role-tab-indicator" style={{ background: ROLE_COLORS[role] }} />
                  <span>{ROLE_LABELS[role]}</span>
                </button>
              ))}
            </div>

            <div className="role-tab-content-card card">
              <div className="role-preview-grid">
                <div className="role-preview-text">
                  <div className="role-pill-badge" style={{ background: `${ROLE_COLORS[activeRoleTab]}22`, color: ROLE_COLORS[activeRoleTab] }}>
                    {ROLE_LABELS[activeRoleTab]} PORTAL
                  </div>
                  <h3 className="role-preview-heading">{ROLE_LABELS[activeRoleTab]} Command View</h3>
                  <p className="role-preview-desc">{ROLE_DESCRIPTIONS[activeRoleTab]}</p>

                  <div className="role-capabilities-list">
                    <h4>Key Operational Capabilities:</h4>
                    <ul>
                      {activeRoleTab === ROLES.PATIENT && (
                        <>
                          <li>Page 1: Real-time waitlist priority queue & organ allocation tracker</li>
                          <li>Page 2: AES-256 encrypted patient health vault & genetic HLA profile</li>
                          <li>Page 3: Live Google Map ambulance transit tracker with speed & signal clearance</li>
                          <li>Page 4: Assigned transplant surgical team & pre-op admission protocol</li>
                        </>
                      )}
                      {activeRoleTab === ROLES.DOCTOR && (
                        <>
                          <li>Page 1: Clinical candidate roster, urgency sorting & MELD score calculator</li>
                          <li>Page 2: Biocompatibility engine & donor-recipient HLA crossmatching matrix</li>
                          <li>Page 3: Patient privacy encryption vault: Decrypt records & encrypt surgical notes</li>
                          <li>Page 4: Inbound organ transit monitor via interactive Google Maps</li>
                        </>
                      )}
                      {activeRoleTab === ROLES.HOSPITAL_ADMIN && (
                        <>
                          <li>Page 1: Hospital command center, ICU beds & dual-authorization review</li>
                          <li>Page 2: Regional organ allocation matrix & dual-signature dispatch approvals</li>
                          <li>Page 3: Transit fleet dispatch & Google Maps emergency convoy tracker</li>
                          <li>Page 4: Hospital-wide HIPAA cryptographic privacy audit & key rotation</li>
                        </>
                      )}
                      {activeRoleTab === ROLES.DONOR_COORDINATOR && (
                        <>
                          <li>Page 1: Donor organ intake with real-time ischemic decay timers</li>
                          <li>Page 2: Algorithmic compatibility matrix & active waitlist matching</li>
                          <li>Page 3: Encrypted donor legal consent forms & confidential clinical vault</li>
                        </>
                      )}
                      {activeRoleTab === ROLES.AMBULANCE && (
                        <>
                          <li>Page 1: Navigation cockpit with interactive Google Maps satellite route</li>
                          <li>Page 2: Organ hypothermic cold storage pod telemetry (3.8°C) & perfusion sensor</li>
                          <li>Page 3: Municipal traffic signal preemption logs & emergency police escort</li>
                        </>
                      )}
                      {activeRoleTab === ROLES.POLICE && (
                        <>
                          <li>Page 1: Municipal green corridor convoy Google Map with live ambulance GPS</li>
                          <li>Page 2: Traffic signal preemption control matrix (Red to Green overrides)</li>
                          <li>Page 3: Escort patrol communications, clearance audit & congestion logs</li>
                        </>
                      )}
                      {activeRoleTab === ROLES.SYSTEM_ADMIN && (
                        <>
                          <li>Page 1: Cross-hospital node network health & SHA-256 blockchain ledger</li>
                          <li>Page 2: Master AES-256 cryptographic key authority & HIPAA zero-knowledge vault</li>
                          <li>Page 3: Real Google Accounts OAuth management & role access privileges</li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="role-cta-row">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleInstantDemoLogin(activeRoleTab)}
                      disabled={quickLoginLoading}
                    >
                      {quickLoginLoading ? 'Entering Portal…' : `Instant Login as ${ROLE_LABELS[activeRoleTab]} →`}
                    </button>
                    <Link to={`/register/${activeRoleTab}`} className="btn btn-outline">
                      Create Dedicated Account
                    </Link>
                  </div>
                </div>

                <div className="role-preview-mockup">
                  <div className="mockup-header-bar">
                    <div className="mockup-circle" />
                    <div className="mockup-circle" />
                    <div className="mockup-circle" />
                    <span className="mockup-url">organmatch.dev/{ROLE_DASHBOARD_PATH[activeRoleTab].replace('/', '')}</span>
                  </div>
                  <div className="mockup-screen-preview">
                    <div className="mockup-stat-strip">
                      <div className="mini-stat">
                        <span className="mini-stat-lbl">Role</span>
                        <span className="mini-stat-val" style={{ color: ROLE_COLORS[activeRoleTab] }}>{ROLE_LABELS[activeRoleTab]}</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-stat-lbl">Node Status</span>
                        <span className="mini-stat-val" style={{ color: '#10B981' }}>Connected</span>
                      </div>
                      <div className="mini-stat">
                        <span className="mini-stat-lbl">Encryption</span>
                        <span className="mini-stat-val">TLS 1.3 · SHA256</span>
                      </div>
                    </div>
                    <div className="mockup-pulse-graphic">
                      <PulseIcon size={120} color={ROLE_COLORS[activeRoleTab]} />
                      <p className="mockup-caption">Authenticated Session Ready · Tap button to launch live portal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step by step Relay Flow */}
        <div className="section-block" style={{ marginTop: 72 }}>
          <div className="section-header-center">
            <span className="section-eyebrow">DISPATCH PROTOCOL</span>
            <h2 className="section-title">From Donor to Recipient: The 4-Step Relay</h2>
          </div>

          <div className="grid-4 step-cards-grid">
            {HOW_IT_WORKS.map((s) => (
              <div className="card step-card-v2" key={s.step}>
                <div className="step-card-num-banner">
                  <span className="step-num">{s.step}</span>
                  <span className="step-sub-badge">{s.badge}</span>
                </div>
                <h3 className="step-title">{s.title}</h3>
                <p className="text-secondary step-text">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security and Network Highlights */}
        <div className="grid-4 trust-grid-v2" style={{ marginTop: 64, marginBottom: 40 }}>
          <div className="card trust-card-v2">
            <div className="trust-icon-box"><HospitalIcon size={46} /></div>
            <h4>Hospital Interoperability</h4>
            <p>Seamless communication protocol between private clinics, major organ centers, and regional hubs.</p>
          </div>
          <div className="card trust-card-v2">
            <div className="trust-icon-box"><AmbulanceIcon size={46} /></div>
            <h4>Active Corridor Telemetry</h4>
            <p>Sub-second telemetry sync between transit vehicles and municipal traffic light infrastructure.</p>
          </div>
          <div className="card trust-card-v2">
            <div className="trust-icon-box"><ShieldCheckIcon size={46} color="var(--omrs-accent)" /></div>
            <h4>Cryptographic Audit Trail</h4>
            <p>Every match, authorization, and handover is signed into a verifiable, immutable ledger.</p>
          </div>
          <div className="card trust-card-v2">
            <div className="trust-icon-box"><PulseIcon size={64} color="var(--omrs-accent)" /></div>
            <h4>Viability Safeguards</h4>
            <p>Automated countdown alerts alert clinicians before safe ischemic limits are reached.</p>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="landing-footer-v2">
        <div className="footer-content-inner">
          <div className="footer-col-main">
            <div className="footer-brand">
              <span className="footer-pulse-dot" />
              <strong>{t('appName')}</strong>
            </div>
            <p className="footer-desc">
              Advanced organ allocation queue & synchronized green corridor transit architecture.
            </p>
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="btn btn-google-nav"
                onClick={() => setIsGoogleModalOpen(true)}
              >
                <GoogleIcon size={18} />
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          <div className="footer-col-links">
            <span className="footer-heading">Portals</span>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <button
              type="button"
              className="footer-link-btn"
              onClick={() => setIsGoogleModalOpen(true)}
            >
              Sign In with Google
            </button>
          </div>

          <div className="footer-col-links">
            <span className="footer-heading">Relay Roles</span>
            <span onClick={() => handleInstantDemoLogin(ROLES.DOCTOR)}>Doctor Portal</span>
            <span onClick={() => handleInstantDemoLogin(ROLES.HOSPITAL_ADMIN)}>Hospital Admin</span>
            <span onClick={() => handleInstantDemoLogin(ROLES.AMBULANCE)}>Ambulance Dispatch</span>
            <span onClick={() => handleInstantDemoLogin(ROLES.POLICE)}>Traffic Clearance</span>
          </div>

          <div className="footer-col-links">
            <span className="footer-heading">Security</span>
            <span>SHA-256 Ledger</span>
            <span>Green Corridor Sync</span>
            <span>HIPAA Compliant MVC</span>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© 2026 OrganMatch Relay System · Life-Saving Medical Relay Network</span>
          <span>Version 2.4.0 · Production Ready</span>
        </div>
      </footer>

      {/* Google Sign-in Modal */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSignIn={handleGoogleLogin}
      />

      {/* Global Quick Settings Modal */}
      <QuickSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
