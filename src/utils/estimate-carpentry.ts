import type { ConstructionTakeoff, EstimateValues } from './construction-estimate';
import {
  addItem,
  choice,
  finiteItems,
  positive,
  roundUp,
  roundUpToTenth,
  wholePositive,
} from './estimate-helpers';

/** Board feet of studs and nailing joists per m² of wall, ceiling or floor (workbook table). */
export const STUD_FACTORS: Record<string, Record<string, number>> = {
  '1x2': { '30x30': 4.103, '30x60': 3.147, '40x40': 3.189, '40x60': 2.686, '60x60': 2.268 },
  '2x2': { '30x30': 8.198, '30x60': 6.293, '40x40': 6.379, '40x60': 5.373, '60x60': 4.594 },
  '2x3': { '30x30': 12.284, '30x60': 9.44, '40x40': 9.569, '40x60': 8.06, '60x60': 6.898 },
  '2x4': { '30x30': 16.414, '30x60': 12.592, '40x40': 12.758, '40x60': 10.746, '60x60': 9.195 },
};

const PLYWOOD_SHEET_AREA = 2.88; // 1.2 m x 2.4 m (4 ft x 8 ft)

export function lumberPieces(boardFeet: number, w1: number, w2: number, lengthFt: number): number {
  return roundUp(boardFeet / ((w1 * w2 * lengthFt) / 12));
}

export function calculateCarpentryTakeoff(
  calculator: string,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  if (calculator === 'lumber-board-feet') {
    const pieces = wholePositive(values, 'pieces');
    const w1 = positive(values, 'w1');
    const w2 = positive(values, 'w2');
    const length = positive(values, 'length');
    if (!pieces || !w1 || !w2 || !length) return undefined;
    const boardFeet = (pieces * w1 * w2 * length) / 12;
    const items = [
      {
        id: 'lumber-board-feet',
        label: 'Lumber',
        quantity: roundUpToTenth(boardFeet),
        unit: 'bd.ft',
        unitPriceLabel: 'Lumber · per board foot',
      },
    ];
    if (!finiteItems(items)) return undefined;
    return {
      measure: { label: 'Total board feet', value: boardFeet, unit: 'bd.ft' },
      items,
      assumptions: [
        'Workbook board feet: pieces × thickness (in) × width (in) × length (ft) ÷ 12.',
        'Board feet are rounded up to 0.1 bd.ft for purchasing. Lumber sold by the piece may price differently.',
      ],
    };
  }

  if (calculator === 'round-log') {
    const pieces = wholePositive(values, 'pieces');
    const diameter = positive(values, 'diameter');
    const length = positive(values, 'length');
    if (!pieces || !diameter || !length || diameter <= 4) return undefined;
    const boardFeet = (pieces * ((diameter - 4) * (diameter - 4) * length)) / 16;
    const items = [
      {
        id: 'round-log-board-feet',
        label: 'Round log',
        quantity: roundUpToTenth(boardFeet),
        unit: 'bd.ft',
        unitPriceLabel: 'Round log · per board foot',
      },
    ];
    if (!finiteItems(items)) return undefined;
    return {
      measure: { label: 'Total board feet', value: boardFeet, unit: 'bd.ft' },
      items,
      assumptions: [
        'Workbook log rule: (diameter − 4)² × length (ft) ÷ 16 board feet per log, with diameter in inches.',
        'The workbook sheet computes one log; this estimate multiplies by the number of logs you enter.',
      ],
    };
  }

  if (calculator === 'studs-joists') {
    const length = positive(values, 'length');
    const height = positive(values, 'height');
    const size = values.lumberSize ?? '';
    const spacing = values.spacing ?? '';
    const w1 = positive(values, 'w1');
    const w2 = positive(values, 'w2');
    const lengthFt = positive(values, 'lengthFt');
    const factor = STUD_FACTORS[size]?.[spacing];
    if (!length || !height || !w1 || !w2 || !lengthFt || factor === undefined) return undefined;
    const area = length * height;
    const boardFeet = area * factor;
    const items: ConstructionTakeoff['items'] = [];
    addItem(items, {
      id: `lumber-${w1}x${w2}x${lengthFt}`,
      label: `Lumber ${w1} x ${w2} x ${lengthFt} ft`,
      quantity: lumberPieces(boardFeet, w1, w2, lengthFt),
      unit: 'pcs',
      unitPriceLabel: `Lumber ${w1} x ${w2} x ${lengthFt} ft · per piece`,
    });
    addItem(items, {
      id: 'nails-cw-2-5',
      label: '2 1/2 in CW nails',
      quantity: roundUpToTenth(area * 0.05),
      unit: 'kg',
      unitPriceLabel: '2 1/2 in CW nails · per kg',
    });
    if (!finiteItems(items)) return undefined;
    return {
      measure: { label: 'Framed area', value: area, unit: 'm²' },
      items,
      assumptions: [
        `Workbook factor for ${size.replace('x', ' x ')} in studs and joists at ${spacing.replace('x', ' x ')} cm: ${factor} bd.ft per m², giving ${boardFeet.toFixed(2)} bd.ft.`,
        'Pieces = board feet ÷ board feet per piece of the purchase size you enter, rounded up. Nails: 0.05 kg per m² for joining the studs, rounded up to 0.1 kg.',
      ],
    };
  }

  if (calculator === 'plywood-covering') {
    const length = positive(values, 'length');
    const height = positive(values, 'height');
    const sides = choice(values, 'sides', ['1', '2'] as const);
    if (!length || !height || !sides) return undefined;
    const area = length * height;
    const sheets =
      sides === '1' ? roundUp(area / PLYWOOD_SHEET_AREA) : roundUp((area / PLYWOOD_SHEET_AREA) * 2);
    const items: ConstructionTakeoff['items'] = [];
    addItem(items, {
      id: 'plywood-quarter-4x8',
      label: '1/4 in plywood, 4 ft x 8 ft',
      quantity: sheets,
      unit: 'pcs',
      unitPriceLabel: '1/4 in plywood 4 x 8 ft · per sheet',
    });
    addItem(items, {
      id: 'nails-cw-1',
      label: '1 in CW nails',
      quantity: roundUpToTenth(sheets * 0.055),
      unit: 'kg',
      unitPriceLabel: '1 in CW nails · per kg',
    });
    if (!finiteItems(items)) return undefined;
    return {
      measure: { label: 'Covered area per side', value: area, unit: 'm²' },
      items,
      assumptions: [
        'Workbook sheets: area ÷ 2.88 m² per 4 ft x 8 ft sheet, rounded up; two sides double the unrounded count before rounding up. The workbook lists 1/4 in ordinary plywood or hardiflex board.',
        'Nails: 0.055 kg of 1 in CW nails per sheet, rounded up to 0.1 kg.',
      ],
    };
  }

  return undefined;
}
