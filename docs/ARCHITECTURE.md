# Architecture

```mermaid
graph TD
    UI[React SPA UI] --> AuthRepo(AuthRepository)
    UI --> DataRepo(DataRepository)
    UI --> AIRepo(AiAssistantRepository)
    UI --> Domain[Pure Domain Logic]

    AuthRepo -.-> FirebaseAuth[Firebase Auth]
    DataRepo -.-> FirestoreDB[(Cloud Firestore)]
    AIRepo -.-> VertexAI[Firebase Vertex AI]

    FirestoreDB --> SecurityRules{Firestore Rules}
```

PrithviProof uses a purely client-side React SPA Architecture to achieve a Serverless Backend with Google Firebase.

## Layers
1. **Presentation Layer**: React, Tailwind, React Router.
2. **Repository Layer**: Abstractions (`DataRepository`, `AuthRepository`) that wrap Firebase SDKs.
3. **Domain Layer**: Pure TypeScript logic (`src/domain`) that has zero knowledge of React or Firebase. Contains all math, algorithms, and Zod schemas.
4. **Infrastructure**: Firebase Auth, Firestore, and Vertex AI.
