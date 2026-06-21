import { describe, it, expect } from "vitest";
import { 
  ActivityCategory, 
  Unit, 
  LedgerState,
  EmissionFactor,
  Activity,
  UserConstraints,
  Recommendation,
  LedgerRecord
} from "@/domain/models";

describe("Domain Models Zod Schemas", () => {
  it("validates ActivityCategory", () => {
    expect(ActivityCategory.parse("transport")).toBe("transport");
    expect(() => ActivityCategory.parse("invalid")).toThrow();
  });

  it("validates Unit", () => {
    expect(Unit.parse("km")).toBe("km");
    expect(() => Unit.parse("invalid")).toThrow();
  });

  it("validates LedgerState", () => {
    expect(LedgerState.parse("estimated")).toBe("estimated");
    expect(() => LedgerState.parse("done")).toThrow();
  });

  it("validates EmissionFactor", () => {
    const factor = {
      id: "f-test",
      name: "Test Factor",
      category: "transport",
      value: 10,
      unit: "km",
      uncertaintyPercent: 10,
      provenance: {
        sourceName: "EPA",
        geography: "US",
        year: 2024
      }
    };
    expect(EmissionFactor.parse(factor)).toEqual(factor);
  });

  it("validates Activity", () => {
    const activity = {
      id: "act-1",
      categoryId: "transport",
      factorId: "f-test",
      value: 100,
      unit: "km",
      dataQualityScore: 80
    };
    expect(Activity.parse(activity)).toEqual(activity);
    
    expect(() => Activity.parse({ ...activity, dataQualityScore: 150 })).toThrow();
  });

  it("validates UserConstraints", () => {
    const constraints = {
      budgetAvailable: 1000,
      housingType: "apartment",
      ownership: "rent",
      hasCar: true
    };
    expect(UserConstraints.parse(constraints)).toEqual(constraints);
  });

  it("validates Recommendation", () => {
    const rec = {
      id: "rec-1",
      title: "Test",
      description: "Test description",
      categoryId: "energy",
      expectedReductionKgCO2e: 100,
      confidencePercent: 80,
      costEstimateUSD: 50,
      effortScore: 5
    };
    expect(Recommendation.parse(rec)).toEqual(rec);
  });

  it("validates LedgerRecord", () => {
    const record = {
      id: "led-1",
      recommendationId: "rec-1",
      title: "Test",
      state: "planned",
      projectedSavingsKgCO2e: 100,
      verifiedSavingsKgCO2e: 0,
      updatedAt: new Date().toISOString()
    };
    expect(LedgerRecord.parse(record)).toEqual(record);
  });
});
