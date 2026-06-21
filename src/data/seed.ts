import { Activity, LedgerRecord, UserConstraints, Recommendation } from "../domain/models";

export const seedConstraints: UserConstraints = {
  budgetAvailable: 50000, // INR (approx 600 USD)
  housingType: "shared", // Common for Indian students
  ownership: "rent",
  hasCar: false,
};

export const seedActivities: Activity[] = [
  {
    id: "act-1",
    categoryId: "transport",
    factorId: "f-scooter-gas",
    value: 300, // 300 km/month
    unit: "km",
    dataQualityScore: 80, // High confidence, knows commute distance
  },
  {
    id: "act-2",
    categoryId: "energy",
    factorId: "f-grid-in-avg",
    value: 120, // 120 kWh/month (shared apartment share)
    unit: "kWh",
    dataQualityScore: 90, // from bill
  },
  {
    id: "act-3",
    categoryId: "food",
    factorId: "f-plant-based",
    value: 45, // 45 kg of food/month
    unit: "kg",
    dataQualityScore: 60, // estimate
  }
];

export const seedRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    title: "Switch to LED Bulbs",
    description: "Replace 4 CFL/Incandescent bulbs with 9W LEDs in your room.",
    categoryId: "energy",
    expectedReductionKgCO2e: 120, // Annual
    confidencePercent: 95,
    costEstimateUSD: 10, // ~800 INR
    effortScore: 1,
    requiredConstraints: { housingType: ["shared", "apartment", "house"] } // Renter friendly
  },
  {
    id: "rec-2",
    title: "Take Metro Instead of Scooter",
    description: "Use the metro for your primary commute 3 days a week.",
    categoryId: "transport",
    expectedReductionKgCO2e: 100,
    confidencePercent: 85,
    costEstimateUSD: 0, // Metro pass approx same as petrol
    effortScore: 4,
  },
  {
    id: "rec-3",
    title: "Install Rooftop Solar",
    description: "Install a 2kW solar system.",
    categoryId: "energy",
    expectedReductionKgCO2e: 1500,
    confidencePercent: 90,
    costEstimateUSD: 1500, // Very expensive
    effortScore: 8,
    requiredConstraints: { ownership: ["own"], housingType: ["house"] } // Will be filtered out for renting student
  }
];

export const seedLedger: LedgerRecord[] = [
  {
    id: "led-1",
    recommendationId: "rec-1",
    title: "Switch to LED Bulbs",
    state: "in-progress",
    projectedSavingsKgCO2e: 120,
    verifiedSavingsKgCO2e: 0,
    updatedAt: new Date().toISOString()
  }
];
