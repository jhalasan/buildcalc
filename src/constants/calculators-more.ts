import type { EstimateModule } from '@/utils/construction-estimate';
import { PAINT_KINDS, TILE_SIZES } from '@/utils/estimate-finishes';

import {
  choiceField,
  numberField,
  withGroup,
  type Choice,
  type FieldDefinition,
  type ModuleDefinition,
} from './field-helpers';

const DIAMETER_CHOICES: readonly Choice[] = ['10', '12', '16', '20', '25'].map((value) => ({
  value,
  label: `${value} mm`,
}));
const COLUMN_DIAMETER_CHOICES = DIAMETER_CHOICES.filter((choice) => choice.value !== '10');
const SLAB_SPACING_CHOICES: readonly Choice[] = ['10', '12.5', '15', '17.5', '20', '22.2', '25'].map(
  (value) => ({ value, label: `${value} cm` })
);
const SIDE_CHOICES: readonly Choice[] = [
  { value: '1', label: 'One side' },
  { value: '2', label: 'Two sides' },
];
const ROOF_LENGTHS: readonly Choice[] = [
  { value: '8', label: '8 ft' },
  { value: '10', label: '10 ft' },
  { value: '12', label: '12 ft' },
];

const lumberFields = (): FieldDefinition[] =>
  withGroup('Purchase lumber', [
    numberField('w1', 'Thickness', 'in', '2'),
    numberField('w2', 'Width', 'in', '4'),
    numberField('lengthFt', 'Length', 'ft', '8'),
  ]);

const roofBase = (): FieldDefinition[] =>
  withGroup('Roof', [
    numberField('span', 'Span', 'm'),
    numberField('rise', 'Rise', 'm'),
    numberField('projection', 'Eave projection', 'm', '0'),
    numberField('roofWidth', 'Roofing width', 'm'),
    choiceField(
      'effectiveWidth',
      'Side lap · effective sheet width',
      [
        { value: '0.7', label: 'Lap 1.5 · 0.7 m' },
        { value: '0.6', label: 'Lap 2.5 · 0.6 m' },
      ],
      '0.7'
    ),
    choiceField(
      'sides',
      'Similar roof sides',
      [
        { value: '1', label: 'One side' },
        { value: '2', label: 'Both sides' },
      ],
      '1'
    ),
  ]);

const beamBars = (prefix: string, withNonContinuous = true): FieldDefinition[] => [
  numberField(`${prefix}Continuous`, 'Continuous bars', 'pcs', '', 'number-pad'),
  ...(withNonContinuous
    ? [numberField(`${prefix}NonContinuous`, 'Non-continuous bars', 'pcs', '', 'number-pad')]
    : []),
  choiceField(`${prefix}Size`, 'Bar size', DIAMETER_CHOICES, '12'),
];

