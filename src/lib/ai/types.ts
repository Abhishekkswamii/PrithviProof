import { z } from "zod";
import { ActivityCategory, Unit } from "@/domain/models";

// Use the user's specific categories, mapping shopping back to purchases internally later or just accept it here
export const ParsedCategory = z.enum(["transport", "energy", "food", "shopping", "purchases", "waste"]);
export type ParsedCategory = z.infer<typeof ParsedCategory>;

export const ParsedActivitySchema = z.object({
  category: ParsedCategory,
  activityType: z.string().describe("e.g. 'car', 'metro', 'beef', 'electricity'"),
  quantity: z.number().nonnegative(),
  unit: z.string().describe("e.g. 'km', 'kg', 'kWh'"),
  confidence: z.number().min(0).max(100),
  clarificationNeeded: z.boolean(),
  clarificationQuestion: z.string().nullable(),
});
export type ParsedActivity = z.infer<typeof ParsedActivitySchema>;

export const ParseActivityResponseSchema = z.object({
  activities: z.array(ParsedActivitySchema),
});
export type ParseActivityResponse = z.infer<typeof ParseActivityResponseSchema>;

export interface AssistantContext {
  aggregatedCategories?: Record<string, number>;
  totalEmissionsLow?: number;
  totalEmissionsCentral?: number;
  totalEmissionsHigh?: number;
  overallConfidence?: number;
  topRecommendations?: string[];
}

export type AssistantIntent = 
  | "explain-estimate"
  | "why-range-wide"
  | "what-to-clarify"
  | "explain-recommendation"
  | "help-log-activity"
  | "explain-projected-vs-verified";

export interface AskAssistantRequest {
  prompt: string;
  intent: AssistantIntent;
  context: AssistantContext;
}

export interface AskAssistantResponse {
  answer: string;
  isFallback: boolean;
}

export interface AiAssistantRepository {
  parseActivity(text: string): Promise<ParseActivityResponse>;
  askAssistant(request: AskAssistantRequest): Promise<AskAssistantResponse>;
}
