import {
  applyWastageAllowance,
  type ConstructionTakeoff,
  type EstimateValues,
} from '@/utils/construction-estimate';

export function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formatNumber(value: number, maximumFractionDigits = 3): string {
  return new Intl.NumberFormat('en-PH', { maximumFractionDigits }).format(value);
}

export function formatQuantity(quantity: number, unit: string): string {
  const digits = unit === 'bags' || unit === 'pcs' || unit === 'gal' ? 0 : 3;
  const formattedUnit =
    quantity === 1 && unit === 'bags' ? 'bag' : quantity === 1 && unit === 'pcs' ? 'pc' : unit;
  return `${formatNumber(quantity, digits)} ${formattedUnit}`;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    currencyDisplay: 'symbol',
  }).format(value);
}

/** "Cement · per 50 kg bag" becomes "Price per 50 kg bag" where the material is already named nearby. */
export function priceFieldLabel(unitPriceLabel: string): string {
  const parts = unitPriceLabel.split(' · ');
  return parts.length > 1 ? `Price ${parts.slice(1).join(' · ')}` : unitPriceLabel;
}

export type TakeoffAdjustments = {
  overrides: EstimateValues;
  wastage: EstimateValues;
};

export type EstimateLine = {
  id: string;
  label: string;
  unit: string;
  unitPriceLabel: string;
  wastageAllowed: boolean;
  calculatedQuantity: number;
  quantity: number | undefined;
  override: string;
  overrideValid: boolean;
  isAdjusted: boolean;
  wastageRaw: string;
  wastageValid: boolean;
  priceRaw: string;
  priceValid: boolean;
  unitPrice: number | undefined;
  cost: number | undefined;
};

export type TakeoffSummary = {
  lines: EstimateLine[];
  total: number | undefined;
  missingPriceCount: number;
  hasInvalidInput: boolean;
  hasCostOverflow: boolean;
};

export function buildLines(
  takeoff: ConstructionTakeoff,
  prices: EstimateValues,
  adjustments: TakeoffAdjustments
): TakeoffSummary {
  const lines = takeoff.items.map<EstimateLine>((item) => {
    const wastageAllowed = item.wastageAllowed !== false;
    const override = adjustments.overrides[item.id] ?? '';
    const wastageRaw = adjustments.wastage[item.id] ?? '0';
    const wastagePercent = parseNumber(wastageRaw);
    const wastageInputValid =
      wastageRaw.trim() === '' || (wastagePercent !== undefined && wastagePercent >= 0);
    const quantityWithWastage = !wastageAllowed
      ? item.quantity
      : wastageInputValid
        ? applyWastageAllowance(item, wastagePercent ?? 0)
        : undefined;
    const parsedOverride = parseNumber(override);
    const hasOverride = override.trim() !== '';
    const wastageValid =
      !wastageAllowed || hasOverride || (wastageInputValid && quantityWithWastage !== undefined);
    const overrideValid =
      !hasOverride ||
      (parsedOverride !== undefined &&
        parsedOverride >= 0 &&
        ((item.unit !== 'bags' && item.unit !== 'pcs' && item.unit !== 'gal') ||
          Number.isInteger(parsedOverride)));
    const quantity = !hasOverride ? quantityWithWastage : overrideValid ? parsedOverride : undefined;
    const priceRaw = prices[item.id] ?? '';
    const unitPrice = parseNumber(priceRaw);
    const priceValid = priceRaw.trim() === '' || (unitPrice !== undefined && unitPrice >= 0);
    const cost =
      quantity !== undefined && unitPrice !== undefined && unitPrice >= 0
        ? quantity * unitPrice
        : undefined;
    return {
      id: item.id,
      label: item.label,
      unit: item.unit,
      unitPriceLabel: item.unitPriceLabel,
      wastageAllowed,
      calculatedQuantity: item.quantity,
      quantity,
      override,
      overrideValid,
      isAdjusted: hasOverride && overrideValid,
      wastageRaw,
      wastageValid,
      priceRaw,
      priceValid,
      unitPrice,
      cost,
    };
  });

  const allCosted = lines.every((line) => line.cost !== undefined);
  const sum = allCosted ? lines.reduce((total, line) => total + (line.cost ?? 0), 0) : undefined;
  const hasCostOverflow =
    (sum !== undefined && !Number.isFinite(sum)) ||
    lines.some((line) => line.cost !== undefined && !Number.isFinite(line.cost));

  return {
    lines,
    total: sum !== undefined && Number.isFinite(sum) ? sum : undefined,
    missingPriceCount: lines.filter((line) => line.priceRaw.trim() === '').length,
    hasInvalidInput: lines.some((line) => !line.overrideValid || !line.wastageValid || !line.priceValid),
    hasCostOverflow,
  };
}
