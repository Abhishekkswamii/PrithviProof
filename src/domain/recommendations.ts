import { Recommendation, UserConstraints } from "./models";

export function isConstraintSatisfied(rec: Recommendation, constraints: UserConstraints): boolean {
  if (!rec.requiredConstraints) return true;

  const req = rec.requiredConstraints;
  
  if (req.minBudget !== undefined && constraints.budgetAvailable < req.minBudget) {
    return false;
  }

  if (req.housingType !== undefined && !req.housingType.includes(constraints.housingType)) {
    return false;
  }

  if (req.ownership !== undefined && !req.ownership.includes(constraints.ownership)) {
    return false;
  }

  return true;
}

export function rankRecommendations(
  recommendations: Recommendation[],
  constraints: UserConstraints,
  activeLedgerRecommendationIds: string[]
): Recommendation[] {
  // Filter out recommendations that violate constraints or are already in the ledger
  const valid = recommendations.filter(rec => {
    if (activeLedgerRecommendationIds.includes(rec.id)) return false; // Prevent double counting
    return isConstraintSatisfied(rec, constraints);
  });

  // Rank by a heuristic score: (Impact * Confidence) / (Cost + Effort * Weight)
  // Higher is better.
  return valid.sort((a, b) => {
    const scoreA = (a.expectedReductionKgCO2e * (a.confidencePercent / 100)) / (a.costEstimateUSD + 1 + a.effortScore * 10);
    const scoreB = (b.expectedReductionKgCO2e * (b.confidencePercent / 100)) / (b.costEstimateUSD + 1 + b.effortScore * 10);
    return scoreB - scoreA; // Descending
  });
}
