import { useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import BuildcalcIcon, { type BuildcalcIconName } from '@/components/buildcalc-icon';
import { Fonts, Radius, type BuildcalcColors } from '@/constants/buildcalc-theme';
import { useColors } from '@/hooks/use-colors';
import { sanitizeNumeric } from '@/utils/numeric-input';

/* ------------------------------------------------------------------ Text */

type Variant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'figure'
  | 'bigFigure';

const VARIANTS: Record<Variant, TextStyle> = {
  display: { fontFamily: Fonts.condensedExtraBold, fontSize: 40, lineHeight: 42, letterSpacing: -0.2 },
  title: { fontFamily: Fonts.condensedBold, fontSize: 28, lineHeight: 32 },
  heading: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 23 },
  bodyStrong: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: Fonts.semiBold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  figure: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  bigFigure: {
    fontFamily: Fonts.condensedExtraBold,
    fontSize: 36,
    lineHeight: 38,
    fontVariant: ['tabular-nums'],
  },
};

type TxtProps = TextProps & {
  v?: Variant;
  tone?: 'ink' | 'muted' | 'faint' | 'onCharcoal' | 'onCharcoalMuted' | 'yellow' | 'error' | 'onYellow';
};

export function Txt({ v = 'body', tone = 'ink', style, ...props }: TxtProps) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const compactDisplay: TextStyle | undefined =
    v === 'display' && width < 360 ? { fontSize: 33, lineHeight: 36 } : undefined;
  const color = {
    ink: c.ink,
    muted: c.inkMuted,
    faint: c.inkFaint,
    onCharcoal: c.onCharcoal,
    onCharcoalMuted: c.onCharcoalMuted,
    yellow: c.yellow,
    error: c.error,
    onYellow: c.onYellow,
  }[tone];
  return (
    <Text
      accessibilityRole={v === 'display' || v === 'title' || v === 'heading' ? 'header' : undefined}
      maxFontSizeMultiplier={v === 'display' || v === 'bigFigure' || v === 'title' ? 1.3 : 1.8}
      {...props}
      style={[VARIANTS[v], compactDisplay, { color }, style]}
    />
  );
}

/* ------------------------------------------------------------------ Card */

export function lift(c: BuildcalcColors & { isDark: boolean }): ViewStyle {
  if (c.isDark) return {};
  return Platform.select<ViewStyle>({
    web: { boxShadow: '0 1px 2px rgba(20,23,26,0.06), 0 4px 12px rgba(20,23,26,0.05)' } as ViewStyle,
    default: {
      shadowColor: c.shadow,
      shadowOpacity: 0.07,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
  })!;
}

export function Card({
  children,
  style,
  tone = 'surface',
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'surface' | 'charcoal' | 'alt';
}) {
  const c = useColors();
  const backgroundColor =
    tone === 'charcoal' ? c.charcoal : tone === 'alt' ? c.surfaceAlt : c.surface;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor, borderColor: tone === 'surface' && c.isDark ? c.line : 'transparent' },
        tone === 'surface' ? lift(c) : undefined,
        style,
      ]}>
      {children}
    </View>
  );
}

