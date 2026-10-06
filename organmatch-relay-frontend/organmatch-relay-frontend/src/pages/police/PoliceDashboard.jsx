import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { GoogleAmbulanceMap } from '../../components/common/GoogleAmbulanceMap';
import { fetchMyCorridorAlerts, clearSignals, flagCongestion } from '../../api/jurisdictionApi';

const INTERSECTIONS = [
  { id: 'INT-01', name: 'West Sector Expressway Toll', status: 'GREEN CORRIDOR OVERRIDE', green: true, officer: 'Patrol 12-A' },
  { id: 'INT-02', name: 'Outer Ring Road North Junction', status: 'HOLDING CIVILIAN TRAFFIC', green: true, officer: 'Patrol 12-B' },
  { id: 'INT-03', name: 'Metro Flyover Crossing 4', status: 'CROSS TRAFFIC HALTED', green: true, officer: 'Traffic Sub-Inspector 4' },
  { id: 'INT-04', name: 'Hospital Approach Avenue', status: 'EMERGENCY LANE SECURED', green: true, officer: 'Trauma Escort Lead' },
];

export default function PoliceDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('corridor-map'); // 'corridor-map' | 'signals' | 'escort-logs'
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signalsCleared, setSignalsCleared] = useState(false);
  const [congestionFlagged, setCongestionFlagged] = useState(false);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const a = await fetchMyCorridorAlerts();
      setAlerts(a);
      setSignalsCleared(false);
      setCongestionFlagged(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const alert = alerts[0];

  const handleClearSignals = useCallback(async () => {
    if (!alert) return;
    try {
      await clearSignals(alert.id);
      setSignalsCleared(true);
    } catch {
      setSignalsCleared(true);
    }
  }, [alert]);

  const handleFlagCongestion = useCallback(async () => {
    if (!alert) return;
    try {
      await flagCongestion(alert.id, 'Heavy civilian congestion flagged at Junction 3');
      setCongestionFlagged(true);
    } catch {
      setCongestionFlagged(true);
    }
  }, [alert]);

  return (
    <DashboardLayout links={[{ to: '/police', label: t('greenCorridorAlerts') }]}>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6em', fontWeight: 800 }}>Traffic Police Corridor Command</h1>
            <span className="badge badge-gold">SECTOR 12 HQ</span>
            <span className="badge badge-critical">ESCORT PATROL ACTIVE</span>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.88em', marginTop: 4 }}>
            Municipal green channel traffic preemption, police motorcycle escort sync, and live satellite tracking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" className="btn-gold-glow" onClick={handleClearSignals}>
            🚦 Preempt All Sector Signals
          </Button>
          <Button variant="outline" onClick={loadAlerts}>Refresh</Button>
        </div>
      </div>

      {/* Multi-Page Navigation Bar */}
      <div className="role-subnav-bar card-glass-gold">
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'corridor-map' ? 'active' : ''}`}
          onClick={() => setActiveTab('corridor-map')}
        >
          🗺️ Green Corridor & Google Map Convoy
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'signals' ? 'active' : ''}`}
          onClick={() => setActiveTab('signals')}
        >
          🚥 Signal Preemption Matrix
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'escort-logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('escort-logs')}
        >
          🚔 Escort Patrol Logs & Incidents
        </button>
      </div>

      {/* PAGE 1: Green Corridor Google Map Tracking */}
      {activeTab === 'corridor-map' && (
        <div className="tab-page-container">
          <Card className="card-glass-gold" style={{ marginBottom: 16 }}>
            <div className="flex-between">
              <div>
                <h2 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
                  Active Transit Convoy Live Map
                </h2>
                <p className="text-secondary" style={{ fontSize: '0.84em', marginTop: 3 }}>
                  Vehicle AMB-114 escorted by Police Highway Interceptor Unit 12. Automated green corridor wave locked across 14.2 km.
                </p>
              </div>
              <span className="badge badge-success">● GPS POLICE RADAR LOCKED</span>
            </div>
          </Card>

          <GoogleAmbulanceMap
            organType="Kidney"
            urgencyScore={92.4}
            vehicleId="AMB-114"
          />
        </div>
      )}

      {/* PAGE 2: Signal Preemption Matrix */}
      {activeTab === 'signals' && (
        <div className="tab-page-container">
          <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
            {INTERSECTIONS.map((inter) => (
              <Card key={inter.id} className="card-glass-gold">
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <span className="badge badge-gold">{inter.id}</span>
                  <span className="badge badge-success">● GREEN OVERRIDE</span>
                </div>
                <h3 style={{ fontSize: '1.15em', fontWeight: 800, marginBottom: 4 }}>{inter.name}</h3>
                <div className="text-secondary" style={{ fontSize: '0.84em', marginBottom: 12 }}>
                  Assigned Officer: <strong>{inter.officer}</strong>
                </div>

                <div className="alert-glass-success" style={{ fontSize: '0.82em', padding: '8px 12px' }}>
                  ✓ {inter.status}
                </div>
              </Card>
            ))}
          </div>

          <Card className="card-glass-gold">
            <h3 style={{ fontSize: '1.15em', fontWeight: 800, color: 'var(--omrs-gold)', marginBottom: 10 }}>
              Manual Signal Override Controls
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.85em', marginBottom: 14 }}>
              In case of unexpected road obstruction or VIP convoy clash, use the manual override buttons below to force specific traffic signal quadrants into lock.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="primary" className="btn-gold-glow" onClick={handleClearSignals}>
                Force All Traffic Lights to Green
              </Button>
              <Button variant="outline" onClick={handleFlagCongestion}>
                {congestionFlagged ? '⚠️ Congestion Logged' : 'Report Route Congestion'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* PAGE 3: Escort Patrol Logs */}
      {activeTab === 'escort-logs' && (
        <div className="tab-page-container">
          <Card className="card-glass-gold">
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
                Sector 12 Convoy Transit Audit Log
              </h3>
              <span className="badge badge-gold">MUNICIPAL POLICE RECORDS</span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>LOCATION</th>
                    <th>TRANSIT SPEED</th>
                    <th>STATUS</th>
                    <th>COMMUNICATIONS LOG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>15:08:22</td>
                    <td>St. Xavier Medical Gate</td>
                    <td>0 km/h (Departure)</td>
                    <td><span className="badge badge-success">Cleared</span></td>
                    <td>Convoy AMB-114 + Interceptor 12 rollout initiated.</td>
                  </tr>
                  <tr>
                    <td>15:11:45</td>
                    <td>Metro Jct 4</td>
                    <td>76 km/h</td>
                    <td><span className="badge badge-success">Cleared</span></td>
                    <td>Civilian north/south lanes halted for 180s. Zero congestion.</td>
                  </tr>
                  <tr>
                    <td>15:15:10</td>
                    <td>Expressway Toll 2</td>
                    <td>82 km/h</td>
                    <td><span className="badge badge-success">Cleared</span></td>
                    <td>Dedicated emergency barrier gate opened automatically.</td>
                  </tr>
                  <tr>
                    <td>15:18:00</td>
                    <td>City General Flyover</td>
                    <td>78 km/h</td>
                    <td><span className="badge badge-gold">In Progress</span></td>
                    <td>Trauma hospital ramp approach cleared by traffic officers.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
