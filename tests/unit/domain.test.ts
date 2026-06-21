import { describe, it, expect } from "vitest";
import { 
  normalizeUnit, 
  calculateCombinedUncertainty, 
  calculateEstimate, 
  calculateCategoryTotals, 
  calculateUncertaintyContributions 
} from "../../src/domain/calculations";
import { 
  selectNextQuestion, 
  defaultQuestions 
} from "../../src/domain/adaptive";
import { 
  isConstraintSatisfied, 
  rankRecommendations 
} from "../../src/domain/recommendations";
import { 
  isValidTransition, 
  transitionLedgerState, 
  calculateTotalSavings 
} from "../../src/domain/ledger";
import { Activity, EmissionEstimate, LedgerRecord, Recommendation, UserConstraints } from "../../src/domain/models";

describe("Calculations - Normalization", () => {
  it("normalizes miles to km", () => {
    expect(normalizeUnit(10, "miles", "km")).toBeCloseTo(16.0934);
  });
  
  it("normalizes km to miles (inverse)", () => {
    expect(normalizeUnit(16.0934, "km", "miles")).toBeCloseTo(10);
  });
  
  it("normalizes lbs to kg", () => {
    expect(normalizeUnit(10, "lbs", "kg")).toBeCloseTo(4.53592);
  });

  it("handles identical units", () => {
    expect(normalizeUnit(10, "km", "km")).toBe(10);
  });

  it("returns 0 for negative values", () => {
    expect(normalizeUnit(-5, "miles", "km")).toBe(0);
  });

  it("returns 0 for NaN", () => {
    expect(normalizeUnit(NaN, "miles", "km")).toBe(0);
  });

  it("returns 0 for incompatible units", () => {
    expect(normalizeUnit(10, "km", "lbs")).toBe(0);
  });
});

describe("Calculations - Estimates", () => {
  it("calculates normal estimate correctly", () => {
    const act: Activity = {
      id: "a1", categoryId: "transport", factorId: "f-car-gas",
      value: 100, unit: "km", dataQualityScore: 100
    };
    const est = calculateEstimate(act);
    expect(est.central).toBeCloseTo(19.2); // 100 * 0.192
    // Factor f-car-gas has 15% uncertainty.
    // Quality 100 -> 0% activity error -> 15% combined.
    expect(est.low).toBeCloseTo(19.2 * 0.85);
    expect(est.high).toBeCloseTo(19.2 * 1.15);
  });

  it("returns 0 for missing factors", () => {
    const act: Activity = {
      id: "a1", categoryId: "transport", factorId: "non-existent",
      value: 100, unit: "km", dataQualityScore: 100
    };
    const est = calculateEstimate(act);
    expect(est.central).toBe(0);
    expect(est.low).toBe(0);
    expect(est.high).toBe(0);
  });

  it("returns 0 for negative activity values (invariant check)", () => {
    const act: Activity = {
      id: "a1", categoryId: "transport", factorId: "f-car-gas",
      value: -100, unit: "km", dataQualityScore: 100
    };
    const est = calculateEstimate(act);
    expect(est.central).toBe(0);
  });

  it("degrades confidence accurately", () => {
    const actPerfect: Activity = { ...actTemplate(), dataQualityScore: 100 };
    const actPoor: Activity = { ...actTemplate(), dataQualityScore: 0 };
    
    const estP = calculateEstimate(actPerfect);
    const estPoor = calculateEstimate(actPoor);
    
    // Spread should be wider for poor quality
    expect(estPoor.high - estPoor.low).toBeGreaterThan(estP.high - estP.low);
  });

  it("never goes negative on low bound", () => {
    const act: Activity = {
      id: "a1", categoryId: "transport", factorId: "f-car-gas",
      value: 1, unit: "km", dataQualityScore: 0 // huge uncertainty
    };
    const est = calculateEstimate(act);
    expect(est.low).toBeGreaterThanOrEqual(0);
  });
});

