import type { ConstructionTakeoff, EstimateValues } from './construction-estimate';
import { addItem, choice, finiteItems, positive, roundUp } from './estimate-helpers';

/** Tile pieces per m² (before breakage), from the workbook's tiling sheet. */
export const TILE_SIZES = [
  { value: '3x3', label: '3 x 3 in · 7.5 x 7.5 cm', perSqm: 177.8 },
  { value: '4x4', label: '4 x 4 in · 10 x 10 cm', perSqm: 100 },
  { value: '4.25x4.25', label: '4 1/4 x 4 1/4 in · 10.6 x 10.6 cm', perSqm: 88.4 },
  { value: '4x8', label: '4 x 8 in · 10 x 20 cm', perSqm: 50 },
  { value: '6x6', label: '6 x 6 in · 15 x 15 cm', perSqm: 44.44 },
  { value: '6x8', label: '6 x 8 in · 15 x 20 cm', perSqm: 33.33 },
  { value: '6x12', label: '6 x 12 in · 15 x 30 cm', perSqm: 22.22 },
  { value: '8x8', label: '8 x 8 in · 20 x 20 cm', perSqm: 25 },
  { value: '8x12', label: '8 x 12 in · 20 x 30 cm', perSqm: 16.66 },
  { value: '8x16', label: '8 x 16 in · 20 x 40 cm', perSqm: 12.5 },
  { value: '10x16', label: '10 x 16 in · 25 x 25 cm', perSqm: 16 },
  { value: '12x12', label: '12 x 12 in · 30 x 30 cm', perSqm: 11.11 },
  { value: '12x24', label: '12 x 24 in · 30 x 60 cm', perSqm: 5.56 },
  { value: '16x16', label: '16 x 16 in · 40 x 40 cm', perSqm: 6.25 },
  { value: '20x20', label: '20 x 20 in · 50 x 50 cm', perSqm: 4 },
  { value: '24x24', label: '24 x 24 in · 60 x 60 cm', perSqm: 2.78 },
] as const;

export const PAINT_KINDS = [
  { value: 'primer', label: 'Primer', coverage: '25 to 40 sq.m. per gallon, by primer type' },
  { value: 'masonry', label: 'Masonry paint', coverage: '30 to 40 sq.m. per gallon' },
  { value: 'roof', label: 'Roof paint', coverage: '30 to 50 sq.m. per gallon, by paint type' },
  { value: 'enamel', label: 'Enamel and gloss', coverage: '25 to 50 sq.m. per gallon, by enamel type' },
  { value: 'varnish', label: 'Varnish and lacquer', coverage: '30 to 50 sq.m. per gallon, by product' },
] as const;

export function calculateTilingTakeoff(
  calculator: string,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  if (calculator !== 'tile-area') return undefined;
  const area = positive(values, 'area');
  const breakage = (values.breakage ?? '').trim() === '' ? 0 : Number(values.breakage);
  const size = TILE_SIZES.find((option) => option.value === values.tileSize);
  const fixing = choice(values, 'fixing', ['mortar', 'adhesive'] as const);
  if (
    area === undefined ||
    size === undefined ||
    fixing === undefined ||
    !Number.isFinite(breakage) ||
    breakage < 0
  ) {
    return undefined;
  }

  const sizeName = size.label.split(' · ')[0];
  const items: ConstructionTakeoff['items'] = [];
  addItem(items, {
    id: `tile-${size.value}`,
    label: `Tiles · ${sizeName}`,
    quantity: roundUp(area * size.perSqm * (1 + breakage / 100)),
    unit: 'pcs',
    unitPriceLabel: `${sizeName} tile · per piece`,
    wastageAllowed: false,
  });
  if (fixing === 'mortar') {
    addItem(items, {
      id: 'cement-bag',
      label: 'Cement mortar',
      quantity: roundUp(area * 0.086),
      unit: 'bags',
      unitPriceLabel: 'Cement · per 50 kg bag',
    });
  } else {
    addItem(items, {
      id: 'tile-adhesive-bag',
      label: 'Tile adhesive',
      quantity: roundUp(area * 0.11),
      unit: 'bags',
      unitPriceLabel: 'Tile adhesive · per bag',
    });
  }
  addItem(items, {
    id: 'white-cement-kg',
    label: 'White cement (grout)',
    quantity: roundUp(area * 0.5),
    unit: 'kg',
    unitPriceLabel: 'White cement · per kg',
  });
  if (!finiteItems(items)) return undefined;

  return {
    measure: { label: 'Wall or floor area', value: area, unit: 'm²' },
    items,
    assumptions: [
      `Workbook tile count: area × ${size.perSqm} pieces per m² × (1 + ${breakage}% breakage), rounded up. Breakage is already in the tile count, so no second wastage applies.`,
      'The workbook suggests a 5–10% breakage allowance for tiles.',
      'Workbook factors per m²: 0.086 bag cement mortar, 0.11 bag adhesive, 0.5 kg white cement, each rounded up. The workbook lists mortar and adhesive side by side; this estimate uses the fixing method you choose.',
      'Workbook-based planning estimate. Verify tile sizes, joints, and fixing method with the supplier.',
    ],
  };
}

export function calculatePaintingTakeoff(
  calculator: string,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  if (calculator !== 'paint-area') return undefined;
  const area = positive(values, 'area');
  const coverage = positive(values, 'coverage');
  const coats = positive(values, 'coats');
  const kind = PAINT_KINDS.find((option) => option.value === values.paintKind);
  if (area === undefined || coverage === undefined || coats === undefined || !kind) return undefined;
  if (!Number.isInteger(coats)) return undefined;

  const items = [
    {
      id: `paint-${kind.value}-gal`,
      label: kind.label,
      quantity: roundUp((area / coverage) * coats),
      unit: 'gal',
      unitPriceLabel: `${kind.label} · per gallon`,
    },
  ];
  if (!finiteItems(items)) return undefined;

  return {
    measure: { label: 'Surface area', value: area, unit: 'm²' },
    items,
    assumptions: [
      'Workbook gallons: (area ÷ coverage per gallon) × number of coats, rounded up. 1 gallon = 4 liters.',
      `Workbook coverage for this kind: ${kind.coverage}. Enter the coverage printed on your product.`,
      'The workbook sheet fixes the coat multiplier at 2; this estimate uses the number of coats you enter (2 matches the workbook).',
      'Thinner, tinting colors, and surface preparation are not included.',
    ],
  };
}

export function calculateFinishesTakeoff(
  module: 'tiling' | 'painting',
  calculator: string,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  return module === 'tiling'
    ? calculateTilingTakeoff(calculator, values)
    : calculatePaintingTakeoff(calculator, values);
}
