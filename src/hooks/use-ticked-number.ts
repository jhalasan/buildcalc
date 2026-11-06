import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

const DURATION = 380;

/**
 * Eases a displayed number toward its target so a changing total reads as a tick,
 * not a jump. Skips the motion when the system asks to reduce it, and for the
 * first value, so screens open settled.
 */
export function useTickedNumber(target: number | undefined): number | undefined {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  const reduceMotion = useRef(false);

  useEffect(() => {
    // A screen reader would read every intermediate value, so it gets the final one only.
    Promise.all([
      AccessibilityInfo.isReduceMotionEnabled(),
      AccessibilityInfo.isScreenReaderEnabled(),
    ]).then(([reduce, reader]) => {
      reduceMotion.current = reduce || reader;
    });
  }, []);

  useEffect(() => {
    const from = shownRef.current;
    if (target === undefined || from === undefined || reduceMotion.current || from === target) {
      shownRef.current = target;
      const frame = requestAnimationFrame(() => setShown(target));
      return () => cancelAnimationFrame(frame);
    }
    const start = Date.now();
    let frame = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = t === 1 ? target : from + (target - from) * eased;
      shownRef.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}
