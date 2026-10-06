import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusChip } from '../../components/common/StatusChip';
import { OrganIcon } from '../../assets/organIcons';
import { PatientSecurityVault } from '../../components/common/PatientSecurityVault';
import { GoogleAmbulanceMap } from '../../components/common/GoogleAmbulanceMap';
import { fetchWaitlist, registerPatient } from '../../api/patientApi';

const ORGAN_FILTER_OPTIONS = ['All', 'Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas'];

const SAMPLE_MATCH_CANDIDATES = [
  {
    donorId: 'DONOR-994',
    organ: 'Kidney',
    donorHospital: 'St. Xavier Medical Center',
    recipientName: 'Arjun Menon',
    recipientId: 'u-patient-1',
    hlaMatchScore: '6 / 6 Complete Match',
    meldScore: 92.4,
    ischemiaWindowLeft: '4 Hours 12 Mins',
    status: 'Corridor Authorized',
    crossmatch: 'Negative (Compatible)',
  },
  {
    donorId: 'DONOR-102',
    organ: 'Heart',
    donorHospital: 'City General Hospital',
    recipientName: 'Karan Mehra',
    recipientId: 'u-patient-2',
    hlaMatchScore: '5 / 6 High Match',
    meldScore: 84.2,
    ischemiaWindowLeft: '2 Hours 45 Mins',
    status: 'Pending Dual-Auth',
    crossmatch: 'Negative (Compatible)',
  },
  {
    donorId: 'DONOR-881',
    organ: 'Liver',
    donorHospital: 'Apollo City Hospital',
    recipientName: 'Sunita Rao',
    recipientId: 'u-patient-3',
    hlaMatchScore: '5 / 6 Concordant',
    meldScore: 79.8,
    ischemiaWindowLeft: '6 Hours 30 Mins',
    status: 'Crossmatch In Progress',
    crossmatch: 'Evaluating Panel Antibodies',
  },
];

