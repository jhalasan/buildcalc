import Constants from 'expo-constants';
import { View } from 'react-native';

import BuildcalcIcon, { type BuildcalcIconName } from '@/components/buildcalc-icon';
import { Card, Divider, Options, Txt } from '@/components/ui/kit';
import { Screen } from '@/components/ui/screen';
import { useColors } from '@/hooks/use-colors';
import { useEstimateStore, type AppearancePreference } from '@/store/estimate-store';

const APPEARANCE_OPTIONS: { label: string; value: AppearancePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

function InfoRow({ icon, label, value }: { icon: BuildcalcIconName; label: string; value: string }) {
  const c = useColors();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={{ minHeight: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <BuildcalcIcon color={c.inkMuted} name={icon} size={22} />
      <Txt v="bodyStrong">{label}</Txt>
      <Txt style={{ flex: 1, textAlign: 'right' }} tone="muted">
        {value}
      </Txt>
    </View>
  );
}

export default function SettingsScreen() {
  const { appearance, setAppearance } = useEstimateStore();

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Txt v="display">Settings</Txt>
        <Txt tone="muted">Measurement, currency, and appearance.</Txt>
      </View>

      <View style={{ gap: 10 }}>
        <Txt v="title">Calculation</Txt>
        <Card style={{ padding: 0 }}>
          <InfoRow icon="ruler" label="Measurement" value="Metric" />
          <Divider />
          <InfoRow icon="calculators" label="Currency" value="Philippine peso (₱)" />
        </Card>
        <Txt tone="muted" v="caption">
          Both are fixed in Phase 1. Quantities and costs use the en-PH number format.
        </Txt>
      </View>

      <View style={{ gap: 10 }}>
        <Txt v="title">Appearance</Txt>
        <Card style={{ gap: 12 }}>
          <Txt tone="muted" v="caption">
            System follows your device. Light is easiest to read in direct sun.
          </Txt>
          <Options
            label="Appearance"
            onChange={(value) => setAppearance(value as AppearancePreference)}
            options={APPEARANCE_OPTIONS}
            value={appearance}
          />
        </Card>
      </View>

      <View style={{ gap: 10 }}>
        <Txt v="title">About Buildcalc</Txt>
        <Card style={{ gap: 12 }}>
          <InfoRowPlain label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} />
          <Divider />
          <Txt tone="muted" v="caption">
            Buildcalc estimates material quantities and material cost only, from dimensions and unit
            prices you enter. Labor, equipment, overhead, reinforcement, and other construction
            expenses are excluded. Estimates are temporary and are not saved.
          </Txt>
          <Txt tone="muted" v="caption">
            Workbook-based planning estimates, not engineering approval. Verify material quantities,
            mixes, and specifications with a qualified construction professional before ordering or
            building.
          </Txt>
        </Card>
      </View>
    </Screen>
  );
}

function InfoRowPlain({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Txt v="bodyStrong">{label}</Txt>
      <Txt tone="muted">{value}</Txt>
    </View>
  );
}
