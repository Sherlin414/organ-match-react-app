import { useState, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { OrganIcon } from '../../assets/organIcons';
import { PatientSecurityVault } from '../../components/common/PatientSecurityVault';
import { registerOrgan } from '../../api/organApi';

const ORGAN_TYPES = [
  { name: 'Kidney', defaultMinutes: 1440, info: '24-36h preservation limit' },
  { name: 'Liver', defaultMinutes: 600, info: '8-12h strict cold ischemia' },
  { name: 'Heart', defaultMinutes: 240, info: '4-6h maximum urgent window' },
  { name: 'Lung', defaultMinutes: 360, info: '6-8h critical window' },
  { name: 'Pancreas', defaultMinutes: 720, info: '12-18h preservation limit' },
];

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function DonorCoordinatorDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('intake'); // 'intake' | 'matrix' | 'crypto-consent'

  const [organType, setOrganType] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [viabilityWindow, setViabilityWindow] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function handleOrganChange(type) {
    setOrganType(type);
    const found = ORGAN_TYPES.find((o) => o.name === type);
    if (found && !viabilityWindow) {
      setViabilityWindow(String(found.defaultMinutes));
    }
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!organType || !bloodType || !viabilityWindow) return;
      setSubmitting(true);
      setError('');
      try {
        const { organ, match } = await registerOrgan({ organType, bloodType, viabilityWindow });
        setResult({ organ, matched: !!match });
        setOrganType('');
        setBloodType('');
        setViabilityWindow('');
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [organType, bloodType, viabilityWindow]
  );

  return (
    <DashboardLayout links={[{ to: '/donor-coordinator', label: t('registerDonorOrgan') }]}>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6em', fontWeight: 800 }}>Donor Viability & Intake Portal</h1>
            <span className="badge badge-gold">COORDINATOR COMMAND</span>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.88em', marginTop: 4 }}>
            Donor organ registration, cold ischemia viability decay calculation, and cryptographic legal consent vault.
          </p>
        </div>
        <span className="badge badge-success">St. Xavier Medical Center</span>
      </div>

      {/* Multi-Page Navigation Bar */}
      <div className="role-subnav-bar card-glass-gold">
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'intake' ? 'active' : ''}`}
          onClick={() => setActiveTab('intake')}
        >
          🫀 Donor Organ Intake & Registration
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          🧬 Candidate Allocation Matrix
        </button>
        <button
          type="button"
          className={`subnav-pill ${activeTab === 'crypto-consent' ? 'active' : ''}`}
          onClick={() => setActiveTab('crypto-consent')}
        >
          📜 Encrypted Donor Consent & Health Vault
        </button>
      </div>

      {/* PAGE 1: Donor Intake */}
      {activeTab === 'intake' && (
        <div className="tab-page-container">
          <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
            <Card className="card-glass-gold">
              <h2 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)', marginBottom: 14 }}>
                Register Retrieved Donor Organ
              </h2>

              {error && <div className="form-error" style={{ marginBottom: 14 }}>{error}</div>}
              {result && (
                <div className="alert-glass-success" style={{ marginBottom: 14 }}>
                  <span>✓</span> Organ successfully registered! Allocation matching engine triggered.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Organ Specification</label>
                  <div className="option-row" style={{ marginTop: 6 }}>
                    {ORGAN_TYPES.map((o) => (
                      <button
                        key={o.name}
                        type="button"
                        className={`option-pill ${organType === o.name ? 'active' : ''}`}
                        onClick={() => handleOrganChange(o.name)}
                      >
                        <OrganIcon organ={o.name} size={16} />
                        <span>{o.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field" style={{ marginTop: 14 }}>
                  <label>Donor ABO Blood Group & Rh</label>
                  <div className="option-row" style={{ marginTop: 6 }}>
                    {BLOOD_TYPES.map((bt) => (
                      <button
                        key={bt}
                        type="button"
                        className={`option-pill ${bloodType === bt ? 'active' : ''}`}
                        onClick={() => setBloodType(bt)}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field" style={{ marginTop: 14 }}>
                  <label>Estimated Cold Ischemia Viability Window (Minutes)</label>
                  <input
                    type="number"
                    value={viabilityWindow}
                    onChange={(e) => setViabilityWindow(e.target.value)}
                    placeholder="e.g. 1440 for Kidney, 240 for Heart"
                    required
                  />
                  <span className="field-hint" style={{ marginTop: 4 }}>
                    Automated decay countdown begins the moment retrieval clamping occurs.
                  </span>
                </div>

                <div style={{ marginTop: 20 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    className="btn-gold-glow"
                    block
                    disabled={submitting}
                  >
                    {submitting ? 'Registering & Calculating Matches…' : 'Commit Organ & Initiate Match Scan →'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Organ Viability Guidelines */}
            <Card className="card-glass-gold">
              <h3 style={{ fontSize: '1.15em', fontWeight: 800, color: 'var(--omrs-gold)', marginBottom: 12 }}>
                Clinical Organ Preservation Standards
              </h3>
              <div className="stack-16">
                {ORGAN_TYPES.map((o) => (
                  <div key={o.name} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{o.name}</div>
                      <div className="text-secondary" style={{ fontSize: '0.82em' }}>{o.info}</div>
                    </div>
                    <span className="badge badge-gold">{o.defaultMinutes / 60}h Target</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* PAGE 2: Candidate Allocation Matrix */}
      {activeTab === 'matrix' && (
        <div className="tab-page-container">
          <Card className="card-glass-gold">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.2em', fontWeight: 800, color: 'var(--omrs-gold)' }}>
                  Active Regional Allocation Queues
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.84em' }}>
                  Real-time priority rankings across participating hospital networks.
                </p>
              </div>
              <span className="badge badge-success">5 HOSPITALS CONNECTED</span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ORGAN</th>
                    <th>TOP RANKED RECIPIENT</th>
                    <th>BLOOD TYPE</th>
                    <th>MELD SCORE</th>
                    <th>DESTINATION HOSPITAL</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Kidney</td>
                    <td><strong>Arjun Menon</strong></td>
                    <td><span className="blood-badge">O+</span></td>
                    <td><span style={{ color: '#DC2626', fontWeight: 800 }}>92.4 (Critical)</span></td>
                    <td>City General Hospital</td>
                    <td><span className="badge badge-success">Matched ✓</span></td>
                  </tr>
                  <tr>
                    <td>Heart</td>
                    <td><strong>Karan Mehra</strong></td>
                    <td><span className="blood-badge">A+</span></td>
                    <td><span style={{ color: '#DC2626', fontWeight: 800 }}>84.2</span></td>
                    <td>St. Xavier Medical Center</td>
                    <td><span className="badge badge-gold">Reviewing</span></td>
                  </tr>
                  <tr>
                    <td>Liver</td>
                    <td><strong>Sunita Rao</strong></td>
                    <td><span className="blood-badge">B+</span></td>
                    <td><span style={{ color: 'var(--omrs-gold)', fontWeight: 800 }}>79.8</span></td>
                    <td>Apollo City Hospital</td>
                    <td><span className="badge badge-subtle">Queued</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* PAGE 3: Encrypted Donor Legal Consent & Health Vault */}
      {activeTab === 'crypto-consent' && (
        <div className="tab-page-container">
          <PatientSecurityVault
            patientId={null}
            role="DONOR_COORDINATOR"
            canAddRecords={true}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
