import { useState, useEffect, useRef, useCallback } from 'react';

// Counts down from `initialSeconds`, updating once per second.
// Used for the organ-viability countdown and the ambulance ETA countdown.
//
// useRef holds the interval ID across renders without causing re-renders itself
// (a plain variable would be wiped out on every re-render; state would cause
// an extra re-render just to store the ID).
export function useCountdown(initialSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback((newSeconds) => {
    setSecondsLeft(newSeconds ?? initialSeconds);
  }, [initialSeconds]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const formatted = `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;

  return { secondsLeft, formatted, reset, isCritical: secondsLeft < 600 };
}
