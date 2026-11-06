import { useMemo } from 'react';

import { findCalculator, MODULES } from '@/constants/calculators';
import { useEstimateStore, type SavedTakeoff } from '@/store/estimate-store';
import { calculateConstructionTakeoff, type ConstructionTakeoff } from '@/utils/construction-estimate';
import { buildLines, type TakeoffSummary } from '@/utils/estimate-lines';

export type TakeoffEntry = {
  saved: SavedTakeoff;
  title: string;
  subtitle: string;
  takeoff: ConstructionTakeoff | undefined;
  summary: TakeoffSummary | undefined;
};

export function useEstimateSummary() {
  const { takeoffs, prices } = useEstimateStore();

  return useMemo(() => {
    const entries: TakeoffEntry[] = takeoffs.map((saved) => {
      const calculator = findCalculator(saved.module, saved.calculatorId);
      const takeoff = calculateConstructionTakeoff(saved.module, saved.calculatorId, saved.values);
      return {
        saved,
        title: calculator?.label ?? saved.calculatorId,
        subtitle: MODULES[saved.module].title,
        takeoff,
        summary: takeoff
          ? buildLines(takeoff, prices, { overrides: saved.overrides, wastage: saved.wastage })
          : undefined,
      };
    });

    const summaries = entries.map((entry) => entry.summary);
    const allPriced = summaries.length > 0 && summaries.every((s) => s?.total !== undefined);
    const total = allPriced
      ? summaries.reduce((sum, s) => sum + (s?.total ?? 0), 0)
      : undefined;
    const pricedIds = new Set<string>();
    const missingIds = new Set<string>();
    for (const entry of entries) {
      for (const line of entry.summary?.lines ?? []) {
        if (line.priceRaw.trim() === '') missingIds.add(line.id);
        else pricedIds.add(line.id);
      }
    }

    return {
      entries,
      total: total !== undefined && Number.isFinite(total) ? total : undefined,
      missingPriceCount: missingIds.size,
      hasInvalidInput: summaries.some((s) => s?.hasInvalidInput || s?.hasCostOverflow),
    };
  }, [takeoffs, prices]);
}
