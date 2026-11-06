import { calculateConstructionTakeoff } from '../construction-estimate';
import { buildLines } from '../estimate-lines';
import {
  buildEstimateText,
  EXCLUSIONS_SENTENCE,
  PLANNING_NOTICE,
  type ShareableTakeoff,
} from '../estimate-text';

const date = new Date('2026-11-06T00:00:00Z');

function entry(prices: Record<string, string>, overrides: Record<string, string> = {}): ShareableTakeoff {
  const takeoff = calculateConstructionTakeoff('concrete', 'footing', {
    length: '1', width: '1', thickness: '0.5', quantity: '1',
  });
  return {
    title: 'Footing',
    subtitle: 'Concreting Works',
    takeoff,
    summary: takeoff ? buildLines(takeoff, prices, { overrides, wastage: {} }) : undefined,
  };
}

describe('buildEstimateText', () => {
  it('lists quantities, prices, costs, the total, and both required notices', () => {
    const prices = { 'cement-bag': '250', 'sand-cubic-metre': '1000', 'gravel-cubic-metre': '1500' };
    const e = entry(prices);
    const total = e.summary?.total;
    const text = buildEstimateText([e], total, 0, date);
    expect(text).toContain('1. Footing (Concreting Works)');
    expect(text).toContain('Cement: 5 bags × ₱250.00 = ₱1,250.00');
    expect(text).toContain('Total Estimated Material Cost: ₱');
    expect(text).toContain(EXCLUSIONS_SENTENCE);
    expect(text).toContain(PLANNING_NOTICE);
  });

  it('says the total is incomplete and marks missing prices', () => {
    const e = entry({ 'cement-bag': '250' });
    const text = buildEstimateText([e], undefined, 2, date);
    expect(text).toContain('Cement: 5 bags × ₱250.00');
    expect(text).toContain('Sand: 0.3 m³ — price not entered');
    expect(text).toContain('incomplete, 2 unit prices still to enter');
    expect(text).not.toMatch(/Total Estimated Material Cost: ₱/);
  });

  it('marks manual quantities', () => {
    const e = entry({ 'cement-bag': '250' }, { 'cement-bag': '12' });
    expect(buildEstimateText([e], undefined, 2, date)).toContain('Cement: 12 bags (manual quantity)');
  });

  it('never invents a price', () => {
    const text = buildEstimateText([entry({})], undefined, 3, date);
    expect(text).not.toMatch(/₱\d/);
  });
});
