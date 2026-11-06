import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import BuildcalcIcon from '@/components/buildcalc-icon';
import { Button, Txt } from '@/components/ui/kit';
import { Radius } from '@/constants/buildcalc-theme';
import { useColors } from '@/hooks/use-colors';
import { PLANNING_NOTICE } from '@/utils/estimate-text';

/**
 * Info button that opens the planning-estimate notice. It sits beside the total it
 * qualifies, so the notice is one tap away without taking space on the page.
 */
export default function PlanningNotice({ onCharcoal = false }: { onCharcoal?: boolean }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityHint="Opens the planning estimate notice"
        accessibilityLabel="Planning estimate notice"
        accessibilityRole="button"
        hitSlop={4}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? (onCharcoal ? c.charcoalLine : c.pressed) : 'transparent' },
        ]}>
        <BuildcalcIcon color={onCharcoal ? c.onCharcoalMuted : c.inkMuted} name="info" size={22} />
      </Pressable>
      <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <View style={styles.center}>
          <Pressable
            accessibilityLabel="Close notice"
            onPress={() => setOpen(false)}
            style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}
          />
          <View
            accessibilityViewIsModal
            style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
            <Txt v="title">Planning estimate</Txt>
            <Txt tone="muted">{PLANNING_NOTICE}</Txt>
            <Button label="Got it" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
});
