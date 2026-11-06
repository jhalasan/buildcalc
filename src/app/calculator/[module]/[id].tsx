import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import BuildcalcIcon from '@/components/buildcalc-icon';
import FieldList from '@/components/field-list';
import { Button, Card, Field, Tag, Txt } from '@/components/ui/kit';
import { Screen } from '@/components/ui/screen';
import { Fonts, Radius, SHEET_MAX_WIDTH } from '@/constants/buildcalc-theme';
import {
  findCalculator,
  getInitialValues,
  isModule,
  MODULES,
  type CalculatorDefinition,
} from '@/constants/calculators';
import { useAnnounce } from '@/hooks/use-announce';
import { useColors } from '@/hooks/use-colors';
import { useWindowClass } from '@/hooks/use-window-class';
import { useEstimateStore } from '@/store/estimate-store';
import {
  calculateConstructionTakeoff,
  type EstimateModule,
  type EstimateValues,
} from '@/utils/construction-estimate';
import {
  buildLines,
  formatMoney,
  formatNumber,
  formatQuantity,
  parseNumber,
  priceFieldLabel,
  type EstimateLine,
} from '@/utils/estimate-lines';

export default function CalculatorRoute() {
  const params = useLocalSearchParams<{ module?: string; id?: string; takeoff?: string }>();
  if (!isModule(params.module)) return <Redirect href="/calculators" />;
  const calculator = findCalculator(params.module, params.id);
  if (!calculator) return <Redirect href="/calculators" />;
  return (
    <CalculatorScreen
      calculator={calculator}
      module={params.module}
      takeoffId={params.takeoff}
    />
  );
}

