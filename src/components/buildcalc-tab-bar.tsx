import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BuildcalcIcon, { type BuildcalcIconName } from '@/components/buildcalc-icon';
import { Fonts, SHEET_MAX_WIDTH } from '@/constants/buildcalc-theme';
import { useColors } from '@/hooks/use-colors';
import { useWindowClass } from '@/hooks/use-window-class';
import { useEstimateStore } from '@/store/estimate-store';

const TABS: Record<string, { label: string; icon: BuildcalcIconName }> = {
  index: { label: 'Home', icon: 'home' },
  calculators: { label: 'Calculators', icon: 'calculators' },
  estimate: { label: 'Estimate', icon: 'estimate' },
  settings: { label: 'Settings', icon: 'settings' },
};

/** Bottom navigation bar on compact and medium windows; a left rail when expanded. */
export default function BuildcalcTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { isExpanded } = useWindowClass();
  const { takeoffs } = useEstimateStore();

  return (
    <View
      style={[
        isExpanded ? styles.rail : styles.bar,
        isExpanded
          ? {
              backgroundColor: c.surface,
              borderRightColor: c.line,
              paddingTop: Math.max(insets.top, 16),
              paddingLeft: Math.max(insets.left, 8),
              paddingBottom: Math.max(insets.bottom, 16),
            }
          : {
              backgroundColor: c.surface,
              borderTopColor: c.line,
              paddingBottom: Math.max(insets.bottom, 8),
              paddingLeft: insets.left,
              paddingRight: insets.right,
            },
      ]}>
      <View accessibilityRole="tablist" style={isExpanded ? styles.railList : styles.row}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const badge = route.name === 'estimate' && takeoffs.length > 0 ? takeoffs.length : 0;
          return (
            <Pressable
              accessibilityLabel={
                badge ? `${tab.label}, ${badge} ${badge === 1 ? 'takeoff' : 'takeoffs'}` : tab.label
              }
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              key={route.key}
              onPress={() => navigateToTab(route.key)}
              style={isExpanded ? styles.railTab : styles.tab}>
              <View style={[styles.pill, { backgroundColor: focused ? c.yellow : 'transparent' }]}>
                <BuildcalcIcon color={focused ? c.onYellow : c.inkMuted} name={tab.icon} />
                {badge ? (
                  <View style={[styles.badge, { backgroundColor: c.charcoal, borderColor: c.surface }]}>
                    <Text style={[styles.badgeText, { color: c.yellow }]}>{badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                maxFontSizeMultiplier={1.3}
                style={[
                  styles.label,
                  {
                    color: focused ? c.ink : c.inkMuted,
                    fontFamily: focused ? Fonts.bold : Fonts.semiBold,
                  },
                ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  row: { flexDirection: 'row', width: '100%', maxWidth: SHEET_MAX_WIDTH, paddingHorizontal: 8, paddingTop: 8 },
  tab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 3 },
  rail: { width: 104, borderRightWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  railList: { gap: 12, alignItems: 'center' },
  railTab: { width: 88, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 3 },
  pill: {
    width: 64,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 13, lineHeight: 16, textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: 4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontFamily: Fonts.bold, fontSize: 12, lineHeight: 15 },
});
