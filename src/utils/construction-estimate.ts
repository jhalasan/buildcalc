import { calculateCarpentryTakeoff } from './estimate-carpentry';
import { calculateFinishesTakeoff } from './estimate-finishes';
import { calculateFormsTakeoff } from './estimate-forms';
import { calculateReinforcementTakeoff } from './estimate-reinforcement';
import { calculateRoofingTakeoff } from './estimate-roofing';

export type EstimateModule =
  | 'concrete'
  | 'masonry'
  | 'reinforcement'
  | 'carpentry'
  | 'roofing'
  | 'tiling'
  | 'painting'
  | 'forms';

export type CalculatorId =
  | 'footing'
  | 'wall-footing'
  | 'floor-slab'
  | 'floor-slab-area'
  | 'rectangular-column'
  | 'circular-column'
  | 'beam'
  | 'stairs'
  | 'chb-wall'
  | 'wall-mortar'
  | 'wall-plaster'
  | 'riprap'
  | 'chb-rebar'
  | 'footing-matting'
  | 'wall-footing-rebar'
  | 'rect-column-rebar'
  | 'circular-column-rebar'
  | 'beam-one-bay'
  | 'beam-two-bays'
  | 'slab-one-way'
  | 'slab-two-way'
  | 'ground-slab-rebar'
  | 'stairs-rebar'
  | 'lumber-board-feet'
  | 'round-log'
  | 'studs-joists'
  | 'plywood-covering'
  | 'roof-two-sheets'
  | 'roof-three-sheets'
  | 'roof-accessories'
  | 'tile-area'
  | 'paint-area'
  | 'column-forms'
  | 'beam-forms'
  | 'staging';

export type EstimateValues = Readonly<Record<string, string>>;

export type MaterialTakeoffItem = {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  unitPriceLabel: string;
  wastageAllowed?: boolean;
  /** One-line statement of how the quantity is worked out, shown beside the material. */
  basis?: string;
};

export type EstimateMeasure = {
  label: string;
  value: number;
  unit: string;
};

export type ConstructionTakeoff = {
  measure: EstimateMeasure;
  items: MaterialTakeoffItem[];
  assumptions: string[];
  /** Non-blocking cautions from the workbook's own checks. */
  warnings?: string[];
};

type ConcreteMixClass = 'AA' | 'A' | 'B';

const CONCRETE_MIX_FACTORS: Record<ConcreteMixClass, { bagsPerCubicMetre: number; ratio: string }> = {
  AA: { bagsPerCubicMetre: 12, ratio: '1:1.5:3' },
  A: { bagsPerCubicMetre: 9, ratio: '1:2:4' },
  B: { bagsPerCubicMetre: 7.5, ratio: '1:3:6' },
};

