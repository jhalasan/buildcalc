import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BuildcalcIcon from '@/components/buildcalc-icon';
import { Card, IconTile, lift, SectionTitle, Txt } from '@/components/ui/kit';
import { Screen } from '@/components/ui/screen';
import { Radius } from '@/constants/buildcalc-theme';
import { findCalculator, MODULE_ORDER, MODULES } from '@/constants/calculators';
import { useColors } from '@/hooks/use-colors';
import { useEstimateSummary } from '@/hooks/use-estimate-summary';
import { useEstimateStore } from '@/store/estimate-store';
import { useWindowClass } from '@/hooks/use-window-class';
import { formatMoney } from '@/utils/estimate-lines';

const STEPS = [
  { title: 'Enter dimensions', detail: 'Metric measurements, in metres unless a field shows another unit.' },
  { title: 'Review quantities', detail: 'Check the assumptions and rounding behind each material.' },
  { title: 'Add your unit prices', detail: 'Prices are yours, in Philippine pesos. None are supplied.' },
];

export default function HomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width, isCompact } = useWindowClass();
  const tileBasis = !isCompact ? '23%' : width < 340 ? '100%' : '47%';
  const estimate = useEstimateSummary();
  const { recent } = useEstimateStore();
  const count = estimate.entries.length;
  const recentRows = recent
    .slice(0, 2)
    .map((item) => ({ ...item, calculator: findCalculator(item.module, item.calculatorId) }))
    .filter((item) => item.calculator !== undefined);

  return (
    <Screen edges={['left', 'right']} contentStyle={{ paddingHorizontal: 0, paddingTop: 0 }} bottomPadding={24}>
      <View style={[styles.masthead, { backgroundColor: c.charcoal, paddingTop: insets.top + 20 }]}>
        <View style={styles.brandRow}>
          <View style={[styles.mark, { backgroundColor: c.yellow }]}>
            <BuildcalcIcon color={c.onYellow} name="ruler" size={22} strokeWidth={2.2} />
          </View>
          <Txt tone="yellow" v="title">
            BuildCalc
          </Txt>
        </View>
        <Txt style={styles.headline} tone="onCharcoal" v="display">
          Measure the work.{'\n'}Price the materials.
        </Txt>

        <Pressable
          accessibilityHint="Opens the Estimate tab"
          accessibilityRole="button"
          onPress={() => router.navigate('/estimate')}
          style={({ pressed }) => [
            styles.strip,
            { backgroundColor: pressed ? c.charcoalLine : c.charcoalWash, borderColor: c.charcoalLine },
          ]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt tone="onCharcoalMuted" v="label">
              Current estimate
            </Txt>
            {count === 0 ? (
              <Txt tone="onCharcoal" v="bodyStrong">
                No takeoffs yet. Start one below.
              </Txt>
            ) : (
              <>
                <Txt tone="onCharcoal" v="bodyStrong">
                  {count} {count === 1 ? 'takeoff' : 'takeoffs'} ·{' '}
                  {estimate.total === undefined
                    ? `Enter ${estimate.missingPriceCount || 1} unit ${estimate.missingPriceCount === 1 ? 'price' : 'prices'}`
                    : formatMoney(estimate.total)}
                </Txt>
                <Txt tone="onCharcoalMuted" v="caption">
                  Total Estimated Material Cost. Material costs only; labor, equipment, overhead, and
                  other construction expenses are excluded.
                </Txt>
              </>
            )}
          </View>
          <BuildcalcIcon color={c.yellow} name="chevron-right" size={22} />
        </Pressable>
      </View>

      <View style={styles.body}>
        {recentRows.length > 0 ? (
          <View style={{ gap: 12 }}>
            <SectionTitle title="Continue" />
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {recentRows.map((item, index) => (
                <View key={`${item.module}-${item.calculatorId}`}>
                  {index > 0 ? (
                    <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: c.line }} />
                  ) : null}
                  <Pressable
                    accessibilityHint="Opens this calculator"
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/calculator/[module]/[id]',
                        params: { module: item.module, id: item.calculatorId },
                      })
                    }
                    style={({ pressed }) => [
                      styles.recentRow,
                      { backgroundColor: pressed ? c.pressed : 'transparent' },
                    ]}>
                    <IconTile name={MODULES[item.module].icon} size={40} />
                    <View style={{ flex: 1, gap: 1 }}>
                      <Txt v="bodyStrong">{item.calculator?.label}</Txt>
                      <Txt tone="muted" v="caption">
                        {MODULES[item.module].title}
                      </Txt>
                    </View>
                    <BuildcalcIcon color={c.inkMuted} name="chevron-right" size={20} />
                  </Pressable>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        <View style={{ gap: 12 }}>
          <SectionTitle detail="Choose a work section to see its calculators." title="Start a takeoff" />
          <View style={styles.grid}>
            {MODULE_ORDER.map((id) => {
              const module = MODULES[id];
              return (
                <Pressable
                  accessibilityHint={`Opens the ${module.title} calculators`}
                  accessibilityLabel={`${module.title}, ${module.calculators.length} calculators`}
                  accessibilityRole="button"
                  key={id}
                  onPress={() => router.navigate({ pathname: '/calculators', params: { module: id } })}
                  style={({ pressed }) => [
                    styles.workCard,
                    { flexBasis: tileBasis },
                    {
                      backgroundColor: pressed ? c.pressed : c.surface,
                      borderColor: c.isDark ? c.line : 'transparent',
                    },
                    lift(c),
                  ]}>
                  <IconTile name={module.icon} size={48} />
                  <View style={{ gap: 2 }}>
                    <Txt v="bodyStrong">{module.title}</Txt>
                    <Txt tone="muted" v="caption">
                      {module.calculators.length} {module.calculators.length === 1 ? 'calculator' : 'calculators'}
                    </Txt>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {count === 0 ? (
        <Card style={{ gap: 14 }}>
          <Txt v="heading">How it works</Txt>
          {STEPS.map((step, index) => (
            <View key={step.title} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: c.charcoal }]}>
                <Txt tone="yellow" v="figure">
                  {index + 1}
                </Txt>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Txt v="bodyStrong">{step.title}</Txt>
                <Txt tone="muted" v="caption">
                  {step.detail}
                </Txt>
              </View>
            </View>
          ))}
        </Card>
        ) : null}

        <View style={styles.notice}>
          <BuildcalcIcon color={c.inkMuted} name="info" size={20} />
          <Txt style={{ flex: 1 }} tone="muted" v="caption">
            Workbook-based planning estimates, not engineering approval. Verify material quantities,
            mixes, and specifications with a qualified construction professional before ordering or
            building.
          </Txt>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  masthead: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 18,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  headline: { marginTop: 4 },
  strip: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 14,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  body: { paddingHorizontal: 16, gap: 28 },
  workCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 132,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  recentRow: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNumber: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingHorizontal: 4 },
});
