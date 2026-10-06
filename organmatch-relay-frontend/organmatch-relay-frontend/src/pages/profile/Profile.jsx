import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { isFieldEditable, getReadonlyReason } from '../../utils/permissions';
import { handleProfileSave } from '../../controllers/authController';
import { ROLE_DASHBOARD_PATH, ROLE_LABELS } from '../../utils/roleConfig';

function humanizeFieldName(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export default function Profile() {
  const { currentUser, updateProfile, isLoading } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState(() => ({ ...currentUser, password: '' }));
  const [saved, setSaved] = useState(false);

  // Every field on the user record except internal bookkeeping ones.
  const allFields = useMemo(
    () => Object.keys(currentUser).filter((k) => !['id', 'role', 'password'].includes(k)),
    [currentUser]
  );

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await handleProfileSave({
        allFields,
        role: currentUser.role,
        formData,
        updateProfile,
        isFieldEditable,
        setSaved,
      });
    },
    [allFields, currentUser.role, formData, updateProfile]
  );

  return (
    <DashboardLayout links={[{ to: ROLE_DASHBOARD_PATH[currentUser.role], label: t('dashboard') }]}>
      <h1 style={{ fontSize: '1.5em', fontWeight: 700, marginBottom: 6 }}>{t('myProfile')}</h1>
      <p className="text-secondary" style={{ fontSize: '0.88em', marginBottom: 24 }}>
        Logged in as <strong>{ROLE_LABELS[currentUser.role]}</strong> · {t('editableFieldsNote')}
      </p>

      <Card className="card-glass-gold" style={{ maxWidth: 640 }}>
        {saved && <div className="form-success">{t('saved')}</div>}

        <form onSubmit={handleSubmit}>
          {allFields.map((field) => {
            const editable = isFieldEditable(currentUser.role, field);
            return (
              <div className="field" key={field}>
                <label>{humanizeFieldName(field)}</label>
                {editable ? (
                  <input
                    value={formData[field] ?? ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                  />
                ) : (
                  <>
                    <div className="field-readonly">{String(formData[field] ?? '—')}</div>
                    <span className="field-hint">{getReadonlyReason(field)}</span>
                  </>
                )}
              </div>
            );
          })}

          {isFieldEditable(currentUser.role, 'password') && (
            <div className="field">
              <label>New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}

          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving…' : t('save')}</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}
