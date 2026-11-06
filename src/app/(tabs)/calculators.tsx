import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import BuildcalcIcon from '@/components/buildcalc-icon';
import { Card, Divider, IconTile, Txt } from '@/components/ui/kit';
import { Select } from '@/components/ui/select';
import { Screen } from '@/components/ui/screen';
import { isModule, MODULE_ORDER, MODULES } from '@/constants/calculators';
import { Fonts, Radius } from '@/constants/buildcalc-theme';
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
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const results = needle
    ? MODULE_ORDER.flatMap((id) =>
        MODULES[id].calculators
          .filter((calculator) =>
            `${calculator.label} ${calculator.description} ${MODULES[id].title} ${MODULES[id].label}`
              .toLowerCase()
              .includes(needle)
          )
          .map((calculator) => ({ module: id, calculator }))
      )
    : [];

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Txt v="display">Calculators</Txt>
        <Txt tone="muted">Choose a work section, then a calculator.</Txt>
      </View>

      <View
        style={[
          styles.search,
          { backgroundColor: c.field, borderColor: c.control },
        ]}>
        <BuildcalcIcon color={c.inkMuted} name="search" size={22} />
        <TextInput
          accessibilityLabel="Search calculators"
          autoCapitalize="none"
          autoCorrect={false}
          maxFontSizeMultiplier={1.6}
          onChangeText={setQuery}
          placeholder="Search all calculators"
          placeholderTextColor={c.inkFaint}
          returnKeyType="search"
          selectionColor={c.yellow}
          style={[styles.searchInput, { color: c.ink }]}
          value={query}
        />
        {query ? (
          <Pressable
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setQuery('')}
            style={styles.searchClear}>
            <BuildcalcIcon color={c.inkMuted} name="close" size={20} />
          </Pressable>
        ) : null}
      </View>

      {needle ? (
        results.length === 0 ? (
          <Card style={{ gap: 6 }} tone="alt">
            <Txt v="bodyStrong">{`No calculators match “${query.trim()}”`}</Txt>
            <Txt tone="muted">Try a material or work name, such as slab, tile, or roof.</Txt>
          </Card>
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {results.map((item, index) => (
              <View key={`${item.module}-${item.calculator.id}`}>
                {index > 0 ? <Divider /> : null}
                <Pressable
                  accessibilityHint="Opens this calculator"
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({
                      pathname: '/calculator/[module]/[id]',
                      params: { module: item.module, id: item.calculator.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: pressed ? c.pressed : 'transparent' },
                  ]}>
                  <IconTile name={MODULES[item.module].icon} size={40} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt v="bodyStrong">{item.calculator.label}</Txt>
                    <Txt tone="muted" v="caption">
                      {MODULES[item.module].title}
                    </Txt>
                  </View>
                  <BuildcalcIcon color={c.inkMuted} name="chevron-right" size={20} />
                </Pressable>
              </View>
            ))}
          </Card>
        )
      ) : (
        <>
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

        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, minHeight: 48, fontFamily: Fonts.semiBold, fontSize: 17 },
  searchClear: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
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
