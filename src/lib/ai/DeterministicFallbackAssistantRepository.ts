import { 
  AiAssistantRepository, 
  ParseActivityResponse, 
  AskAssistantRequest, 
  AskAssistantResponse 
} from "./types";
import { parseNaturalLanguageEntry } from "../natural-language";

export class DeterministicFallbackAssistantRepository implements AiAssistantRepository {
  async parseActivity(text: string): Promise<ParseActivityResponse> {
    const parsed = parseNaturalLanguageEntry(text);
    if (!parsed) {
      throw new Error("Could not parse activity deterministically.");
    }

    return {
      activities: [
        {
          category: parsed.activity.categoryId,
          activityType: parsed.activity.factorId, // Rough approximation
          quantity: parsed.activity.value,
          unit: parsed.activity.unit,
          confidence: parsed.activity.dataQualityScore,
          clarificationNeeded: false,
          clarificationQuestion: null,
        }
      ]
    };
  }

  async askAssistant(request: AskAssistantRequest): Promise<AskAssistantResponse> {
    return {
      answer: "I am currently running in offline deterministic mode. I cannot provide dynamic explanations, but your core calculations are fully operational.",
      isFallback: true,
    };
  }
}
