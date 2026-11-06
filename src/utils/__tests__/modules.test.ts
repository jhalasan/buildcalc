import { calculateConstructionTakeoff, type EstimateModule } from '../construction-estimate';

/** Expected values are the cached results in docs/CONST-ESTIMATE-MADE-EASY.xls. */
const run = (module: EstimateModule, calculator: Parameters<typeof calculateConstructionTakeoff>[1], values: Record<string, string>) =>
  calculateConstructionTakeoff(module, calculator, values);
const qty = (t: ReturnType<typeof run>, id: string) => t?.items.find((item) => item.id === id)?.quantity;

describe('tiling', () => {
  const base = { area: '48', breakage: '5', tileSize: '6x6' };
  it('counts tiles with breakage, mortar, and white cement', () => {
    const t = run('tiling', 'tile-area', { ...base, fixing: 'mortar' });
    expect(qty(t, 'tile-6x6')).toBe(2240);
    expect(qty(t, 'cement-bag')).toBe(5);
    expect(qty(t, 'white-cement-kg')).toBe(24);
  });
  it('uses adhesive instead of mortar when chosen', () => {
    const t = run('tiling', 'tile-area', { ...base, fixing: 'adhesive' });
    expect(qty(t, 'tile-adhesive-bag')).toBe(6);
    expect(qty(t, 'cement-bag')).toBeUndefined();
  });
  it('does not allow a second wastage on tiles', () => {
    const t = run('tiling', 'tile-area', { ...base, fixing: 'mortar' });
    expect(t?.items.find((i) => i.id === 'tile-6x6')?.wastageAllowed).toBe(false);
  });
  it('rejects zero area and negative breakage', () => {
    expect(run('tiling', 'tile-area', { ...base, area: '0', fixing: 'mortar' })).toBeUndefined();
    expect(run('tiling', 'tile-area', { ...base, breakage: '-1', fixing: 'mortar' })).toBeUndefined();
  });
});

describe('painting', () => {
  it('rounds gallons up from area, coverage, and coats', () => {
    const t = run('painting', 'paint-area', { area: '27', coverage: '25', coats: '2', paintKind: 'primer' });
    expect(qty(t, 'paint-primer-gal')).toBe(3);
  });
  it('uses the entered number of coats, not a fixed 2', () => {
    const t = run('painting', 'paint-area', { area: '27', coverage: '25', coats: '3', paintKind: 'masonry' });
    expect(qty(t, 'paint-masonry-gal')).toBe(4);
  });
  it('rejects fractional coats and zero coverage', () => {
    expect(run('painting', 'paint-area', { area: '27', coverage: '25', coats: '1.5', paintKind: 'primer' })).toBeUndefined();
    expect(run('painting', 'paint-area', { area: '27', coverage: '0', coats: '2', paintKind: 'primer' })).toBeUndefined();
  });
});

describe('carpentry', () => {
  it('board feet of lumber', () => {
    const t = run('carpentry', 'lumber-board-feet', { pieces: '100', w1: '2', w2: '4', length: '12' });
    expect(qty(t, 'lumber-board-feet')).toBe(800);
  });
  it('round log board feet', () => {
    const t = run('carpentry', 'round-log', { pieces: '1', diameter: '28', length: '20' });
    expect(qty(t, 'round-log-board-feet')).toBe(720);
  });
  it('rejects a log of 4 in or less', () => {
    expect(run('carpentry', 'round-log', { pieces: '1', diameter: '4', length: '20' })).toBeUndefined();
  });
  it('studs and nailing joists', () => {
    const t = run('carpentry', 'studs-joists', {
      length: '9', height: '3', lumberSize: '2x3', spacing: '60x60', w1: '2', w2: '3', lengthFt: '8',
    });
    expect(qty(t, 'lumber-2x3x8')).toBe(47);
    expect(qty(t, 'nails-cw-2-5')).toBe(1.4);
  });
  it('plywood covering, one and two sides', () => {
    const one = run('carpentry', 'plywood-covering', { length: '9', height: '3', sides: '1' });
    expect(qty(one, 'plywood-quarter-4x8')).toBe(10);
    expect(qty(one, 'nails-cw-1')).toBe(0.6);
    const two = run('carpentry', 'plywood-covering', { length: '9', height: '3', sides: '2' });
    expect(qty(two, 'plywood-quarter-4x8')).toBe(19);
    expect(qty(two, 'nails-cw-1')).toBe(1.1);
  });
});

