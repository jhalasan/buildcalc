import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BuildcalcIcon from '@/components/buildcalc-icon';
import { Button, Card, Divider, Field, IconTile, Tag, Txt } from '@/components/ui/kit';
import { Screen, useSheetWidth } from '@/components/ui/screen';
import { useColors } from '@/hooks/use-colors';
import { useEstimateSummary } from '@/hooks/use-estimate-summary';
import { useTickedNumber } from '@/hooks/use-ticked-number';
import { useEstimateStore } from '@/store/estimate-store';
import { buildEstimateText } from '@/utils/estimate-text';
import { haptic } from '@/utils/haptics';
import {
  formatMoney,
  formatNumber,
  formatQuantity,
  parseNumber,
  priceFieldLabel,
} from '@/utils/estimate-lines';

type CombinedMaterial = {
  id: string;
  label: string;
  unit: string;
  unitPriceLabel: string;
  quantity: number | undefined;
  adjusted: boolean;
};

export default function EstimateScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { prices, setPrice, removeTakeoff, duplicateTakeoff, clearEstimate } = useEstimateStore();
  const estimate = useEstimateSummary();
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | undefined>();
  const [shareNote, setShareNote] = useState<string | undefined>();
  const sheetWidth = useSheetWidth();

  useEffect(() => {
    if (!confirmClear) return;
    const timer = setTimeout(() => setConfirmClear(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  useEffect(() => {
    if (!confirmRemoveId) return;
    const timer = setTimeout(() => setConfirmRemoveId(undefined), 4000);
    return () => clearTimeout(timer);
  }, [confirmRemoveId]);

  useEffect(() => {
    if (!shareNote) return;
    const timer = setTimeout(() => setShareNote(undefined), 4000);
    return () => clearTimeout(timer);
  }, [shareNote]);

  async function shareEstimate() {
    const message = buildEstimateText(estimate.entries, estimate.total, estimate.missingPriceCount);
    try {
      await Share.share({ message, title: 'Buildcalc material estimate' });
    } catch {
      // Browsers without the share sheet: copy to the clipboard instead.
      try {
        if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(message);
          setShareNote('Estimate copied to the clipboard.');
          return;
        }
      } catch {
        // fall through to the message below
      }
      setShareNote('Sharing is not available on this device.');
    }
  }

  const materials = useMemo(() => {
    const map = new Map<string, CombinedMaterial>();
    for (const entry of estimate.entries) {
      for (const line of entry.summary?.lines ?? []) {
        const current = map.get(line.id);
        if (!current) {
          map.set(line.id, {
            id: line.id,
            label: line.label,
            unit: line.unit,
            unitPriceLabel: line.unitPriceLabel,
            quantity: line.quantity,
            adjusted: line.isAdjusted,
          });
        } else {
          current.quantity =
            current.quantity === undefined || line.quantity === undefined
              ? undefined
              : current.quantity + line.quantity;
          current.adjusted = current.adjusted || line.isAdjusted;
        }
      }
    }
    return [...map.values()];
  }, [estimate.entries]);

  const tickedTotal = useTickedNumber(estimate.total);

  if (estimate.entries.length === 0) {
    return (
      <Screen>
        <View style={{ gap: 4 }}>
          <Txt v="display">Estimate</Txt>
          <Txt tone="muted">Takeoffs you add are combined here with your unit prices.</Txt>
        </View>
        <Card style={styles.empty}>
          <IconTile name="estimate" size={64} tone="muted" />
          <Txt style={{ textAlign: 'center' }} v="heading">
            No takeoffs in this estimate
          </Txt>
          <Txt style={{ textAlign: 'center' }} tone="muted">
            Open a calculator, enter measurements, then choose Add to estimate. Takeoffs are
            temporary and clear when you close the app. Unit prices you enter are saved on this
            device.
          </Txt>
          <Button label="Browse calculators" onPress={() => router.navigate('/calculators')} />
        </Card>
      </Screen>
    );
  }

  const total = estimate.total;
  const totalText =
    estimate.hasInvalidInput
      ? 'Fix fields in a takeoff'
      : total === undefined
        ? `Enter ${estimate.missingPriceCount} unit ${estimate.missingPriceCount === 1 ? 'price' : 'prices'}`
        : formatMoney(tickedTotal ?? total);

  const footer = (
    <View
      style={[
        styles.footer,
        { backgroundColor: c.charcoal, paddingBottom: Math.max(insets.bottom, 0) + 12 },
      ]}>
      <View style={[styles.footerInner, { maxWidth: sheetWidth - 32 }]}>
        <Txt tone="onCharcoalMuted" v="label">
          Total Estimated Material Cost
        </Txt>
        <Txt
          accessibilityLiveRegion="polite"
          adjustsFontSizeToFit
          numberOfLines={1}
          tone={total === undefined ? 'onCharcoal' : 'yellow'}
          v={total === undefined ? 'heading' : 'display'}>
          {totalText}
        </Txt>
        <Txt tone="onCharcoalMuted" v="caption">
          Material costs only. Labor, equipment, overhead, and other construction expenses are
          excluded.
        </Txt>
      </View>
    </View>
  );

  return (
    <Screen footer={footer}>
      <View style={{ gap: 4 }}>
        <Txt v="display">Estimate</Txt>
        <Txt tone="muted">
          Takeoffs clear when you close the app. Unit prices are saved on this device.
        </Txt>
      </View>

      <View style={{ gap: 10 }}>
        <Txt v="title">Materials and prices</Txt>
        <Card style={{ padding: 0 }}>
          {materials.map((material, index) => {
            const raw = prices[material.id] ?? '';
            const price = parseNumber(raw);
            const invalid = raw.trim() !== '' && (price === undefined || price < 0);
            const cost =
              material.quantity !== undefined && price !== undefined && price >= 0
                ? material.quantity * price
                : undefined;
            return (
              <View key={material.id}>
                {index > 0 ? <Divider /> : null}
                <View style={styles.material}>
                  <View style={styles.materialHead}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Txt v="bodyStrong">{material.label}</Txt>
                      {material.adjusted ? <Tag label="adjusted" /> : null}
                    </View>
                    <Txt v="figure">
                      {material.quantity === undefined
                        ? '—'
                        : formatQuantity(material.quantity, material.unit)}
                    </Txt>
                  </View>
                  <View style={styles.priceRow}>
                    <View style={styles.priceField}>
                      <Field
                        compact
                        invalid={invalid}
                        context={material.label}
                        label={priceFieldLabel(material.unitPriceLabel)}
                        onChangeText={(value) => setPrice(material.id, value)}
                        placeholder="Enter price"
                        prefix="₱"
                        value={raw}
                      />
                    </View>
                    <View style={styles.cost}>
                      <Txt tone="muted" v="label">
                        Line cost
                      </Txt>
                      <Txt v="figure">{cost === undefined ? '—' : formatMoney(cost)}</Txt>
                    </View>
                  </View>
                  {invalid ? (
                    <Txt accessibilityRole="alert" tone="error" v="caption">
                      Unit prices must be zero or more. Correct the price to update the total.
                    </Txt>
                  ) : null}
                </View>
              </View>
            );
          })}
        </Card>
      </View>

      <View style={{ gap: 10 }}>
        <Txt v="title">Takeoffs</Txt>
        {estimate.entries.map((entry) => (
          <Animated.View
            entering={FadeInDown.duration(260)}
            exiting={FadeOut.duration(160)}
            key={entry.saved.id}
            layout={LinearTransition.duration(220)}>
          <Card style={{ gap: 12 }}>
            <View style={styles.takeoffHead}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="heading">{entry.title}</Txt>
                <Txt tone="muted" v="caption">
                  {entry.subtitle}
                  {entry.takeoff
                    ? ` · ${entry.takeoff.measure.label} ${formatNumber(entry.takeoff.measure.value)} ${entry.takeoff.measure.unit}`
                    : ''}
                </Txt>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Txt tone="muted" v="label">
                  Subtotal
                </Txt>
                <Txt v="figure">
                  {entry.summary?.total === undefined ? '—' : formatMoney(entry.summary.total)}
                </Txt>
              </View>
            </View>
            <View style={[styles.lines, { borderColor: c.line }]}>
              {(entry.summary?.lines ?? []).map((line) => (
                <View key={line.id} style={styles.lineRow}>
                  <Txt style={{ flex: 1 }} tone="muted" v="caption">
                    {line.label}
                  </Txt>
                  <Txt v="label">
                    {line.quantity === undefined ? '—' : formatQuantity(line.quantity, line.unit)}
                  </Txt>
                </View>
              ))}
            </View>
            <View style={styles.actions}>
              <Button
                icon="edit"
                label="Edit"
                onPress={() =>
                  router.push({
                    pathname: '/calculator/[module]/[id]',
                    params: {
                      module: entry.saved.module,
                      id: entry.saved.calculatorId,
                      takeoff: entry.saved.id,
                    },
                  })
                }
                style={{ flex: 1, minHeight: 48, minWidth: 96 }}
                variant="secondary"
              />
              <Button
                icon="copy"
                label="Duplicate"
                onPress={() => {
                  haptic.light();
                  duplicateTakeoff(entry.saved.id);
                }}
                style={{ flex: 1, minHeight: 48, minWidth: 96 }}
                variant="secondary"
              />
              <Button
                icon="trash"
                label={confirmRemoveId === entry.saved.id ? 'Confirm' : 'Remove'}
                onPress={() => {
                  if (confirmRemoveId === entry.saved.id) {
                    haptic.warning();
                    removeTakeoff(entry.saved.id);
                    setConfirmRemoveId(undefined);
                  } else {
                    haptic.light();
                    setConfirmRemoveId(entry.saved.id);
                  }
                }}
                style={{ flex: 1, minHeight: 48, minWidth: 96 }}
                variant={confirmRemoveId === entry.saved.id ? 'danger' : 'secondary'}
              />
            </View>
          </Card>
          </Animated.View>
        ))}
        <Button
          icon="plus"
          label="Add another takeoff"
          onPress={() => router.navigate('/calculators')}
          variant="secondary"
        />
        <Button
          accessibilityHint="Opens the share sheet with a plain text copy of this estimate"
          icon="share"
          label="Share estimate"
          onPress={shareEstimate}
        />
        {shareNote ? (
          <Txt accessibilityLiveRegion="polite" tone="muted" v="caption">
            {shareNote}
          </Txt>
        ) : null}
      </View>

      <View style={{ gap: 12 }}>
        <Button
          icon="trash"
          label={confirmClear ? 'Tap again to clear all takeoffs' : 'Clear all takeoffs'}
          onPress={() => {
            if (confirmClear) {
              haptic.warning();
              clearEstimate();
              setConfirmClear(false);
            } else {
              haptic.light();
              setConfirmClear(true);
            }
          }}
          variant="danger"
        />
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
  footer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  footerInner: { width: '100%', maxWidth: 640, gap: 2 },
  empty: { alignItems: 'center', gap: 14, paddingVertical: 28 },
  material: { padding: 16, gap: 10 },
  materialHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 },
  priceField: { flexGrow: 1, flexBasis: 170, minWidth: 150, maxWidth: 360 },
  cost: { minWidth: 110, minHeight: 52, justifyContent: 'center', alignItems: 'flex-end', gap: 2 },
  takeoffHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  lines: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 6 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingHorizontal: 4 },
});
