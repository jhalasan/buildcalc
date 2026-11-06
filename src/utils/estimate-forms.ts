import { lumberPieces } from './estimate-carpentry';
import type { ConstructionTakeoff, EstimateValues } from './construction-estimate';
import {
  addItem,
  finiteItems,
  optionalNonNegative,
  positive,
  roundUp,
  roundUpToTenth,
  wholePositive,
} from './estimate-helpers';

const PLYWOOD_SHEET_AREA = 2.88;

/** Board feet of lumber per m of column height / beam length / m² of flooring (workbook table). */
const STAGING_FACTORS: Record<
  string,
  { colVertical: number; colHorizontal: number; colBrace: number; beamVertical: number; beamHorizontal: number; floor: number }
> = {
  '2x2': { colVertical: 4.7, colHorizontal: 21, colBrace: 11.7, beamVertical: 4, beamHorizontal: 4.7, floor: 6.1 },
  '2x3': { colVertical: 7, colHorizontal: 31.67, colBrace: 17.5, beamVertical: 6, beamHorizontal: 7, floor: 9.1 },
  '2x4': { colVertical: 9.35, colHorizontal: 42.25, colBrace: 23.35, beamVertical: 8, beamHorizontal: 9.35, floor: 12.1 },
};

function lumberItem(id: string, w1: number, w2: number, lengthFt: number, pieces: number) {
  return {
    id,
    label: `Lumber ${w1} x ${w2} x ${lengthFt} ft`,
    quantity: pieces,
    basis: 'Board feet needed ÷ board feet per piece, rounded up',
    unit: 'pcs',
    unitPriceLabel: `Lumber ${w1} x ${w2} x ${lengthFt} ft · per piece`,
  };
}

function formMaterials(
  area: number,
  framePerSheet: number,
  w1: number,
  w2: number,
  lengthFt: number
): ConstructionTakeoff['items'] {
  const sheets = roundUp(area / PLYWOOD_SHEET_AREA);
  const items: ConstructionTakeoff['items'] = [];
  addItem(items, lumberItem(`lumber-${w1}x${w2}x${lengthFt}`, w1, w2, lengthFt, lumberPieces(sheets * framePerSheet, w1, w2, lengthFt)));
  addItem(items, {
    id: 'plywood-form-4x8',
    label: 'Plywood, 4 ft x 8 ft',
    quantity: sheets,
    basis: 'Form area ÷ one sheet, rounded up',
    unit: 'pcs',
    unitPriceLabel: 'Form plywood 4 x 8 ft · per sheet',
  });
  addItem(items, {
    id: 'nails-cw-2-5',
    label: '2 1/2 in CW nails',
    quantity: roundUpToTenth(0.08 * area),
    basis: 'Form area × 0.08 kg per m², rounded up to 0.1 kg',
    unit: 'kg',
    unitPriceLabel: '2 1/2 in CW nails · per kg',
  });
  addItem(items, {
    id: 'nails-finishing-1',
    label: '1 in finishing nails',
    quantity: roundUpToTenth(area * 0.033),
    basis: 'Form area × 0.033 kg per m², rounded up to 0.1 kg',
    unit: 'kg',
    unitPriceLabel: '1 in finishing nails · per kg',
  });
  return items;
}

