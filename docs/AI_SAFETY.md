# AI Safety Architecture

PrithviProof utilizes Vertex AI via Firebase AI Logic to power its "Ask Prithvi" natural language assistant.

## Core Safety Principles

1. **Containment**: AI is isolated to a specific repository interface (`AiAssistantRepository`). The rest of the domain logic is completely unaware of the AI's existence.
2. **Zero-Calculation Policy**: The AI is explicitly instructed *never* to calculate emissions or derive emission factors. The domain logic (`src/domain`) handles all math.
3. **Structured Outputs**: The AI is forced to return valid JSON matching Zod schemas. If it fails, the request is retried or falls back to a deterministic response.
4. **Data Privacy**: We never send PII (Personally Identifiable Information) like User IDs, Email Addresses, or Names to the AI.
5. **Deterministic Fallback**: If the AI API is down, rate-limited, or blocked, the `DeterministicFallbackAssistantRepository` activates, providing hardcoded helpful responses.

## Threat Model Mitigation
- **Prompt Injection**: Mitigated by schema validation and strict system instructions.
- **Hallucination**: Mitigated by the Zero-Calculation Policy and the narrow focus of the intents.
