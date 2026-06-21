import { 
  AiAssistantRepository, 
  ParseActivityResponse, 
  AskAssistantRequest, 
  AskAssistantResponse 
} from "./types";

export class MockAiAssistantRepository implements AiAssistantRepository {
  async parseActivity(text: string): Promise<ParseActivityResponse> {
    const input = text.toLowerCase();
    
    // Simple deterministic fallback for tests
    if (input.includes("metro")) {
      return {
        activities: [
          {
            category: "transport",
            activityType: "metro",
            quantity: 12,
            unit: "km",
            confidence: 90,
            clarificationNeeded: false,
            clarificationQuestion: null,
          }
        ]
      };
    }
    
    if (input.includes("invalid-json")) {
      throw new Error("Simulated invalid JSON from AI");
    }

    if (input.includes("timeout")) {
      throw new Error("Timeout exceeded");
    }

    if (input.includes("clarify")) {
      return {
        activities: [
          {
            category: "food",
            activityType: "meal",
            quantity: 1,
            unit: "meal",
            confidence: 30,
            clarificationNeeded: true,
            clarificationQuestion: "Was the meal vegetarian or did it include meat?",
          }
        ]
      };
    }
    
    // Default fallback
    return {
      activities: [
        {
          category: "transport",
          activityType: "car",
          quantity: 10,
          unit: "km",
          confidence: 50,
          clarificationNeeded: false,
          clarificationQuestion: null,
        }
      ]
    };
  }

  async askAssistant(request: AskAssistantRequest): Promise<AskAssistantResponse> {
    if (request.prompt.includes("timeout")) {
      throw new Error("Timeout exceeded");
    }
    return {
      answer: "This is a mocked AI explanation for tests. " + request.intent,
      isFallback: true,
    };
  }
}