function CalculatorScreen({
  module,
  calculator,
  takeoffId,
}: {
  module: EstimateModule;
  calculator: CalculatorDefinition;
  takeoffId?: string;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { isExpanded, height } = useWindowClass();
  const isShort = height < 480;
  const { prices, takeoffs, setPrice, saveTakeoff } = useEstimateStore();
  const saved = takeoffs.find((item) => item.id === takeoffId);

  const [values, setValues] = useState<EstimateValues>(
    () => saved?.values ?? getInitialValues(calculator.fields)
  );
  const [overrides, setOverrides] = useState<EstimateValues>(() => saved?.overrides ?? {});
  const [wastage, setWastage] = useState<EstimateValues>(() => saved?.wastage ?? {});
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const exclusionText =
    'Material costs only. Labor, equipment, overhead, and other construction expenses are excluded.';
  // Reuse one id so a double tap on Add never creates two takeoffs.
  const savedIdRef = useRef<string | undefined>(saved?.id);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () =>
      setKeyboardOpen(true)
    );
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      setKeyboardOpen(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const numberFields = calculator.fields.filter((field) => field.choices === undefined);
  const takeoff = useMemo(
    () => calculateConstructionTakeoff(module, calculator.id, values),
    [module, calculator.id, values]
  );
  const summary = useMemo(
    () => (takeoff ? buildLines(takeoff, prices, { overrides, wastage }) : undefined),
    [takeoff, prices, overrides, wastage]
  );
  const hasEditedMeasurements = numberFields.some(
    (field) => (values[field.key] ?? '') !== (field.initialValue ?? '')
  );

  const blocked = summary === undefined || summary.hasInvalidInput || summary.hasCostOverflow;

  let totalText: string;
  let totalReady = false;
  if (!summary) totalText = 'Enter measurements';
  else if (summary.hasInvalidInput) totalText = 'Fix fields above';
  else if (summary.hasCostOverflow) totalText = 'Too large to calculate';
  else if (summary.total === undefined) {
    totalText = `Enter ${summary.missingPriceCount} unit ${summary.missingPriceCount === 1 ? 'price' : 'prices'}`;
  } else {
    totalText = formatMoney(summary.total);
    totalReady = true;
  }

  const measurementError =
    hasEditedMeasurements && !takeoff
      ? 'Check that every measurement is filled in and positive, counts are whole numbers, and wall openings do not exceed wall area.'
      : undefined;
  useAnnounce(measurementError ?? (totalReady ? `Total Estimated Material Cost ${totalText}` : totalText));

  // Live quantities in the pinned bar, so a dimension change is visible without scrolling.
  const quantityPreview = summary
    ? summary.lines
        .filter((line) => line.quantity !== undefined)
        .map((line) => `${formatQuantity(line.quantity as number, line.unit)} ${line.label}`)
        .join(' · ')
    : undefined;

  function addToEstimate() {
    savedIdRef.current = saveTakeoff({
      id: savedIdRef.current,
      module,
      calculatorId: calculator.id,
      values,
      overrides,
      wastage,
    });
    router.navigate('/estimate');
  }

  const footerNode = (
          <View
            style={[
              styles.footer,
              { backgroundColor: c.charcoal, paddingBottom: Math.max(insets.bottom, 12) },
            ]}>
            <View style={[styles.footerInner, { maxWidth: isExpanded ? 1200 : SHEET_MAX_WIDTH }]}>
              <View style={styles.totalRow}>
                <View style={{ flexGrow: 1, flexBasis: 170 }}>
                  <Txt tone="onCharcoalMuted" v="label">
                    Total Estimated Material Cost
                  </Txt>
                  <Txt
                    accessibilityLiveRegion="polite"
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={totalReady ? styles.totalValue : styles.totalHint}
                    tone={totalReady ? 'yellow' : 'onCharcoal'}
                    v={totalReady ? 'bigFigure' : 'bodyStrong'}>
                    {totalText}
                  </Txt>
                  {quantityPreview ? (
                    <Txt maxFontSizeMultiplier={1.3} numberOfLines={1} tone="onCharcoalMuted" v="caption">
                      {quantityPreview}
                    </Txt>
                  ) : null}
                  {isShort ? (
                    <Txt maxFontSizeMultiplier={1.3} tone="onCharcoalMuted" v="caption">
                      {exclusionText}
                    </Txt>
                  ) : null}
                </View>
                {keyboardOpen ? null : (
                <Button
                  accessibilityHint="Saves this takeoff to the current estimate for this session"
                  disabled={blocked}
                  surface="charcoal"
                  icon={saved ? 'check' : 'plus'}
                  label={saved ? 'Update' : 'Add to estimate'}
                  onPress={addToEstimate}
                  style={{ flexGrow: isShort ? 0 : 1, minWidth: isShort ? 200 : 150, minHeight: isShort ? 48 : 52 }}
                />
                )}
              </View>
              {isShort ? null : (
                <Txt maxFontSizeMultiplier={1.3} tone="onCharcoalMuted" v="caption">
                  {exclusionText}
                </Txt>
              )}
            </View>
          </View>
  );
  const headerNode = (
          <View style={[styles.header, { borderBottomColor: c.line, backgroundColor: c.ground }]}>
            <View style={[styles.headerInner, { maxWidth: isExpanded ? 1200 : SHEET_MAX_WIDTH }]}>
              <Pressable
                accessibilityLabel="Back"
                accessibilityRole="button"
                hitSlop={4}
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/calculators'))}
                style={({ pressed }) => [
                  styles.back,
                  { backgroundColor: pressed ? c.pressed : c.surface, borderColor: c.line },
                ]}>
                <BuildcalcIcon color={c.ink} name="back" size={22} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Txt adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} v="title">
                  {calculator.label}
                </Txt>
                <Txt numberOfLines={1} tone="muted" v="caption">
                  {MODULES[module].title}
                  {saved ? ' · Editing takeoff' : ''}
                </Txt>
              </View>
            </View>
          </View>
  );
  const inputsNode = (
    <>
        <Txt tone="muted">
          {calculator.description} Dimensions are in metres unless a field shows another unit.
        </Txt>

        <Card style={{ gap: 16 }}>
          <Txt v="heading">Measurements</Txt>
          <FieldList
            fields={calculator.fields}
            onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
            values={values}
          />
          {measurementError ? (
            <Txt accessibilityRole="alert" tone="error" v="caption">
              {measurementError}
            </Txt>
          ) : null}
        </Card>

    </>
  );
  const resultsNode = (
    <>
        {takeoff && summary ? (
          <>
            <Card style={styles.measure} tone="charcoal">
              <Txt style={{ flex: 1 }} tone="onCharcoalMuted" v="label">
                {takeoff.measure.label}
              </Txt>
              <Txt tone="yellow" v="bigFigure">
                {formatNumber(takeoff.measure.value)}
              </Txt>
              <Txt tone="onCharcoal" v="bodyStrong">
                {takeoff.measure.unit}
              </Txt>
            </Card>

            <View style={{ gap: 12 }}>
              <Txt v="title">Materials</Txt>
              {summary.lines.map((line) => (
                <MaterialCard
                  key={line.id}
                  line={line}
                  onOverride={(value) => setOverrides((current) => ({ ...current, [line.id]: value }))}
                  onPrice={(value) => setPrice(line.id, value)}
                  onWastage={(value) => setWastage((current) => ({ ...current, [line.id]: value }))}
                />
              ))}
              {takeoff.warnings?.map((warning) => (
                <Card key={warning} style={styles.caution} tone="alt">
                  <BuildcalcIcon color={c.adjusted} name="info" size={20} />
                  <Txt style={{ flex: 1 }} v="caption">
                    {warning}
                  </Txt>
                </Card>
              ))}
              {summary.hasCostOverflow ? (
                <Txt accessibilityRole="alert" tone="error" v="caption">
                  The cost is too large to calculate. Reduce a quantity or unit price.
                </Txt>
              ) : null}
            </View>

            <Card tone="alt">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: showAssumptions }}
                onPress={() => setShowAssumptions((open) => !open)}
                style={styles.assumptionsHead}>
                <Txt style={{ flex: 1 }} v="bodyStrong">
                  Assumptions and rounding
                </Txt>
                <BuildcalcIcon
                  color={c.inkMuted}
                  name={showAssumptions ? 'chevron-up' : 'chevron-down'}
                  size={20}
                />
              </Pressable>
              {showAssumptions ? (
                <View style={{ gap: 10, marginTop: 10 }}>
                  {takeoff.assumptions.map((assumption) => (
                    <Txt key={assumption} tone="muted" v="caption">
                      {assumption}
                    </Txt>
                  ))}
                  <Txt tone="muted" v="caption">
                    Optional wastage is applied to calculated quantities; zero is the default. Bag and
                    piece purchases round up to whole units. Bulk quantities retain decimals. An entered
                    quantity override is the final quantity used for costing.
                  </Txt>
                </View>
              ) : null}
            </Card>
          </>
        ) : (
          <Card style={{ gap: 6 }} tone="alt">
            <Txt v="bodyStrong">Material takeoff</Txt>
            <Txt tone="muted">Complete the measurements above to see estimated quantities and costs.</Txt>
          </Card>
        )}

        <Txt tone="faint" v="caption">
          Workbook-based planning estimates, not engineering approval. Verify material quantities,
          mixes, and specifications with a qualified construction professional before ordering or
          building.
        </Txt>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: c.ground }}>
      {isExpanded ? (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.split}>
          {headerNode}
          <View style={styles.panes}>
            <ScrollView
              contentContainerStyle={styles.pane}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.paneLeft}>
              {inputsNode}
            </ScrollView>
            <ScrollView
              contentContainerStyle={styles.pane}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.paneRight}>
              {resultsNode}
            </ScrollView>
          </View>
          {footerNode}
        </SafeAreaView>
      ) : (
        <Screen bottomPadding={24} footer={footerNode} header={headerNode}>
          {inputsNode}
          {resultsNode}
        </Screen>
      )}
    </KeyboardAvoidingView>
  );
}

