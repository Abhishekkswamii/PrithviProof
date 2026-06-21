import { isFirebaseConfigured, shouldUseFirebaseEmulators } from "../firebase/config";
import { AiAssistantRepository } from "./types";

/**
 * Factory for AiAssistantRepository implementations.
 * Uses dynamic imports so firebase/ai and FirebaseAiAssistantRepository
 * are never included in the initial JS bundle — they load only when
 * the user first triggers Ask Prithvi or natural-language activity parsing.
 */
export async function getAiRepository(): Promise<AiAssistantRepository> {
  if (!isFirebaseConfigured() || shouldUseFirebaseEmulators()) {
    const { MockAiAssistantRepository } = await import("./MockAiAssistantRepository");
    return new MockAiAssistantRepository();
  }
  const { FirebaseAiAssistantRepository } = await import("./FirebaseAiAssistantRepository");
  return new FirebaseAiAssistantRepository();
}
