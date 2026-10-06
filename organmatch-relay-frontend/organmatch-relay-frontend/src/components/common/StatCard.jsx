import { memo } from 'react';
import { Card } from './Card';

function StatCardBase({ label, value }) {
  return (
    <Card className="stat-card-v2" style={{ padding: '22px 24px' }}>
      <div className="stat-card-glow" />
      <div className="stack-8" style={{ gap: 6 }}>
        <span className="stat-label-v2">
          {label}
        </span>
        <span className="stat-value-v2" style={{ marginTop: 2 }}>{value}</span>
      </div>
      <div className="stat-trend-bar">
        <span className="stat-trend-fill" style={{ width: '85%' }} />
      </div>
    </Card>
  );
}

export const StatCard = memo(StatCardBase);
