import type { ConstructionTakeoff } from '../construction-estimate';
import { buildLines, formatMoney, formatQuantity } from '../estimate-lines';
import { sanitizeNumeric } from '../numeric-input';

const takeoff: ConstructionTakeoff = {
  measure: { label: 'Volume', value: 1, unit: 'm³' },
  assumptions: [],
  items: [
    { id: 'cement-bag', label: 'Cement', quantity: 9, unit: 'bags', unitPriceLabel: 'Cement · per bag' },
    { id: 'sand', label: 'Sand', quantity: 0.5, unit: 'm³', unitPriceLabel: 'Sand · per m³' },
    { id: 'chb', label: 'CHB', quantity: 100, unit: 'pcs', unitPriceLabel: 'CHB · per piece', wastageAllowed: false },
  ],
};
const none = { overrides: {}, wastage: {} };
const line = (summary: ReturnType<typeof buildLines>, id: string) => summary.lines.find((l) => l.id === id)!;

describe('buildLines', () => {
  it('shows quantities with no prices and asks for each missing price', () => {
    const s = buildLines(takeoff, {}, none);
    expect(s.total).toBeUndefined();
    expect(s.missingPriceCount).toBe(3);
    expect(line(s, 'cement-bag').quantity).toBe(9);
  });

  it('totals line costs once every material is priced', () => {
    const s = buildLines(takeoff, { 'cement-bag': '250', sand: '1200', chb: '15' }, none);
    expect(s.total).toBe(9 * 250 + 0.5 * 1200 + 100 * 15);
  });

  it('defaults wastage to zero and rounds bags up when wastage is added', () => {
    const base = buildLines(takeoff, {}, none);
    expect(line(base, 'cement-bag').quantity).toBe(9);
    const s = buildLines(takeoff, {}, { overrides: {}, wastage: { 'cement-bag': '10', sand: '10' } });
    expect(line(s, 'cement-bag').quantity).toBe(10); // 9.9 bags, whole units
    expect(line(s, 'sand').quantity).toBeCloseTo(0.55); // bulk keeps decimals
  });

  it('never applies wastage to items that already include breakage', () => {
    const s = buildLines(takeoff, {}, { overrides: {}, wastage: { chb: '50' } });
    expect(line(s, 'chb').quantity).toBe(100);
  });

  it('a manual override wins over calculated quantity and is tagged adjusted', () => {
    const s = buildLines(takeoff, { 'cement-bag': '250' }, { overrides: { 'cement-bag': '12' }, wastage: { 'cement-bag': '10' } });
    expect(line(s, 'cement-bag').quantity).toBe(12);
    expect(line(s, 'cement-bag').isAdjusted).toBe(true);
    expect(line(s, 'cement-bag').calculatedQuantity).toBe(9);
    expect(line(s, 'cement-bag').cost).toBe(3000);
  });

  it('rejects fractional bag and piece overrides but accepts fractional bulk', () => {
    const s = buildLines(takeoff, {}, { overrides: { 'cement-bag': '2.5', sand: '0.75' }, wastage: {} });
    expect(line(s, 'cement-bag').overrideValid).toBe(false);
    expect(line(s, 'sand').overrideValid).toBe(true);
    expect(s.hasInvalidInput).toBe(true);
  });

  it('rejects negative prices and negative wastage', () => {
    const s = buildLines(takeoff, { sand: '-5' }, { overrides: {}, wastage: { 'cement-bag': '-1' } });
    expect(line(s, 'sand').priceValid).toBe(false);
    expect(line(s, 'cement-bag').wastageValid).toBe(false);
    expect(s.total).toBeUndefined();
  });

  it('accepts a zero price', () => {
    const s = buildLines(takeoff, { 'cement-bag': '0', sand: '0', chb: '0' }, none);
    expect(s.total).toBe(0);
  });

  it('flags a cost too large to calculate', () => {
    const s = buildLines(takeoff, { 'cement-bag': '1e308', sand: '1', chb: '1' }, { overrides: { 'cement-bag': '1e10' }, wastage: {} });
    expect(s.hasCostOverflow).toBe(true);
    expect(s.total).toBeUndefined();
  });
});

describe('formatting (en-PH, PHP)', () => {
  it('formats money with the peso sign', () => {
    expect(formatMoney(2400)).toBe('₱2,400.00');
  });
  it('uses singular bag and piece', () => {
    expect(formatQuantity(1, 'bags')).toBe('1 bag');
    expect(formatQuantity(1, 'pcs')).toBe('1 pc');
    expect(formatQuantity(22, 'bags')).toBe('22 bags');
  });
  it('keeps decimals on bulk quantities', () => {
    expect(formatQuantity(1.25, 'm³')).toBe('1.25 m³');
  });
});

describe('sanitizeNumeric', () => {
  it.each([
    ['1,5', false, '1.5'],
    ['1,500', false, '1500'],
    ['1,234,567.5', false, '1234567.5'],
    ['12.3.4', false, '12.34'],
    ['abc', false, ''],
    ['-5', false, '5'],
    ['4.5', true, '45'],
    ['1234567890123456', false, '123456789012'],
    ['5,', false, '5.'],
  ])('%p (whole=%p) becomes %p', (input, whole, expected) => {
    expect(sanitizeNumeric(input, whole)).toBe(expected);
  });
});
