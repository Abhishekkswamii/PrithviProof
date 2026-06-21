import { Activity } from "@/domain/models";
import { localFactors } from "@/domain/factors";

interface ParsedActivity {
  activity: Omit<Activity, "id">;
  description: string;
}

/** Simple natural-language parser mapping phrases to existing emission factors */
export function parseNaturalLanguageEntry(input: string): ParsedActivity | null {
  const text = input.trim().toLowerCase();
  if (!text) return null;

  const numberMatch = text.match(/(\d+(?:\.\d+)?)\s*(km|kwh|kg|miles|therms)?/i);
  if (!numberMatch) return null;

  const value = parseFloat(numberMatch[1]);
  const unit = (numberMatch[2]?.toLowerCase() ?? "km") as Activity["unit"];

  let factorId = "f-scooter-gas";
  let categoryId: Activity["categoryId"] = "transport";

  if (text.includes("flight") || text.includes("plane")) {
    factorId = "f-flight-short";
    categoryId = "transport";
  } else if (text.includes("car") || text.includes("taxi") || text.includes("uber")) {
    factorId = "f-car-gas";
    categoryId = "transport";
  } else if (text.includes("metro") || text.includes("train") || text.includes("bus") || text.includes("transit")) {
    factorId = "f-scooter-gas";
    categoryId = "transport";
  } else if (text.includes("electric") || text.includes("kwh") || text.includes("power") || text.includes("bill")) {
    factorId = "f-grid-in-avg";
    categoryId = "energy";
  } else if (text.includes("beef") || text.includes("meat")) {
    factorId = "f-beef";
    categoryId = "food";
  } else if (text.includes("plant") || text.includes("vegan") || text.includes("vegetarian") || text.includes("diet")) {
    factorId = "f-plant-based";
    categoryId = "food";
  } else if (text.includes("clothing") || text.includes("purchase") || text.includes("spend")) {
    factorId = "f-clothing";
    categoryId = "purchases";
  } else if (text.includes("waste") || text.includes("trash") || text.includes("landfill")) {
    factorId = "f-landfill";
    categoryId = "waste";
  }

  const factor = localFactors.find((f) => f.id === factorId);
  if (!factor) return null;

  const resolvedUnit = unit === "km" && factor.unit !== "km" ? factor.unit : unit;

  return {
    activity: {
      categoryId,
      factorId,
      value,
      unit: resolvedUnit as Activity["unit"],
      dataQualityScore: 70,
    },
    description: input.trim(),
  };
}

/** Deterministically maps an AI-extracted activity type and category to an exact factor ID */
export function mapTypeToFactorId(categoryId: Activity["categoryId"], activityType: string): string {
  const t = activityType.toLowerCase();
  if (categoryId === "transport") {
    if (t.includes("flight") || t.includes("plane")) return "f-flight-short";
    if (t.includes("car") || t.includes("taxi") || t.includes("uber")) return "f-car-gas";
    return "f-scooter-gas"; // default for metro/bus/scooter
  }
  if (categoryId === "energy") {
    if (t.includes("gas") || t.includes("heat")) return "f-gas-heat";
    return "f-grid-in-avg"; // default electricity
  }
  if (categoryId === "food") {
    if (t.includes("beef") || t.includes("meat")) return "f-beef";
    return "f-plant-based";
  }
  if (categoryId === "purchases" || categoryId as string === "shopping") return "f-clothing";
  if (categoryId === "waste") return "f-landfill";
  
  // Ultimate fallback
  return "f-scooter-gas";
}