describe("Calculations - Totals and Decomposition", () => {
  it("calculates category totals", () => {
    const estimates = [
      { activityId: "a1", central: 10, low: 8, high: 12 },
      { activityId: "a2", central: 20, low: 15, high: 25 },
    ];
    const activities: Activity[] = [
      { id: "a1", categoryId: "transport", factorId: "f1", value: 1, unit: "km", dataQualityScore: 100 },
      { id: "a2", categoryId: "transport", factorId: "f2", value: 1, unit: "km", dataQualityScore: 100 },
    ];
    
    const totals = calculateCategoryTotals(estimates, activities);
    expect(totals["transport"].central).toBe(30);
    expect(totals["transport"].low).toBe(23);
    expect(totals["transport"].high).toBe(37);
  });

  it("ignores estimates without matching activities", () => {
    const estimates = [
      { activityId: "missing-act", central: 10, low: 8, high: 12 },
    ];
    const activities: Activity[] = [];
    const totals = calculateCategoryTotals(estimates, activities);
    expect(totals["transport"]).toBeUndefined();
  });

  it("decomposes uncertainty and sorts by variance contribution", () => {
    const estimates = [
      { activityId: "small-spread", central: 10, low: 9, high: 11 }, // Spread 2, variance 1
      { activityId: "large-spread", central: 10, low: 2, high: 18 }, // Spread 16, variance 64
    ];
    const contribs = calculateUncertaintyContributions(estimates);
    
    expect(contribs[0].activityId).toBe("large-spread");
    expect(contribs[0].percentageOfTotal).toBeCloseTo((64 / 65) * 100);
    expect(contribs[1].activityId).toBe("small-spread");
  });

  it("handles empty estimates in decomposition", () => {
    const contribs = calculateUncertaintyContributions([{ activityId: "zero-var", central: 10, low: 10, high: 10 }]);
    expect(contribs[0].percentageOfTotal).toBe(0);
  });
});

describe("Adaptive Questions", () => {
  it("selects deterministic next question based on uncertainty", () => {
    const contribs = [{ activityId: "a-diet", variance: 100, percentageOfTotal: 90 }];
    const activities: Activity[] = [
      { id: "a-diet", categoryId: "food", factorId: "f-beef", value: 10, unit: "kg", dataQualityScore: 10 }
    ];
    
    const nextQ = selectNextQuestion(defaultQuestions, [], contribs, activities);
    expect(nextQ?.id).toBe("q-diet");
  });

  it("selects overall highest info gain if no targeted questions found", () => {
    const contribs = [{ activityId: "a-diet", variance: 100, percentageOfTotal: 90 }];
    const activities: Activity[] = [
      { id: "a-diet", categoryId: "purchases", factorId: "f-clothing", value: 10, unit: "USD", dataQualityScore: 10 }
    ];
    // We don't have a purchase question in defaultQuestions, so it should fallback to highest overall
    const nextQ = selectNextQuestion(defaultQuestions, [], contribs, activities);
    expect(nextQ?.id).toBe("q-diet"); // diet has 90 info gain, highest overall
  });

  it("selects overall highest info gain if low uncertainty", () => {
    const contribs = [{ activityId: "a-diet", variance: 1, percentageOfTotal: 10 }]; // < 20%
    const nextQ = selectNextQuestion(defaultQuestions, [], contribs, []);
    expect(nextQ?.id).toBe("q-diet"); // diet has 90 info gain
  });

  it("returns null when all questions answered", () => {
    const nextQ = selectNextQuestion(defaultQuestions, defaultQuestions.map(q => q.id), [], []);
    expect(nextQ).toBeNull();
  });
});

describe("Recommendations", () => {
  const constraints: UserConstraints = {
    budgetAvailable: 500,
    housingType: "apartment",
    ownership: "rent",
    hasCar: false
  };

  const recSolar: Recommendation = {
    id: "r1", title: "Solar", description: "", categoryId: "energy",
    expectedReductionKgCO2e: 1000, confidencePercent: 90, costEstimateUSD: 10000, effortScore: 8,
    requiredConstraints: { housingType: ["house"], ownership: ["own"] }
  };
  
  const recLed: Recommendation = {
    id: "r2", title: "LEDs", description: "", categoryId: "energy",
    expectedReductionKgCO2e: 50, confidencePercent: 95, costEstimateUSD: 20, effortScore: 1,
  };

  const recEv: Recommendation = {
    id: "r3", title: "EV", description: "", categoryId: "transport",
    expectedReductionKgCO2e: 2000, confidencePercent: 90, costEstimateUSD: 30000, effortScore: 9,
    requiredConstraints: { minBudget: 25000 }
  };

  const recNoConstraints: Recommendation = {
    id: "r4", title: "Eat Less Meat", description: "", categoryId: "food",
    expectedReductionKgCO2e: 500, confidencePercent: 80, costEstimateUSD: 0, effortScore: 5,
  };

  it("filters constraint-violating recommendations (housing fails)", () => {
    const valid = isConstraintSatisfied(recSolar, constraints);
    expect(valid).toBe(false);
  });

  it("filters constraint-violating recommendations (ownership fails)", () => {
    const recOwnershipFail: Recommendation = {
      id: "rx", title: "Solar", description: "", categoryId: "energy",
      expectedReductionKgCO2e: 1000, confidencePercent: 90, costEstimateUSD: 10000, effortScore: 8,
      requiredConstraints: { housingType: ["apartment"], ownership: ["own"] } // passes housing, fails ownership
    };
    const valid = isConstraintSatisfied(recOwnershipFail, constraints);
    expect(valid).toBe(false);
  });

  it("filters constraint-violating recommendations (budget)", () => {
    const valid = isConstraintSatisfied(recEv, constraints);
    expect(valid).toBe(false);
  });

  it("allows recommendations with no constraints", () => {
    const valid = isConstraintSatisfied(recNoConstraints, constraints);
    expect(valid).toBe(true);
  });

  it("allows recommendations with satisfied constraints", () => {
    const valid = isConstraintSatisfied(recLed, constraints);
    expect(valid).toBe(true);
  });

  it("ranks valid recommendations correctly based on heuristic score", () => {
    const ranked = rankRecommendations([recLed, recNoConstraints], constraints, []);
    // recNoConstraints score: (500 * 0.8) / (0 + 1 + 5*10) = 400 / 51 = 7.84
    // recLed score: (50 * 0.95) / (20 + 1 + 1*10) = 47.5 / 31 = 1.53
    // recNoConstraints should be first.
    expect(ranked[0].id).toBe("r4");
    expect(ranked[1].id).toBe("r2");
  });

  it("prevents double counting (filtering out active ledger items)", () => {
    const ranked = rankRecommendations([recLed], constraints, ["r2"]);
    expect(ranked.length).toBe(0);
  });
});

