import type { ConstructionTakeoff, EstimateValues, MaterialTakeoffItem } from './construction-estimate';
import {
  addItem,
  finiteItems,
  optionalNonNegative,
  positive,
  rebarItem,
  roundUp,
  roundUpToTenth,
  TIE_WIRE,
  wholeNonNegative,
  wholePositive,
} from './estimate-helpers';

/** Workbook tables. */
export const CHB_VERTICAL_FACTORS: Record<string, number> = { '40': 2.93, '60': 2.13, '80': 1.6 };
export const CHB_HORIZONTAL_FACTORS: Record<string, number> = { '2': 3.3, '3': 2.15, '4': 1.72 };
export const ONE_WAY_SLAB: Record<string, { bars: number; tie: number }> = {
  '10': { bars: 3.764, tie: 0.474 },
  '12.5': { bars: 3.062, tie: 0.316 },
  '15': { bars: 2.584, tie: 0.228 },
  '17.5': { bars: 2.232, tie: 0.168 },
  '20': { bars: 1.98, tie: 0.132 },
  '22.2': { bars: 1.786, tie: 0.11 },
  '25': { bars: 1.627, tie: 0.089 },
};
export const TWO_WAY_SLAB: Record<string, { bars: number; tie: number }> = {
  '10': { bars: 4.369, tie: 0.592 },
  '12.5': { bars: 3.603, tie: 0.416 },
  '15': { bars: 3.221, tie: 0.35 },
  '17.5': { bars: 2.647, tie: 0.247 },
  '20': { bars: 2.36, tie: 0.174 },
  '22.2': { bars: 2.168, tie: 0.168 },
  '25': { bars: 1.977, tie: 0.142 },
};
const END_HOOK: Record<string, number> = { '12': 0.2, '16': 0.25, '20': 0.35, '25': 0.435 };

const DIAMETERS = ['10', '12', '16', '20', '25'];
const BAR_NOTE =
  'Bars are counted in 6 m lengths (as the workbook does) and rounded up to whole bars. Bar diameter affects only the price line; the workbook factors do not change with diameter.';
const DISCLAIMER = 'Workbook-based quantities, not structural design. Verify bar sizes, spacing, laps, and details with the structural engineer.';

function diameter(values: EstimateValues, key: string): string | undefined {
  const value = values[key];
  return DIAMETERS.includes(value ?? '') ? value : undefined;
}

function tie(quantity: number, decimals: 0 | 1): MaterialTakeoffItem {
  return { ...TIE_WIRE, quantity: decimals === 1 ? quantity : roundUp(quantity) };
}

function result(
  measure: ConstructionTakeoff['measure'],
  items: MaterialTakeoffItem[],
  assumptions: string[],
  warnings?: string[]
): ConstructionTakeoff | undefined {
  const nonEmpty = items.filter((item) => item.quantity > 0);
  if (nonEmpty.length === 0 || !finiteItems(nonEmpty)) return undefined;
  return { measure, items: nonEmpty, assumptions: [...assumptions, BAR_NOTE, DISCLAIMER], warnings };
}

/** Longest steel quantity helper: bars per beam group. */
function beamBars(
  values: EstimateValues,
  prefix: 'top' | 'web' | 'bottom'
): { continuous: number; nonContinuous: number; size: string } | undefined {
  const continuous = wholeNonNegative(values, `${prefix}Continuous`) ?? (values[`${prefix}Continuous`]?.trim() === '' ? 0 : undefined);
  const nonContinuous =
    prefix === 'web'
      ? 0
      : wholeNonNegative(values, `${prefix}NonContinuous`) ??
        (values[`${prefix}NonContinuous`]?.trim() === '' ? 0 : undefined);
  const size = diameter(values, `${prefix}Size`);
  if (continuous === undefined || nonContinuous === undefined || size === undefined) return undefined;
  return { continuous, nonContinuous, size };
}