export function calculateFormsTakeoff(
  calculator: string,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  const w1 = positive(values, 'w1');
  const w2 = positive(values, 'w2');
  const lengthFt = positive(values, 'lengthFt');
  if (!w1 || !w2 || !lengthFt) return undefined;

  if (calculator === 'column-forms') {
    const a = positive(values, 'widthA');
    const b = positive(values, 'widthB');
    const count = wholePositive(values, 'quantity');
    if (!a || !b || !count) return undefined;
    const area = (2 * (a + b) + 0.2) * 2.4 * count;
    const items = formMaterials(area, 29.67, w1, w2, lengthFt);
    if (!finiteItems(items)) return undefined;
    return {
      measure: { label: 'Form area', value: area, unit: 'm²' },
      items,
      assumptions: [
        'Workbook form area: (2 × (A + B) + 0.2 m) × 2.4 m form height × number of columns. One reusable form per column; the workbook does not use the column height.',
        'Plywood = form area ÷ 2.88 m² per 4 ft x 8 ft sheet, rounded up. Frame lumber = 29.67 bd.ft per plywood sheet, converted to pieces of the size you enter.',
        'Nails: 0.08 kg of 2 1/2 in CW nails and 0.033 kg of 1 in finishing nails per m² of form, each rounded up to 0.1 kg.',
        'Formwork is a temporary-works estimate. Verify the form design, bracing, and reuse with a qualified construction professional.',
      ],
    };
  }

  if (calculator === 'beam-forms') {
    const length = positive(values, 'length');
    const depth = positive(values, 'depth');
    const width = positive(values, 'width');
    const count = wholePositive(values, 'quantity');
    if (!length || !depth || !width || !count) return undefined;
    const area = (2 * depth + width + 0.1) * length * count;
    const items = formMaterials(area, 28, w1, w2, lengthFt);
    if (!finiteItems(items)) return undefined;
    return {
      measure: { label: 'Form area', value: area, unit: 'm²' },
      items,
      assumptions: [
        'Workbook form area: (2 × depth + width + 0.1 m) × beam length × number of beams.',
        'Plywood = form area ÷ 2.88 m² per 4 ft x 8 ft sheet, rounded up. Frame lumber = 28 bd.ft per plywood sheet, converted to pieces of the size you enter.',
        'Nails: 0.08 kg of 2 1/2 in CW nails and 0.033 kg of 1 in finishing nails per m² of form, each rounded up to 0.1 kg.',
        'Formwork is a temporary-works estimate. Verify the form design, bracing, and reuse with a qualified construction professional.',
      ],
    };
  }

  if (calculator === 'staging') {
    const colHeight = optionalNonNegative(values, 'columnHeight');
    const columns = optionalNonNegative(values, 'columns');
    const beamLength = optionalNonNegative(values, 'beamLength');
    const beams = optionalNonNegative(values, 'beams');
    const floorArea = optionalNonNegative(values, 'floorArea');
    const factors = STAGING_FACTORS[values.stagingSize ?? ''];
    if (
      colHeight === undefined ||
      columns === undefined ||
      beamLength === undefined ||
      beams === undefined ||
      floorArea === undefined ||
      !factors
    ) {
      return undefined;
    }
    const totalColumnHeight = colHeight * columns;
    const totalBeamLength = beamLength * beams;
    if (totalColumnHeight + totalBeamLength + floorArea <= 0) return undefined;

    const boardFeet =
      totalColumnHeight * (factors.colVertical + factors.colHorizontal + factors.colBrace) +
      totalBeamLength * (factors.beamVertical + factors.beamHorizontal) +
      floorArea * factors.floor;
    const items: ConstructionTakeoff['items'] = [];
    addItem(items, lumberItem(`lumber-${w1}x${w2}x${lengthFt}`, w1, w2, lengthFt, lumberPieces(boardFeet, w1, w2, lengthFt)));
    addItem(items, {
      id: 'nails-cw-4',
      label: '#4 CW nails',
      quantity: roundUp(totalColumnHeight * 0.73),
      basis: 'Total column height × 0.73 kg per m, rounded up',
      unit: 'kg',
      unitPriceLabel: '#4 CW nails · per kg',
    });
    if (!finiteItems(items)) return undefined;
    return {
      measure: { label: 'Staging lumber', value: boardFeet, unit: 'bd.ft' },
      items,
      assumptions: [
        `Workbook board feet for ${(values.stagingSize ?? '').replace('x', ' x ')} in staging lumber: per metre of column height (vertical, horizontal, brace), per metre of beam length (vertical, horizontal), and per m² of flooring.`,
        'Pieces = total board feet ÷ board feet per piece of the purchase size you enter, rounded up.',
        '#4 CW nails: 0.73 kg per metre of total column height, rounded up to a whole kilogram.',
        'Scaffolding and staging must be designed for its loads. This is a lumber quantity estimate, not a design.',
      ],
    };
  }

  return undefined;
}
