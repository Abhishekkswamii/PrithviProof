# PrithviProof Build Specification

## 1. Product Goals
- Provide an uncertainty-aware, scientifically rigorous carbon tracking and reduction tool.
- Help users separate real carbon reduction actions from estimates or unverified plans.
- Provide adaptive, information-gain-driven questioning rather than static lengthy forms.
- Maintain a transparent "Evidence Ledger" for verifying actions.

## 2. Non-Goals
- Generic carbon footprint calculator based purely on national averages without personal data.
- Chatbot interface or unconstrained conversational agent.
- Gamification app (no badges, points, or leaderboards).
- Digital twin or purely forecasting dashboard.

## 3. User Journeys
- **Initial Assessment**: User is asked a minimal set of adaptive questions to establish a high-uncertainty baseline.
- **Data Refinement**: User provides more specific data (e.g., utility bills) to reduce uncertainty bounds.
- **Action Planning**: System recommends constraint-aware actions (e.g., if user rents, no solar panel recommendations).
- **Evidence Verification**: User uploads proof (e.g., receipt, smart meter data) moving an action from "planned" to "verified" in the ledger.

## 4. Architecture
- Next.js App Router for server/client component rendering.
- Tailwind CSS for styling with a restricted, professional palette (charcoal, forest green, teal, restrained amber). No glassmorphism or excessive rounding.
- Zod for rigorous data validation.
- Firebase Client SDK (Firestore, Auth) for production persistence.
- **Judge Demo Mode**: Deterministic, local-only mode bypassing Firebase/Gemini for robust demonstration.

## 5. Domain Vocabulary
- **Assessment**: The ongoing process of gathering data to estimate emissions.
- **Uncertainty Range**: The lower and upper bound of an emission estimate (e.g., ±20%).
- **Evidence Ledger**: Immutable-style record of actions categorized by state (Estimated, Planned, In-Progress, Verified, Rejected).
- **Constraint**: User limitations (financial, housing type) that filter recommendations.

## 6. Formulas
- **Emission = Activity Data × Emission Factor**
- **Uncertainty Propagation**: Standard error propagation formulas for combining uncertainties of activity data and emission factors.

## 7. Page List
- `/dashboard`: Primary usable screen, summary of current emissions, uncertainty ranges, and active actions.
- `/assessment`: Adaptive questionnaire interface.
- `/log`: Activity log for daily/weekly emission-generating events.
- `/recommendations`: Constraint-filtered reduction actions.
- `/ledger`: The Evidence Ledger showing action state provenance.
- `/methodology`: Transparent explanation of formulas and factors used.
- `/settings`: Application and user settings, including Judge Demo toggle.

## 8. Data Model
- `User`: Profile, constraints.
- `EmissionEntry`: Category, value, unit, emission factor reference, uncertainty bounds.
- `LedgerItem`: Proposed action, expected reduction, state, evidence attachments, verification timestamp.

## 9. Security Requirements
- All user inputs validated via Zod.
- Evidence files sanitized and restricted by type/size.
- Firebase Security Rules for production data isolation.

## 10. Accessibility Requirements
- WCAG 2.1 AA compliance.
- Keyboard navigable navigation.
- Screen reader friendly forms and error states.
- High contrast professional color palette.

## 11. Testing Targets
- **Unit/Domain**: 80%+ coverage using Vitest for calculation formulas and uncertainty propagation.
- **E2E**: Critical paths (assessment, adding ledger item) tested via Playwright.

## 12. Performance Budgets
- First Contentful Paint (FCP) < 1.5s.
- Interactive < 2.0s.
- Zero layout shift (CLS < 0.1) during assessment flows.
- Strict bundle size limits.

## 13. Rubric Traceability
- *Uncertainty-Aware*: Prominently displayed ranges.
- *Calculation Provenance*: Methodology page and itemized ledger.
- *Constraint-Aware Recommendations*: Filtering logic explicitly tested.