/* ---------------------------------------------------------------- Button */

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  style,
  accessibilityHint,
  surface = 'light',
}: {
  label: string;
  onPress: () => void;
  icon?: BuildcalcIconName;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  /** Background the button sits on, so the disabled state stays legible there. */
  surface?: 'light' | 'charcoal';
}) {
  const c = useColors();
  const onCharcoal = surface === 'charcoal';
  const disabledBg = onCharcoal ? c.charcoalWash : c.surfaceAlt;
  const disabledBorder = onCharcoal ? c.charcoalLine : c.line;
  const disabledFg = onCharcoal ? c.onCharcoalMuted : c.inkFaint;
  const palette =
    variant === 'primary'
      ? { bg: c.yellow, fg: c.onYellow, border: 'transparent' }
      : variant === 'danger'
        ? { bg: 'transparent', fg: c.error, border: c.error }
        : { bg: 'transparent', fg: c.ink, border: c.control };
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? disabledBg : palette.bg,
          borderColor: disabled ? disabledBorder : palette.border,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}>
      {icon ? (
        <BuildcalcIcon color={disabled ? disabledFg : palette.fg} name={icon} size={20} />
      ) : null}
      <Text
        style={[
          styles.buttonLabel,
          { color: disabled ? disabledFg : palette.fg },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* --------------------------------------------------------------- Options */

export function Options({
  options,
  value,
  onChange,
  label,
  context,
}: {
  options: readonly { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  context?: string;
}) {
  const c = useColors();
  return (
    <View
      accessibilityLabel={context ? `${context}, ${label}` : label}
      accessibilityRole="radiogroup"
      style={styles.options}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: selected ? c.yellow : pressed ? c.pressed : c.surfaceAlt,
                borderColor: selected ? c.ink : c.line,
              },
            ]}>
            <Text
              style={[
                styles.optionLabel,
                {
                  color: selected ? c.onYellow : c.ink,
                  fontFamily: selected ? Fonts.bold : Fonts.semiBold,
                },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ----------------------------------------------------------------- Field */

export function Field({
  label,
  value,
  onChangeText,
  unit,
  prefix,
  placeholder = '0',
  keyboardType = 'decimal-pad',
  invalid = false,
  hint,
  compact = false,
  context,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  unit?: string;
  prefix?: string;
  placeholder?: string;
  keyboardType?: 'decimal-pad' | 'number-pad' | 'default';
  invalid?: boolean;
  hint?: string;
  compact?: boolean;
  /** Group or material name, spoken before the label so repeated labels stay unique. */
  context?: string;
}) {
  const c = useColors();
  const [focused, setFocused] = useState(false);
  const borderColor = invalid ? c.error : focused ? c.focus : c.control;
  const spokenLabel = context ? `${context}, ${label}` : label;
  const baseHint = hint ?? (unit ? `Enter ${label.toLowerCase()} in ${unit}` : undefined);
  const spokenHint = invalid ? `Invalid value. ${baseHint ?? ''}`.trim() : baseHint;
  const handleChange = (text: string) =>
    onChangeText(keyboardType === 'default' ? text : sanitizeNumeric(text, keyboardType === 'number-pad'));
  return (
    <View style={styles.field}>
      <Text style={[VARIANTS.label, { color: invalid ? c.error : c.inkMuted }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          compact ? styles.inputCompact : undefined,
          {
            backgroundColor: c.field,
            borderColor,
            borderWidth: focused || invalid ? 2 : 1.5,
          },
        ]}>
        {prefix ? (
          <Text style={[styles.affix, { color: c.inkMuted, marginRight: 6 }]}>{prefix}</Text>
        ) : null}
        <TextInput
          accessibilityHint={spokenHint}
          accessibilityLabel={spokenLabel}
          autoCorrect={false}
          keyboardType={keyboardType}
          maxFontSizeMultiplier={1.6}
          returnKeyType="done"
          onBlur={() => setFocused(false)}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={c.inkFaint}
          selectTextOnFocus
          selectionColor={c.yellow}
          style={[styles.input, { color: c.ink }, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : undefined]}
          value={value}
        />
        {unit ? <Text style={[styles.affix, { color: c.inkMuted, marginLeft: 6 }]}>{unit}</Text> : null}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------ Misc bits */

export function IconTile({
  name,
  size = 48,
  tone = 'yellow',
}: {
  name: BuildcalcIconName;
  size?: number;
  tone?: 'yellow' | 'muted' | 'charcoal';
}) {
  const c = useColors();
  const bg = tone === 'yellow' ? c.yellow : tone === 'charcoal' ? c.charcoal : c.surfaceAlt;
  const fg = tone === 'yellow' ? c.onYellow : tone === 'charcoal' ? c.yellow : c.inkFaint;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <BuildcalcIcon color={fg} name={name} size={size * 0.5} />
    </View>
  );
}

export function Tag({ label, tone = 'adjusted' }: { label: string; tone?: 'adjusted' | 'planned' }) {
  const c = useColors();
  const adjusted = tone === 'adjusted';
  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: adjusted ? c.adjustedWash : c.surfaceAlt },
      ]}>
      <Text style={[VARIANTS.label, { color: adjusted ? c.adjusted : c.inkMuted }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({
  title,
  detail,
  right,
}: {
  title: string;
  detail?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.sectionTitle}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt accessibilityRole="header" v="heading">
          {title}
        </Txt>
        {detail ? (
          <Txt tone="muted" v="caption">
            {detail}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Divider({ tone = 'line' }: { tone?: 'line' | 'charcoal' }) {
  const c = useColors();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth * 2,
        backgroundColor: tone === 'charcoal' ? c.charcoalLine : c.line,
      }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
  },
  button: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonLabel: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    lineHeight: 22,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: { fontSize: 15, lineHeight: 20 },
  field: { width: '100%', gap: 6 },
  inputWrap: {
    minHeight: 56,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputCompact: { minHeight: 52 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    fontFamily: Fonts.bold,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    paddingVertical: 6,
  },
  affix: { fontFamily: Fonts.semiBold, fontSize: 16 },
  tag: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  sectionTitle: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
});
