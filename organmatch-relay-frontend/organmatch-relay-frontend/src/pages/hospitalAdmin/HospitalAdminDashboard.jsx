import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CountdownBadge } from '../../components/common/CountdownBadge';
import { NotificationItem } from '../../components/common/NotificationItem';
import { OrganIcon } from '../../assets/organIcons';
import { GoogleAmbulanceMap } from '../../components/common/GoogleAmbulanceMap';
import { PatientSecurityVault } from '../../components/common/PatientSecurityVault';
import { fetchPendingMatches, confirmMatch, rejectMatch } from '../../api/matchApi';
import { fetchMyNotifications } from '../../api/notificationApi';

export default function HospitalAdminDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('command-center'); // 'command-center' | 'transit-fleet' | 'crypto-audit'
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchStatus, setMatchStatus] = useState('pending');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pendingMatches, myNotifications] = await Promise.all([
        fetchPendingMatches(),
        fetchMyNotifications(),
      ]);
      setMatches(pendingMatches);
      setNotifications(myNotifications);
      setMatchStatus('pending');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const match = matches[0];

  const handleConfirm = useCallback(async () => {
    if (!match) return;
    try {
      await confirmMatch(match.id);
      setMatchStatus('confirmed');
    } catch (err) {
      setError(err.message);
    }
  }, [match]);

  const handleReject = useCallback(async () => {
    if (!match) return;
    try {
      await rejectMatch(match.id, 'Not suitable at this time');
      setMatchStatus('rejected');
    } catch (err) {
      setError(err.message);
    }
  }, [match]);

  return (
    <DashboardLayout links={[{ to: '/hospital-admin', label: t('hospitalReview') }]}>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6em', fontWeight: 800 }}>Hospital Operations Command</h1>
            <span className="badge badge-gold">DIRECTOR PORTAL</span>
            <span className="badge badge-success">CITY GENERAL HOSPITAL</span>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.88em', marginTop: 4 }}>
            Dual-authorization organ allocation review, live municipal fleet tracking, and cryptographic patient audit.
          </p>
        </div>
        <Button variant="outline" onClick={loadData}>Refresh Grid</Button>
      </div>

      {/* Multi-Page Navigation Bar */}
      <div className="role-subnav-bar card-glass-gold">
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'command-center' ? 'active' : ''}`}
          onClick={() => setActiveTab('command-center')}
        >
          🏥 Command & Dual-Authorization
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'transit-fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('transit-fleet')}
        >
          🗺️ Transit Fleet & Google Map
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'crypto-audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('crypto-audit')}
        >
          🛡️ Hospital Privacy & AES-256 Vault
        </button>
      </div>

      {/* PAGE 1: Command Center & Dual-Authorization */}
      {activeTab === 'command-center' && (
        <div className="tab-page-container">
          {/* Quick Metrics */}
          <div className="grid-4" style={{ marginBottom: 20, gap: 16 }}>
            <div className="card mini-kpi-card card-glass-gold">
              <span className="mini-kpi-lbl">ACTIVE ICU TRANSPLANT BEDS</span>
              <span className="mini-kpi-val highlight-gold">4 / 6 Occupied</span>
              <span className="mini-kpi-sub">Trauma Wing Green Line</span>
            </div>
            <div className="card mini-kpi-card card-glass-gold">
              <span className="mini-kpi-lbl">PENDING AUTHORIZATIONS</span>
              <span className="mini-kpi-val highlight-red">{matches.length || 1} Review Required</span>
              <span className="mini-kpi-sub">Critical window active</span>
            </div>
            <div className="card mini-kpi-card card-glass-gold">
              <span className="mini-kpi-lbl">INBOUND AMBULANCE CONVOYS</span>
              <span className="mini-kpi-val highlight-green">1 Convoy En Route</span>
              <span className="mini-kpi-sub">AMB-114 ETA 8m</span>
            </div>
            <div className="card mini-kpi-card card-glass-gold">
              <span className="mini-kpi-lbl">HIPAA CRYPTO COMPLIANCE</span>
              <span className="mini-kpi-val" style={{ color: '#10B981' }}>100% VERIFIED</span>
              <span className="mini-kpi-sub">AES-256-GCM Active</span>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
            {/* Match Review Card */}
            <Card className="card-glass-gold">
              <div className="flex-between" style={{ marginBottom: 14 }}>
                <div>
                  <span className="field-hint" style={{ color: 'var(--omrs-gold)', fontWeight: 700 }}>
                    ALLOCATION ID #{match?.id || 42}
                  </span>
                  <h2 style={{ fontSize: '1.25em', fontWeight: 800 }}>Dual-Authorization Review</h2>
                </div>
                {match && <CountdownBadge targetTime={match.expiresAt} />}
              </div>

              {matchStatus === 'confirmed' ? (
                <div className="alert-glass-success" style={{ padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2em', marginBottom: 8 }}>✓</div>
                  <h3 style={{ fontSize: '1.2em', fontWeight: 800 }}>DISPATCH AUTHORIZED & COMMITTED</h3>
                  <p className="text-secondary" style={{ marginTop: 6, fontSize: '0.86em' }}>
                    Green corridor clearance instructions sent to Traffic Police Sector 12 and Ambulance AMB-114.
                  </p>
                </div>
              ) : matchStatus === 'rejected' ? (
                <div className="alert-glass-danger" style={{ padding: '24px', textAlign: 'center' }}>
                  <h3>Allocation Declined</h3>
                  <p className="text-secondary" style={{ marginTop: 6 }}>
                    Candidate declined; organ rerouted to next ranked patient on regional waitlist.
                  </p>
                </div>
              ) : match ? (
                <div>
                  <div className="organ-inline patient-organ-banner" style={{ marginBottom: 18 }}>
                    <OrganIcon organ={match.organ} size={48} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.2em', color: 'var(--omrs-gold)' }}>
                        {match.organ} Allocation: {match.patientName}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.84em' }}>
                        Retrieved from: {match.donorHospital}
                      </div>
                    </div>
                  </div>

                  <div className="stack-16" style={{ marginBottom: 20 }}>
                    <div className="flex-between">
                      <span className="text-secondary" style={{ fontSize: '0.86em' }}>Blood Type Match:</span>
                      <span style={{ fontWeight: 700 }}>{match.bloodType} (Compatible)</span>
                    </div>
                    <div className="flex-between">
                      <span className="text-secondary" style={{ fontSize: '0.86em' }}>HLA Allele Concordance:</span>
                      <span style={{ fontWeight: 800, color: '#10B981' }}>{match.compatibilityScore}% (6/6 Alleles)</span>
                    </div>
                    <div className="flex-between">
                      <span className="text-secondary" style={{ fontSize: '0.86em' }}>Cold Ischemia Clock:</span>
                      <span style={{ fontWeight: 800, color: 'var(--omrs-gold)' }}>4 Hours 12 Mins Remaining</span>
                    </div>
                    <div className="flex-between">
                      <span className="text-secondary" style={{ fontSize: '0.86em' }}>Lead Transplant Surgeon:</span>
                      <span style={{ fontWeight: 700 }}>Dr. Fatima Rahman, M.D.</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="primary" className="btn-gold-glow" style={{ flex: 1 }} onClick={handleConfirm}>
                      ✓ Confirm & Authorize Green Corridor
                    </Button>
                    <Button variant="outline" onClick={handleReject}>
                      Decline Match
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 12px' }}>
                  <span style={{ fontSize: '2em' }}>✓</span>
                  <h3 style={{ marginTop: 8 }}>All Active Organ Matches Reviewed</h3>
                  <p className="text-secondary" style={{ fontSize: '0.85em', marginTop: 4 }}>
                    Monitoring real-time municipal donor intake grid for incoming alerts.
                  </p>
                </div>
              )}
            </Card>

            {/* Notifications Feed */}
            <Card className="card-glass-gold">
              <div className="flex-between" style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: '1.15em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
                  Hospital Alert Stream
                </h3>
                <span className="badge badge-info">{notifications.length || 2} NEW</span>
              </div>
              <div className="notifications-feed-list">
                {notifications.map((n, i) => (
                  <NotificationItem key={n.id} notification={n} isLast={i === notifications.length - 1} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* PAGE 2: Transit Fleet & Google Map Dispatch */}
      {activeTab === 'transit-fleet' && (
        <div className="tab-page-container">
          <Card className="card-glass-gold" style={{ marginBottom: 16 }}>
            <div className="flex-between">
              <div>
                <h2 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
                  Hospital Transit Fleet Logistics
                </h2>
                <p className="text-secondary" style={{ fontSize: '0.84em', marginTop: 3 }}>
                  Active emergency convoys en route to City General Hospital trauma docks. Direct satellite telemetry synced.
                </p>
              </div>
              <span className="badge badge-success">● GPS FLEET CONNECTED</span>
            </div>
          </Card>

          <GoogleAmbulanceMap
            organType="Kidney"
            urgencyScore={92.4}
            vehicleId="AMB-114"
          />
        </div>
      )}

      {/* PAGE 3: Hospital-Wide Cryptographic Privacy Audit */}
      {activeTab === 'crypto-audit' && (
        <div className="tab-page-container">
          <PatientSecurityVault
            patientId={null}
            role="HOSPITAL_ADMIN"
            canAddRecords={true}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
