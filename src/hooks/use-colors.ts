import { useMemo } from 'react';

import { BuildcalcTheme, type BuildcalcColors } from '@/constants/buildcalc-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useColors(): BuildcalcColors & { isDark: boolean } {
  const isDark = useColorScheme() === 'dark';
  return useMemo(() => ({ ...BuildcalcTheme[isDark ? 'dark' : 'light'], isDark }), [isDark]);
}
