import { isFirebaseConfigured, shouldUseFirebaseEmulators } from "../firebase/config";
import { AiAssistantRepository } from "./types";
import { FirebaseAiAssistantRepository } from "./FirebaseAiAssistantRepository";
import { MockAiAssistantRepository } from "./MockAiAssistantRepository";

export function getAiRepository(): AiAssistantRepository {
  // If we are running in a test/emulator environment or Firebase is completely missing, 
  // mock the AI logic to avoid spamming the live Gemini API.
  if (!isFirebaseConfigured() || shouldUseFirebaseEmulators()) {
    return new MockAiAssistantRepository();
  }

  return new FirebaseAiAssistantRepository();
}
