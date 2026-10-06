import { memo } from 'react';
import { useCountdown } from '../../hooks/useCountdown';

function CountdownBadgeBase({ initialSeconds, label }) {
  const { formatted, isCritical } = useCountdown(initialSeconds);

  return (
    <div
      className="stack-8"
      style={{
        padding: '10px 18px',
        borderRadius: 12,
        background: isCritical ? 'var(--omrs-critical-bg)' : 'var(--omrs-warning-bg)',
        textAlign: 'center',
      }}
    >
      <span
        className="field-hint"
        style={{ color: isCritical ? 'var(--omrs-critical-text)' : 'var(--omrs-warning-text)', fontWeight: 600 }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '1.4em',
          fontWeight: 700,
          color: isCritical ? 'var(--omrs-critical-text)' : 'var(--omrs-warning-text)',
        }}
      >
        {formatted}
      </span>
    </div>
  );
}

export const CountdownBadge = memo(CountdownBadgeBase);
