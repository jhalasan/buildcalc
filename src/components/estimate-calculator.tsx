import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ColorSchemeName,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  calculateConcreteEstimate,
  DEFAULT_MIX,
  type ConcreteEstimate,
  type ConcreteMix,
} from '@/utils/concrete-estimate';

const COMPONENTS = ['Footing', 'Beam', 'Column', 'Slab', 'Wall', 'Custom'] as const;
type Component = (typeof COMPONENTS)[number];
type Colors = {
  background: string;
  paper: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  line: string;
  input: string;
  placeholder: string;
  error: string;
};

const PALETTE: Record<'light' | 'dark', Colors> = {
  light: {
    background: '#F4F0E7',
    paper: '#FCFBF8',
    text: '#252923',
    muted: '#65685F',
    accent: '#305E78',
    accentText: '#FFFFFF',
    line: '#D9D5CB',
    input: '#FFFFFF',
    placeholder: '#77796F',
    error: '#A33327',
  },
  dark: {
    background: '#1C211F',
    paper: '#252C29',
    text: '#F4F0E7',
    muted: '#C0C2B9',
    accent: '#83B9D2',
    accentText: '#17252D',
    line: '#48514C',
    input: '#303936',
    placeholder: '#AEB3A9',
    error: '#FFB4A9',
  },
};

function parseNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getEstimate(values: {
  length: number | undefined;
  width: number | undefined;
  height: number | undefined;
  quantity: number | undefined;
  cementRatio: number | undefined;
  sandRatio: number | undefined;
  aggregateRatio: number | undefined;
  cementPrice: number | undefined;
  sandPrice: number | undefined;
  aggregatePrice: number | undefined;
}): ConcreteEstimate | undefined {
  const {
    length,
    width,
    height,
    quantity,
    cementRatio,
    sandRatio,
    aggregateRatio,
    cementPrice,
    sandPrice,
    aggregatePrice,
  } = values;

  if (
    length === undefined ||
    length <= 0 ||
    width === undefined ||
    width <= 0 ||
    height === undefined ||
    height <= 0 ||
    quantity === undefined ||
    quantity <= 0 ||
    !Number.isInteger(quantity) ||
    cementRatio === undefined ||
    cementRatio <= 0 ||
    sandRatio === undefined ||
    sandRatio <= 0 ||
    aggregateRatio === undefined ||
    aggregateRatio <= 0
  ) {
    return undefined;
  }

  return calculateConcreteEstimate({
    length,
    width,
    height,
    quantity,
    mix: { cement: cementRatio, sand: sandRatio, aggregate: aggregateRatio },
    prices: {
      cementPerBag: cementPrice ?? 0,
      sandPerCubicMetre: sandPrice ?? 0,
      aggregatePerCubicMetre: aggregatePrice ?? 0,
    },
  });
}

function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-PH', { maximumFractionDigits }).format(value);
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    currencyDisplay: 'symbol',
  }).format(value);
}

function InputField({
  label,
  value,
  onChangeText,
  colors,
  placeholder,
  keyboardType = 'decimal-pad',
  unit,
  prefix,
  accessibilityHint,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  colors: Colors;
  placeholder?: string;
  keyboardType?: 'decimal-pad' | 'number-pad' | 'default';
  unit?: string;
  prefix?: string;
  accessibilityHint?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.line }]}>
        {prefix ? <Text style={[styles.prefix, { color: colors.muted }]}>{prefix}</Text> : null}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={
            accessibilityHint ?? (unit ? `Enter ${label.toLowerCase()} in ${unit}` : undefined)
          }
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder ?? '0'}
          placeholderTextColor={colors.placeholder}
          selectTextOnFocus
          style={[styles.input, { color: colors.text }]}
          value={value}
        />
        {unit ? <Text style={[styles.unit, { color: colors.muted }]}>{unit}</Text> : null}
      </View>
    </View>
  );
}

