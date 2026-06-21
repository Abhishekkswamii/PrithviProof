import { z } from "zod";

// --- Enums & Literals ---
export const ActivityCategory = z.enum(["transport", "energy", "food", "purchases", "waste"]);
export type ActivityCategory = z.infer<typeof ActivityCategory>;

export const Unit = z.enum(["km", "miles", "kWh", "therms", "kg", "lbs", "USD", "EUR"]);
export type Unit = z.infer<typeof Unit>;

export const LedgerState = z.enum(["estimated", "planned", "in-progress", "verified", "rejected"]);
export type LedgerState = z.infer<typeof LedgerState>;

// --- Provenance & Factors ---
export const FactorProvenance = z.object({
  sourceName: z.string(),
  year: z.number().int(),
  geography: z.string(),
  url: z.string().url().optional(),
});
export type FactorProvenance = z.infer<typeof FactorProvenance>;

export const EmissionFactor = z.object({
  id: z.string(),
  category: ActivityCategory,
  name: z.string(),
  value: z.number().nonnegative(), // kgCO2e per unit
  unit: Unit,
  uncertaintyPercent: z.number().nonnegative(), // e.g. 10 for ±10%
  provenance: FactorProvenance,
});
export type EmissionFactor = z.infer<typeof EmissionFactor>;

// --- Activities & Estimates ---
export const Activity = z.object({
  id: z.string(),
  categoryId: ActivityCategory,
  factorId: z.string(),
  value: z.number().nonnegative(),
  unit: Unit,
  dataQualityScore: z.number().min(0).max(100), // 100 = perfect confidence (metered), 0 = pure guess
});
export type Activity = z.infer<typeof Activity>;

export const EmissionEstimate = z.object({
  activityId: z.string(),
  central: z.number().nonnegative(), // kgCO2e
  low: z.number().nonnegative(),
  high: z.number().nonnegative(),
});
export type EmissionEstimate = z.infer<typeof EmissionEstimate>;

export const UncertaintyContribution = z.object({
  activityId: z.string(),
  variance: z.number().nonnegative(), // Variance contribution
  percentageOfTotal: z.number().min(0).max(100),
});
export type UncertaintyContribution = z.infer<typeof UncertaintyContribution>;

// --- Adaptive Questions ---
export const AdaptiveQuestion = z.object({
  id: z.string(),
  factorId: z.string().optional(),
  categoryId: ActivityCategory,
  text: z.string(),
  type: z.enum(["number", "choice", "boolean"]),
  unit: Unit.optional(),
  options: z.array(z.object({ label: z.string(), value: z.any() })).optional(),
  informationGainPotential: z.number().nonnegative(), // Heuristic for how much this reduces uncertainty
});
export type AdaptiveQuestion = z.infer<typeof AdaptiveQuestion>;

// --- Constraints & Recommendations ---
export const UserConstraints = z.object({
  budgetAvailable: z.number().nonnegative(),
  housingType: z.enum(["apartment", "house", "shared"]),
  ownership: z.enum(["own", "rent"]),
  hasCar: z.boolean(),
});
export type UserConstraints = z.infer<typeof UserConstraints>;

export const Recommendation = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  categoryId: ActivityCategory,
  expectedReductionKgCO2e: z.number().nonnegative(),
  confidencePercent: z.number().min(0).max(100),
  costEstimateUSD: z.number().nonnegative(),
  effortScore: z.number().min(1).max(10), // 1 = easy, 10 = hard
  requiredConstraints: z.object({
    minBudget: z.number().optional(),
    housingType: z.array(z.string()).optional(),
    ownership: z.array(z.string()).optional(),
  }).optional(),
});
export type Recommendation = z.infer<typeof Recommendation>;

// --- Evidence Ledger ---
export const LedgerRecord = z.object({
  id: z.string(),
  recommendationId: z.string(),
  title: z.string(),
  state: LedgerState,
  projectedSavingsKgCO2e: z.number().nonnegative(),
  verifiedSavingsKgCO2e: z.number().nonnegative(),
  evidenceUrls: z.array(z.string().url()).optional(),
  updatedAt: z.string().datetime(),
});
export type LedgerRecord = z.infer<typeof LedgerRecord>;
