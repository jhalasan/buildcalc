import type { BuildcalcIconName } from '@/components/buildcalc-icon';
import type { CalculatorId } from '@/utils/construction-estimate';

export type Choice = { label: string; value: string };
export type FieldDefinition = {
  key: string;
  label: string;
  unit?: string;
  initialValue?: string;
  keyboardType?: 'decimal-pad' | 'number-pad';
  choices?: readonly Choice[];
  /** Sub-heading shown above this field when it starts a new group. */
  group?: string;
};
export type CalculatorDefinition = {
  id: CalculatorId;
  label: string;
  description: string;
  fields: readonly FieldDefinition[];
};
export type ModuleDefinition = {
  label: string;
  title: string;
  detail: string;
  icon: BuildcalcIconName;
  calculators: readonly CalculatorDefinition[];
};

export const numberField = (
  key: string,
  label: string,
  unit: string,
  initialValue = '',
  keyboardType: FieldDefinition['keyboardType'] = 'decimal-pad'
): FieldDefinition => ({ key, label, unit, initialValue, keyboardType });

export const choiceField = (
  key: string,
  label: string,
  choices: readonly Choice[],
  initialValue: string
): FieldDefinition => ({ key, label, choices, initialValue });

export const withGroup = (group: string, fields: readonly FieldDefinition[]): FieldDefinition[] =>
  fields.map((field) => ({ ...field, group }));
