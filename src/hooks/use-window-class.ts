import { useSyncExternalStore } from 'react';
import { useWindowDimensions } from 'react-native';

export type WindowClass = 'compact' | 'medium' | 'expanded';

const subscribe = () => () => undefined;

/**
 * Window size classes, driven by the window (not the device), so iPad Split View,
 * Android multi-window, foldables, and landscape all resolve the same way.
 * Breakpoints follow Material's window size classes: 600 and 840 dp.
 *
 * The first render (including server render and hydration on web) always reports
 * compact, so the markup matches before the real window size is known.
 */
export function useWindowClass() {
  const { width, height } = useWindowDimensions();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const windowClass: WindowClass = !hydrated
    ? 'compact'
    : width >= 840
      ? 'expanded'
      : width >= 600
        ? 'medium'
        : 'compact';
  return {
    width,
    height,
    windowClass,
    isCompact: windowClass === 'compact',
    isExpanded: windowClass === 'expanded',
    isLandscape: width > height,
  };
}
