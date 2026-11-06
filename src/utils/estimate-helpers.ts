import type { EstimateValues, MaterialTakeoffItem } from './construction-estimate';

export function readNumber(values: EstimateValues, key: string): number | undefined {
  const raw = values[key];
  if (raw === undefined || raw.trim() === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

export function positive(values: EstimateValues, key: string): number | undefined {
  const value = readNumber(values, key);
  return value !== undefined && value > 0 ? value : undefined;
}

export function nonNegative(values: EstimateValues, key: string): number | undefined {
  const value = readNumber(values, key);
  return value !== undefined && value >= 0 ? value : undefined;
}

/** Blank counts as zero; anything else must be a non-negative number. */
export function optionalNonNegative(values: EstimateValues, key: string): number | undefined {
  const raw = values[key];
  if (raw === undefined || raw.trim() === '') return 0;
  return nonNegative(values, key);
}

export function wholePositive(values: EstimateValues, key: string): number | undefined {
  const value = positive(values, key);
  return value !== undefined && Number.isInteger(value) ? value : undefined;
}

export function wholeNonNegative(values: EstimateValues, key: string): number | undefined {
  const value = readNumber(values, key);
  return value !== undefined && value >= 0 && Number.isInteger(value) ? value : undefined;
}

/** Excel ROUNDUP(x, 0) for non-negative values, tolerant of float noise. */
export function roundUp(value: number): number {
  return Math.ceil(value - 1e-9);
}

/** Excel ROUNDUP(x, 1) for non-negative values. */
export function roundUpToTenth(value: number): number {
  return Math.ceil(value * 10 - 1e-9) / 10;
}

export function choice<T extends string>(
  values: EstimateValues,
  key: string,
  allowed: readonly T[]
): T | undefined {
  const value = values[key];
  return allowed.find((option) => option === value);
}

/** Adds an item, or merges its quantity into an existing item with the same id. */
export function addItem(items: MaterialTakeoffItem[], item: MaterialTakeoffItem): void {
  const existing = items.find((current) => current.id === item.id);
  if (existing) existing.quantity += item.quantity;
  else items.push({ ...item });
}

export const TIE_WIRE = {
  id: 'tie-wire-kg',
  label: '#16 tie wire',
  unit: 'kg',
  unitPriceLabel: '#16 tie wire · per kg',
  basis: 'Workbook tie-wire factor for this member',
} as const;

export const REBAR_DIAMETERS = ['10', '12', '16', '20', '25'] as const;

export function rebarItem(diameter: string, quantity: number): MaterialTakeoffItem {
  return {
    id: `rebar-${diameter}mm`,
    label: `${diameter} mm rebar`,
    quantity,
    basis: 'Total bar length ÷ 6 m, rounded up',
    unit: 'pcs',
    unitPriceLabel: `${diameter} mm rebar · per 6 m bar`,
  };
}

export function finiteItems(items: readonly MaterialTakeoffItem[]): boolean {
  return items.every((item) => Number.isFinite(item.quantity) && item.quantity >= 0);
}