export function calculateReinforcementTakeoff(
  calculator: string,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  if (calculator === 'chb-rebar') {
    const height = positive(values, 'height');
    const length = positive(values, 'length');
    const openings = optionalNonNegative(values, 'openings');
    const vertical = CHB_VERTICAL_FACTORS[values.verticalSpacing ?? ''];
    const horizontal = CHB_HORIZONTAL_FACTORS[values.layers ?? ''];
    const vDia = diameter(values, 'verticalDiameter');
    const hDia = diameter(values, 'horizontalDiameter');
    if (!height || !length || openings === undefined || !vertical || !horizontal || !vDia || !hDia) {
      return undefined;
    }
    const area = height * length - openings;
    if (area <= 0) return undefined;
    const items: MaterialTakeoffItem[] = [];
    addItem(items, rebarItem(vDia, roundUp((area * vertical) / 6)));
    const horizontalBars = rebarItem(hDia, roundUp((area * horizontal) / 6));
    if (hDia === vDia) addItem(items, horizontalBars);
    else items.push(horizontalBars);
    items.push(tie(roundUpToTenth(area * 0.047), 1));
    return result({ label: 'Net wall area', value: area, unit: 'm²' }, items, [
      `Workbook factors: vertical bars ${vertical} m per m² of wall (${values.verticalSpacing} cm spacing) and horizontal bars ${horizontal} m per m² (${values.layers} layers).`,
      'Tie wire: 0.047 kg per m² of wall, rounded up to 0.1 kg.',
    ]);
  }

  if (calculator === 'footing-matting') {
    const length = positive(values, 'length');
    const width = positive(values, 'width');
    const alongL = wholePositive(values, 'barsAlongLength');
    const alongW = wholePositive(values, 'barsAlongWidth');
    const footings = wholePositive(values, 'quantity');
    const dia = diameter(values, 'barDiameter');
    if (!length || !width || !alongL || !alongW || !footings || !dia) return undefined;
    const bars = roundUp((length * alongL * footings) / 6 + (width * alongW * footings) / 6);
    const items = [rebarItem(dia, bars), tie(roundUpToTenth((alongL * alongW * 0.4 * footings) / 53), 1)];
    return result({ label: 'Footings', value: footings, unit: 'pcs' }, items, [
      'Workbook bars: (length × bars along length + width × bars along width) × footings ÷ 6 m. The workbook leaves this count fractional; it is rounded up here.',
      'The workbook computes clear-cover lengths but does not use them in the bar count, so clear cover is not an input here.',
      'Tie wire: bars along length × bars along width × 0.4 m × footings ÷ 53, rounded up to 0.1 kg.',
    ]);
  }

  if (calculator === 'wall-footing-rebar') {
    const width = positive(values, 'width');
    const length = positive(values, 'length');
    const spacing = positive(values, 'tieSpacing');
    const dia = diameter(values, 'barDiameter');
    if (!width || !length || !spacing || !dia) return undefined;
    const ties = roundUp(length / spacing + 1);
    const horizontals = roundUp((2 * length) / 5.5);
    const bars = roundUp((ties * width) / 6 + horizontals);
    const items = [rebarItem(dia, bars), tie(roundUpToTenth((ties * 2 * 0.4) / 53), 1)];
    return result({ label: 'Wall footing length', value: length, unit: 'm' }, items, [
      `Tie bars: length ÷ spacing + 1 = ${ties} ties, each one footing width long. Horizontal bars: two lines over the length at 5.5 m of usable bar each = ${horizontals} bars.`,
      'Bars shown are the workbook’s overall total of tie and horizontal bars, in 6 m lengths. Tie wire: 0.8 m per tie ÷ 53, rounded up to 0.1 kg.',
    ]);
  }

  if (calculator === 'rect-column-rebar' || calculator === 'circular-column-rebar') {
    const circular = calculator === 'circular-column-rebar';
    const height = positive(values, 'height');
    const count = wholePositive(values, 'quantity');
    const vDia = diameter(values, 'verticalDiameter');
    const sDia = diameter(values, 'stirrupDiameter');
    const bars = wholePositive(values, 'verticalBars');
    const spacing = positive(values, 'stirrupSpacing');
    const d1 = positive(values, circular ? 'diameter' : 'widthA');
    const d2 = circular ? 1 : positive(values, 'widthB');
    if (!height || !count || !vDia || !sDia || !bars || !spacing || !d1 || !d2) return undefined;
    const hook = END_HOOK[vDia];
    if (hook === undefined) return undefined;
    if (d1 <= 0.08 || (!circular && d2 <= 0.08)) return undefined;

    const barLength = roundUpToTenth(hook + height + Number(vDia) * 0.04);
    const stock = barLength <= 3 ? 3 : 6;
    const verticalBars = roundUp((stock * count * bars) / 6);
    const stirrupsPerColumn = circular
      ? (height + 0.2) / spacing + 10
      : roundUp((height + 0.2) / spacing + 10);

    const items: MaterialTakeoffItem[] = [];
    addItem(items, rebarItem(vDia, verticalBars));
    let tieWire: number;
    let stirrupAssumption: string;
    if (!circular) {
      const cut = roundUpToTenth(2 * (d1 - 0.08) + 2 * (d2 - 0.08) + 0.2);
      addItem(items, rebarItem(sDia, roundUp((stirrupsPerColumn * cut * count) / 6)));
      tieWire = roundUpToTenth((stirrupsPerColumn * 4 * 0.3 * count) / 53);
      stirrupAssumption = `Stirrup cut length ${cut} m = 2 × (D1 − 0.08) + 2 × (D2 − 0.08) + 0.2, with ${stirrupsPerColumn} stirrups per column.`;
    } else if (values.stirrupType === 'spiral') {
      const cut = roundUpToTenth((d1 - 0.08) * 3.1416);
      addItem(items, rebarItem(sDia, roundUp((cut * stirrupsPerColumn * count) / 5.5)));
      tieWire = roundUpToTenth((stirrupsPerColumn * count * bars * 0.3) / 53);
      stirrupAssumption = `Spiral loop cut length ${cut} m = (D − 0.08) × 3.1416, with ${stirrupsPerColumn.toFixed(1)} loops per column, bars at 5.5 m usable length.`;
    } else {
      const cut = roundUpToTenth((d1 - 0.08) * 3.1416 + Number(sDia) * 0.001 * 6 * 2);
      addItem(items, rebarItem(sDia, roundUp((stirrupsPerColumn * cut * count) / 6)));
      tieWire = roundUpToTenth((stirrupsPerColumn * bars * 0.3 * count) / 53);
      stirrupAssumption = `Circular tie cut length ${cut} m = (D − 0.08) × 3.1416 + 12 × stirrup diameter, with ${stirrupsPerColumn.toFixed(1)} ties per column.`;
    }
    items.push(tie(tieWire, 1));

    return result(
      { label: circular ? 'Circular columns' : 'Rectangular columns', value: count, unit: 'pcs' },
      items,
      [
        `Each vertical bar must be at least ${barLength} m: end hook ${hook} m + column height + 0.04 × bar diameter. Bars up to 3 m are cut two per 6 m bar; longer bars use whole 6 m bars.`,
        stirrupAssumption,
        'Stirrups per column = (height + 0.2) ÷ spacing + 10. Tie wire per the workbook factors, rounded up to 0.1 kg.',
        'Vertical bar diameters follow the workbook: 12, 16, 20, or 25 mm.',
      ]
    );
  }

  if (calculator === 'beam-one-bay' || calculator === 'beam-two-bays') {
    const twoBay = calculator === 'beam-two-bays';
    const l1 = positive(values, twoBay ? 'length1' : 'length');
    const l2 = twoBay ? positive(values, 'length2') : 0;
    const width = positive(values, 'width');
    const depth = positive(values, 'depth');
    const column = positive(values, 'columnWidth');
    const sDia = diameter(values, 'stirrupDiameter');
    const spacing = positive(values, 'stirrupSpacing');
    const top = beamBars(values, 'top');
    const web = beamBars(values, 'web');
    const bottom = beamBars(values, 'bottom');
    if (!l1 || l2 === undefined || (twoBay && !l2) || !width || !depth || !column || !sDia || !spacing || !top || !web || !bottom) {
      return undefined;
    }
    if (depth <= 0.08 || width <= 0.08) return undefined;
    const counts = top.continuous + top.nonContinuous + web.continuous + bottom.continuous + bottom.nonContinuous;
    if (counts === 0) return undefined;

    let topBars: number;
    let webBars: number;
    let bottomBars: number;
    let stirrups: number;
    let tieWire: number;
    const assumptions: string[] = [];
    const warnings: string[] = [];

    if (!twoBay) {
      const continuousLength = l1 + ((column / 2 - 0.08) * 2) + (depth - 0.08) * 2;
      topBars =
        roundUp((continuousLength * top.continuous) / 6) +
        roundUp(((((l1 / 4 + 0.1) + column / 2 + (depth - 0.08)) * 2) * top.nonContinuous) / 6);
      webBars = roundUp(((l1 + (column - 0.08)) * web.continuous) / 6);
      bottomBars =
        roundUp((continuousLength * bottom.continuous) / 6) +
        roundUp(((l1 - 0.15 * l1 * 2) * bottom.nonContinuous) / 6);
      stirrups = roundUp(((l1 / spacing + 10) * ((width - 0.08) * 2 + (depth - 0.08) * 2 + 0.2)) / 6);
      tieWire = roundUpToTenth((counts * (l1 / column + 10) * 0.3) / 53);
      assumptions.push(
        'One bay between two beams (under 6 m). Continuous bars run the clear length plus column and depth allowances; non-continuous top bars use a quarter span plus 0.1 m; non-continuous bottom bars use 70% of the span.',
        'Stirrups = (length ÷ spacing + 10) × stirrup perimeter ÷ 6 m, rounded up. Tie wire = bars × (length ÷ column width + 10) × 0.3 m ÷ 53.'
      );
    } else {
      const eff = (size: string) => 6 - Number(size) * 0.04;
      const continuousLength = l1 + l2 + (column - 0.08) + (depth - 0.08) * 2;
      topBars =
        roundUp((continuousLength * top.continuous) / eff(top.size)) +
        roundUp(
          (((l1 / 4 + (column / 2 - 0.08) + (depth - 0.08)) +
            (l1 / 4 + 0.1) +
            (l2 / 4 + 0.1) +
            ((l2 / 4 + 0.1) + (column / 2 - 0.08) + (depth - 0.08))) *
            top.nonContinuous) /
            eff(top.size)
        );
      webBars = roundUp(((l2 + l1 + column) * web.continuous) / eff(web.size));
      bottomBars =
        roundUp((continuousLength * bottom.continuous) / eff(bottom.size)) +
        roundUp(
          (((l1 - 0.3 * l1 + 0.2) + (l2 - 0.3 * l2 + 0.2)) * bottom.nonContinuous) / eff(bottom.size)
        );
      stirrups = roundUp(
        ((((l1 + l2) / spacing) + 12) * ((depth - 0.08) + (width - 0.08)) * 2) / 6
      );
      tieWire = roundUpToTenth(((((l1 + l2) / spacing) + 12) * counts * 0.3) / 53);
      assumptions.push(
        'Two bays of a continuous beam. Usable bar length is 6 m less 0.04 m per mm of diameter (lap allowance).',
        'Corrected from the workbook: its stirrup count refers to blank cells, so this uses the total beam length (L1 + L2) ÷ stirrup spacing + 12 with the workbook’s stirrup perimeter; and its non-continuous bottom bar count did not multiply by the number of bars entered, so it does here.'
      );
      warnings.push('Two-bay stirrup and non-continuous bottom bar counts correct apparent workbook errors. Confirm against your source before ordering.');
    }

    const items: MaterialTakeoffItem[] = [];
    if (topBars > 0) addItem(items, rebarItem(top.size, topBars));
    if (webBars > 0) addItem(items, rebarItem(web.size, webBars));
    if (bottomBars > 0) {
      addItem(items, rebarItem(bottom.size, bottomBars));
    }
    addItem(items, rebarItem(sDia, stirrups));
    items.push(tie(tieWire, 1));
    return result(
      { label: twoBay ? 'Total beam length' : 'Beam length', value: l1 + l2, unit: 'm' },
      items,
      assumptions,
      warnings
    );
  }

  if (calculator === 'slab-one-way' || calculator === 'slab-two-way') {
    const table = calculator === 'slab-one-way' ? ONE_WAY_SLAB : TWO_WAY_SLAB;
    const length = positive(values, 'length');
    const width = positive(values, 'width');
    const factor = table[values.spacing ?? ''];
    const dia = diameter(values, 'barDiameter');
    if (!length || !width || !factor || !dia) return undefined;
    const area = length * width;
    const items = [rebarItem(dia, roundUp(area * factor.bars)), tie(area * factor.tie, 0)];
    return result({ label: 'Slab area', value: area, unit: 'm²' }, items, [
      `Workbook factors for ${values.spacing} cm bar spacing: ${factor.bars} bars (6 m) and ${factor.tie} kg of #16 tie wire per m² of slab.`,
      'Bars and tie wire are each rounded up to whole units.',
      calculator === 'slab-two-way' ? 'Two-way slab table from the workbook.' : 'One-way slab table from the workbook.',
    ]);
  }

  if (calculator === 'ground-slab-rebar') {
    const length = positive(values, 'length');
    const width = positive(values, 'width');
    const spacingW = positive(values, 'spacingAlongWidth');
    const spacingL = positive(values, 'spacingAlongLength');
    const dia = diameter(values, 'barDiameter');
    if (!length || !width || !spacingW || !spacingL || !dia) return undefined;
    const parallelToLength = roundUp((((width / (spacingW / 100)) + 1) * length) / 5.5);
    const parallelToWidth = roundUp((((length / (spacingL / 100)) + 1) * width) / 5.5);
    const bars = parallelToLength + parallelToWidth;
    const items = [rebarItem(dia, bars), tie((parallelToLength * parallelToWidth * 0.3) / 53, 0)];
    const warnings =
      spacingW <= 25 || spacingL <= 25
        ? ['This workbook method is for bar spacing over 25 cm. Use the one-way or two-way slab calculator for closer spacing.']
        : undefined;
    return result({ label: 'Slab area', value: length * width, unit: 'm²' }, items, [
      'Reinforced ground slab, bar spacing over 25 cm. Bars parallel to each side = (other side ÷ spacing + 1) × side length ÷ 5.5 m usable bar, rounded up.',
      'Tie wire follows the workbook: bar count parallel to length × bar count parallel to width × 0.3 m ÷ 53, rounded up to whole kilograms. This may be a high figure; compare with your own count of bar crossings.',
    ], warnings);
  }

  if (calculator === 'stairs-rebar') {
    const riser = positive(values, 'riser');
    const tread = positive(values, 'tread');
    const width = positive(values, 'width');
    const steps = wholePositive(values, 'steps');
    const stepSpacing = positive(values, 'stepSpacing');
    const stringerSpacing = positive(values, 'stringerSpacing');
    const latDia = diameter(values, 'lateralDiameter');
    const horDia = diameter(values, 'horizontalDiameter');
    if (!riser || !tread || !width || !steps || !stepSpacing || !stringerSpacing || !latDia || !horDia) {
      return undefined;
    }
    const stringerLength = Math.sqrt(tread * tread + riser * riser);
    const stepLateral = roundUp(((((riser + tread + 0.0125) * steps) + 1.2) * (width / stepSpacing + 1)) / 5.5);
    const stepHorizontal = roundUp(((width * 2 + width) * steps) / 6);
    const stringerLateral = roundUp((((stringerLength * steps) + 1.2) * (width / stringerSpacing + 1)) / 5.5);
    const stringerHorizontal = roundUp((width * steps + width) / 6);
    const items: MaterialTakeoffItem[] = [];
    addItem(items, { ...rebarItem(latDia, stepLateral + stringerLateral) });
    addItem(items, { ...rebarItem(horDia, stepHorizontal + stringerHorizontal) });
    items.push(tie((steps * (width / stepSpacing + 1) * 3 * 0.3) / 53, 0));
    return result({ label: 'Steps', value: steps, unit: 'steps' }, items, [
      `Steps: ${stepLateral} lateral and ${stepHorizontal} horizontal bars. Stringer: ${stringerLateral} lateral and ${stringerHorizontal} horizontal bars.`,
      'The workbook sets separate bar diameters for steps and stringer; this estimate uses one lateral and one horizontal diameter for both.',
      'Dowels for lateral bars are already included in the workbook estimates. For stair landings, use a slab reinforcement calculator.',
      'Tie wire: steps × (width ÷ spacing + 1) × 3 × 0.3 m ÷ 53, rounded up to whole kilograms.',
    ]);
  }

  return undefined;
}