function SectionHeading({
  number,
  title,
  colors,
}: {
  number: string;
  title: string;
  colors: Colors;
}) {
  return (
    <View style={[styles.sectionHeading, { borderBottomColor: colors.line }]}>
      <Text style={[styles.sectionNumber, { color: colors.accent }]}>{number}</Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function EstimateSummary({
  estimate,
  pricesValid,
  colors,
  component,
  mix,
}: {
  estimate: ConcreteEstimate | undefined;
  pricesValid: boolean;
  colors: Colors;
  component: Component;
  mix: ConcreteMix;
}) {
  const rows = estimate
    ? [
        { label: 'Cement', quantity: `${estimate.cementBags} ${estimate.cementBags === 1 ? 'bag' : 'bags'}`, cost: estimate.cementCost },
        { label: 'Sand', quantity: `${formatNumber(estimate.sandVolume, 3)} m³`, cost: estimate.sandCost },
        {
          label: 'Aggregate',
          quantity: `${formatNumber(estimate.aggregateVolume, 3)} m³`,
          cost: estimate.aggregateCost,
        },
      ]
    : [];

  return (
    <View style={[styles.summary, { backgroundColor: colors.paper }]}>
      <SectionHeading number="04" title="Material takeoff" colors={colors} />
      {estimate ? (
        <>
          <View style={styles.volumeLine}>
            <Text style={[styles.volumeLabel, { color: colors.muted }]}>
              Concrete volume · {component.toLowerCase()}
            </Text>
            <Text style={[styles.volumeValue, { color: colors.text }]}>
              {formatNumber(estimate.wetVolume, 3)} m³
            </Text>
          </View>
          {rows.map((row) => (
            <View key={row.label} style={[styles.materialRow, { borderTopColor: colors.line }]}>
              <Text style={[styles.materialName, { color: colors.text }]}>{row.label}</Text>
              <Text style={[styles.materialQuantity, { color: colors.muted }]}>{row.quantity}</Text>
              <Text style={[styles.materialCost, { color: colors.text }]}>
                {pricesValid ? formatMoney(row.cost) : '—'}
              </Text>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: colors.text }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Estimated materials total</Text>
            <Text style={[styles.totalValue, { color: colors.accent }]}>
              {pricesValid ? formatMoney(estimate.totalCost) : 'Add prices'}
            </Text>
          </View>
        </>
      ) : (
        <Text style={[styles.emptyHint, { color: colors.muted }]}>
          Enter valid dimensions and a mix ratio to see your material quantities.
        </Text>
      )}
      <Text style={[styles.assumptions, { borderTopColor: colors.line, color: colors.muted }]}>
        Mix {mix.cement}:{mix.sand}:{mix.aggregate} · gross volume · dry-volume factor 1.54 · cement
        bulk density 1,440 kg/m³ · whole 50 kg bags.
        {'\n'}Materials only; excludes labor, reinforcement, and wall openings.
      </Text>
    </View>
  );
}

function getColors(colorScheme: ColorSchemeName | null) {
  return PALETTE[colorScheme === 'dark' ? 'dark' : 'light'];
}

export default function EstimateCalculator() {
  const colors = getColors(useColorScheme());
  const [component, setComponent] = useState<Component>('Footing');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cementRatio, setCementRatio] = useState(String(DEFAULT_MIX.cement));
  const [sandRatio, setSandRatio] = useState(String(DEFAULT_MIX.sand));
  const [aggregateRatio, setAggregateRatio] = useState(String(DEFAULT_MIX.aggregate));
  const [cementPrice, setCementPrice] = useState('');
  const [sandPrice, setSandPrice] = useState('');
  const [aggregatePrice, setAggregatePrice] = useState('');

  const parsed = {
    length: parseNumber(length),
    width: parseNumber(width),
    height: parseNumber(height),
    quantity: parseNumber(quantity),
    cementRatio: parseNumber(cementRatio),
    sandRatio: parseNumber(sandRatio),
    aggregateRatio: parseNumber(aggregateRatio),
    cementPrice: parseNumber(cementPrice),
    sandPrice: parseNumber(sandPrice),
    aggregatePrice: parseNumber(aggregatePrice),
  };

  const dimensionsValid =
    parsed.length !== undefined &&
    parsed.length > 0 &&
    parsed.width !== undefined &&
    parsed.width > 0 &&
    parsed.height !== undefined &&
    parsed.height > 0 &&
    parsed.quantity !== undefined &&
    parsed.quantity > 0 &&
    Number.isInteger(parsed.quantity);
  const mixValid =
    parsed.cementRatio !== undefined &&
    parsed.cementRatio > 0 &&
    parsed.sandRatio !== undefined &&
    parsed.sandRatio > 0 &&
    parsed.aggregateRatio !== undefined &&
    parsed.aggregateRatio > 0;
  const pricesValid =
    parsed.cementPrice !== undefined &&
    parsed.cementPrice >= 0 &&
    parsed.sandPrice !== undefined &&
    parsed.sandPrice >= 0 &&
    parsed.aggregatePrice !== undefined &&
    parsed.aggregatePrice >= 0;

  const estimate = getEstimate(parsed);
  const currentMix: ConcreteMix = {
    cement: parsed.cementRatio ?? 0,
    sand: parsed.sandRatio ?? 0,
    aggregate: parsed.aggregateRatio ?? 0,
  };

  const heightLabel = component === 'Slab' ? 'Thickness' : 'Height';
  const componentHint = component === 'Slab' ? 'Slab thickness in metres' : `${heightLabel} in metres`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sheet}>
          <View style={[styles.masthead, { borderBottomColor: colors.line }]}>
            <Text style={[styles.brand, { color: colors.text }]}>Buildcalc</Text>
            <Text style={[styles.tagline, { color: colors.muted }]}>CONCRETE MATERIAL ESTIMATE</Text>
          </View>

          <Text style={[styles.intro, { color: colors.muted }]}>
            Measure a component. Get a clear material takeoff.
          </Text>

          <View style={styles.section}>
            <SectionHeading number="01" title="Choose a component" colors={colors} />
            <View style={styles.componentList}>
              {COMPONENTS.map((item) => {
                const selected = component === item;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    key={item}
                    onPress={() => setComponent(item)}
                    style={[
                      styles.componentOption,
                      {
                        backgroundColor: selected ? colors.accent : colors.paper,
                        borderColor: selected ? colors.accent : colors.line,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.componentText,
                        { color: selected ? colors.accentText : colors.text },
                      ]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeading number="02" title="Dimensions & mix" colors={colors} />
            <Text style={[styles.instruction, { color: colors.muted }]}>
              Enter dimensions in metres. {componentHint}.
            </Text>
            <View style={styles.fieldGrid}>
              <InputField label="Length" value={length} onChangeText={setLength} colors={colors} unit="m" />
              <InputField label="Width" value={width} onChangeText={setWidth} colors={colors} unit="m" />
              <InputField
                label={heightLabel}
                value={height}
                onChangeText={setHeight}
                colors={colors}
                unit="m"
              />
              <InputField
                label="Number of components"
                value={quantity}
                onChangeText={setQuantity}
                colors={colors}
                keyboardType="number-pad"
                accessibilityHint="Enter a whole number greater than zero"
              />
            </View>
            {(length !== '' || width !== '' || height !== '') && !dimensionsValid ? (
              <Text accessibilityRole="alert" style={[styles.validation, { color: colors.error }]}>
                Dimensions must be greater than zero, and quantity must be a whole number.
              </Text>
            ) : null}

            <Text style={[styles.subheading, { color: colors.text }]}>Concrete mix ratio · parts</Text>
            <View style={styles.fieldGrid}>
              <InputField
                label="Cement"
                value={cementRatio}
                onChangeText={setCementRatio}
                colors={colors}
                keyboardType="decimal-pad"
              />
              <InputField
                label="Sand"
                value={sandRatio}
                onChangeText={setSandRatio}
                colors={colors}
                keyboardType="decimal-pad"
              />
              <InputField
                label="Aggregate"
                value={aggregateRatio}
                onChangeText={setAggregateRatio}
                colors={colors}
                keyboardType="decimal-pad"
              />
            </View>
            {!mixValid ? (
              <Text accessibilityRole="alert" style={[styles.validation, { color: colors.error }]}>
                Each mix ratio part must be greater than zero.
              </Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <SectionHeading number="03" title="Material prices" colors={colors} />
            <Text style={[styles.instruction, { color: colors.muted }]}>
              Enter prices in Philippine pesos (₱).
            </Text>
            <View style={styles.priceFields}>
              <InputField
                label="Cement · per 50 kg bag"
                value={cementPrice}
                onChangeText={setCementPrice}
                colors={colors}
                prefix="₱"
                accessibilityHint="Enter the cement price in Philippine pesos per 50 kg bag"
              />
              <InputField
                label="Sand · per m³"
                value={sandPrice}
                onChangeText={setSandPrice}
                colors={colors}
                prefix="₱"
                accessibilityHint="Enter the sand price in Philippine pesos per cubic metre"
              />
              <InputField
                label="Aggregate · per m³"
                value={aggregatePrice}
                onChangeText={setAggregatePrice}
                colors={colors}
                prefix="₱"
                accessibilityHint="Enter the aggregate price in Philippine pesos per cubic metre"
              />
            </View>
            {(cementPrice !== '' || sandPrice !== '' || aggregatePrice !== '') && !pricesValid ? (
              <Text accessibilityRole="alert" style={[styles.validation, { color: colors.error }]}>
                Enter a price of zero or more for each material.
              </Text>
            ) : null}
          </View>

          <EstimateSummary
            estimate={estimate}
            pricesValid={pricesValid}
            colors={colors}
            component={component}
            mix={currentMix}
          />
          <Text style={[styles.footer, { color: colors.muted }]}>
            Planning estimate only. Confirm quantities and mix design with your construction
            professional before ordering.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 36,
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 680,
  },
  masthead: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  brand: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  intro: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginTop: 18,
  },
  sectionHeading: {
    minHeight: 38,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionNumber: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
  },
  componentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  componentOption: {
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
  },
  componentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  field: {
    width: '48%',
    flexGrow: 1,
    minWidth: 138,
    gap: 5,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  inputWrap: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 11,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    paddingVertical: 8,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 13,
    marginLeft: 6,
  },
  prefix: {
    fontSize: 15,
    marginRight: 6,
  },
  validation: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 9,
  },
  priceFields: {
    gap: 12,
  },
  summary: {
    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  volumeLine: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  volumeLabel: {
    flexShrink: 1,
    fontSize: 13,
  },
  volumeValue: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  materialRow: {
    minHeight: 44,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  materialName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  materialQuantity: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  materialCost: {
    minWidth: 84,
    textAlign: 'right',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  totalRow: {
    minHeight: 54,
    borderTopWidth: 1,
    marginTop: 3,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  emptyHint: {
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 21,
  },
  assumptions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    paddingTop: 10,
    fontSize: 11,
    lineHeight: 17,
  },
  footer: {
    marginTop: 16,
    fontSize: 11,
    lineHeight: 17,
  },
});
