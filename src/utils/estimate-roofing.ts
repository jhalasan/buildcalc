import type { ConstructionTakeoff, EstimateValues, MaterialTakeoffItem } from './construction-estimate';
import { addItem, choice, finiteItems, positive, roundUp } from './estimate-helpers';

const FIRST_SHEET_NET: Record<string, number> = { '8': 2.4, '10': 3, '12': 3.6 };
const NEXT_SHEET_NET: Record<string, number> = { '8': 2.1, '10': 2.7, '12': 3.3 };
const NAILS_PER_SHEET: Record<string, number> = { '8': 18, '10': 22, '12': 26 };
const LENGTHS = ['8', '10', '12'] as const;

function sheetItem(length: string, quantity: number): MaterialTakeoffItem {
  return {
    id: `roof-sheet-${length}ft`,
    label: `Roof sheet · ${length} ft`,
    quantity,
    basis: 'Sheets per roof side × number of sides',
    unit: 'pcs',
    unitPriceLabel: `Roof sheet ${length} ft · per sheet`,
  };
}

function roofSheets(
  calculator: 'roof-two-sheets' | 'roof-three-sheets',
  values: EstimateValues
): ConstructionTakeoff | undefined {
  const span = positive(values, 'span');
  const rise = positive(values, 'rise');
  const overhangRaw = (values.projection ?? '').trim();
  const projection = overhangRaw === '' ? 0 : Number(overhangRaw);
  const width = positive(values, 'roofWidth');
  const effective = positive(values, 'effectiveWidth');
  const sides = choice(values, 'sides', ['1', '2'] as const);
  const lengths = [choice(values, 'sheet1', LENGTHS), choice(values, 'sheet2', LENGTHS)];
  if (calculator === 'roof-three-sheets') lengths.push(choice(values, 'sheet3', LENGTHS));
  if (
    !span ||
    !rise ||
    !width ||
    !effective ||
    !sides ||
    !Number.isFinite(projection) ||
    projection < 0 ||
    lengths.some((length) => length === undefined)
  ) {
    return undefined;
  }
  const chosen = lengths as string[];

  // Rafter run along the slope, plus the projected eave (bulada). The workbook approximates
  // the eave with TAN/TANH; this uses the exact slope geometry.
  const rafter = (span + projection) * Math.sqrt(1 + (rise / span) ** 2);
  const netLength = rafter + 0.025 + 0.05;

  let overlap: number;
  if (calculator === 'roof-two-sheets') {
    overlap = FIRST_SHEET_NET[chosen[0]] + NEXT_SHEET_NET[chosen[1]] - netLength + 0.3;
  } else {
    overlap =
      (FIRST_SHEET_NET[chosen[0]] + NEXT_SHEET_NET[chosen[1]] + NEXT_SHEET_NET[chosen[2]] - netLength + 0.6) / 2;
  }

  const perSheetCount = roundUp(width / effective);
  const sideCount = Number(sides);
  const items: MaterialTakeoffItem[] = [];
  let nailTotal = 0;
  for (const length of chosen) {
    addItem(items, sheetItem(length, perSheetCount * sideCount));
    nailTotal += NAILS_PER_SHEET[length] * perSheetCount * sideCount;
  }
  addItem(items, {
    id: 'umbrella-nails-kg',
    label: 'Umbrella nails / tekscrews',
    quantity: roundUp(nailTotal / 120),
    basis: 'Nails per sheet × sheets ÷ 120 per kg, rounded up',
    unit: 'kg',
    unitPriceLabel: 'Umbrella nails or tekscrews · per kg',
  });
  if (!finiteItems(items)) return undefined;

  const warnings: string[] = [];
  if (overlap < 0.3) {
    warnings.push('Adjust sheet length: the chosen sheets leave less than the 0.3 m minimum end lap.');
  } else if (overlap > 0.6) {
    warnings.push(
      'Not economical: end lap is more than 0.6 m (2 ft). Choose shorter sheets or accept the extra material.'
    );
  }

  return {
    measure: { label: 'Roofing net length per run', value: netLength, unit: 'm' },
    items,
    warnings,
    assumptions: [
      `Rafter length ${rafter.toFixed(2)} m from span, rise, and eave projection (exact slope geometry; the workbook approximates the eave), plus 0.075 m for the eave overhang, gives ${netLength.toFixed(2)} m of roofing per run.`,
      `End lap of this sheet combination: ${overlap.toFixed(2)} m. Workbook rule: at least 0.3 m, and not more than 0.6 m (2 ft).`,
      `Sheets per run = roof width ÷ effective width (${effective} m), rounded up; every run uses the same count. Lengths: 8, 10, or 12 ft only; net sheet lengths 2.4 / 3.0 / 3.6 m for the first sheet and 2.1 / 2.7 / 3.3 m after.`,
      `Umbrella nails or tekscrews: 18, 22, or 26 per 8, 10, or 12 ft sheet, ÷ 120 per kg, rounded up. ${sides === '2' ? 'Quantities are doubled for a second, similar roof side.' : 'One roof side only; choose two sides if the other side is similar.'}`,
      'Purlins, ridge rolls, flashing, and gutters are not included here.',
    ],
  };
}

export function calculateRoofingTakeoff(
  calculator: string,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  if (calculator === 'roof-two-sheets' || calculator === 'roof-three-sheets') {
    return roofSheets(calculator, values);
  }
  if (calculator === 'roof-accessories') {
    const covered = positive(values, 'coveredLength');
    const effective = positive(values, 'effectiveLength');
    if (!covered || !effective) return undefined;
    const items: MaterialTakeoffItem[] = [
      {
        id: 'roof-accessory-pcs',
        label: 'Roof accessories',
        quantity: roundUp(covered / effective),
        basis: 'Covered length ÷ effective length per piece, rounded up',
        unit: 'pcs',
        unitPriceLabel: 'Roof accessory · per piece',
      },
    ];
    if (!finiteItems(items)) return undefined;
    return {
      measure: { label: 'Total covered length', value: covered, unit: 'm' },
      items,
      assumptions: [
        'Workbook count: total covered length ÷ effective length of one accessory piece, rounded up. The workbook uses 2.2 m as its example effective length.',
      ],
    };
  }
  return undefined;
}
