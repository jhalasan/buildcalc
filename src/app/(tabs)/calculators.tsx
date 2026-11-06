import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import BuildcalcIcon from '@/components/buildcalc-icon';
import { Card, Divider, IconTile, Txt } from '@/components/ui/kit';
import { Select } from '@/components/ui/select';
import { Screen } from '@/components/ui/screen';
import { isModule, MODULE_ORDER, MODULES } from '@/constants/calculators';
import { useColors } from '@/hooks/use-colors';
import type { EstimateModule } from '@/utils/construction-estimate';

export default function CalculatorsScreen() {
  const c = useColors();
  const params = useLocalSearchParams<{ module?: string }>();
  const [module, setModule] = useState<EstimateModule>(
    isModule(params.module) ? params.module : 'concrete'
  );
  const [seenParam, setSeenParam] = useState(params.module);
  if (params.module !== seenParam) {
    setSeenParam(params.module);
    if (isModule(params.module)) setModule(params.module);
  }

  const active = MODULES[module];

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Txt v="display">Calculators</Txt>
        <Txt tone="muted">Choose a work section, then a calculator.</Txt>
      </View>

      <Select
        label="Work section"
        onChange={(value) => isModule(value) && setModule(value)}
        options={MODULE_ORDER.map((id) => ({ label: MODULES[id].title, value: id }))}
        value={module}
      />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={styles.cardHead}>
          <IconTile name={active.icon} size={44} />
          <View style={{ flex: 1 }}>
            <Txt v="heading">{active.detail}</Txt>
            <Txt tone="muted" v="caption">
              {active.calculators.length} calculators
            </Txt>
          </View>
        </View>
        {active.calculators.map((calculator) => (
          <View key={calculator.id}>
            <Divider />
            <Pressable
              accessibilityHint="Opens this calculator"
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/calculator/[module]/[id]',
                  params: { module, id: calculator.id },
                })
              }
              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.pressed : 'transparent' }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="bodyStrong">{calculator.label}</Txt>
                <Txt numberOfLines={2} tone="muted" v="caption">
                  {calculator.description}
                </Txt>
              </View>
              <BuildcalcIcon color={c.inkMuted} name="chevron-right" size={20} />
            </Pressable>
          </View>
        ))}
      </Card>

    </Screen>
  );
}

const styles = StyleSheet.create({
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  row: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
