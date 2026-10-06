import { useState, useCallback } from 'react';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const containerRef = useOutsideClick(close);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div onClick={toggle}>{trigger}</div>
      {open && <div onClick={close}>{children}</div>}
    </div>
  );
}
