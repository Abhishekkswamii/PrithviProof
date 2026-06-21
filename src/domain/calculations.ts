import { Activity, EmissionEstimate, UncertaintyContribution, Unit } from "./models";
import { getFactorById } from "./factors";

// --- Unit Normalization ---
const UNIT_CONVERSIONS: Record<string, number> = {
  "miles_to_km": 1.60934,
  "lbs_to_kg": 0.453592,
  "EUR_to_USD": 1.10, // Assuming static exchange rate for now
};

export function normalizeUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (Number.isNaN(value) || value < 0) return 0;
  if (fromUnit === toUnit) return value;
  const key = `${fromUnit}_to_${toUnit}`;
  const invKey = `${toUnit}_to_${fromUnit}`;

  if (UNIT_CONVERSIONS[key]) return value * UNIT_CONVERSIONS[key];
  if (UNIT_CONVERSIONS[invKey]) return value / UNIT_CONVERSIONS[invKey];

  // If no conversion is defined and units mismatch, default to 0 to avoid invalid state.
  return 0;
}

// --- Confidence / Data Quality ---
export function calculateCombinedUncertainty(dataQualityScore: number, factorUncertaintyPercent: number): number {
  // dataQualityScore: 0 (guess) to 100 (metered)
  // Translate data quality to a percentage uncertainty for the activity value.
  // Assume: 100 score = 0% uncertainty, 0 score = 50% uncertainty (heuristic bounds).
  const activityUncertaintyPercent = Math.max(0, 50 - (dataQualityScore / 2));

  // Error propagation (root sum square of relative errors)
  const relativeActivityError = activityUncertaintyPercent / 100;
  const relativeFactorError = factorUncertaintyPercent / 100;
  
  const combinedRelativeError = Math.sqrt(
    Math.pow(relativeActivityError, 2) + Math.pow(relativeFactorError, 2)
  );

  return Math.min(100, combinedRelativeError * 100); // Cap at 100%
}

// --- Calculations ---
export function calculateEstimate(activity: Activity): EmissionEstimate {
  const factor = getFactorById(activity.factorId);
  if (!factor || Number.isNaN(activity.value) || activity.value < 0) {
    return { activityId: activity.id, central: 0, low: 0, high: 0 };
  }

  // Normalize activity value to factor unit
  const normalizedValue = normalizeUnit(activity.value, activity.unit, factor.unit);
  const central = normalizedValue * factor.value;

  const combinedUncertainty = calculateCombinedUncertainty(activity.dataQualityScore, factor.uncertaintyPercent);
  
  const spread = central * (combinedUncertainty / 100);
  const low = Math.max(0, central - spread);
  const high = central + spread;

  return {
    activityId: activity.id,
    central,
    low,
    high
  };
}

export function calculateCategoryTotals(estimates: EmissionEstimate[], activities: Activity[]): Record<string, { central: number, low: number, high: number }> {
  const totals: Record<string, { central: number, low: number, high: number }> = {};
  
  for (const est of estimates) {
    const act = activities.find(a => a.id === est.activityId);
    if (!act) continue;

    if (!totals[act.categoryId]) {
      totals[act.categoryId] = { central: 0, low: 0, high: 0 };
    }
    
    totals[act.categoryId].central += est.central;
    // Simple addition of bounds (assumes perfect correlation for worst-case, though quadrature could be used)
    totals[act.categoryId].low += est.low;
    totals[act.categoryId].high += est.high;
  }

  return totals;
}

// --- Uncertainty Decomposition ---
export function calculateUncertaintyContributions(estimates: EmissionEstimate[]): UncertaintyContribution[] {
  const contributions: UncertaintyContribution[] = [];
  let totalVariance = 0;

  for (const est of estimates) {
    // Assuming spread (high - central) represents roughly 2 std deviations
    // Variance is proportional to square of standard deviation
    const spread = est.high - est.central;
    const stdDev = spread / 2;
    const variance = stdDev * stdDev;
    
    contributions.push({
      activityId: est.activityId,
      variance,
      percentageOfTotal: 0
    });
    totalVariance += variance;
  }

  if (totalVariance > 0) {
    for (const c of contributions) {
      c.percentageOfTotal = (c.variance / totalVariance) * 100;
    }
  }

  // Sort descending by percentage
  return contributions.sort((a, b) => b.percentageOfTotal - a.percentageOfTotal);
}
