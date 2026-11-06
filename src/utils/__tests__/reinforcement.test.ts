import { calculateConstructionTakeoff } from '../construction-estimate';

/** Expected values are the cached results in docs/CONST-ESTIMATE-MADE-EASY.xls (REINFORCEMENT sheet). */
function qty(takeoff: ReturnType<typeof calculateConstructionTakeoff>, id: string) {
  return takeoff?.items.find((item) => item.id === id)?.quantity;
}
const run = (calculator: Parameters<typeof calculateConstructionTakeoff>[1], values: Record<string, string>) =>
  calculateConstructionTakeoff('reinforcement', calculator, values);

describe('reinforcement: workbook examples', () => {
  it('CHB wall: 1.1 m x 10.8 m, 60 cm vertical, 3 layers', () => {
    const t = run('chb-rebar', {
      height: '1.1', length: '10.8', openings: '0', verticalSpacing: '60', layers: '3',
      verticalDiameter: '10', horizontalDiameter: '10',
    });
    expect(qty(t, 'rebar-10mm')).toBe(10); // 5 vertical + 5 horizontal, same diameter merges
    expect(qty(t, 'tie-wire-kg')).toBe(0.6);
  });

  it('footing matting rounds the workbook fraction (7.29) up to whole bars', () => {
    const t = run('footing-matting', {
      length: '1', width: '0.75', barsAlongLength: '5', barsAlongWidth: '5', quantity: '5', barDiameter: '12',
    });
    expect(qty(t, 'rebar-12mm')).toBe(8);
    expect(qty(t, 'tie-wire-kg')).toBe(1);
  });

  it('wall footing', () => {
    const t = run('wall-footing-rebar', { width: '0.3', length: '23.3', tieSpacing: '0.4', barDiameter: '10' });
    expect(qty(t, 'rebar-10mm')).toBe(12);
    expect(qty(t, 'tie-wire-kg')).toBe(1);
  });

  it('rectangular column', () => {
    const t = run('rect-column-rebar', {
      height: '3', quantity: '9', verticalDiameter: '12', widthA: '0.3', widthB: '0.3',
      verticalBars: '4', stirrupDiameter: '10', stirrupSpacing: '0.2',
    });
    expect(qty(t, 'rebar-12mm')).toBe(36);
    expect(qty(t, 'rebar-10mm')).toBe(43);
    expect(qty(t, 'tie-wire-kg')).toBe(5.3);
  });

  it('circular column: ties and spiral', () => {
    const base = {
      height: '3.5', quantity: '8', verticalDiameter: '12', diameter: '0.3',
      verticalBars: '6', stirrupDiameter: '10', stirrupSpacing: '0.2',
    };
    const ties = run('circular-column-rebar', { ...base, stirrupType: 'ties' });
    expect(qty(ties, 'rebar-12mm')).toBe(48);
    expect(qty(ties, 'rebar-10mm')).toBe(35);
    expect(qty(ties, 'tie-wire-kg')).toBe(7.8);
    const spiral = run('circular-column-rebar', { ...base, stirrupType: 'spiral' });
    expect(qty(spiral, 'rebar-10mm')).toBe(30);
  });

  it('one-bay beam', () => {
    const t = run('beam-one-bay', {
      length: '4', width: '0.25', depth: '0.4', columnWidth: '0.3',
      topContinuous: '10', topNonContinuous: '', topSize: '20',
      webContinuous: '', webSize: '10',
      bottomContinuous: '2', bottomNonContinuous: '', bottomSize: '20',
      stirrupDiameter: '10', stirrupSpacing: '0.1',
    });
    expect(qty(t, 'rebar-20mm')).toBe(10); // 8 top + 2 bottom
    expect(qty(t, 'rebar-10mm')).toBe(10); // stirrups
    expect(qty(t, 'tie-wire-kg')).toBe(1.6);
  });

  it('two-bay beam flags the corrected workbook cells', () => {
    const t = run('beam-two-bays', {
      length1: '3.9', length2: '4', width: '0.25', depth: '0.3', columnWidth: '0.3',
      topContinuous: '4', topNonContinuous: '2', topSize: '10',
      webContinuous: '', webSize: '10',
      bottomContinuous: '2', bottomNonContinuous: '0', bottomSize: '12',
      stirrupDiameter: '10', stirrupSpacing: '0.2',
    });
    expect(t?.warnings?.length).toBeGreaterThan(0);
    expect(qty(t, 'tie-wire-kg')).toBe(2.4);
  });

  it('one-way and two-way slabs', () => {
    const one = run('slab-one-way', { length: '9', width: '7', spacing: '22.2', barDiameter: '10' });
    expect(qty(one, 'rebar-10mm')).toBe(113);
    expect(qty(one, 'tie-wire-kg')).toBe(7);
    const two = run('slab-two-way', { length: '1.87', width: '6.3', spacing: '15', barDiameter: '10' });
    expect(qty(two, 'rebar-10mm')).toBe(38);
    expect(qty(two, 'tie-wire-kg')).toBe(5);
  });

  it('ground slab with wide spacing', () => {
    const t = run('ground-slab-rebar', {
      length: '10.197', width: '11.595', spacingAlongWidth: '40', spacingAlongLength: '40', barDiameter: '10',
    });
    expect(qty(t, 'rebar-10mm')).toBe(112); // 56 + 56
    expect(qty(t, 'tie-wire-kg')).toBe(18);
  });

  it('stairs', () => {
    const t = run('stairs-rebar', {
      riser: '0.17', tread: '0.31', width: '1.25', steps: '35', stepSpacing: '0.3',
      stringerSpacing: '0.3', lateralDiameter: '12', horizontalDiameter: '10',
    });
    expect(qty(t, 'rebar-12mm')).toBe(31); // 18 + 13
    expect(qty(t, 'rebar-10mm')).toBe(30); // 22 + 8
    expect(qty(t, 'tie-wire-kg')).toBe(4);
  });
});

describe('reinforcement: invalid input', () => {
  it.each([
    ['blank height', { height: '', length: '10', openings: '0' }],
    ['negative length', { height: '2', length: '-1', openings: '0' }],
    ['openings larger than the wall', { height: '2', length: '2', openings: '5' }],
  ])('CHB wall rejects %s', (_name, values) => {
    expect(
      run('chb-rebar', { verticalSpacing: '60', layers: '3', verticalDiameter: '10', horizontalDiameter: '10', ...values })
    ).toBeUndefined();
  });

  it('column rejects an unsupported vertical bar size', () => {
    expect(
      run('rect-column-rebar', {
        height: '3', quantity: '1', verticalDiameter: '10', widthA: '0.3', widthB: '0.3',
        verticalBars: '4', stirrupDiameter: '10', stirrupSpacing: '0.2',
      })
    ).toBeUndefined();
  });
});
