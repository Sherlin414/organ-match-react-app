import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { NavigationIcon, BoltIcon, ShieldCheckIcon } from '../../assets/brandIcons';

const WAYPOINTS = [
  { name: 'St. Xavier Medical Center (Donor Base)', status: 'Departed', time: '0m', km: '0.0', type: 'origin', light: 'GREEN' },
  { name: 'Sector 4 Metro Interchange', status: 'Cleared', time: '+4m', km: '3.2', type: 'cleared', light: 'GREEN' },
  { name: 'National Expressway Toll 2', status: 'In Transit', time: '+9m', km: '7.8', type: 'active', light: 'GREEN_PRIORITY' },
  { name: 'City Hospital Flyover Junction', status: 'Signals Preempted', time: '+14m', km: '11.4', type: 'upcoming', light: 'AUTO_CLEARED' },
  { name: 'City General Hospital (Trauma Center OR)', status: 'Destination', time: '+18m', km: '14.2', type: 'destination', light: 'CLEAR' },
];

export function GoogleAmbulanceMap({
  route = null,
  organType = 'Kidney',
  urgencyScore = 92.4,
  vehicleId = 'AMB-114',
}) {
  const [mapMode, setMapMode] = useState('google'); // 'google' | 'radar'
  const [sirenActive, setSirenActive] = useState(true);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('omrs_google_maps_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [customKey, setCustomKey] = useState(apiKey);
  const [keySaved, setKeySaved] = useState(false);
  const [speed, setSpeed] = useState(78);
  const [signalOverrideCount, setSignalOverrideCount] = useState(6);

  // Simulated live speed fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(Math.floor(75 + Math.random() * 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('omrs_google_maps_key', customKey.trim());
    setApiKey(customKey.trim());
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyInput(false);
    }, 1500);
  };

  // Google Maps directions embed URL (Chennai / Metro Coordinates or query)
  // Origin: St. Xavier Medical Center, Destination: City General Hospital
  const googleMapEmbedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(apiKey)}&origin=St.+Xavier+Medical+Center&destination=City+General+Hospital&mode=driving`
    : `https://maps.google.com/maps?q=St.+Xavier+Medical+Center+to+City+General+Hospital&t=k&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="google-ambulance-map-container">
      {/* Top Telemetry & Control Bar */}
      <div className="corridor-map-header card-glass-gold">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="live-siren-indicator">
            <span className={`siren-pulse-dot ${sirenActive ? 'siren-flashing' : ''}`} />
            <span style={{ fontWeight: 800, fontSize: '0.95em', letterSpacing: '0.04em' }}>
              GREEN CORRIDOR TRANSIT · VEHICLE {vehicleId}
            </span>
          </div>
          <span className="badge badge-gold">ORGAN: {organType.toUpperCase()}</span>
          <span className="badge badge-critical">MELD: {urgencyScore}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div className="map-view-switcher">
            <button
              type="button"
              className={`view-pill ${mapMode === 'google' ? 'active' : ''}`}
              onClick={() => setMapMode('google')}
            >
              🗺️ Google Maps Satellite
            </button>
            <button
              type="button"
              className={`view-pill ${mapMode === 'radar' ? 'active' : ''}`}
              onClick={() => setMapMode('radar')}
            >
              📡 High-Tech Radar HUD
            </button>
          </div>

          {/* Siren Button */}
          <button
            type="button"
            className={`btn btn-sm ${sirenActive ? 'btn-crimson-glow' : 'btn-outline'}`}
            onClick={() => setSirenActive(!sirenActive)}
            title="Toggle Emergency Beacon & Audio Sync"
          >
            {sirenActive ? '🚨 Siren: ACTIVE' : '🚨 Siren: MUTED'}
          </button>

          {/* API Key Modal / Settings Trigger */}
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => setShowKeyInput(!showKeyInput)}
            title="Configure Google Maps API Key"
          >
            ⚙️ Maps API Key
          </button>
        </div>
      </div>

      {/* API Key Configuration Drawer */}
      {showKeyInput && (
        <Card className="api-key-config-banner card-glass-gold" style={{ margin: '12px 0' }}>
          <form onSubmit={handleSaveKey} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.2em' }}>🔑</span>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88em', color: 'var(--omrs-gold)' }}>
                Google Maps API Key Configuration
              </div>
              <p className="text-secondary" style={{ fontSize: '0.8em', margin: '2px 0 6px' }}>
                Enter your Google Maps API Key below, or leave empty to use our built-in satellite embed. (If you want any API, ask me for anything!)
              </p>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                style={{ width: '100%', padding: '6px 12px', fontSize: '0.88em' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="submit" variant="primary" className="btn-gold-glow">
                {keySaved ? 'Saved! ✓' : 'Save Key'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowKeyInput(false)}>
                Close
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Map Viewer Area */}
      <div className="ambulance-map-viewport-wrapper">
        {mapMode === 'google' ? (
          /* Google Maps Interactive Frame */
          <div className="google-maps-frame-container">
            <iframe
              title="Google Maps Ambulance Emergency Route"
              src={googleMapEmbedUrl}
              width="100%"
              height="380"
              style={{ border: 0, borderRadius: 'var(--omrs-radius-md)', filter: 'contrast(105%)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Floating Live Telemetry Overlay on Google Map */}
            <div className="google-map-hud-overlay">
              <div className="hud-metric">
                <span className="hud-metric-label">TELEMETRY SPEED</span>
                <span className="hud-metric-val highlight-gold">{speed} km/h</span>
              </div>
              <div className="hud-metric">
                <span className="hud-metric-label">CORRIDOR STATUS</span>
                <span className="hud-metric-val highlight-green">ALL SIGNALS GREEN</span>
              </div>
              <div className="hud-metric">
                <span className="hud-metric-label">ESTIMATED ETA</span>
                <span className="hud-metric-val highlight-red">8 MIN 40 SEC</span>
              </div>
              <div className="hud-metric">
                <span className="hud-metric-label">TRAFFIC SIGNALS PREEMPTED</span>
                <span className="hud-metric-val">{signalOverrideCount} / 6 INTERSECTIONS</span>
              </div>
            </div>
          </div>
        ) : (
          /* High-Tech Radar HUD Route Visualizer */
          <div className="corridor-map-canvas-card">
            <svg viewBox="0 0 600 240" className="corridor-route-svg">
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="0.8" />
                </pattern>
                <linearGradient id="corridorGoldGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />

              {/* Highway Corridor Line */}
              <path
                d="M 60 170 Q 180 50, 320 120 T 540 80"
                fill="none"
                stroke="rgba(220, 38, 38, 0.25)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 60 170 Q 180 50, 320 120 T 540 80"
                fill="none"
                stroke="url(#corridorGoldGlow)"
                strokeWidth="5"
                strokeLinecap="round"
                className="corridor-live-path"
              />

              {/* Origin Marker */}
              <circle cx="60" cy="170" r="10" fill="#D4AF37" />
              <circle cx="60" cy="170" r="16" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6" />
              <text x="60" y="202" fill="#D4AF37" fontSize="11" fontWeight="700" textAnchor="middle">
                St. Xavier Medical
              </text>

              {/* Waypoint 1 */}
              <circle cx="190" cy="98" r="7" fill="#10B981" />
              <text x="190" y="82" fill="#10B981" fontSize="10" opacity="0.9" textAnchor="middle">
                Metro Jct (Green ✓)
              </text>

              {/* Active Ambulance Marker */}
              <g transform="translate(320, 120)" className="corridor-ambulance-marker">
                <circle cx="0" cy="0" r="22" fill="#DC2626" opacity="0.3" className="marker-radar-wave" />
                <circle cx="0" cy="0" r="13" fill="#DC2626" />
                <text x="0" y="4" fill="#fff" fontSize="12" fontWeight="800" textAnchor="middle">🚑</text>
              </g>
              <text x="320" y="154" fill="#DC2626" fontSize="11" fontWeight="800" textAnchor="middle">
                AMB-114 (Now) · 78 km/h
              </text>

              {/* Destination Point */}
              <circle cx="540" cy="80" r="10" fill="#10B981" />
              <circle cx="540" cy="80" r="18" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.6" />
              <text x="540" y="112" fill="#10B981" fontSize="11" fontWeight="700" textAnchor="middle">
                City General OR
              </text>
            </svg>
          </div>
        )}
      </div>

      {/* Waypoint Timeline with Signal Statuses */}
      <div className="corridor-waypoints-timeline card-glass-gold" style={{ marginTop: 14 }}>
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <span className="timeline-title" style={{ color: 'var(--omrs-gold)', fontWeight: 700 }}>
            MUNICIPAL GREEN CORRIDOR INTERSECTIONS & SIGNAL OVERRIDES:
          </span>
          <span className="badge badge-success">POLICE ESCORT CLEARED</span>
        </div>

        <div className="waypoints-row">
          {WAYPOINTS.map((wp, i) => (
            <div key={i} className={`waypoint-node wp-${wp.type}`}>
              <div className="wp-dot" style={{ background: wp.type === 'destination' ? '#10B981' : wp.type === 'active' ? '#DC2626' : '#D4AF37' }} />
              <span className="wp-name">{wp.name}</span>
              <span className="wp-status">
                {wp.status} · {wp.time}
              </span>
              <span className="signal-light-pill">
                ● {wp.light}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
