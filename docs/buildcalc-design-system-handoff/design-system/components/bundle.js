/* @ds-bundle: {"format":4,"namespace":"Buildcalc","components":[{"name":"Masthead"},{"name":"AppBar"},{"name":"TabBar"},{"name":"SectionHeading"},{"name":"OptionButtons"},{"name":"InputField"},{"name":"Button"},{"name":"StatusTag"},{"name":"Icon"},{"name":"ListRow"},{"name":"SettingRow"},{"name":"MeasureLine"},{"name":"MaterialLine"},{"name":"ResultRow"},{"name":"TotalRow"},{"name":"Validation"},{"name":"Assumptions"},{"name":"HomeScreen"},{"name":"CalculatorsScreen"},{"name":"CalculatorSheetScreen"},{"name":"EstimatorScreen"},{"name":"EstimatorEmptyScreen"},{"name":"ResultsScreen"},{"name":"SettingsScreen"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;

  var ICONS = {
    home: 'M3 11.5 12 4l9 7.5M6 9.5V20h12V9.5M10 20v-6h4v6',
    calculators: 'M5 3h14v18H5zM8 6.5h8v3.5H8zM8 14h2M14 14h2M8 17.5h2M14 17.5h2',
    estimate: 'M4 6h10M4 12h10M4 18h10M17.5 6H20M17.5 12H20M17.5 18H20',
    settings: 'M4 7h9M17 7h3M13 4.5v5h4v-5zM4 17h3M11 17h9M7 14.5v5h4v-5z',
    'chevron-right': 'M9 5l7 7-7 7',
    'chevron-down': 'M5 9l7 7 7-7',
    'chevron-up': 'M5 15l7-7 7 7',
    back: 'M15 5l-7 7 7 7',
    pencil: 'M4 20l1-4.5L16 4.5l3.5 3.5-11 11zM13.5 7l3.5 3.5',
    plus: 'M12 5v14M5 12h14',
    lock: 'M6 11h12v9H6zM9 11V7h6v4',
    alert: 'M12 4l9 16H3zM12 10v5M12 17v1',
    clear: 'M5 7h14M9.5 7V4h5v3M7 7l1 13h8l1-13',
    info: 'M4 4h16v16H4zM12 11v5M12 7.5v1'
  };

  function Icon(p) {
    var size = p.size || 24;
    return h('svg', {
      className: 'bc-icon', width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'square', strokeLinejoin: 'miter',
      'aria-hidden': p.label ? undefined : 'true', 'aria-label': p.label, role: p.label ? 'img' : undefined
    }, h('path', { d: ICONS[p.name] || '' }));
  }

  function Masthead(p) {
    return h('header', { className: 'bc-masthead' },
      h('h1', { className: 'bc-brand' }, p.name || 'Buildcalc'),
      h('span', { className: 'bc-tagline' }, p.tagline || 'CONSTRUCTION TAKEOFF'));
  }

  function AppBar(p) {
    return h('header', { className: 'bc-appbar' },
      p.back ? h('button', { type: 'button', className: 'bc-back', onClick: p.onBack }, h(Icon, { name: 'back', size: 20 }), p.back) : null,
      h('h1', { className: 'bc-title' }, p.title),
      p.subtitle ? h('p', { className: 'bc-subtitle' }, p.subtitle) : null);
  }

  var TABS = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'calculators', label: 'Calculators', icon: 'calculators' },
    { id: 'estimate', label: 'Estimate', icon: 'estimate' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  function TabBar(p) {
    return h('nav', { className: 'bc-tabs', 'aria-label': 'Main' }, TABS.map(function (t) {
      return h('button', {
        key: t.id, type: 'button', className: 'bc-tab',
        'aria-current': p.active === t.id ? 'page' : undefined,
        onClick: p.onChange ? function () { p.onChange(t.id); } : undefined
      }, h(Icon, { name: t.icon, size: 22 }), t.label);
    }));
  }

  function SectionHeading(p) {
    return h('div', { className: 'bc-heading' },
      p.number ? h('span', { className: 'bc-heading-num' }, p.number) : null,
      h('h2', { className: 'bc-heading-title' }, p.title),
      p.trailing ? h('span', { className: 'bc-heading-trail' }, p.trailing) : null);
  }

  function OptionButtons(p) {
    var s = useState(p.value);
    var value = s[0];
    return h('div', { className: 'bc-options', role: 'radiogroup', 'aria-label': p.label },
      (p.options || []).map(function (o) {
        return h('button', {
          key: o.value, type: 'button', role: 'radio', className: 'bc-option',
          'aria-checked': value === o.value ? 'true' : 'false',
          onClick: function () { s[1](o.value); if (p.onChange) p.onChange(o.value); }
        }, o.label);
      }));
  }

  function InputField(p) {
    var s = useState(p.value === undefined ? '' : p.value);
    return h('label', { className: 'bc-field' },
      p.hideLabel ? null : h('span', { className: 'bc-label' }, p.label),
      h('span', { className: 'bc-input-wrap', 'data-invalid': p.invalid ? 'true' : undefined, 'data-adjusted': p.adjusted ? 'true' : undefined },
        p.prefix ? h('span', { className: 'bc-prefix' }, p.prefix) : null,
        h('input', {
          className: 'bc-input', inputMode: 'decimal', 'aria-label': p.hideLabel ? p.label : undefined, value: s[0], placeholder: p.placeholder === undefined ? '0' : p.placeholder,
          'aria-invalid': p.invalid ? 'true' : undefined,
          onChange: function (e) { s[1](e.target.value); if (p.onChange) p.onChange(e.target.value); }
        }),
        p.unit ? h('span', { className: 'bc-unit' }, p.unit) : null));
  }

  function Button(p) {
    var cls = 'bc-btn bc-btn-' + (p.variant || 'secondary') + (p.block ? ' bc-btn-block' : '');
    return h('button', {
      type: 'button', className: cls, 'aria-disabled': p.disabled ? 'true' : undefined,
      onClick: p.disabled ? undefined : p.onClick
    }, p.icon ? h(Icon, { name: p.icon, size: 20 }) : null, p.children);
  }

  function StatusTag(p) {
    return p.tone === 'adjusted'
      ? h('span', { className: 'bc-tag bc-tag-adjusted' }, h(Icon, { name: 'pencil', size: 14 }), p.children || 'Manual')
      : h('span', { className: 'bc-tag' }, p.children);
  }

  function ListRow(p) {
    var linked = !p.off;
    return h(linked ? 'button' : 'div', {
      type: linked ? 'button' : undefined,
      className: 'bc-row' + (linked ? ' bc-row-link' : '') + (p.sub ? ' bc-row-sub' : ''),
      'aria-expanded': p.expanded === undefined ? undefined : String(p.expanded),
      onClick: linked ? p.onClick : undefined
    },
      p.number ? h('span', { className: 'bc-row-num', 'data-off': p.off ? 'true' : undefined }, p.number) : null,
      h('span', { className: 'bc-row-body' },
        h('span', { className: 'bc-row-title', 'data-off': p.off ? 'true' : undefined }, p.title),
        p.meta ? h('span', { className: 'bc-row-meta' }, p.meta) : null),
      h('span', { className: 'bc-row-trail' },
        p.trailing || null,
        linked ? h(Icon, { name: p.expanded === undefined ? 'chevron-right' : (p.expanded ? 'chevron-up' : 'chevron-down'), size: 20 }) : null));
  }

  function SettingRow(p) {
    return h('div', { className: 'bc-setting' },
      h('span', { className: 'bc-setting-body' },
        h('span', { className: 'bc-row-title' }, p.title),
        p.meta ? h('span', { className: 'bc-row-meta' }, p.meta) : null),
      p.control ? h('span', { className: 'bc-setting-control' }, p.control)
        : h('span', { className: 'bc-setting-value' }, p.value, p.fixed ? h(Icon, { name: 'lock', size: 16, label: 'Fixed' }) : null));
  }

  function MeasureLine(p) {
    return h('div', { className: 'bc-measure' },
      h('span', { className: 'bc-measure-label' }, p.label),
      h('span', { className: 'bc-measure-value' }, p.value));
  }

  function TakeoffPreviewRow(p) {
    return h('div', { className: 'bc-preview-row' },
      h('span', { className: 'bc-preview-name' }, p.name),
      h('span', { className: 'bc-preview-qty' }, p.quantity));
  }

  function MaterialLine(p) {
    var s = useState(!!p.open);
    var open = s[0];
    var manual = !!p.override;
    return h('div', { className: 'bc-material' },
      h('div', { className: 'bc-material-head' },
        h('span', { className: 'bc-material-name' }, p.name),
        h('span', { className: 'bc-material-qty' }, 'Calculated · ' + p.calculated)),
      open ? h('div', { className: 'bc-material-row' },
        h(InputField, { label: 'Quantity override', placeholder: 'Auto', unit: p.unit, value: p.override, adjusted: manual }),
        p.wastageAllowed === false
          ? h('span', { className: 'bc-note' }, 'CHB breakage allowance is included in the calculated quantity.')
          : h(InputField, { label: 'Wastage', unit: '%', value: p.wastage === undefined ? '0' : p.wastage })) : null,
      h('div', { className: 'bc-material-row' },
        h('div', { style: { flex: '1 1 48%', minWidth: 140, display: 'flex' } },
          h(InputField, { label: p.priceLabel, prefix: '₱', value: p.price, placeholder: 'Enter price' })),
        h('div', { className: 'bc-line-cost' },
          h('span', { className: 'bc-line-cost-label' }, 'Line cost'),
          h('span', { className: 'bc-line-cost-value' }, p.cost || '—'))),
      h('div', { className: 'bc-material-foot' },
        h('span', { className: 'bc-status', 'data-adjusted': manual ? 'true' : undefined }, p.status),
        h('button', { type: 'button', className: 'bc-disclose', 'aria-expanded': String(open), onClick: function () { s[1](!open); } },
          manual ? h(StatusTag, { tone: 'adjusted' }) : 'Adjust',
          h(Icon, { name: open ? 'chevron-up' : 'chevron-down', size: 18 }))));
  }

  function ResultRow(p) {
    return h('div', { className: 'bc-result' },
      h('div', { className: 'bc-result-main' },
        h('span', { className: 'bc-result-name' }, p.name, p.manual ? h(StatusTag, { tone: 'adjusted' }) : null),
        h('span', { className: 'bc-result-calc' }, p.calc),
        p.basis ? h('span', { className: 'bc-result-basis' }, p.basis) : null),
      h('span', { className: 'bc-result-cost' }, p.cost));
  }

  function TotalRow(p) {
    var label = 'Total Estimated Material Cost';
    if (p.variant === 'head') {
      return h('div', { className: 'bc-total-head' },
        h('span', { className: 'bc-total-label' }, label),
        h('span', { className: 'bc-total-display' }, p.value));
    }
    return h('div', { className: 'bc-total' + (p.variant === 'closed' ? ' bc-total-closed' : '') },
      h('span', { className: 'bc-total-label' }, label),
      h('span', { className: 'bc-total-value' }, p.value));
  }

  function Disclaimer() {
    return h('p', { className: 'bc-disclaimer' }, 'Material costs only. Labor, equipment, overhead, and other construction expenses are excluded.');
  }

  function Validation(p) {
    return h('div', { className: 'bc-validation', role: 'alert' }, h(Icon, { name: 'alert', size: 18 }), h('span', null, p.children));
  }

  function Assumptions(p) {
    return h('div', null, (p.items || []).map(function (t) { return h('p', { key: t, className: 'bc-assumption' }, t); }));
  }

  function ClosingNotice() {
    return h('p', { className: 'bc-footer' }, 'Workbook-based planning estimates, not engineering approval. Verify material quantities, mixes, and specifications with a qualified construction professional before ordering or building.');
  }

  /* Sample data: quantities follow src/utils/construction-estimate.ts; prices are round layout placeholders. */
  var SLAB_ASSUMPTIONS = [
    'Concrete class A · nominal mix 1:2:4.',
    '9 cement bags per m³; sand 0.5 m³ and gravel 1 m³ per m³ of concrete.',
    'Sand and gravel estimates are rounded up to 0.1 m³; quantities are workbook-based estimates, not a mix-design specification.'
  ];
  var WALL_ASSUMPTIONS = [
    'CHB allowance is 12.5 blocks per net wall m², plus the entered breakage allowance.',
    'Net wall area subtracts window and door openings. Block size and mortar joints can change actual coverage.'
  ];

  function Phone(p) {
    return h('div', { className: 'bc-root' },
      h('p', { className: 'bc-frame-label' }, p.label),
      h('div', { className: 'bc-phone', 'data-theme': p.theme }, p.children));
  }

  function Pair(Body) {
    return function Screen(props) {
      if (props && props.theme) return h('div', { className: 'bc-root bc-phone', 'data-theme': props.theme }, h(Body, null));
      return h('div', { className: 'bc-stage' },
        h(Phone, { label: 'Light', theme: 'light' }, h(Body, null)),
        h(Phone, { label: 'Dark', theme: 'dark' }, h(Body, null)));
    };
  }

  function Home() {
    return h(React.Fragment, null,
      h('div', { className: 'bc-sheet' },
        h(Masthead, null),
        h('p', { className: 'bc-intro' }, 'Measure the work, review the materials, then enter your own unit prices.'),
        h('button', { type: 'button', className: 'bc-session' },
          h('span', { className: 'bc-session-top' },
            'Current estimate',
            h(Icon, { name: 'chevron-right', size: 20 })),
          h('span', { className: 'bc-session-count' }, '2 takeoffs · 4 materials · Clears when the app closes'),
          h('span', { className: 'bc-session-total' },
            h('span', { className: 'bc-session-label' }, 'Total Estimated Material Cost'),
            h('span', { className: 'bc-session-value' }, 'Enter 1 unit price'))),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { number: '01', title: 'Start a takeoff' }),
          h('div', { className: 'bc-list' },
            h(ListRow, { title: 'Concreting Works', meta: 'Footings, floor slabs, columns, beams, stairs' }),
            h(ListRow, { title: 'Masonry Works', meta: 'CHB wall, CHB mortar, wall plaster, riprap' }),
            h(ListRow, { title: 'All work sections', meta: '2 of 8 available now' }))),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { number: '02', title: 'How an estimate works' }),
          h('ol', { className: 'bc-steps' },
            [['Measure.', ' Enter dimensions in metres.'],
             ['Review.', ' Check the materials and the factors behind them.'],
             ['Price.', ' Enter your own unit price for each material.'],
             ['Total.', ' Read the cost of materials, and only materials.']].map(function (s, i) {
              return h('li', { key: s[0], className: 'bc-step' },
                h('span', { className: 'bc-step-num' }, String(i + 1)),
                h('span', { className: 'bc-step-text' }, h('b', null, s[0]), s[1]));
            }))),
        h(ClosingNotice, null)),
      h(TabBar, { active: 'home' }));
  }

  var CONCRETING = ['Footing', 'Wall footing', 'Floor slab · dimensions', 'Floor slab · area', 'Rectangular column', 'Circular column', 'Beam', 'Concrete stairs'];
  var MASONRY = ['CHB wall', 'CHB mortar', 'Wall plaster', 'Riprap'];
  var PLANNED = [['03', 'Steel Reinforcement Works'], ['04', 'Carpentry Works'], ['05', 'Roofing Works'], ['06', 'Tiling Works'], ['07', 'Painting Works'], ['08', 'Scaffoldings and Forms']];

  function Calculators() {
    var s = useState('concreting');
    var open = s[0];
    function section(id, number, title, items) {
      var isOpen = open === id;
      return h(React.Fragment, { key: id },
        h(ListRow, {
          number: number, title: title, meta: items.length + ' calculators', expanded: isOpen,
          onClick: function () { s[1](isOpen ? null : id); }
        }),
        isOpen ? items.map(function (c) { return h(ListRow, { key: c, title: c, sub: true }); }) : null);
    }
    return h(React.Fragment, null,
      h('div', { className: 'bc-sheet' },
        h(AppBar, { title: 'Construction Calculators', subtitle: 'Choose a work section, then a calculator.' }),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { title: 'Available', trailing: '2 of 8' }),
          h('div', { className: 'bc-list' },
            section('concreting', '01', 'Concreting Works', CONCRETING),
            section('masonry', '02', 'Masonry Works', MASONRY))),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { title: 'Not yet available' }),
          h('div', { className: 'bc-list' }, PLANNED.map(function (r) {
            return h(ListRow, { key: r[0], number: r[0], title: r[1], off: true });
          })))),
      h(TabBar, { active: 'calculators' }));
  }

  function CalculatorSheet() {
    return h(React.Fragment, null,
      h('div', { className: 'bc-sheet' },
        h(AppBar, { back: 'Concreting Works', title: 'Floor slab · dimensions' }),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { number: '01', title: 'Measurements' }),
          h('p', { className: 'bc-instruction' }, 'Slab volume from length, width, and thickness. Enter dimensions in metres unless another unit is shown.'),
          h('div', { className: 'bc-grid' },
            h(InputField, { label: 'Length', unit: 'm', value: '6' }),
            h(InputField, { label: 'Width', unit: 'm', value: '4' }),
            h(InputField, { label: 'Thickness', unit: 'm', value: '0.1' })),
          h('div', { className: 'bc-choice' },
            h('span', { className: 'bc-label' }, 'Concrete class · reference mix'),
            h(OptionButtons, { label: 'Concrete class', value: 'A', options: [{ value: 'AA', label: 'AA · 1:1.5:3' }, { value: 'A', label: 'A · 1:2:4' }, { value: 'B', label: 'B · 1:3:6' }] }))),
        h('section', { className: 'bc-surface bc-section' },
          h(SectionHeading, { number: '02', title: 'Material takeoff' }),
          h(MeasureLine, { label: 'Concrete volume', value: '2.4 m³' }),
          h(TakeoffPreviewRow, { name: 'Cement', quantity: '22 bags' }),
          h(TakeoffPreviewRow, { name: 'Sand', quantity: '1.2 m³' }),
          h(TakeoffPreviewRow, { name: '3/4 in gravel', quantity: '2.4 m³' }),
          h(Assumptions, { items: SLAB_ASSUMPTIONS })),
        h('div', { style: { marginTop: 12 } }, h(Button, { variant: 'primary', block: true, icon: 'plus' }, 'Add to estimate')),
        h(ClosingNotice, null)),
      h(TabBar, { active: 'calculators' }));
  }

  function Estimator() {
    return h(React.Fragment, null,
      h('div', { className: 'bc-sheet' },
        h(AppBar, { title: 'Material Cost Estimator', subtitle: 'Enter a unit price for each material. This estimate clears when the app closes.' }),
        h('section', { className: 'bc-surface bc-section' },
          h(SectionHeading, { number: '01', title: 'Floor slab · dimensions' }),
          h(MeasureLine, { label: 'Concrete volume', value: '2.4 m³' }),
          h(MaterialLine, { name: 'Cement', calculated: '22 bags', unit: 'bags', wastage: '5', priceLabel: 'Cement · per 50 kg bag', price: '100.00', cost: '₱2,400.00', status: 'Using 5% wastage · 24 bags' }),
          h(MaterialLine, { name: 'Sand', calculated: '1.2 m³', unit: 'm³', priceLabel: 'Sand · per m³', price: '1000.00', cost: '₱1,200.00', status: 'Using calculated quantity · 1.2 m³' }),
          h(MaterialLine, { name: '3/4 in gravel', calculated: '2.4 m³', unit: 'm³', override: '2.5', open: true, priceLabel: 'Gravel · per m³', price: '1000.00', cost: '₱2,500.00', status: 'Manual quantity override · 2.5 m³' })),
        h('section', { className: 'bc-surface bc-section' },
          h(SectionHeading, { number: '02', title: 'CHB wall' }),
          h(MeasureLine, { label: 'Net wall area', value: '26 m²' }),
          h(MaterialLine, { name: 'Concrete hollow blocks', calculated: '342 pcs', unit: 'pcs', wastageAllowed: false, priceLabel: 'CHB · per piece', status: 'Using calculated quantity · 342 pcs' })),
        h('div', { style: { marginTop: 12 } }, h(Button, { variant: 'secondary', block: true, icon: 'plus' }, 'Add another takeoff'))),
      h('div', { className: 'bc-totalbar' },
        h(TotalRow, { value: 'Enter 1 unit price' }),
        h(Disclaimer, null),
        h(Button, { variant: 'primary', block: true, disabled: true }, 'View results')),
      h(TabBar, { active: 'estimate' }));
  }

  function EstimatorEmpty() {
    return h(React.Fragment, null,
      h('div', { className: 'bc-sheet' },
        h(AppBar, { title: 'Material Cost Estimator' }),
        h('section', { className: 'bc-surface bc-section' },
          h(SectionHeading, { title: 'No materials yet' }),
          h('p', { className: 'bc-empty' }, 'Run a calculator and add its takeoff. Its materials appear here, ready for your unit prices.'),
          h(Button, { variant: 'primary', block: true, icon: 'calculators' }, 'Choose a calculator')),
        h(ClosingNotice, null)),
      h(TabBar, { active: 'estimate' }));
  }

  function Results() {
    return h(React.Fragment, null,
      h('div', { className: 'bc-sheet' },
        h(AppBar, { back: 'Estimator', title: 'Estimate Results' }),
        h(TotalRow, { variant: 'head', value: '₱9,520.00' }),
        h(Disclaimer, null),
        h('section', { className: 'bc-surface bc-section' },
          h(SectionHeading, { number: '01', title: 'Floor slab · dimensions', trailing: '₱6,100.00' }),
          h(MeasureLine, { label: 'Concrete volume · 6 × 4 × 0.1 m', value: '2.4 m³' }),
          h(ResultRow, { name: 'Cement', calc: '24 bags × ₱100.00', basis: 'Calculated 22 bags + 5% wastage, rounded up', cost: '₱2,400.00' }),
          h(ResultRow, { name: 'Sand', calc: '1.2 m³ × ₱1,000.00', basis: 'Calculated 1.2 m³', cost: '₱1,200.00' }),
          h(ResultRow, { name: '3/4 in gravel', manual: true, calc: '2.5 m³ × ₱1,000.00', basis: 'Calculated 2.4 m³, overridden to 2.5 m³', cost: '₱2,500.00' })),
        h('section', { className: 'bc-surface bc-section' },
          h(SectionHeading, { number: '02', title: 'CHB wall', trailing: '₱3,420.00' }),
          h(MeasureLine, { label: 'Net wall area', value: '26 m²' }),
          h(ResultRow, { name: 'Concrete hollow blocks', calc: '342 pcs × ₱10.00', basis: 'Calculated, including 5% breakage', cost: '₱3,420.00' }),
          h(TotalRow, { variant: 'closed', value: '₱9,520.00' })),
        h('div', { className: 'bc-actions' },
          h(Button, { variant: 'secondary', icon: 'pencil' }, 'Edit prices'),
          h(Button, { variant: 'danger', icon: 'clear' }, 'Clear estimate')),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { title: 'Assumptions' }),
          h(Assumptions, { items: SLAB_ASSUMPTIONS.concat(WALL_ASSUMPTIONS) })),
        h(ClosingNotice, null)),
      h(TabBar, { active: 'estimate' }));
  }

  function Settings() {
    return h(React.Fragment, null,
      h('div', { className: 'bc-sheet' },
        h(AppBar, { title: 'Settings' }),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { number: '01', title: 'Measurement and calculation' }),
          h(SettingRow, { title: 'Measurement system', value: 'Metric', fixed: true }),
          h(SettingRow, {
            title: 'Default wastage', meta: 'Starting value for new materials. CHB counts are excluded.',
            control: h(InputField, { label: 'Default wastage', hideLabel: true, unit: '%', value: '0' })
          })),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { number: '02', title: 'Currency' }),
          h(SettingRow, { title: 'Currency', meta: 'Philippine Peso (PHP)', value: '₱', fixed: true }),
          h(SettingRow, { title: 'Number format', meta: 'Philippine English (en-PH)', value: '₱1,234.50', fixed: true })),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { number: '03', title: 'Appearance' }),
          h(OptionButtons, { label: 'Appearance', value: 'auto', options: [{ value: 'auto', label: 'Automatic' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }] }),
          h('p', { className: 'bc-subtitle', style: { marginTop: 8 } }, 'Automatic follows the device.')),
        h('section', { className: 'bc-section' },
          h(SectionHeading, { number: '04', title: 'About' }),
          h(SettingRow, { title: 'Version', value: '1.0.0' }),
          h(SettingRow, { title: 'Estimates', meta: 'Kept for this session only. Cleared when the app closes.', value: 'Temporary' }),
          h(SettingRow, { title: 'Material factors', meta: 'Reference factors from the construction-estimate workbook.', value: 'Workbook' }),
          h(ClosingNotice, null))),
      h(TabBar, { active: 'settings' }));
  }

  window.Buildcalc = {
    Icon: Icon, Masthead: Masthead, AppBar: AppBar, TabBar: TabBar, SectionHeading: SectionHeading,
    OptionButtons: OptionButtons, InputField: InputField, Button: Button, StatusTag: StatusTag,
    ListRow: ListRow, SettingRow: SettingRow, MeasureLine: MeasureLine, MaterialLine: MaterialLine,
    ResultRow: ResultRow, TotalRow: TotalRow, Validation: Validation, Assumptions: Assumptions,
    HomeScreen: Pair(Home), CalculatorsScreen: Pair(Calculators), CalculatorSheetScreen: Pair(CalculatorSheet),
    EstimatorScreen: Pair(Estimator), EstimatorEmptyScreen: Pair(EstimatorEmpty), ResultsScreen: Pair(Results),
    SettingsScreen: Pair(Settings)
  };
})();