describe('roofing', () => {
  const base = { span: '3', rise: '1.2', projection: '1', roofWidth: '11', effectiveWidth: '0.7', sides: '1' };
  it('two sheets per run: 16 + 16 sheets and 5 kg of nails', () => {
    const t = run('roofing', 'roof-two-sheets', { ...base, sheet1: '8', sheet2: '8' });
    expect(qty(t, 'roof-sheet-8ft')).toBe(32);
    expect(qty(t, 'umbrella-nails-kg')).toBe(5);
  });
  it('three sheets per run warns that the lap is not economical (as the workbook does)', () => {
    const t = run('roofing', 'roof-three-sheets', { ...base, sheet1: '8', sheet2: '8', sheet3: '8' });
    expect(qty(t, 'roof-sheet-8ft')).toBe(48);
    expect(qty(t, 'umbrella-nails-kg')).toBe(8);
    expect(t?.warnings?.[0]).toMatch(/not economical/i);
  });
  it('doubles quantities for two similar roof sides', () => {
    const t = run('roofing', 'roof-two-sheets', { ...base, sides: '2', sheet1: '8', sheet2: '8' });
    expect(qty(t, 'roof-sheet-8ft')).toBe(64);
  });
  it('warns when the sheets are too short', () => {
    const t = run('roofing', 'roof-two-sheets', { ...base, projection: '4', sheet1: '8', sheet2: '8' });
    expect(t?.warnings?.[0]).toMatch(/adjust sheet length/i);
  });
  it('roof accessories', () => {
    expect(qty(run('roofing', 'roof-accessories', { coveredLength: '11', effectiveLength: '2.2' }), 'roof-accessory-pcs')).toBe(5);
  });
});

describe('scaffoldings and forms', () => {
  const lumber = { w1: '2', w2: '3', lengthFt: '8' };
  it('column forms', () => {
    const t = run('forms', 'column-forms', { widthA: '0.3', widthB: '0.3', quantity: '9', ...lumber });
    expect(qty(t, 'lumber-2x3x8')).toBe(82);
    expect(qty(t, 'plywood-form-4x8')).toBe(11);
    expect(qty(t, 'nails-cw-2-5')).toBe(2.5);
    expect(qty(t, 'nails-finishing-1')).toBe(1);
  });
  it('beam forms', () => {
    const t = run('forms', 'beam-forms', { length: '7', depth: '0.3', width: '0.2', quantity: '4', ...lumber });
    expect(qty(t, 'lumber-2x3x8')).toBe(63);
    expect(qty(t, 'plywood-form-4x8')).toBe(9);
    expect(qty(t, 'nails-cw-2-5')).toBe(2.1);
    expect(qty(t, 'nails-finishing-1')).toBe(0.9);
  });
  it('staging lumber needs at least one dimension', () => {
    const empty = { columnHeight: '', columns: '', beamLength: '', beams: '', floorArea: '', stagingSize: '2x4', w1: '2', w2: '4', lengthFt: '8' };
    expect(run('forms', 'staging', empty)).toBeUndefined();
    const t = run('forms', 'staging', { ...empty, columnHeight: '3', columns: '9' });
    expect(qty(t, 'nails-cw-4')).toBe(20); // 27 m of column height x 0.73
  });
});

describe('concrete: regression', () => {
  it('footing volume and Class A materials', () => {
    const t = run('concrete', 'footing', { length: '1', width: '1', thickness: '0.5', quantity: '1' });
    expect(t?.measure.value).toBeCloseTo(0.5);
    expect(qty(t, 'cement-bag')).toBe(5); // 0.5 m3 x 9 bags, rounded up from 4.5
    expect(qty(t, 'sand-cubic-metre')).toBe(0.3);
    expect(qty(t, 'gravel-cubic-metre')).toBe(0.5);
  });
  it.each(['', '0', '-1', 'abc'])('rejects %p as a dimension', (value) => {
    expect(run('concrete', 'footing', { length: value, width: '1', thickness: '0.5', quantity: '1' })).toBeUndefined();
  });
});
