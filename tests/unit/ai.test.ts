import { describe, it, expect } from "vitest";
import { ParsedActivitySchema } from "../../src/lib/ai/types";

describe("ParsedActivitySchema Validation", () => {
  it("validates a correctly structured AI response", () => {
    const valid = {
      category: "transport",
      activityType: "metro",
      quantity: 12,
      unit: "km",
      confidence: 90,
      clarificationNeeded: false,
      clarificationQuestion: null,
    };
    expect(() => ParsedActivitySchema.parse(valid)).not.toThrow();
  });

  it("fails if category is unsupported", () => {
    const invalidCategory = {
      category: "entertainment", // Invalid
      activityType: "cinema",
      quantity: 1,
      unit: "visit",
      confidence: 50,
      clarificationNeeded: false,
      clarificationQuestion: null,
    };
    expect(() => ParsedActivitySchema.parse(invalidCategory)).toThrow(/Invalid enum value/);
  });

  it("fails if quantity is negative", () => {
    const negativeQuantity = {
      category: "transport",
      activityType: "car",
      quantity: -10,
      unit: "km",
      confidence: 80,
      clarificationNeeded: false,
      clarificationQuestion: null,
    };
    expect(() => ParsedActivitySchema.parse(negativeQuantity)).toThrow(/Number must be greater than or equal to 0/);
  });

  it("fails if missing required unit", () => {
    const missingUnit = {
      category: "food",
      activityType: "beef",
      quantity: 1,
      confidence: 80,
      clarificationNeeded: false,
      clarificationQuestion: null,
    };
    expect(() => ParsedActivitySchema.parse(missingUnit)).toThrow(/Required/);
  });

  it("allows clarificationNeeded and clarificationQuestion", () => {
    const clarification = {
      category: "food",
      activityType: "meal",
      quantity: 1,
      unit: "meal",
      confidence: 30,
      clarificationNeeded: true,
      clarificationQuestion: "Was the meal vegetarian or did it include meat?",
    };
    expect(() => ParsedActivitySchema.parse(clarification)).not.toThrow();
  });
});