export const MORE_MODULES: Record<Exclude<EstimateModule, 'concrete' | 'masonry'>, ModuleDefinition> = {
  reinforcement: {
    label: 'Reinforcement',
    title: 'Steel Reinforcement Works',
    detail: 'CHB walls, footings, columns, beams, slabs and stairs',
    icon: 'rebar',
    calculators: [
      {
        id: 'chb-rebar',
        label: 'CHB wall reinforcement',
        description: 'Vertical and horizontal bars and tie wire for a CHB wall.',
        fields: [
          numberField('height', 'Wall height', 'm'),
          numberField('length', 'Wall length', 'm'),
          numberField('openings', 'Wall openings', 'm²', '0'),
          choiceField(
            'verticalSpacing',
            'Vertical bar spacing',
            [
              { value: '40', label: '40 cm' },
              { value: '60', label: '60 cm' },
              { value: '80', label: '80 cm' },
            ],
            '60'
          ),
          choiceField(
            'layers',
            'Horizontal bar layers',
            [
              { value: '2', label: '2 layers' },
              { value: '3', label: '3 layers' },
              { value: '4', label: '4 layers' },
            ],
            '3'
          ),
          choiceField('verticalDiameter', 'Vertical bar size', DIAMETER_CHOICES, '10'),
          choiceField('horizontalDiameter', 'Horizontal bar size', DIAMETER_CHOICES, '10'),
        ],
      },
      {
        id: 'footing-matting',
        label: 'Footing matting',
        description: 'Two-way bar mat for a number of identical footings.',
        fields: [
          numberField('length', 'Footing length', 'm'),
          numberField('width', 'Footing width', 'm'),
          numberField('barsAlongLength', 'Bars along length', 'pcs', '', 'number-pad'),
          numberField('barsAlongWidth', 'Bars along width', 'pcs', '', 'number-pad'),
          numberField('quantity', 'Number of footings', 'pcs', '1', 'number-pad'),
          choiceField('barDiameter', 'Bar size', DIAMETER_CHOICES, '12'),
        ],
      },
      {
        id: 'wall-footing-rebar',
        label: 'Wall footing reinforcement',
        description: 'Tie bars and horizontal bars for a continuous wall footing.',
        fields: [
          numberField('width', 'Footing width', 'm'),
          numberField('length', 'Total length', 'm'),
          numberField('tieSpacing', 'Tie bar spacing', 'm', '0.4'),
          choiceField('barDiameter', 'Bar size', DIAMETER_CHOICES, '10'),
        ],
      },
      {
        id: 'rect-column-rebar',
        label: 'Rectangular column bars',
        description: 'Vertical bars, stirrups, and tie wire for rectangular columns.',
        fields: [
          ...withGroup('Column', [
            numberField('height', 'Column height', 'm'),
            numberField('quantity', 'Number of columns', 'pcs', '1', 'number-pad'),
            numberField('widthA', 'Dimension D1', 'm'),
            numberField('widthB', 'Dimension D2', 'm'),
          ]),
          ...withGroup('Vertical bars', [
            numberField('verticalBars', 'Bars per column', 'pcs', '4', 'number-pad'),
            choiceField('verticalDiameter', 'Bar size', COLUMN_DIAMETER_CHOICES, '12'),
          ]),
          ...withGroup('Stirrups', [
            numberField('stirrupSpacing', 'Spacing', 'm', '0.2'),
            choiceField('stirrupDiameter', 'Bar size', DIAMETER_CHOICES, '10'),
          ]),
        ],
      },
      {
        id: 'circular-column-rebar',
        label: 'Circular column bars',
        description: 'Vertical bars, circular ties or spiral, and tie wire.',
        fields: [
          ...withGroup('Column', [
            numberField('height', 'Column height', 'm'),
            numberField('quantity', 'Number of columns', 'pcs', '1', 'number-pad'),
            numberField('diameter', 'Diameter', 'm'),
          ]),
          ...withGroup('Vertical bars', [
            numberField('verticalBars', 'Bars per column', 'pcs', '6', 'number-pad'),
            choiceField('verticalDiameter', 'Bar size', COLUMN_DIAMETER_CHOICES, '12'),
          ]),
          ...withGroup('Stirrups', [
            numberField('stirrupSpacing', 'Spacing', 'm', '0.2'),
            choiceField(
              'stirrupType',
              'Stirrup type',
              [
                { value: 'ties', label: 'Circular ties' },
                { value: 'spiral', label: 'Spiral' },
              ],
              'ties'
            ),
            choiceField('stirrupDiameter', 'Bar size', DIAMETER_CHOICES, '10'),
          ]),
        ],
      },
      {
        id: 'beam-one-bay',
        label: 'Beam · one bay',
        description: 'Beam-to-beam length under 6 m: top, web, and bottom bars with stirrups.',
        fields: [
          ...withGroup('Beam', [
            numberField('length', 'Beam-to-beam length', 'm'),
            numberField('width', 'Width', 'm'),
            numberField('depth', 'Depth', 'm'),
            numberField('columnWidth', 'Column width', 'm'),
          ]),
          ...withGroup('Top bars', beamBars('top')),
          ...withGroup('Web bars', beamBars('web', false)),
          ...withGroup('Bottom bars', beamBars('bottom')),
          ...withGroup('Stirrups', [
            numberField('stirrupSpacing', 'Spacing', 'm', '0.15'),
            choiceField('stirrupDiameter', 'Bar size', DIAMETER_CHOICES, '10'),
          ]),
        ],
      },
      {
        id: 'beam-two-bays',
        label: 'Beam · two bays',
        description: 'Continuous beam over two bays with top, web, and bottom bars.',
        fields: [
          ...withGroup('Beam', [
            numberField('length1', 'Bay 1 length', 'm'),
            numberField('length2', 'Bay 2 length', 'm'),
            numberField('width', 'Width', 'm'),
            numberField('depth', 'Depth', 'm'),
            numberField('columnWidth', 'Widest column', 'm'),
          ]),
          ...withGroup('Top bars', beamBars('top')),
          ...withGroup('Web bars', beamBars('web', false)),
          ...withGroup('Bottom bars', beamBars('bottom')),
          ...withGroup('Stirrups', [
            numberField('stirrupSpacing', 'Spacing', 'm', '0.2'),
            choiceField('stirrupDiameter', 'Bar size', DIAMETER_CHOICES, '10'),
          ]),
        ],
      },
      {
        id: 'slab-one-way',
        label: 'One-way slab',
        description: 'Bars and tie wire for a one-way reinforced slab.',
        fields: [
          numberField('length', 'Length', 'm'),
          numberField('width', 'Width', 'm'),
          choiceField('spacing', 'Bar spacing', SLAB_SPACING_CHOICES, '20'),
          choiceField('barDiameter', 'Bar size', DIAMETER_CHOICES, '10'),
        ],
      },
      {
        id: 'slab-two-way',
        label: 'Two-way slab',
        description: 'Bars and tie wire for a two-way reinforced slab.',
        fields: [
          numberField('length', 'Length', 'm'),
          numberField('width', 'Width', 'm'),
          choiceField('spacing', 'Bar spacing', SLAB_SPACING_CHOICES, '20'),
          choiceField('barDiameter', 'Bar size', DIAMETER_CHOICES, '10'),
        ],
      },
      {
        id: 'ground-slab-rebar',
        label: 'Ground slab · wide spacing',
        description: 'Reinforced ground slab with bar spacing more than 25 cm.',
        fields: [
          numberField('length', 'Length', 'm'),
          numberField('width', 'Width', 'm'),
          numberField('spacingAlongWidth', 'Bar spacing along width', 'cm', '40'),
          numberField('spacingAlongLength', 'Bar spacing along length', 'cm', '40'),
          choiceField('barDiameter', 'Bar size', DIAMETER_CHOICES, '10'),
        ],
      },
      {
        id: 'stairs-rebar',
        label: 'Concrete stairs bars',
        description: 'Lateral and horizontal bars for the steps and the stringer.',
        fields: [
          ...withGroup('Stair', [
            numberField('riser', 'Riser height', 'm'),
            numberField('tread', 'Tread run', 'm'),
            numberField('width', 'Stair width', 'm'),
            numberField('steps', 'Number of steps', 'steps', '', 'number-pad'),
          ]),
          ...withGroup('Reinforcement', [
            numberField('stepSpacing', 'Step lateral spacing', 'm', '0.3'),
            numberField('stringerSpacing', 'Stringer lateral spacing', 'm', '0.3'),
            choiceField('lateralDiameter', 'Lateral bar size', DIAMETER_CHOICES, '12'),
            choiceField('horizontalDiameter', 'Horizontal bar size', DIAMETER_CHOICES, '10'),
          ]),
        ],
      },
    ],
  },
  carpentry: {
    label: 'Carpentry',
    title: 'Carpentry Works',
    detail: 'Lumber board feet, studs and joists, plywood',
    icon: 'carpentry',
    calculators: [
      {
        id: 'lumber-board-feet',
        label: 'Lumber board feet',
        description: 'Total board feet of sawn lumber from its dimensions.',
        fields: [
          numberField('pieces', 'Number of pieces', 'pcs', '1', 'number-pad'),
          numberField('w1', 'Thickness', 'in'),
          numberField('w2', 'Width', 'in'),
          numberField('length', 'Length', 'ft'),
        ],
      },
      {
        id: 'round-log',
        label: 'Round log board feet',
        description: 'Board feet of round logs from diameter and length.',
        fields: [
          numberField('pieces', 'Number of logs', 'pcs', '1', 'number-pad'),
          numberField('diameter', 'Diameter (over 4 in)', 'in'),
          numberField('length', 'Length', 'ft'),
        ],
      },
      {
        id: 'studs-joists',
        label: 'Studs and nailing joists',
        description: 'Lumber pieces and nails for studs or joists over a wall, ceiling, or floor.',
        fields: [
          numberField('length', 'Length', 'm'),
          numberField('height', 'Height or width', 'm'),
          choiceField(
            'lumberSize',
            'Framing lumber size',
            [
              { value: '1x2', label: '1 x 2 in' },
              { value: '2x2', label: '2 x 2 in' },
              { value: '2x3', label: '2 x 3 in' },
              { value: '2x4', label: '2 x 4 in' },
            ],
            '2x3'
          ),
          choiceField(
            'spacing',
            'Spacing, center to center',
            [
              { value: '30x30', label: '30 x 30 cm' },
              { value: '30x60', label: '30 x 60 cm' },
              { value: '40x40', label: '40 x 40 cm' },
              { value: '40x60', label: '40 x 60 cm' },
              { value: '60x60', label: '60 x 60 cm' },
            ],
            '60x60'
          ),
          ...lumberFields(),
        ],
      },
      {
        id: 'plywood-covering',
        label: 'Plywood covering',
        description: '4 ft x 8 ft plywood or hardiflex boards and nails over a surface.',
        fields: [
          numberField('length', 'Length', 'm'),
          numberField('height', 'Height or width', 'm'),
          choiceField('sides', 'Covered sides', SIDE_CHOICES, '1'),
        ],
      },
    ],
  },
  roofing: {
    label: 'Roofing',
    title: 'Roofing Works',
    detail: 'Roof sheets, fasteners and accessories',
    icon: 'roofing',
    calculators: [
      {
        id: 'roof-two-sheets',
        label: 'Roof sheets · two per run',
        description: 'Sheets and umbrella nails when each run uses two sheets.',
        fields: [
          ...roofBase(),
          ...withGroup('Sheets', [
            choiceField('sheet1', 'First sheet length', ROOF_LENGTHS, '8'),
            choiceField('sheet2', 'Second sheet length', ROOF_LENGTHS, '8'),
          ]),
        ],
      },
      {
        id: 'roof-three-sheets',
        label: 'Roof sheets · three per run',
        description: 'Sheets and umbrella nails when each run uses three sheets.',
        fields: [
          ...roofBase(),
          ...withGroup('Sheets', [
            choiceField('sheet1', 'First sheet length', ROOF_LENGTHS, '8'),
            choiceField('sheet2', 'Second sheet length', ROOF_LENGTHS, '8'),
            choiceField('sheet3', 'Third sheet length', ROOF_LENGTHS, '8'),
          ]),
        ],
      },
      {
        id: 'roof-accessories',
        label: 'Roof accessories',
        description: 'Accessory pieces along a covered length.',
        fields: [
          numberField('coveredLength', 'Total covered length', 'm'),
          numberField('effectiveLength', 'Effective length per piece', 'm', '2.2'),
        ],
      },
    ],
  },
  tiling: {
    label: 'Tiling',
    title: 'Tiling Works',
    detail: 'Wall or floor tiles, mortar or adhesive, grout',
    icon: 'tiling',
    calculators: [
      {
        id: 'tile-area',
        label: 'Wall or floor tiles',
        description: 'Tile count with breakage, fixing material, and white cement.',
        fields: [
          numberField('area', 'Wall or floor area', 'm²'),
          numberField('breakage', 'Breakage (5–10%)', '%', '5'),
          choiceField(
            'tileSize',
            'Tile size',
            TILE_SIZES.map(({ value, label }) => ({ value, label })),
            '12x12'
          ),
          choiceField(
            'fixing',
            'Fixing material',
            [
              { value: 'mortar', label: 'Cement mortar' },
              { value: 'adhesive', label: 'Tile adhesive' },
            ],
            'mortar'
          ),
        ],
      },
    ],
  },
  painting: {
    label: 'Painting',
    title: 'Painting Works',
    detail: 'Paint and primer gallons by area and coats',
    icon: 'painting',
    calculators: [
      {
        id: 'paint-area',
        label: 'Paint or primer',
        description: 'Gallons from surface area, coverage per gallon, and coats.',
        fields: [
          numberField('area', 'Surface area', 'm²'),
          numberField('coverage', 'Coverage per gallon', 'm²/gal'),
          numberField('coats', 'Number of coats', 'coats', '2', 'number-pad'),
          choiceField(
            'paintKind',
            'Kind of paint',
            PAINT_KINDS.map(({ value, label }) => ({ value, label })),
            'masonry'
          ),
        ],
      },
    ],
  },
  forms: {
    label: 'Forms and scaffolds',
    title: 'Scaffoldings and Forms',
    detail: 'Column and beam forms, staging lumber',
    icon: 'scaffold',
    calculators: [
      {
        id: 'column-forms',
        label: 'Column forms',
        description: 'Plywood, frame lumber, and nails for rectangular column forms.',
        fields: [
          numberField('widthA', 'Column dimension A', 'm'),
          numberField('widthB', 'Column dimension B', 'm'),
          numberField('quantity', 'Number of columns', 'pcs', '1', 'number-pad'),
          ...lumberFields(),
        ],
      },
      {
        id: 'beam-forms',
        label: 'Beam and girder forms',
        description: 'Plywood, frame lumber, and nails for beam and girder forms.',
        fields: [
          numberField('length', 'Beam length', 'm'),
          numberField('depth', 'Beam depth', 'm'),
          numberField('width', 'Beam width', 'm'),
          numberField('quantity', 'Number of beams', 'pcs', '1', 'number-pad'),
          ...lumberFields(),
        ],
      },
      {
        id: 'staging',
        label: 'Scaffolding lumber',
        description: 'Lumber for column and beam scaffolding and a working floor.',
        fields: [
          ...withGroup('Columns', [
            numberField('columnHeight', 'Column height', 'm'),
            numberField('columns', 'Number of columns', 'pcs', '', 'number-pad'),
          ]),
          ...withGroup('Beams', [
            numberField('beamLength', 'Beam length', 'm'),
            numberField('beams', 'Number of beams', 'pcs', '', 'number-pad'),
          ]),
          ...withGroup('Flooring and lumber', [
            numberField('floorArea', 'Flooring area', 'm²'),
            choiceField(
              'stagingSize',
              'Staging lumber size',
              [
                { value: '2x2', label: '2 x 2 in' },
                { value: '2x3', label: '2 x 3 in' },
                { value: '2x4', label: '2 x 4 in' },
              ],
              '2x4'
            ),
          ]),
          ...lumberFields(),
        ],
      },
    ],
  },
};
