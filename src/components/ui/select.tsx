import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BuildcalcIcon from '@/components/buildcalc-icon';
import { Options, Txt } from '@/components/ui/kit';
import { Fonts, Radius, SHEET_MAX_WIDTH } from '@/constants/buildcalc-theme';
import { useColors } from '@/hooks/use-colors';
import { useWindowClass } from '@/hooks/use-window-class';

export type SelectOption = { label: string; value: string };

/** Dropdown: a field-like trigger that opens a bottom sheet of options. */
export function Select({
  label,
  value,
  options,
  onChange,
  title,
  context,
}: {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  title?: string;
  context?: string;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { isExpanded } = useWindowClass();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.wrap}>
      <Txt tone="muted" v="label">
        {label}
      </Txt>
      <Pressable
        accessibilityHint="Opens a list of options"
        accessibilityLabel={`${context ? `${context}, ` : ''}${label}, ${selected?.label ?? 'none selected'}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: pressed ? c.pressed : c.field,
            borderColor: open ? c.focus : c.control,
            borderWidth: open ? 2 : 1.5,
          },
        ]}>
        <Text
          maxFontSizeMultiplier={1.6}
          numberOfLines={1}
          style={[styles.value, { color: selected ? c.ink : c.inkFaint }]}>
          {selected?.label ?? 'Select'}
        </Text>
        <BuildcalcIcon color={c.inkMuted} name="chevron-down" size={22} />
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
        transparent
        visible={open}>
        <View style={[styles.root, isExpanded ? { justifyContent: 'center' } : undefined]}>
          <Pressable
            accessibilityLabel="Close list"
            onPress={() => setOpen(false)}
            style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                backgroundColor: c.surface,
                maxHeight: height * 0.72,
                ...(isExpanded ? { maxWidth: 520, borderRadius: 24 } : undefined),
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}>
            <View style={[styles.grabber, { backgroundColor: c.line }]} />
            <View style={styles.head}>
              <Txt accessibilityRole="header" style={{ flex: 1 }} v="heading">
                {title ?? label}
              </Txt>
              <Pressable
                accessibilityLabel="Close"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setOpen(false)}
                style={styles.close}>
                <Txt v="bodyStrong">Done</Txt>
              </Pressable>
            </View>
            <ScrollView
              accessibilityRole="radiogroup"
              contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.row,
                      {
                        backgroundColor: isSelected
                          ? c.adjustedWash
                          : pressed
                            ? c.pressed
                            : 'transparent',
                      },
                    ]}>
                    <Txt
                      style={{ flex: 1, fontFamily: isSelected ? Fonts.bold : Fonts.semiBold }}
                      v="body">
                      {option.label}
                    </Txt>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: isSelected ? c.ink : c.control,
                          backgroundColor: isSelected ? c.yellow : 'transparent',
                        },
                      ]}>
                      {isSelected ? (
                        <BuildcalcIcon color={c.onYellow} name="check" size={16} strokeWidth={2.6} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** Chips for a few short options; a dropdown for longer lists. */
export function Choices({
  label,
  options,
  value,
  onChange,
  context,
}: {
  label: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  context?: string;
}) {
  const useChips = options.length <= 3 && options.every((option) => option.label.length <= 16);
  if (!useChips) return (
      <Select context={context} label={label} onChange={onChange} options={options} value={value} />
    );
  return (
    <View style={{ gap: 8 }}>
      <Txt tone="muted" v="label">
        {label}
      </Txt>
      <Options context={context} label={label} onChange={onChange} options={options} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, width: '100%' },
  trigger: {
    minHeight: 56,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: { flex: 1, fontFamily: Fonts.bold, fontSize: 17 },
  root: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: SHEET_MAX_WIDTH,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginTop: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  close: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  row: {
    minHeight: 56,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
