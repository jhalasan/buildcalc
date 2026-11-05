export type ConcreteMix = {
  cement: number;
  sand: number;
  aggregate: number;
};

export type MaterialPrices = {
  cementPerBag: number;
  sandPerCubicMetre: number;
  aggregatePerCubicMetre: number;
};

export type ConcreteEstimateInput = {
  length: number;
  width: number;
  height: number;
  quantity: number;
  mix: ConcreteMix;
  prices: MaterialPrices;
};

export type ConcreteEstimate = {
  wetVolume: number;
  dryVolume: number;
  cementBags: number;
  sandVolume: number;
  aggregateVolume: number;
  cementCost: number;
  sandCost: number;
  aggregateCost: number;
  totalCost: number;
};

export const DEFAULT_MIX: ConcreteMix = {
  cement: 1,
  sand: 2,
  aggregate: 4,
};

export const DRY_VOLUME_FACTOR = 1.54;
export const CEMENT_DENSITY_KG_PER_CUBIC_METRE = 1440;
export const CEMENT_BAG_WEIGHT_KG = 50;

export function calculateConcreteEstimate(input: ConcreteEstimateInput): ConcreteEstimate {
  const wetVolume = input.length * input.width * input.height * input.quantity;
  const dryVolume = wetVolume * DRY_VOLUME_FACTOR;
  const mixParts = input.mix.cement + input.mix.sand + input.mix.aggregate;
  const cementVolume = (dryVolume * input.mix.cement) / mixParts;
  const requiredCementBags =
    (cementVolume * CEMENT_DENSITY_KG_PER_CUBIC_METRE) / CEMENT_BAG_WEIGHT_KG;
  const cementBags = Math.ceil(requiredCementBags - 1e-10);
  const sandVolume = (dryVolume * input.mix.sand) / mixParts;
  const aggregateVolume = (dryVolume * input.mix.aggregate) / mixParts;
  const cementCost = cementBags * input.prices.cementPerBag;
  const sandCost = sandVolume * input.prices.sandPerCubicMetre;
  const aggregateCost = aggregateVolume * input.prices.aggregatePerCubicMetre;

  return {
    wetVolume,
    dryVolume,
    cementBags,
    sandVolume,
    aggregateVolume,
    cementCost,
    sandCost,
    aggregateCost,
    totalCost: cementCost + sandCost + aggregateCost,
  };
}
