import { Tabs } from 'expo-router/js-tabs';

import BuildcalcTabBar from '@/components/buildcalc-tab-bar';
import { useWindowClass } from '@/hooks/use-window-class';

export default function TabsLayout() {
  const { isExpanded } = useWindowClass();
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarPosition: isExpanded ? 'left' : 'bottom' }}
      tabBar={(props) => <BuildcalcTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="calculators" options={{ title: 'Calculators' }} />
      <Tabs.Screen name="estimate" options={{ title: 'Estimate' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