export default function DoctorDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('waitlist'); // 'waitlist' | 'matching-engine' | 'crypto-vault' | 'transit-corridor'
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganFilter, setSelectedOrganFilter] = useState('All');

  const loadWaitlist = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const patients = await fetchWaitlist();
      setWaitlist(patients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWaitlist();
  }, [loadWaitlist]);

  const filteredWaitlist = useMemo(() => {
    return waitlist
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.bloodType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesOrgan =
          selectedOrganFilter === 'All' || p.organ === selectedOrganFilter;
        return matchesSearch && matchesOrgan;
      })
      .sort((a, b) => (b.urgency || 0) - (a.urgency || 0));
  }, [waitlist, searchTerm, selectedOrganFilter]);

  const criticalCount = useMemo(() => waitlist.filter((p) => p.urgency >= 80).length, [waitlist]);
  const matchedCount = useMemo(() => waitlist.filter((p) => p.status === 'Matched').length, [waitlist]);

  const toggleForm = useCallback(() => setShowForm((prev) => !prev), []);

  const handleAddPatient = useCallback(async (formValues) => {
    const newPatient = await registerPatient(formValues);
    setWaitlist((prev) => [...prev, newPatient]);
    setShowForm(false);
  }, []);

  return (
    <DashboardLayout links={[{ to: '/doctor', label: t('patientWaitlist') }]}>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6em', fontWeight: 800 }}>Clinical Specialist Command</h1>
            <span className="badge badge-gold">SURGEON PORTAL</span>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.88em', marginTop: 4 }}>
            Organ match triage, HLA crossmatching, AES-256 patient privacy vault, and green corridor tracking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={toggleForm} className="btn-primary btn-gold-glow">
            + {t('registerNewPatient')}
          </Button>
          <Button variant="outline" onClick={loadWaitlist}>Refresh</Button>
        </div>
      </div>

      {/* Multi-Page Navigation Bar */}
      <div className="role-subnav-bar card-glass-gold">
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'waitlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('waitlist')}
        >
          🩺 Clinical Roster & Triage
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'matching-engine' ? 'active' : ''}`}
          onClick={() => setActiveTab('matching-engine')}
        >
          🧬 Biocompatibility & HLA Engine
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'crypto-vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('crypto-vault')}
        >
          🔐 Patient Privacy & Encryption Vault
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'transit-corridor' ? 'active' : ''}`}
          onClick={() => setActiveTab('transit-corridor')}
        >
          🚑 Inbound Organ Google Map
        </button>
      </div>

      {/* PAGE 1: Clinical Waitlist Roster */}
      {activeTab === 'waitlist' && (
        <div className="tab-page-container">
          {/* Quick Metrics Strip */}
          <div className="grid-4" style={{ marginBottom: 20, gap: 16 }}>
            <div className="card mini-kpi-card card-glass-gold">
              <span className="mini-kpi-lbl">TOTAL CANDIDATES</span>
              <span className="mini-kpi-val highlight-gold">{waitlist.length}</span>
              <span className="mini-kpi-sub">Indexed across 5 organ types</span>
            </div>
            <div className="card mini-kpi-card card-glass-gold">
              <span className="mini-kpi-lbl">CRITICAL URGENCY (&gt;80)</span>
              <span className="mini-kpi-val highlight-red">{criticalCount}</span>
              <span className="mini-kpi-sub">Priority allocation queued</span>
            </div>
            <div className="card mini-kpi-card card-glass-gold">
              <span className="mini-kpi-lbl">ACTIVE ALLOCATIONS</span>
              <span className="mini-kpi-val highlight-green">{matchedCount}</span>
              <span className="mini-kpi-sub">Ready for transplant OR</span>
            </div>
            <div className="card mini-kpi-card card-glass-gold">
              <span className="mini-kpi-lbl">AI ISCHEMIA ENGINE</span>
              <span className="mini-kpi-val" style={{ color: '#10B981' }}>ONLINE</span>
              <span className="mini-kpi-sub">Synchronized with Green Corridor</span>
            </div>
          </div>

          {showForm && (
            <QuickAddForm onSubmit={handleAddPatient} onCancel={() => setShowForm(false)} />
          )}

          {/* Filter Bar */}
          <div className="filter-bar card card-glass-gold" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-input-box" style={{ flex: 1, minWidth: 220 }}>
                <input
                  type="text"
                  placeholder="Search candidate by name, ID code, or blood group…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="organ-pill-filter" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ORGAN_FILTER_OPTIONS.map((org) => (
                  <button
                    key={org}
                    type="button"
                    className={`filter-pill-btn ${selectedOrganFilter === org ? 'active' : ''}`}
                    onClick={() => setSelectedOrganFilter(org)}
                  >
                    {org}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Candidates Table */}
          {loading ? (
            <div className="card card-glass-gold" style={{ textAlign: 'center', padding: '48px' }}>
              <div className="google-spinner" style={{ margin: '0 auto 16px' }} />
              <p className="text-secondary">Loading candidate queue from clinical database…</p>
            </div>
          ) : (
            <div className="table-responsive card card-glass-gold">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CANDIDATE ID & NAME</th>
                    <th>TARGET ORGAN</th>
                    <th>BLOOD GROUP</th>
                    <th>MELD URGENCY SCORE</th>
                    <th>STATUS</th>
                    <th>REGISTERED</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWaitlist.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{p.name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.82em' }}>{p.code}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <OrganIcon organ={p.organ} size={20} />
                          <span>{p.organ}</span>
                        </div>
                      </td>
                      <td>
                        <span className="blood-badge">{p.bloodType}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, color: p.urgency >= 80 ? '#DC2626' : 'var(--omrs-gold)' }}>
                            {p.urgency}
                          </span>
                          <div className="urgency-bar-track">
                            <div
                              className="urgency-bar-fill"
                              style={{
                                width: `${Math.min(p.urgency, 100)}%`,
                                background: p.urgency >= 80 ? '#DC2626' : 'var(--omrs-gold)',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td><StatusChip status={p.status} /></td>
                      <td className="text-secondary" style={{ fontSize: '0.84em' }}>{p.registered}</td>
                    </tr>
                  ))}
                  {filteredWaitlist.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px' }}>
                        <p className="text-secondary">No patients match your search criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PAGE 2: Biocompatibility & Donor HLA Matching Engine */}
      {activeTab === 'matching-engine' && (
        <div className="tab-page-container">
          <Card className="card-glass-gold" style={{ marginBottom: 18 }}>
            <div className="flex-between">
              <div>
                <h2 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
                  Algorithmic Biocompatibility & Donor Allocation Matrix
                </h2>
                <p className="text-secondary" style={{ fontSize: '0.84em', marginTop: 3 }}>
                  Calculated against ABO blood compatibility, HLA-A, HLA-B, HLA-DR allele crossmatching, and geographical decay curves.
                </p>
              </div>
              <span className="badge badge-success">● CROSSMATCH ENGINE ACTIVE</span>
            </div>
          </Card>

          <div className="grid-3" style={{ gap: 20 }}>
            {SAMPLE_MATCH_CANDIDATES.map((match) => (
              <Card key={match.donorId} className="card-glass-gold match-candidate-card">
                <div className="flex-between" style={{ marginBottom: 10 }}>
                  <span className="badge badge-gold">{match.donorId}</span>
                  <span className="badge badge-critical">{match.organ.toUpperCase()}</span>
                </div>
                <h3 style={{ fontSize: '1.15em', fontWeight: 800, marginBottom: 4 }}>{match.recipientName}</h3>
                <div className="text-secondary" style={{ fontSize: '0.82em', marginBottom: 14 }}>
                  Donor Retrieval Base: <strong>{match.donorHospital}</strong>
                </div>

                <div className="stack-16" style={{ marginBottom: 16 }}>
                  <div className="flex-between">
                    <span className="text-secondary" style={{ fontSize: '0.86em' }}>HLA Concordance:</span>
                    <span style={{ fontWeight: 800, color: '#10B981' }}>{match.hlaMatchScore}</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-secondary" style={{ fontSize: '0.86em' }}>MELD Score:</span>
                    <span style={{ fontWeight: 800, color: '#DC2626' }}>{match.meldScore}</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-secondary" style={{ fontSize: '0.86em' }}>Ischemia Limit:</span>
                    <span style={{ fontWeight: 800, color: 'var(--omrs-gold)' }}>{match.ischemiaWindowLeft}</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-secondary" style={{ fontSize: '0.86em' }}>Serum Crossmatch:</span>
                    <span style={{ fontWeight: 700 }}>{match.crossmatch}</span>
                  </div>
                </div>

                <Button variant="primary" className="btn-gold-glow" block onClick={() => setActiveTab('crypto-vault')}>
                  View Cryptographic Patient Records →
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 3: Confidential Patient Security & Cryptographic Privacy Vault */}
      {activeTab === 'crypto-vault' && (
        <div className="tab-page-container">
          <PatientSecurityVault
            patientId={null}
            role="DOCTOR"
            canAddRecords={true}
          />
        </div>
      )}

      {/* PAGE 4: Emergency Green Corridor Google Map Tracking */}
      {activeTab === 'transit-corridor' && (
        <div className="tab-page-container">
          <Card className="card-glass-gold" style={{ marginBottom: 16 }}>
            <div className="flex-between">
              <div>
                <h2 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
                  Inbound Organ Transport Corridor
                </h2>
                <p className="text-secondary" style={{ fontSize: '0.84em', marginTop: 3 }}>
                  Live satellite route for donor kidney in transit to Trauma Center OR-4. Traffic police signal preemption synchronized.
                </p>
              </div>
              <span className="badge badge-success">● GREEN CORRIDOR ACTIVE</span>
            </div>
          </Card>

          <GoogleAmbulanceMap
            organType="Kidney"
            urgencyScore={92.4}
            vehicleId="AMB-114"
          />
        </div>
      )}
    </DashboardLayout>
  );
}

function QuickAddForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [organ, setOrgan] = useState('Kidney');
  const [bloodType, setBloodType] = useState('O+');
  const [urgency, setUrgency] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!name || !urgency) return;
      setSubmitting(true);
      setError('');
      try {
        await onSubmit({
          name,
          organNeeded: organ,
          bloodType,
          urgencyScore: parseFloat(urgency),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [name, organ, bloodType, urgency, onSubmit]
  );

  return (
    <Card className="card-glass-gold quick-add-modal-card" style={{ marginBottom: 20 }}>
      <div className="flex-between" style={{ marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
            Clinical Waitlist Intake Registration
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.84em' }}>
            Candidate will be immediately indexed by the cold ischemia matching engine.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', color: '#fff' }}
        >
          ✕
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ gap: 14 }}>
          <div className="field">
            <label>Patient Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Nair" required />
          </div>
          <div className="field">
            <label>Calculated Urgency Score (0 - 100)</label>
            <input type="number" step="0.1" value={urgency} onChange={(e) => setUrgency(e.target.value)} placeholder="e.g. 84.5" required />
          </div>
          <div className="field">
            <label>Organ Needed</label>
            <select value={organ} onChange={(e) => setOrgan(e.target.value)}>
              {['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Blood Type (ABO & Rh)</label>
            <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
          <Button type="submit" variant="primary" className="btn-gold-glow" disabled={submitting}>
            {submitting ? 'Registering Patient…' : 'Add to Prioritized Waitlist →'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
