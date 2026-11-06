import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Field, Txt } from '@/components/ui/kit';
import { Choices } from '@/components/ui/select';
import type { FieldDefinition } from '@/constants/field-helpers';
import type { EstimateValues } from '@/utils/construction-estimate';

/**
 * Renders calculator inputs in declaration order: runs of number fields share a
 * wrapping grid (one column on narrow phones, two when there is room), choices
 * take a full row, and a new `group` starts a sub-heading.
 */
export default function FieldList({
  fields,
  values,
  onChange,
}: {
  fields: readonly FieldDefinition[];
  values: EstimateValues;
  onChange: (key: string, value: string) => void;
}) {
  const blocks: ReactNode[] = [];
  let run: FieldDefinition[] = [];
  let lastGroup: string | undefined;

  const flush = () => {
    if (run.length === 0) return;
    const items = run;
    run = [];
    blocks.push(
      <View key={`grid-${items[0].key}`} style={styles.grid}>
        {items.map((field) => (
          <View key={field.key} style={styles.cell}>
            <Field
              context={items[0].group}
              keyboardType={field.keyboardType}
              label={field.label}
              onChangeText={(value) => onChange(field.key, value)}
              unit={field.unit}
              value={values[field.key] ?? ''}
            />
          </View>
        ))}
      </View>
    );
  };

  for (const field of fields) {
    if (field.group !== lastGroup) {
      flush();
      lastGroup = field.group;
      if (field.group) {
        blocks.push(
          <Txt accessibilityRole="header" key={`group-${field.group}`} style={styles.group} v="bodyStrong">
            {field.group}
          </Txt>
        );
      }
    }
    if (field.choices) {
      flush();
      blocks.push(
        <Choices
          context={field.group}
          key={field.key}
          label={field.label}
          onChange={(value) => onChange(field.key, value)}
          options={field.choices}
          value={values[field.key] ?? ''}
        />
      );
    } else {
      run.push(field);
    }
  }
  flush();

  return <View style={styles.list}>{blocks}</View>;
}

const styles = StyleSheet.create({
  list: { gap: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { flexGrow: 1, flexBasis: 150, minWidth: 140 },
  group: { marginTop: 8 },
});
