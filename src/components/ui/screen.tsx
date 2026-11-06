import type { ReactNode } from 'react';
import { Keyboard, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { SHEET_MAX_WIDTH } from '@/constants/buildcalc-theme';
import { useColors } from '@/hooks/use-colors';
import { useWindowClass } from '@/hooks/use-window-class';

/** Content width cap per window size class. */
export function useSheetWidth(): number {
  const { windowClass } = useWindowClass();
  return windowClass === 'expanded' ? 880 : SHEET_MAX_WIDTH;
}

/** Scrolling screen: ground color, content capped and centered on wide screens. */
export function Screen({
  children,
  header,
  footer,
  edges = ['top', 'left', 'right'],
  bottomPadding = 32,
  contentStyle,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  edges?: Edge[];
  bottomPadding?: number;
  contentStyle?: ViewStyle;
}) {
  const c = useColors();
  const maxWidth = useSheetWidth();
  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: c.ground }]}>
      {header}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
        style={styles.flex}>
        <View style={[styles.sheet, { maxWidth }, contentStyle]}>{children}</View>
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { alignItems: 'center', flexGrow: 1 },
  sheet: { width: '100%', paddingHorizontal: 16, paddingTop: 16, gap: 20 },
});