function readNumber(values: EstimateValues, key: string): number | undefined {
  const raw = values[key];
  if (raw === undefined || raw.trim() === '') return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function positive(values: EstimateValues, key: string): number | undefined {
  const value = readNumber(values, key);
  return value !== undefined && value > 0 ? value : undefined;
}

function nonNegative(values: EstimateValues, key: string): number | undefined {
  const value = readNumber(values, key);
  return value !== undefined && value >= 0 ? value : undefined;
}

function optionalNonNegative(values: EstimateValues, key: string): number | undefined {
  const raw = values[key];
  if (raw === undefined || raw.trim() === '') return 0;
  return nonNegative(values, key);
}

function wholePositive(values: EstimateValues, key: string): number | undefined {
  const value = positive(values, key);
  return value !== undefined && Number.isInteger(value) ? value : undefined;
}

function roundUp(value: number): number {
  return Math.ceil(value - 1e-10);
}

function roundUpToTenth(value: number): number {
  return Math.ceil(value * 10 - 1e-10) / 10;
}

function hasFiniteQuantities(items: readonly MaterialTakeoffItem[]): boolean {
  return items.every((item) => Number.isFinite(item.quantity) && item.quantity >= 0);
}

export function applyWastageAllowance(
  item: MaterialTakeoffItem,
  wastagePercent: number
): number | undefined {
  if (
    item.wastageAllowed === false ||
    !Number.isFinite(wastagePercent) ||
    wastagePercent < 0
  ) {
    return undefined;
  }

  const quantity = item.quantity * (1 + wastagePercent / 100);
  if (!Number.isFinite(quantity)) return undefined;
  return item.unit === 'bags' || item.unit === 'pcs' || item.unit === 'gal'
    ? roundUp(quantity)
    : quantity;
}

function concreteMix(values: EstimateValues): ConcreteMixClass | undefined {
  const value = values.mixClass;
  return value === 'AA' || value === 'A' || value === 'B' ? value : undefined;
}

function concreteMaterials(volume: number, mixClass: ConcreteMixClass): MaterialTakeoffItem[] {
  const mix = CONCRETE_MIX_FACTORS[mixClass];
  return [
    {
      id: 'cement-bag',
      label: 'Cement',
      quantity: roundUp(volume * mix.bagsPerCubicMetre),
      basis: 'Concrete volume × bags per m³ for the mix class, rounded up',
      unit: 'bags',
      unitPriceLabel: 'Cement · per 50 kg bag',
    },
    {
      id: 'sand-cubic-metre',
      label: 'Sand',
      quantity: roundUpToTenth(volume * 0.5),
      basis: 'Concrete volume × 0.5, rounded up to 0.1 m³',
      unit: 'm³',
      unitPriceLabel: 'Sand · per m³',
    },
    {
      id: 'gravel-cubic-metre',
      label: '3/4 in gravel',
      quantity: roundUpToTenth(volume),
      basis: 'Concrete volume × 1, rounded up to 0.1 m³',
      unit: 'm³',
      unitPriceLabel: 'Gravel · per m³',
    },
  ];
}

function calculateConcreteTakeoff(
  calculator: CalculatorId,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  let volume: number | undefined;
  let mixClass: ConcreteMixClass = 'A';

  switch (calculator) {
    case 'footing': {
      const length = positive(values, 'length');
      const width = positive(values, 'width');
      const thickness = positive(values, 'thickness');
      const quantity = wholePositive(values, 'quantity');
      if (length === undefined || width === undefined || thickness === undefined || quantity === undefined) {
        return undefined;
      }
      volume = length * width * thickness * quantity;
      break;
    }
    case 'wall-footing': {
      const length = positive(values, 'length');
      const width = positive(values, 'width');
      const thickness = positive(values, 'thickness');
      if (length === undefined || width === undefined || thickness === undefined) return undefined;
      volume = length * width * thickness;
      break;
    }
    case 'floor-slab': {
      const length = positive(values, 'length');
      const width = positive(values, 'width');
      const thickness = positive(values, 'thickness');
      const selectedMix = concreteMix(values);
      if (length === undefined || width === undefined || thickness === undefined || selectedMix === undefined) {
        return undefined;
      }
      mixClass = selectedMix;
      volume = length * width * thickness;
      break;
    }
    case 'floor-slab-area': {
      const area = positive(values, 'area');
      const thickness = positive(values, 'thickness');
      const selectedMix = concreteMix(values);
      if (area === undefined || thickness === undefined || selectedMix === undefined) return undefined;
      mixClass = selectedMix;
      volume = area * thickness;
      break;
    }
    case 'rectangular-column': {
      const height = positive(values, 'height');
      const widthA = positive(values, 'widthA');
      const widthB = positive(values, 'widthB');
      const quantity = wholePositive(values, 'quantity');
      if (height === undefined || widthA === undefined || widthB === undefined || quantity === undefined) {
        return undefined;
      }
      volume = height * widthA * widthB * quantity;
      break;
    }
    case 'circular-column': {
      const height = positive(values, 'height');
      const diameter = positive(values, 'diameter');
      const quantity = wholePositive(values, 'quantity');
      if (height === undefined || diameter === undefined || quantity === undefined) return undefined;
      volume = (Math.PI * diameter * diameter * height * quantity) / 4;
      break;
    }
    case 'beam': {
      const length = positive(values, 'length');
      const width = positive(values, 'width');
      const depth = positive(values, 'depth');
      if (length === undefined || width === undefined || depth === undefined) return undefined;
      volume = length * width * depth;
      break;
    }
    case 'stairs': {
      const riser = positive(values, 'riser');
      const tread = positive(values, 'tread');
      const width = positive(values, 'width');
      const steps = wholePositive(values, 'steps');
      const stringerThickness = positive(values, 'stringerThickness');
      if (
        riser === undefined ||
        tread === undefined ||
        width === undefined ||
        steps === undefined ||
        stringerThickness === undefined
      ) {
        return undefined;
      }
      const stepsVolume = ((riser * tread) / 2) * width * steps;
      const stringerVolume =
        Math.sqrt(riser * riser + tread * tread) * steps * width * stringerThickness;
      volume = stepsVolume + stringerVolume;
      break;
    }
    default:
      return undefined;
  }

  if (volume === undefined || !Number.isFinite(volume) || volume <= 0) return undefined;

  const mix = CONCRETE_MIX_FACTORS[mixClass];
  const assumptions = [
    `Concrete class ${mixClass} · nominal mix ${mix.ratio}.`,
    `${mix.bagsPerCubicMetre} cement bags per m³; sand 0.5 m³ and gravel 1 m³ per m³ of concrete.`,
    'Sand and gravel estimates are rounded up to 0.1 m³; quantities are workbook-based estimates, not a mix-design specification.',
  ];
  const items = concreteMaterials(volume, mixClass);
  if (!hasFiniteQuantities(items)) return undefined;

  return {
    measure: { label: 'Concrete volume', value: volume, unit: 'm³' },
    items,
    assumptions,
  };
}

function wallArea(values: EstimateValues): number | undefined {
  const height = positive(values, 'height');
  const length = positive(values, 'length');
  const windowArea = optionalNonNegative(values, 'windowArea');
  const doorArea = optionalNonNegative(values, 'doorArea');
  if (
    height === undefined ||
    length === undefined ||
    windowArea === undefined ||
    doorArea === undefined
  ) {
    return undefined;
  }
  const netArea = height * length - windowArea - doorArea;
  return netArea > 0 ? netArea : undefined;
}

function calculateMasonryTakeoff(
  calculator: CalculatorId,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  if (calculator === 'chb-wall') {
    const area = wallArea(values);
    const breakage = nonNegative(values, 'breakage');
    if (area === undefined || breakage === undefined) return undefined;
    const blockCount = roundUp(area * 12.5 * (1 + breakage / 100));
    if (!Number.isFinite(blockCount)) return undefined;
    return {
      measure: { label: 'Net wall area', value: area, unit: 'm²' },
      items: [
        {
          id: 'chb-piece',
          label: 'Concrete hollow blocks',
          quantity: blockCount,
          basis: 'Net wall area × 12.5 blocks per m² × (1 + breakage %), rounded up',
          unit: 'pcs',
          unitPriceLabel: 'CHB · per piece',
          wastageAllowed: false,
        },
      ],
      assumptions: [
        'CHB allowance is 12.5 blocks per net wall m², plus the entered breakage allowance.',
        'Net wall area subtracts window and door openings. Block size and mortar joints can change actual coverage.',
      ],
    };
  }

  if (calculator === 'wall-mortar') {
    const area = wallArea(values);
    const blockSize = values.blockSize;
    if (area === undefined || (blockSize !== '4' && blockSize !== '6')) return undefined;
    const cementFactor = blockSize === '4' ? 0.525 : 1.013;
    const sandFactor = blockSize === '4' ? 0.0438 : 0.0844;
    const items: MaterialTakeoffItem[] = [
      {
        id: 'cement-bag',
        label: 'Cement',
        quantity: roundUp(area * cementFactor),
        basis: 'Net wall area × cement factor for the block size, rounded up',
        unit: 'bags',
        unitPriceLabel: 'Cement · per 50 kg bag',
      },
      {
        id: 'sand-cubic-metre',
        label: 'Screened sand',
        quantity: roundUpToTenth(area * sandFactor),
        basis: 'Net wall area × sand factor for the block size, rounded up to 0.1 m³',
        unit: 'm³',
        unitPriceLabel: 'Sand · per m³',
      },
    ];
    if (!hasFiniteQuantities(items)) return undefined;
    return {
      measure: { label: 'Net wall area', value: area, unit: 'm²' },
      items,
      assumptions: [
        `Mortar factors are from the workbook's ${blockSize}-in CHB estimate.`,
        'Cement bags are rounded up to whole bags; sand is rounded up to 0.1 m³. Confirm these empirical factors against the selected block and mortar specification.',
      ],
    };
  }

  if (calculator === 'wall-plaster') {
    const area = wallArea(values);
    const faces = values.faces;
    if (area === undefined || (faces !== '1' && faces !== '2')) return undefined;
    const faceCount = Number(faces);
    const items: MaterialTakeoffItem[] = [
      {
        id: 'cement-bag',
        label: 'Cement',
        quantity: roundUp(area * faceCount * 0.288),
        basis: 'Net wall area × faces × 0.288 bag per m², rounded up',
        unit: 'bags',
        unitPriceLabel: 'Cement · per 50 kg bag',
      },
      {
        id: 'fine-sand-cubic-metre',
        label: 'Fine sand',
        quantity: roundUpToTenth(area * faceCount * 0.016),
        basis: 'Net wall area × faces × 0.016 m³ per m², rounded up to 0.1 m³',
        unit: 'm³',
        unitPriceLabel: 'Fine sand · per m³',
      },
    ];
    if (!hasFiniteQuantities(items)) return undefined;
    return {
      measure: { label: 'Net wall area', value: area * faceCount, unit: 'm²' },
      items,
      assumptions: [
        'Plaster factors are for a nominal 16 mm layer and a 1:2 mix, as listed in the workbook.',
        'The estimate applies the selected one or two faces to net wall area; confirm finish thickness and material factors for the project.',
      ],
    };
  }

  if (calculator === 'riprap') {
    const height = positive(values, 'height');
    const widthA = positive(values, 'widthA');
    const widthB = positive(values, 'widthB');
    const length = positive(values, 'length');
    if (height === undefined || widthA === undefined || widthB === undefined || length === undefined) {
      return undefined;
    }
    const sideArea = ((widthA + widthB) / 2) * height;
    const volume = sideArea * length;
    if (!Number.isFinite(volume) || volume <= 0) return undefined;
    const items: MaterialTakeoffItem[] = [
      {
        id: 'boulder-cubic-metre',
        label: 'Boulders',
        quantity: volume,
        basis: 'Average section width × height × length',
        unit: 'm³',
        unitPriceLabel: 'Boulders · per m³',
      },
      {
        id: 'cement-bag',
        label: 'Cement',
        quantity: roundUp(volume * 2.574),
        basis: 'Volume × 2.574 bags per m³, rounded up',
        unit: 'bags',
        unitPriceLabel: 'Cement · per 50 kg bag',
      },
      {
        id: 'sand-cubic-metre',
        label: 'Sand',
        quantity: roundUpToTenth(volume * 0.143),
        basis: 'Volume × 0.143 m³ per m³, rounded up to 0.1 m³',
        unit: 'm³',
        unitPriceLabel: 'Sand · per m³',
      },
    ];
    if (!hasFiniteQuantities(items)) return undefined;
    return {
      measure: { label: 'Riprap volume', value: volume, unit: 'm³' },
      items,
      assumptions: [
        'Uses a trapezoidal side section: average of the two entered widths × height × length.',
        'Workbook factors: boulders equal to calculated volume, 2.574 cement bags/m³, and 0.143 m³ sand/m³.',
        'The workbook describes 15–25 kg stones, with at least half weighing more than 20 kg. Verify stone grading and the Class A mix for the project.',
      ],
    };
  }

  return undefined;
}

export function calculateConstructionTakeoff(
  module: EstimateModule,
  calculator: CalculatorId,
  values: EstimateValues
): ConstructionTakeoff | undefined {
  switch (module) {
    case 'concrete':
      return calculateConcreteTakeoff(calculator, values);
    case 'masonry':
      return calculateMasonryTakeoff(calculator, values);
    case 'reinforcement':
      return calculateReinforcementTakeoff(calculator, values);
    case 'carpentry':
      return calculateCarpentryTakeoff(calculator, values);
    case 'roofing':
      return calculateRoofingTakeoff(calculator, values);
    case 'tiling':
    case 'painting':
      return calculateFinishesTakeoff(module, calculator, values);
    case 'forms':
      return calculateFormsTakeoff(calculator, values);
  }
}
