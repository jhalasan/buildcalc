import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Speaks a changing status line to VoiceOver after the user pauses typing.
 * Android announces through `accessibilityLiveRegion` on the element itself,
 * which iOS ignores, so this covers iOS only.
 */
export function useAnnounce(message: string | undefined, delay = 900) {
  const previous = useRef<string | undefined>(message);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !message || message === previous.current) {
      previous.current = message;
      return;
    }
    const timer = setTimeout(() => {
      previous.current = message;
      AccessibilityInfo.announceForAccessibility(message);
    }, delay);
    return () => clearTimeout(timer);
  }, [message, delay]);
}
