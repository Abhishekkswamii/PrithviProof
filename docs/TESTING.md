# Testing Strategy

PrithviProof uses a multi-layered testing approach.

## 1. Unit Tests (Vitest)
Unit tests focus on the pure Domain logic (`src/domain`). Since domain functions have no side effects, they are thoroughly tested for edge cases. Run with:
`npm run test`

## 2. Component Tests (React Testing Library)
UI components are tested to ensure they render correctly and handle user interactions.

## 3. Security Rules Tests (Firestore Emulators)
The `firestore.rules` are tested locally using the Firebase Emulator Suite and `@firebase/rules-unit-testing`. These tests ensure that cross-user access is denied and schema validation works. Run with:
`npm run test:rules`

## 4. End-to-End Tests (Playwright)
Playwright spins up the browser and runs through actual user flows (Sign Up, Complete Assessment, View Dashboard). Run with:
`npm run test:e2e`

## 5. Coverage Results
As of the final audit, the core domain logic achieves **99.28% statement coverage**. 93 tests run natively covering components, routing, schema validation, and mocks.

## 6. Accessibility Tests (`axe-core`)
Playwright integrates with `@axe-core/playwright` to perform real-time DOM analysis for WCAG 2.2 AA violations on both public and authenticated routes.
