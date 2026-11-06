import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useBuildcalcFonts } from '@/hooks/use-buildcalc-fonts';
import { useColors } from '@/hooks/use-colors';
import { EstimateProvider } from '@/store/estimate-store';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navigator() {
  const c = useColors();
  return (
    <>
      <StatusBar style={c.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.ground } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="calculator/[module]/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const fontsReady = useBuildcalcFonts();

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      <EstimateProvider>
        <Navigator />
      </EstimateProvider>
    </SafeAreaProvider>
  );
}