function MaterialCard({
  line,
  onPrice,
  onOverride,
  onWastage,
}: {
  line: EstimateLine;
  onPrice: (value: string) => void;
  onOverride: (value: string) => void;
  onWastage: (value: string) => void;
}) {
  const c = useColors();
  const wholeUnits = line.unit === 'bags' || line.unit === 'pcs' || line.unit === 'gal';
  const costText =
    line.cost === undefined || !Number.isFinite(line.cost) ? '—' : formatMoney(line.cost);

  return (
    <Card style={{ gap: 14 }}>
      <View style={styles.materialHead}>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.nameRow}>
            <Txt v="heading">{line.label}</Txt>
            {line.isAdjusted ? <Tag label="adjusted" /> : null}
          </View>
          <Txt tone="muted" v="caption">
            Calculated · {formatQuantity(line.calculatedQuantity, line.unit)}
          </Txt>
        </View>
        <View style={{ alignItems: 'flex-end', flexShrink: 1, maxWidth: '55%' }}>
          <Txt adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} v="bigFigure" style={{ fontSize: 30, lineHeight: 32 }}>
            {line.quantity === undefined ? '—' : formatQuantity(line.quantity, line.unit)}
          </Txt>
          <Txt tone="muted" v="caption">
            {line.isAdjusted
              ? 'Manual quantity'
              : !line.wastageAllowed
                ? 'Includes breakage'
                : (parseNumber(line.wastageRaw) ?? 0) > 0
                  ? `+${line.wastageRaw}% wastage`
                  : 'No wastage added'}
          </Txt>
        </View>
      </View>

      <Field
        context={line.label}
        hint={`Enter the price in Philippine pesos ${line.unitPriceLabel.toLowerCase()}`}
        invalid={!line.priceValid}
        label={priceFieldLabel(line.unitPriceLabel)}
        onChangeText={onPrice}
        placeholder="Enter price"
        prefix="₱"
        value={line.priceRaw}
      />

      <View style={styles.grid}>
        {line.wastageAllowed ? (
          <View style={styles.field}>
            <Field
              context={line.label}
              invalid={!line.wastageValid}
              label="Wastage"
              onChangeText={onWastage}
              unit="%"
              value={line.wastageRaw}
            />
          </View>
        ) : (
          <View style={[styles.field, { justifyContent: 'center' }]}>
            <Txt tone="muted" v="caption">
              A breakage allowance is already included in the calculated count.
            </Txt>
          </View>
        )}
        <View style={styles.field}>
          <Field
            context={line.label}
            hint={`Leave blank to use the calculated ${line.unit} quantity; enter a value to override it.`}
            invalid={!line.overrideValid}
            keyboardType={wholeUnits ? 'number-pad' : 'decimal-pad'}
            label="Quantity override"
            onChangeText={onOverride}
            placeholder="Auto"
            unit={line.unit}
            value={line.override}
          />
        </View>
      </View>

      {!line.overrideValid ? (
        <Txt accessibilityRole="alert" tone="error" v="caption">
          Enter a valid non-negative quantity; bags and pieces must be whole units.
        </Txt>
      ) : null}
      {!line.wastageValid ? (
        <Txt accessibilityRole="alert" tone="error" v="caption">
          Wastage must be a valid, non-negative percentage.
        </Txt>
      ) : null}
      {!line.priceValid ? (
        <Txt accessibilityRole="alert" tone="error" v="caption">
          Unit prices must be zero or more. Correct the price to update the total.
        </Txt>
      ) : null}

      <View style={[styles.lineCost, { backgroundColor: c.surfaceAlt }]}>
        <Txt tone="muted" v="label">
          Line cost
        </Txt>
        <Txt v="figure" style={{ fontFamily: Fonts.bold, fontSize: 18 }}>
          {costText}
        </Txt>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  headerInner: {
    width: '100%',
    maxWidth: SHEET_MAX_WIDTH,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  split: { flex: 1 },
  panes: { flex: 1, flexDirection: 'row' },
  paneLeft: { flex: 5 },
  paneRight: { flex: 6 },
  pane: { padding: 16, paddingBottom: 24, gap: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  field: { flexGrow: 1, flexBasis: 150, minWidth: 140 },
  measure: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingVertical: 14,
  },
  materialHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  lineCost: {
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caution: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  assumptionsHead: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: {
    paddingTop: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  footerInner: { width: '100%', maxWidth: SHEET_MAX_WIDTH, gap: 8 },
  totalRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  totalValue: { fontSize: 32, lineHeight: 36 },
  totalHint: { marginTop: 2 },
});