describe("Ledger Transitions", () => {
  it("validates transition matrix", () => {
    expect(isValidTransition("estimated", "planned")).toBe(true);
    expect(isValidTransition("estimated", "verified")).toBe(false);
    expect(isValidTransition("in-progress", "verified")).toBe(true);
  });

  it("allows transition to the same state", () => {
    expect(isValidTransition("planned", "planned")).toBe(true);
  });

  it("throws error on invalid transition", () => {
    const rec: LedgerRecord = {
      id: "l1", recommendationId: "r1", title: "Test", state: "estimated",
      projectedSavingsKgCO2e: 100, verifiedSavingsKgCO2e: 0, updatedAt: ""
    };
    expect(() => transitionLedgerState(rec, "verified")).toThrowError(/Invalid transition/);
  });

  it("transitions state and updates verified savings", () => {
    const rec: LedgerRecord = {
      id: "l1", recommendationId: "r1", title: "Test", state: "in-progress",
      projectedSavingsKgCO2e: 100, verifiedSavingsKgCO2e: 0, updatedAt: ""
    };
    
    const verifiedRec = transitionLedgerState(rec, "verified");
    expect(verifiedRec.state).toBe("verified");
    expect(verifiedRec.verifiedSavingsKgCO2e).toBe(100);
  });

  it("nullifies savings when rejected", () => {
    const rec: LedgerRecord = {
      id: "l1", recommendationId: "r1", title: "Test", state: "verified",
      projectedSavingsKgCO2e: 100, verifiedSavingsKgCO2e: 100, updatedAt: ""
    };
    
    const rejectedRec = transitionLedgerState(rec, "rejected");
    expect(rejectedRec.state).toBe("rejected");
    expect(rejectedRec.verifiedSavingsKgCO2e).toBe(0);
  });

  it("preserves savings if state transition doesn't explicitly modify it", () => {
    const rec: LedgerRecord = {
      id: "l1", recommendationId: "r1", title: "Test", state: "planned",
      projectedSavingsKgCO2e: 100, verifiedSavingsKgCO2e: 50, updatedAt: ""
    };
    const inProgRec = transitionLedgerState(rec, "in-progress");
    expect(inProgRec.verifiedSavingsKgCO2e).toBe(50);
  });

  it("calculates total savings correctly", () => {
    const records: LedgerRecord[] = [
      { id: "l1", recommendationId: "r1", title: "", state: "planned", projectedSavingsKgCO2e: 50, verifiedSavingsKgCO2e: 0, updatedAt: "" },
      { id: "l2", recommendationId: "r2", title: "", state: "verified", projectedSavingsKgCO2e: 100, verifiedSavingsKgCO2e: 100, updatedAt: "" },
      { id: "l3", recommendationId: "r3", title: "", state: "rejected", projectedSavingsKgCO2e: 200, verifiedSavingsKgCO2e: 0, updatedAt: "" },
    ];
    
    const totals = calculateTotalSavings(records);
    expect(totals.projected).toBe(150); // 50 + 100 (excludes rejected 200)
    expect(totals.verified).toBe(100);
  });
});

// Helper
function actTemplate(): Activity {
  return { id: "a1", categoryId: "transport", factorId: "f-car-gas", value: 100, unit: "km", dataQualityScore: 50 };
}
