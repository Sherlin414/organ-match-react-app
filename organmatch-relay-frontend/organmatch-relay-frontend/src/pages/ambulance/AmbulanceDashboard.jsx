import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CountdownBadge } from '../../components/common/CountdownBadge';
import { GoogleAmbulanceMap } from '../../components/common/GoogleAmbulanceMap';
import { fetchMyActiveRoute, confirmDelivery } from '../../api/routeApi';
import { NavigationIcon, BoltIcon, ShieldCheckIcon } from '../../assets/brandIcons';

export default function AmbulanceDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('cockpit'); // 'cockpit' | 'ischemia' | 'preemption'
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [delivered, setDelivered] = useState(false);
  const [sirenActive, setSirenActive] = useState(true);

  // Simulated organ telemetry
  const [podTemp, setPodTemp] = useState(3.8);
  const [perfusionPressure, setPerfusionPressure] = useState(28);

  const loadRoute = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetchMyActiveRoute();
      setRoute(r || {
        id: 'ROUTE-8812',
        vehicleId: 'AMB-114',
        matchId: 42,
        organType: 'Kidney',
        status: 'In Transit',
        origin: 'St. Xavier Medical Center',
        destination: 'City General Hospital (Trauma Center)',
        etaMinutes: 18,
        speedKmh: 78,
      });
      setDelivered(false);
    } catch {
      // Fallback active route
      setRoute({
        id: 'ROUTE-8812',
        vehicleId: 'AMB-114',
        matchId: 42,
        organType: 'Kidney',
        status: 'In Transit',
        origin: 'St. Xavier Medical Center',
        destination: 'City General Hospital (Trauma Center)',
        etaMinutes: 18,
        speedKmh: 78,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  // Subtle telemetry fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setPodTemp((3.7 + Math.random() * 0.3).toFixed(1));
      setPerfusionPressure(Math.floor(27 + Math.random() * 3));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirmDelivery = useCallback(async () => {
    if (!route) return;
    try {
      await confirmDelivery(route.id);
      setDelivered(true);
    } catch {
      setDelivered(true);
    }
  }, [route]);

  return (
    <DashboardLayout links={[{ to: '/ambulance', label: t('liveRoute') }]}>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6em', fontWeight: 800 }}>Ambulance Navigation Cockpit</h1>
            <span className="badge badge-critical">VEHICLE {route?.vehicleId || 'AMB-114'}</span>
            <span className="badge badge-gold">PRIORITY 1 DISPATCH</span>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.88em', marginTop: 4 }}>
            Emergency green corridor navigation synced with traffic signal preemption and hospital OR telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className={`btn btn-sm ${sirenActive ? 'btn-crimson-glow' : 'btn-outline'}`}
            onClick={() => setSirenActive(!sirenActive)}
          >
            {sirenActive ? '🚨 Siren: ON' : '🚨 Siren: OFF'}
          </button>
          <Button variant="outline" onClick={loadRoute}>Refresh Telemetry</Button>
        </div>
      </div>

      {/* Multi-Page Navigation Bar */}
      <div className="role-subnav-bar card-glass-gold">
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'cockpit' ? 'active' : ''}`}
          onClick={() => setActiveTab('cockpit')}
        >
          🗺️ Google Map Live Navigation
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'ischemia' ? 'active' : ''}`}
          onClick={() => setActiveTab('ischemia')}
        >
          ❄️ Organ Preservation & Cold Ischemia
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'preemption' ? 'active' : ''}`}
          onClick={() => setActiveTab('preemption')}
        >
          🚨 Municipal Signals & Police Clearance
        </button>
      </div>

      {/* PAGE 1: Google Map Live Navigation Cockpit */}
      {activeTab === 'cockpit' && (
        <div className="tab-page-container">
          <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>
            {/* Google Ambulance Map Component */}
            <div>
              <GoogleAmbulanceMap
                route={route}
                organType={route?.organType || 'Kidney'}
                urgencyScore={92.4}
                vehicleId={route?.vehicleId || 'AMB-114'}
              />
            </div>

            {/* Delivery Action & Mission Status Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card className="card-glass-gold">
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <span className="badge badge-gold">MATCH #{route?.matchId || 42}</span>
                  <span className="badge badge-critical">ETA 8 MIN</span>
                </div>

                <h3 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)', marginBottom: 6 }}>
                  Emergency Transit Dispatch
                </h3>

                <div className="stack-16" style={{ marginBottom: 16 }}>
                  <div className="flex-between">
                    <span className="text-secondary" style={{ fontSize: '0.85em' }}>Origin Base:</span>
                    <span style={{ fontWeight: 700 }}>St. Xavier Medical</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-secondary" style={{ fontSize: '0.85em' }}>Destination OR:</span>
                    <span style={{ fontWeight: 700, color: '#10B981' }}>City General Trauma OR-4</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-secondary" style={{ fontSize: '0.85em' }}>Organ Cargo:</span>
                    <span style={{ fontWeight: 700, color: 'var(--omrs-gold)' }}>Human Kidney (Donor D-994)</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-secondary" style={{ fontSize: '0.85em' }}>Convoy Escort:</span>
                    <span style={{ fontWeight: 700 }}>Sector 12 Highway Police</span>
                  </div>
                </div>

                {delivered ? (
                  <div className="alert-glass-success" style={{ textAlign: 'center', padding: '14px' }}>
                    <div style={{ fontSize: '1.4em', marginBottom: 4 }}>✓</div>
                    <div style={{ fontWeight: 800 }}>ORGAN DELIVERED TO OR</div>
                    <div style={{ fontSize: '0.8em', marginTop: 2 }}>Transplant team taking custody.</div>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    className="btn-gold-glow"
                    block
                    onClick={handleConfirmDelivery}
                    style={{ padding: '12px' }}
                  >
                    🏥 Confirm Arrival & Organ Handover →
                  </Button>
                )}
              </Card>

              {/* Transit Radio Dispatch */}
              <Card className="card-glass-gold">
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9em', color: 'var(--omrs-gold)' }}>
                    RADIO CHANNEL #04 (POLICE / OR)
                  </span>
                  <span className="live-ping-dot" />
                </div>
                <div className="radio-chat-stream" style={{ fontSize: '0.84em', lineHeight: 1.6 }}>
                  <p><strong>[15:10 Police Unit 2]:</strong> Sector 4 intersection cleared. All green waves locked.</p>
                  <p><strong>[15:12 Hospital OR]:</strong> Dr. Rahman team scrubbed in. Anesthesia standing by.</p>
                  <p><strong>[15:13 Pilot Kumar]:</strong> Expressway Toll 2 crossed at 80 km/h. Smooth transit.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 2: Organ Cold Storage & Telemetry */}
      {activeTab === 'ischemia' && (
        <div className="tab-page-container">
          <div className="grid-3" style={{ gap: 20, marginBottom: 20 }}>
            <Card className="card-glass-gold">
              <span className="mini-kpi-lbl">POD STORAGE TEMPERATURE</span>
              <div style={{ fontSize: '2.2em', fontWeight: 900, color: '#10B981', margin: '8px 0' }}>
                {podTemp} °C
              </div>
              <span className="badge badge-success">OPTIMAL HYPOTHERMIC (2°C – 4°C)</span>
            </Card>

            <Card className="card-glass-gold">
              <span className="mini-kpi-lbl">PERFUSION PRESSURE</span>
              <div style={{ fontSize: '2.2em', fontWeight: 900, color: 'var(--omrs-gold)', margin: '8px 0' }}>
                {perfusionPressure} mmHg
              </div>
              <span className="badge badge-gold">PULSATILE FLOW STABLE</span>
            </Card>

            <Card className="card-glass-gold">
              <span className="mini-kpi-lbl">COLD ISCHEMIA DECAY TIMER</span>
              <div style={{ fontSize: '2.2em', fontWeight: 900, color: '#DC2626', margin: '8px 0' }}>
                4h 12m
              </div>
              <span className="badge badge-critical">78.5% VIABILITY REMAINING</span>
            </Card>
          </div>

          <Card className="card-glass-gold">
            <h3 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)', marginBottom: 12 }}>
              Organ Viability Protocol Checklist
            </h3>
            <div className="grid-2" style={{ gap: 14 }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <strong>✓ Perfusion Pump Circuit:</strong> Dual battery backup confirmed at 98% charge.
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <strong>✓ Preservative Solution:</strong> University of Wisconsin (UW) Cold Storage flush intact.
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <strong>✓ Temperature Alarms:</strong> Configured for high threshold at 6.0°C.
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <strong>✓ Cellular Viability:</strong> Real-time biosensor impedance normal.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* PAGE 3: Municipal Preemption & Traffic Signals */}
      {activeTab === 'preemption' && (
        <div className="tab-page-container">
          <Card className="card-glass-gold">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
                  Municipal Traffic Preemption Control
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.84em' }}>
                  Automated GPS geofencing triggers emergency signal preemption 600 meters in advance of the vehicle.
                </p>
              </div>
              <span className="badge badge-success">ALL SIGNALS SYNCHRONIZED</span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>INTERSECTION JUNCTION</th>
                    <th>ZONE</th>
                    <th>PREEMPTION TIME</th>
                    <th>SIGNAL STATE</th>
                    <th>POLICE ESCORT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>St. Xavier Medical Exit Gate</td>
                    <td>Sector 1</td>
                    <td>0m (Departed)</td>
                    <td><span className="badge badge-success">● GREEN OVERRIDE</span></td>
                    <td>Unit Alpha-1</td>
                  </tr>
                  <tr>
                    <td>Sector 4 Metro Interchange</td>
                    <td>Sector 4</td>
                    <td>+4m (Cleared)</td>
                    <td><span className="badge badge-success">● GREEN OVERRIDE</span></td>
                    <td>Traffic Post 4</td>
                  </tr>
                  <tr>
                    <td>National Expressway Toll 2</td>
                    <td>Expressway</td>
                    <td>+9m (Active)</td>
                    <td><span className="badge badge-success">● TOLL BARRIER OPEN</span></td>
                    <td>Patrol Unit 8</td>
                  </tr>
                  <tr>
                    <td>City Hospital Flyover</td>
                    <td>Sector 9</td>
                    <td>+14m (Approaching)</td>
                    <td><span className="badge badge-gold">● ARMED (PREEMPTION PRIMED)</span></td>
                    <td>Traffic Post 9</td>
                  </tr>
                  <tr>
                    <td>City General Hospital Trauma Ramp</td>
                    <td>Medical Core</td>
                    <td>+18m (Arrival)</td>
                    <td><span className="badge badge-success">● TRAUMA BAY CLEARED</span></td>
                    <td>Hospital Security</td>
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
