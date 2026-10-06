import { memo } from 'react';

const DOT_COLOR = {
  critical: 'var(--omrs-critical-text)',
  success: 'var(--omrs-success-text)',
  info: 'var(--omrs-info-text)',
  neutral: 'var(--omrs-text-secondary)',
};

function NotificationItemBase({ notification, isLast }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--omrs-border)',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          marginTop: 6,
          flexShrink: 0,
          background: DOT_COLOR[notification.type] || DOT_COLOR.neutral,
        }}
      />
      <div className="stack-8" style={{ gap: 3 }}>
        <span style={{ fontWeight: 600, fontSize: '0.9em' }}>{notification.title}</span>
        <span className="text-secondary" style={{ fontSize: '0.85em' }}>{notification.subtitle}</span>
        <span className="text-secondary" style={{ fontSize: '0.78em' }}>{notification.time}</span>
      </div>
    </div>
  );
}

export const NotificationItem = memo(NotificationItemBase);
