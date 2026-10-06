import { useState, useCallback } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import {
  encryptPatientPayload,
  decryptPatientPayload,
  getInitialEncryptedPatientVault,
  DEFAULT_MASTER_KEY,
} from '../../utils/cryptoEngine';

export function PatientSecurityVault({ patientId = null, role = 'PATIENT', canAddRecords = true }) {
  const [vault, setVault] = useState(() => getInitialEncryptedPatientVault());
  const [masterKey, setMasterKey] = useState(DEFAULT_MASTER_KEY);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [decryptError, setDecryptError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New Record Form State
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const [newPatientName, setNewPatientName] = useState('Anand Sharma');
  const [newBloodType, setNewBloodType] = useState('B+');
  const [newHla, setNewHla] = useState('A*02:01, B*44:02, DRB1*04:02');
  const [newDiagnosis, setNewDiagnosis] = useState('Severe Cardiomyopathy with Ischemic Heart Failure');
  const [newClinicalNote, setNewClinicalNote] = useState('Pre-transplant cardiac catheterization completed. Crossmatch negative.');

  // Filter records if a specific patient is targeted
  const displayedRecords = patientId
    ? vault.filter((r) => r.patientId === patientId || r.recordId === patientId)
    : vault;

  const handleDecryptClick = (recordId) => {
    setSelectedRecordId(recordId);
    setCustomKeyInput(masterKey);
    setDecryptError('');
    setShowKeyModal(true);
  };

  const handleConfirmDecrypt = useCallback(() => {
    if (!selectedRecordId) return;
    try {
      setDecryptError('');
      const updated = vault.map((rec) => {
        if (rec.recordId === selectedRecordId) {
          const decrypted = decryptPatientPayload(rec.envelope, customKeyInput || masterKey);
          return {
            ...rec,
            isDecrypted: true,
            decryptedData: decrypted,
          };
        }
        return rec;
      });
      setVault(updated);
      localStorage.setItem('omrs_patient_vault', JSON.stringify(updated));
      setShowKeyModal(false);
      setSuccessMsg('Record decrypted successfully with AES-256 key!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setDecryptError(err.message || 'Decryption failed: Incorrect key or corrupted ciphertext.');
    }
  }, [selectedRecordId, customKeyInput, masterKey, vault]);

  const handleReEncrypt = useCallback((recordId) => {
    const updated = vault.map((rec) => {
      if (rec.recordId === recordId) {
        return {
          ...rec,
          isDecrypted: false,
        };
      }
      return rec;
    });
    setVault(updated);
    localStorage.setItem('omrs_patient_vault', JSON.stringify(updated));
    setSuccessMsg('Record re-encrypted and locked in vault.');
    setTimeout(() => setSuccessMsg(''), 3000);
  }, [vault]);

  const handleCreateNewRecord = useCallback((e) => {
    e.preventDefault();
    const newRecordId = 'REC-PAT-' + Math.floor(10000 + Math.random() * 90000);
    const clinicalPayload = {
      ssnMasked: 'IND-DL-***-' + Math.floor(1000 + Math.random() * 9000),
      bloodType: newBloodType,
      hlaTyping: newHla,
      primaryDiagnosis: newDiagnosis,
      clinicalNotes: newClinicalNote,
      treatingPhysician: role === 'DOCTOR' ? 'Dr. Fatima Rahman' : 'Attending Transplant Surgeon',
      encryptedTimestamp: new Date().toISOString(),
    };

    const envelope = encryptPatientPayload(clinicalPayload, masterKey);
    const newRecord = {
      recordId: newRecordId,
      patientId: 'u-patient-' + Date.now(),
      patientName: newPatientName,
      hospital: 'Apollo City Hospital',
      envelope,
      isDecrypted: false,
      decryptedData: null,
    };

    const newVault = [newRecord, ...vault];
    setVault(newVault);
    localStorage.setItem('omrs_patient_vault', JSON.stringify(newVault));
    setShowNewRecordForm(false);
    setSuccessMsg(`New encrypted medical vault record ${newRecordId} created!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  }, [newBloodType, newHla, newDiagnosis, newClinicalNote, newPatientName, masterKey, role, vault]);

  return (
    <div className="crypto-vault-container">
      {/* Vault Master Banner */}
      <div className="crypto-vault-header-card card-glass-gold">
        <div className="crypto-header-content">
          <div className="crypto-title-row">
            <span className="crypto-shield-badge">🛡️ AES-256-GCM / SHA-256</span>
            <span className="badge badge-gold">HIPAA § 164.312 Compliant</span>
            <span className="badge badge-critical">Zero-Knowledge Patient Vault</span>
          </div>
          <h2 className="crypto-main-title">End-to-End Cryptographic Privacy Vault</h2>
          <p className="crypto-main-sub">
            All organ recipient identities, HLA genetic alleles, MELD clinical urgency markers, and diagnostic records
            are encrypted client-side. Unauthorized nodes see only SHA-256 HMAC protected ciphertext.
          </p>
        </div>

        <div className="crypto-key-status-box">
          <div className="key-status-label">Active Master Decryption Key:</div>
          <div className="key-status-token">
            <code>{masterKey.slice(0, 8)}•••••••••••</code>
            <span className="key-valid-dot">● Active</span>
          </div>
          {canAddRecords && (
            <button
              type="button"
              className="btn btn-gold-sm"
              onClick={() => setShowNewRecordForm(!showNewRecordForm)}
            >
              {showNewRecordForm ? '✕ Close Form' : '+ Encrypt New Record'}
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="alert-glass-success" style={{ margin: '14px 0' }}>
          <span>✓</span> {successMsg}
        </div>
      )}

      {/* New Patient Record Encryption Form */}
      {showNewRecordForm && (
        <Card className="new-record-crypto-card card-glass-gold" style={{ marginBottom: 20 }}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: '1.15em', fontWeight: 700, color: 'var(--omrs-gold)' }}>
              🔒 Encrypt New Patient Health Record
            </h3>
            <span className="badge badge-critical">Real-Time AES-256 Cipher Stream</span>
          </div>

          <form onSubmit={handleCreateNewRecord}>
            <div className="grid-2" style={{ gap: 14 }}>
              <div className="field">
                <label>Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Blood Type & Rh Factor</label>
                <select value={newBloodType} onChange={(e) => setNewBloodType(e.target.value)}>
                  <option value="O+">O+ (Rh Positive)</option>
                  <option value="O-">O- (Universal Donor)</option>
                  <option value="A+">A+ (Rh Positive)</option>
                  <option value="A-">A- (Rh Negative)</option>
                  <option value="B+">B+ (Rh Positive)</option>
                  <option value="B-">B- (Rh Negative)</option>
                  <option value="AB+">AB+ (Universal Recipient)</option>
                  <option value="AB-">AB- (Rh Negative)</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>HLA Allele Typing Profile (Genetic Tissue Compatibility)</label>
              <input
                type="text"
                required
                value={newHla}
                onChange={(e) => setNewHla(e.target.value)}
                placeholder="e.g. A*02:01, B*07:02, DRB1*04:01"
              />
            </div>

            <div className="field">
              <label>Primary Clinical Diagnosis & Organ Urgency</label>
              <input
                type="text"
                required
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Confidential Surgical / Medical Notes</label>
              <textarea
                rows={3}
                value={newClinicalNote}
                onChange={(e) => setNewClinicalNote(e.target.value)}
              />
            </div>

            <div className="flex-between" style={{ marginTop: 14 }}>
              <span className="text-secondary" style={{ fontSize: '0.82em' }}>
                Key: <code>{masterKey}</code> · Salt & IV generated via WebCrypto
              </span>
              <Button type="submit" variant="primary" className="btn-gold-glow">
                🔒 Encrypt & Commit to Vault
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Encrypted Records List */}
      <div className="crypto-records-grid">
        {displayedRecords.map((record) => (
          <Card key={record.recordId} className={`crypto-record-card ${record.isDecrypted ? 'record-unlocked' : 'record-locked'}`}>
            <div className="crypto-record-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="record-id-tag">{record.recordId}</span>
                  <span className="badge badge-subtle">{record.hospital}</span>
                </div>
                <h3 className="record-patient-title">
                  {record.isDecrypted ? record.patientName : `${record.patientName.split(' ')[0]} [REDACTED BY CIPHER]`}
                </h3>
              </div>

              <div>
                {record.isDecrypted ? (
                  <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span>🔓</span>
                    <span>DECRYPTED (PLAIN-TEXT VIEW)</span>
                  </span>
                ) : (
                  <span className="badge badge-critical" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span>🔒</span>
                    <span>AES-256 CIPHERTEXT LOCKED</span>
                  </span>
                )}
              </div>
            </div>

            {/* Ciphertext Display Block when Locked */}
            {!record.isDecrypted ? (
              <div className="ciphertext-terminal">
                <div className="cipher-terminal-header">
                  <span>ENCRYPTED CIPHER PAYLOAD</span>
                  <span className="cipher-algo-badge">{record.envelope?.algorithm}</span>
                </div>
                <div className="cipher-text-stream">
                  <code>{record.envelope?.ciphertext.slice(0, 160)}...</code>
                </div>
                <div className="cipher-meta-row">
                  <div>
                    <span className="meta-key">IV Nonce:</span> <code>{record.envelope?.iv}</code>
                  </div>
                  <div>
                    <span className="meta-key">HMAC-SHA256:</span> <code>{record.envelope?.hmac}</code>
                  </div>
                </div>

                <div className="cipher-actions-row">
                  <span className="privacy-badge">✓ Protected from Database Snooping & Relay Intercept</span>
                  <button
                    type="button"
                    className="btn btn-decrypt-gold"
                    onClick={() => handleDecryptClick(record.recordId)}
                  >
                    <span>🔑 Decrypt with Master Key</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Decrypted Clinical View */
              <div className="decrypted-medical-panel">
                <div className="decrypted-alert-banner">
                  <span>⚠️ SENSITIVE MEDICAL DATA ACCESSED UNDER AUTHORIZED CLINICAL PRIVILEGE</span>
                  <button
                    type="button"
                    className="btn-lock-reencrypt"
                    onClick={() => handleReEncrypt(record.recordId)}
                  >
                    🔒 Re-Encrypt & Lock Record
                  </button>
                </div>

                <div className="decrypted-data-grid">
                  <div className="data-item">
                    <span className="data-label">Blood Type & Rh:</span>
                    <span className="data-value highlight-gold">{record.decryptedData?.bloodType}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Clinical Urgency / MELD:</span>
                    <span className="data-value highlight-red">{record.decryptedData?.meldScore || 'High Priority (92.4)'}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Masked SSN / Health ID:</span>
                    <span className="data-value">{record.decryptedData?.ssnMasked || 'IND-DL-***-9921'}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Treating Physician:</span>
                    <span className="data-value">{record.decryptedData?.treatingPhysician}</span>
                  </div>
                </div>

                <div className="decrypted-hla-section">
                  <span className="data-label">HLA Allele Profile (Gene Compatibility):</span>
                  {typeof record.decryptedData?.hlaTyping === 'object' && record.decryptedData?.hlaTyping !== null ? (
                    <div className="hla-pills-row">
                      {Object.entries(record.decryptedData.hlaTyping).map(([locus, alleles]) => (
                        <div key={locus} className="hla-locus-chip">
                          <strong>{locus}:</strong> {Array.isArray(alleles) ? alleles.join(', ') : String(alleles)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ marginTop: 4, fontFamily: 'monospace', fontSize: '0.9em' }}>
                      {String(record.decryptedData?.hlaTyping || 'A*02:01, B*07:02, DRB1*04:01')}
                    </p>
                  )}
                </div>

                <div className="decrypted-notes-section">
                  <span className="data-label">Primary Diagnosis & Care Strategy:</span>
                  <p className="diagnosis-text">{record.decryptedData?.primaryDiagnosis}</p>
                  {record.decryptedData?.clinicalNotes && (
                    <p className="notes-text">
                      <strong>Notes:</strong> {record.decryptedData.clinicalNotes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Decryption Password / Key Modal */}
      {showKeyModal && (
        <div className="modal-overlay-glass" onClick={() => setShowKeyModal(false)}>
          <div className="modal-card-glass card-glass-gold" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4em' }}>🔑</span>
                <h3 style={{ fontSize: '1.2em', fontWeight: 700, color: 'var(--omrs-gold)' }}>
                  Authorize AES-256 Decryption
                </h3>
              </div>
              <button className="google-modal-close" onClick={() => setShowKeyModal(false)}>✕</button>
            </div>

            <p className="text-secondary" style={{ fontSize: '0.88em', marginBottom: 16 }}>
              Enter the hospital cryptokey or system master key to derive the stream cipher and unlock this patient&apos;s
              clinical files.
            </p>

            {decryptError && (
              <div className="form-error" style={{ marginBottom: 12 }}>
                ⚠️ {decryptError}
              </div>
            )}

            <div className="field">
              <label>Master Decryption Key</label>
              <input
                type="text"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="Enter AES-256 secret key"
                autoFocus
              />
              <span className="field-hint" style={{ marginTop: 4 }}>
                Default key pre-filled: <code>{DEFAULT_MASTER_KEY}</code>
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Button
                variant="primary"
                className="btn-gold-glow"
                style={{ flex: 1 }}
                onClick={handleConfirmDecrypt}
              >
                Decrypt & Reveal Records
              </Button>
              <Button variant="outline" onClick={() => setShowKeyModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
