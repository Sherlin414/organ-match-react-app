import { useEffect, useRef } from 'react';

// Returns a ref to attach to a dropdown/menu container. Calls `onOutsideClick`
// when the user clicks anywhere outside that element — used to close the
// profile menu and the settings language/theme dropdowns.
export function useOutsideClick(onOutsideClick) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onOutsideClick]);

  return ref;
}
