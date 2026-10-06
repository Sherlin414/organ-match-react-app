import { memo } from 'react';

function CardBase({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export const Card = memo(CardBase);
