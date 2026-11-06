import type { ConstructionTakeoff } from './construction-estimate';
import { formatMoney, formatNumber, formatQuantity, type TakeoffSummary } from './estimate-lines';

export type ShareableTakeoff = {
  title: string;
  subtitle: string;
  takeoff: ConstructionTakeoff | undefined;
  summary: TakeoffSummary | undefined;
};

export const EXCLUSIONS_SENTENCE =
  'Material costs only. Labor, equipment, overhead, and other construction expenses are excluded.';
export const PLANNING_NOTICE =
  'Workbook-based planning estimates, not engineering approval. Verify material quantities, mixes, and specifications with a qualified construction professional before ordering or building.';

/** Plain-text copy of the current estimate, for sharing from the Estimate tab. */
export function buildEstimateText(
  entries: readonly ShareableTakeoff[],
  total: number | undefined,
  missingPriceCount: number,
  date: Date = new Date()
): string {
  const lines: string[] = [
    'Buildcalc material estimate',
    new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(date),
    '',
  ];

  entries.forEach((entry, index) => {
    lines.push(`${index + 1}. ${entry.title} (${entry.subtitle})`);
    if (entry.takeoff) {
      const { label, value, unit } = entry.takeoff.measure;
      lines.push(`   ${label}: ${formatNumber(value)} ${unit}`);
    }
    for (const line of entry.summary?.lines ?? []) {
      const quantity = line.quantity === undefined ? '—' : formatQuantity(line.quantity, line.unit);
      const manual = line.isAdjusted ? ' (manual quantity)' : '';
      const price =
        line.unitPrice !== undefined && line.priceValid
          ? ` × ${formatMoney(line.unitPrice)} = ${line.cost === undefined ? '—' : formatMoney(line.cost)}`
          : ' — price not entered';
      lines.push(`   - ${line.label}: ${quantity}${manual}${price}`);
    }
    if (entry.summary?.total !== undefined) {
      lines.push(`   Subtotal: ${formatMoney(entry.summary.total)}`);
    }
    lines.push('');
  });

  lines.push(
    total === undefined
      ? `Total Estimated Material Cost: incomplete, ${missingPriceCount || 1} unit ${missingPriceCount === 1 ? 'price' : 'prices'} still to enter`
      : `Total Estimated Material Cost: ${formatMoney(total)}`
  );
  lines.push(EXCLUSIONS_SENTENCE, '', PLANNING_NOTICE);
  return lines.join('\n');
}
