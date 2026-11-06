import type { EstimateModule } from '@/utils/construction-estimate';

import { MORE_MODULES } from './calculators-more';
import {
  choiceField,
  numberField,
  type CalculatorDefinition,
  type Choice,
  type FieldDefinition,
  type ModuleDefinition,
} from './field-helpers';

export type { CalculatorDefinition, Choice, FieldDefinition, ModuleDefinition };

const MIX_CHOICES: readonly Choice[] = [
  { value: 'AA', label: 'AA · 1:1.5:3' },
  { value: 'A', label: 'A · 1:2:4' },
  { value: 'B', label: 'B · 1:3:6' },
];

export const MODULES: Record<EstimateModule, ModuleDefinition> = {
  ...MORE_MODULES,
  concrete: {
    label: 'Concreting',
    title: 'Concreting Works',
    detail: 'Footings, slabs, columns, beams and stairs',
    icon: 'concrete',
    calculators: [
      {
        id: 'footing',
        label: 'Footing',
        description: 'Rectangular pad footing with a quantity of identical units.',
        fields: [
          numberField('length', 'Length', 'm'),
          numberField('width', 'Width', 'm'),
          numberField('thickness', 'Thickness', 'm'),
          numberField('quantity', 'Number of footings', 'pcs', '1', 'number-pad'),
        ],
      },
      {
        id: 'wall-footing',
        label: 'Wall footing',
        description: 'Continuous rectangular footing measured by total length.',
        fields: [
          numberField('length', 'Total length', 'm'),
          numberField('width', 'Width', 'm'),
          numberField('thickness', 'Thickness', 'm'),
        ],
      },
      {
        id: 'floor-slab',
        label: 'Floor slab · dimensions',
        description: 'Slab volume from length, width, and thickness.',
        fields: [
          numberField('length', 'Length', 'm'),
          numberField('width', 'Width', 'm'),
          numberField('thickness', 'Thickness', 'm'),
          choiceField('mixClass', 'Concrete class · reference mix', MIX_CHOICES, 'A'),
        ],
      },
      {
        id: 'floor-slab-area',
        label: 'Floor slab · area',
        description: 'Slab volume from a known floor area and thickness.',
        fields: [
          numberField('area', 'Floor area', 'm²'),
          numberField('thickness', 'Thickness', 'm'),
          choiceField('mixClass', 'Concrete class · reference mix', MIX_CHOICES, 'B'),
        ],
      },
      {
        id: 'rectangular-column',
        label: 'Rectangular column',
        description: 'Rectangular columns with matching dimensions and height.',
        fields: [
          numberField('height', 'Column height', 'm'),
          numberField('widthA', 'Dimension A', 'm'),
          numberField('widthB', 'Dimension B', 'm'),
          numberField('quantity', 'Number of columns', 'pcs', '1', 'number-pad'),
        ],
      },
      {
        id: 'circular-column',
        label: 'Circular column',
        description: 'Cylindrical columns with matching diameter and height.',
        fields: [
          numberField('height', 'Column height', 'm'),
          numberField('diameter', 'Diameter', 'm'),
          numberField('quantity', 'Number of columns', 'pcs', '1', 'number-pad'),
        ],
      },
      {
        id: 'beam',
        label: 'Beam',
        description: 'Rectangular concrete beam measured by total length.',
        fields: [
          numberField('length', 'Total length', 'm'),
          numberField('width', 'Width', 'm'),
          numberField('depth', 'Depth', 'm'),
        ],
      },
      {
        id: 'stairs',
        label: 'Concrete stairs',
        description: 'Step wedges plus one sloping stringer volume.',
        fields: [
          numberField('riser', 'Riser height', 'm'),
          numberField('tread', 'Tread run', 'm'),
          numberField('width', 'Stair width', 'm'),
          numberField('steps', 'Number of steps', 'steps', '', 'number-pad'),
          numberField('stringerThickness', 'Stringer thickness', 'm'),
        ],
      },
    ],
  },
  masonry: {
    label: 'Masonry',
    title: 'Masonry Works',
    detail: 'CHB walls, mortar, plaster and riprap',
    icon: 'masonry',
    calculators: [
      {
        id: 'chb-wall',
        label: 'CHB wall',
        description: 'Hollow-block count from net wall area, openings, and breakage allowance.',
        fields: [
          numberField('height', 'Wall height', 'm'),
          numberField('length', 'Wall length', 'm'),
          numberField('windowArea', 'Window openings', 'm²', '0'),
          numberField('doorArea', 'Door openings', 'm²', '0'),
          numberField('breakage', 'Breakage allowance', '%', '5'),
        ],
      },
      {
        id: 'wall-mortar',
        label: 'CHB mortar',
        description: 'Cement and screened sand for mortar by block thickness.',
        fields: [
          numberField('height', 'Wall height', 'm'),
          numberField('length', 'Wall length', 'm'),
          numberField('windowArea', 'Window openings', 'm²', '0'),
          numberField('doorArea', 'Door openings', 'm²', '0'),
          choiceField(
            'blockSize',
            'CHB thickness',
            [
              { value: '4', label: '4 in' },
              { value: '6', label: '6 in' },
            ],
            '4'
          ),
        ],
      },
      {
        id: 'wall-plaster',
        label: 'Wall plaster',
        description: 'Materials for a nominal 16 mm plaster layer on one or both faces.',
        fields: [
          numberField('height', 'Wall height', 'm'),
          numberField('length', 'Wall length', 'm'),
          numberField('windowArea', 'Window openings', 'm²', '0'),
          numberField('doorArea', 'Door openings', 'm²', '0'),
          choiceField(
            'faces',
            'Faces to plaster',
            [
              { value: '1', label: 'One face' },
              { value: '2', label: 'Two faces' },
            ],
            '1'
          ),
        ],
      },
      {
        id: 'riprap',
        label: 'Riprap',
        description: 'Trapezoidal side section along a measured length.',
        fields: [
          numberField('height', 'Riprap height', 'm'),
          numberField('widthA', 'Top width', 'm'),
          numberField('widthB', 'Bottom width', 'm'),
          numberField('length', 'Total length', 'm'),
        ],
      },
    ],
  },
};

export const MODULE_ORDER: readonly EstimateModule[] = [
  'concrete',
  'masonry',
  'reinforcement',
  'carpentry',
  'roofing',
  'tiling',
  'painting',
  'forms',
];

export function isModule(value: string | undefined): value is EstimateModule {
  return MODULE_ORDER.some((module) => module === value);
}

export function findCalculator(
  module: EstimateModule,
  id: string | undefined
): CalculatorDefinition | undefined {
  return MODULES[module].calculators.find((calculator) => calculator.id === id);
}

export function getInitialValues(fields: readonly FieldDefinition[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, field.initialValue ?? '']));
}
