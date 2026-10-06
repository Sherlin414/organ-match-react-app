import { memo } from 'react';

const STATUS_VARIANT = {
  Matched: 'badge-success',
  Confirmed: 'badge-success',
  Delivered: 'badge-success',
  Waiting: 'badge-warning',
  Proposed: 'badge-warning',
  Critical: 'badge-critical',
  Rejected: 'badge-critical',
  Info: 'badge-info',
};

function StatusChipBase({ status }) {
  const variant = STATUS_VARIANT[status] || 'badge-info';
  return <span className={`badge ${variant}`}>{status.toUpperCase()}</span>;
}

export const StatusChip = memo(StatusChipBase);
