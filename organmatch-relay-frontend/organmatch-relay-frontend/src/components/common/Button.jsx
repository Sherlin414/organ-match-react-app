import { memo } from 'react';

// Wrapped in memo: this renders in lists (e.g. table action buttons) and
// shouldn't re-render unless its own props actually change.
function ButtonBase({ children, variant = 'primary', onClick, type = 'button', disabled = false, block = false, style }) {
  const variantClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger: 'btn-danger-outline',
  }[variant];

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${block ? 'btn-block' : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

export const Button = memo(ButtonBase);
