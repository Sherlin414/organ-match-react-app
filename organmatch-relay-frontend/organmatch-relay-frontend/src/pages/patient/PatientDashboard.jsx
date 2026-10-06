import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { StatusChip } from '../../components/common/StatusChip';
import { NotificationItem } from '../../components/common/NotificationItem';
import { OrganIcon } from '../../assets/organIcons';
import { PatientSecurityVault } from '../../components/common/PatientSecurityVault';
import { GoogleAmbulanceMap } from '../../components/common/GoogleAmbulanceMap';
import { fetchMyNotifications } from '../../api/notificationApi';

const PATIENT_JOURNEY_STEPS = [
  { id: 1, label: 'Waitlist Registered', desc: 'Clinical evaluation & HLA typing verified', done: true },
  { id: 2, label: 'Priority Ranked', desc: 'Indexed in real-time ischemia allocation engine', done: true },
  { id: 3, label: 'Donor Organ Match', desc: 'Hospital admin dual-authorization review', current: true },
  { id: 4, label: 'Green Corridor Transit', desc: 'Police cleared emergency route to OR' },
];

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'crypto-vault' | 'ambulance-map' | 'care-team'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const n = await fetchMyNotifications();
      setNotifications(n);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const isMatched = currentUser.waitlistStatus === 'Matched';

  return (
    <DashboardLayout links={[{ to: '/patient', label: t('dashboard') }]}>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6em', fontWeight: 800 }}>Recipient Patient Portal</h1>
            <span className="badge badge-gold">VIP QUEUE #1</span>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.88em', marginTop: 4 }}>
            Confidential medical relay status, AES-256 encrypted health vault, and live ambulance corridor transit.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/profile" className="btn btn-outline">
            ⚙️ Update Contact
          </Link>
        </div>
      </div>

      {/* Multi-Page Navigation Bar */}
      <div className="role-subnav-bar card-glass-gold">
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📋 Allocation & Priority Queue
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'crypto-vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('crypto-vault')}
        >
          🛡️ Medical Records & Encrypted Vault
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'ambulance-map' ? 'active' : ''}`}
          onClick={() => setActiveTab('ambulance-map')}
        >
          🚑 Ambulance Live Google Map Route
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'care-team' ? 'active' : ''}`}
          onClick={() => setActiveTab('care-team')}
        >
          👨‍⚕️ Transplant Surgical Team
        </button>
      </div>

      {/* PAGE 1: Allocation & Waitlist Lifecycle */}
      {activeTab === 'queue' && (
        <div className="tab-page-container">
          {/* Recipient Status Journey Stepper */}
          <Card className="card-glass-gold" style={{ marginBottom: 24, padding: '24px 30px' }}>
            <div className="flex-between" style={{ marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: '1.15em', fontWeight: 700, color: 'var(--omrs-gold)' }}>
                  Allocation Lifecycle Tracker
                </h2>
                <span className="text-secondary" style={{ fontSize: '0.84em' }}>
                  Automated matching criteria: HLA Allele Crossmatch (6/6), Cold Ischemia Limit (6 Hours)
                </span>
              </div>
              <span className="badge badge-success">● SYSTEM SCANNING DONOR MATRIX</span>
            </div>

            <div className="patient-journey-stepper">
              {PATIENT_JOURNEY_STEPS.map((step, idx) => {
                const isComplete = isMatched ? idx <= 2 : step.done;
                const isCurrent = isMatched ? idx === 2 : step.current;
                return (
                  <div
                    key={step.id}
                    className={`journey-step ${isComplete ? 'step-done' : ''} ${isCurrent ? 'step-active' : ''}`}
                  >
                    <div className="step-circle">{isComplete ? '✓' : step.id}</div>
                    <div className="step-info">
                      <span className="step-title-text">{step.label}</span>
                      <span className="step-desc-text">{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid-2" style={{ gap: 24 }}>
            {/* Patient Clinical Profile Card */}
            <Card className="card-glass-gold">
              <div className="flex-between" style={{ marginBottom: 18 }}>
                <div>
                  <span className="field-hint" style={{ fontWeight: 700, color: 'var(--omrs-gold)' }}>
                    AUTHENTICATED RECIPIENT
                  </span>
                  <h2 style={{ fontSize: '1.25em', fontWeight: 800 }}>{currentUser.name}</h2>
                </div>
                <StatusChip status={currentUser.waitlistStatus || 'Waiting'} />
              </div>

              <div className="organ-inline patient-organ-banner" style={{ marginBottom: 20 }}>
                <OrganIcon organ={currentUser.organNeeded || 'Kidney'} size={48} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2em', color: 'var(--omrs-gold)' }}>
                    {currentUser.organNeeded || 'Kidney'} Recipient
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.82em' }}>
                    Critical window: 24 – 36 Hours Viability Window
                  </div>
                </div>
              </div>

              <div className="stack-16">
                <Row label="Blood Type (ABO / Rh)" value={currentUser.bloodType || 'O+'} />
                <Row
                  label="Calculated Urgency Score"
                  value={
                    currentUser.urgencyScore
                      ? `${currentUser.urgencyScore} (Priority High)`
                      : '92.4 (Priority High)'
                  }
                  accent={true}
                />
                <Row label="Registered Hospital" value={currentUser.registeredHospital || 'City General Hospital'} />
                <Row label="Contact Phone" value={currentUser.contactNumber || '+91 98765 43210'} />
              </div>

              <hr className="divider" />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-gold-sm"
                  onClick={() => setActiveTab('crypto-vault')}
                  style={{ flex: 1 }}
                >
                  🔒 View Encrypted Health Vault →
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setActiveTab('ambulance-map')}
                  style={{ flex: 1 }}
                >
                  🚑 Track Organ Transit →
                </button>
              </div>
            </Card>

            {/* Notifications and Care Team Hotline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Card className="card-glass-gold">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h2 style={{ fontSize: '1.15em', fontWeight: 700 }}>{t('recentNotifications')}</h2>
                  <span className="badge badge-info">{notifications.length || 3} NEW</span>
                </div>
                {loading ? (
                  <p className="text-secondary">Loading your notification stream…</p>
                ) : notifications.length === 0 ? (
                  <p className="text-secondary">No urgent notifications at this time.</p>
                ) : (
                  <div className="notifications-feed-list">
                    {notifications.map((n, i) => (
                      <NotificationItem key={n.id} notification={n} isLast={i === notifications.length - 1} />
                    ))}
                  </div>
                )}
              </Card>

              {/* Care Team Emergency Contact */}
              <Card className="card-glass-gold">
                <h3 style={{ fontSize: '1em', fontWeight: 700, marginBottom: 8, color: 'var(--omrs-gold)' }}>
                  Emergency Care Hotline
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.84em', lineHeight: 1.5, marginBottom: 14 }}>
                  If you experience sudden health changes or require immediate hospital admission, notify the Organ Relay Coordinator hotline immediately.
                </p>
                <div className="flex-between">
                  <span style={{ fontWeight: 700, color: 'var(--omrs-gold)' }}>📞 24/7 Coordinator Hotline:</span>
                  <span style={{ fontWeight: 800, color: '#fff' }}>1800-ORGAN-RELAY</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2: Encrypted Health Vault (Patient Privacy & Security) */}
      {activeTab === 'crypto-vault' && (
        <div className="tab-page-container">
          <PatientSecurityVault
            patientId={currentUser.id || 'u-patient-1'}
            role="PATIENT"
            canAddRecords={false}
          />
        </div>
      )}

      {/* PAGE 3: Ambulance Live Route on Google Map */}
      {activeTab === 'ambulance-map' && (
        <div className="tab-page-container">
          <Card className="card-glass-gold" style={{ marginBottom: 16 }}>
            <div className="flex-between">
              <div>
                <h2 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
                  Live Inbound Transit Tracker
                </h2>
                <p className="text-secondary" style={{ fontSize: '0.84em', marginTop: 3 }}>
                  Donor organ retrieved at St. Xavier Medical Center and now traveling via Green Corridor to City General Hospital Trauma Center.
                </p>
              </div>
              <span className="badge badge-success">● LIVE SATELLITE RADAR</span>
            </div>
          </Card>

          <GoogleAmbulanceMap
            organType={currentUser.organNeeded || 'Kidney'}
            urgencyScore={currentUser.urgencyScore || 92.4}
            vehicleId="AMB-114"
          />
        </div>
      )}

      {/* PAGE 4: Transplant Care Team */}
      {activeTab === 'care-team' && (
        <div className="tab-page-container">
          <div className="grid-2" style={{ gap: 24 }}>
            <Card className="card-glass-gold">
              <div className="flex-between" style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: '1.15em', fontWeight: 700, color: 'var(--omrs-gold)' }}>
                  Assigned Transplant Surgeon
                </h3>
                <span className="badge badge-success">Lead Specialist</span>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D4AF37, #DC2626)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2em',
                    color: '#000',
                  }}
                >
                  FR
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1em', fontWeight: 800 }}>Dr. Fatima Rahman, M.D.</h4>
                  <div className="text-secondary" style={{ fontSize: '0.85em' }}>
                    Chief of Abdominal & Kidney Transplant Surgery
                  </div>
                  <div style={{ fontSize: '0.82em', color: 'var(--omrs-gold)', marginTop: 2 }}>
                    St. Xavier Medical Center / City General Hospital Affiliation
                  </div>
                </div>
              </div>

              <div className="stack-16">
                <Row label="Transplant Coordinator" value="Rahul Verma (+91 99887 66554)" />
                <Row label="Operation Theater" value="Trauma OR-4 (Dedicated Green Wing)" />
                <Row label="Anesthesia Clearance" value="Pre-approved · High Priority" />
                <Row label="Donor HLA Compatibility" value="6/6 Complete Allele Concordance" />
              </div>
            </Card>

            <Card className="card-glass-gold">
              <h3 style={{ fontSize: '1.15em', fontWeight: 700, marginBottom: 14, color: 'var(--omrs-gold)' }}>
                Immediate Pre-Operative Checklist
              </h3>
              <ul className="preop-checklist" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(212,175,55,0.15)', display: 'flex', gap: 10 }}>
                  <span style={{ color: '#10B981' }}>✓</span>
                  <span>Remain fasting (NPO) upon receiving the dispatch confirmation call.</span>
                </li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(212,175,55,0.15)', display: 'flex', gap: 10 }}>
                  <span style={{ color: '#10B981' }}>✓</span>
                  <span>Ensure primary mobile phone (+91 98765 43210) is active and unmuted.</span>
                </li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(212,175,55,0.15)', display: 'flex', gap: 10 }}>
                  <span style={{ color: '#10B981' }}>✓</span>
                  <span>Keep emergency hospital bag and government ID ready for admission intake.</span>
                </li>
                <li style={{ padding: '8px 0', display: 'flex', gap: 10 }}>
                  <span style={{ color: '#10B981' }}>✓</span>
                  <span>Hospital escort ambulance dispatched upon corridor green signal sync.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex-between" style={{ padding: '4px 0' }}>
      <span className="text-secondary" style={{ fontSize: '0.88em' }}>{label}</span>
      <span style={{ fontWeight: 700, color: accent ? 'var(--omrs-gold)' : 'inherit' }}>{value}</span>
    </div>
  );
}
