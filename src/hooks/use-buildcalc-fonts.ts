import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import {
  Barlow_400Regular,
  Barlow_600SemiBold,
  Barlow_700Bold,
  Barlow_800ExtraBold,
} from '@expo-google-fonts/barlow';
import {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
} from '@expo-google-fonts/barlow-condensed';

import { Fonts } from '@/constants/buildcalc-theme';

export function useBuildcalcFonts() {
  const [loaded, error] = useFonts({
    [Fonts.regular]: Barlow_400Regular,
    [Fonts.semiBold]: Barlow_600SemiBold,
    [Fonts.bold]: Barlow_700Bold,
    [Fonts.extraBold]: Barlow_800ExtraBold,
    [Fonts.condensedBold]: BarlowCondensed_700Bold,
    [Fonts.condensedExtraBold]: BarlowCondensed_800ExtraBold,
  });

  useEffect(() => {
    if (error) console.error('Unable to load Buildcalc fonts.', error);
  }, [error]);

  return loaded || error != null;
}
