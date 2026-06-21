# Threat Model

## 1. Malicious Data Forgery
**Threat**: A user tries to submit a negative carbon emission value to artificially lower their footprint.
**Mitigation**:
- The `Activity` domain model (Zod) rejects negative values.
- `firestore.rules` natively enforce that `request.resource.data.value >= 0`.

## 2. Cross-User Data Access (IDOR)
**Threat**: A user tries to read or write another user's profile, activities, or ledger.
**Mitigation**:
- `firestore.rules` checks `isOwner(uid)` for every path, ensuring `request.auth.uid == uid`.

## 3. Privilege Escalation
**Threat**: A user tries to give themselves "admin" status by modifying their profile document.
**Mitigation**:
- The Firestore Rule uses `dataHasOnly` to explicitly whitelist fields (`uid`, `displayName`, `email`, `provider`, `onboardingCompleted`, `schemaVersion`). Any unknown field causes the write to fail.

## 4. Ledger Tampering
**Threat**: A user modifies their ledger entry directly from `estimated` to `verified` without proving action.
**Mitigation**:
- Firestore rules restrict state transitions for `LedgerRecord` to sequential paths: `estimated` -> `planned` -> `in_progress` -> `verified`. Direct leaps are blocked at the database level.

## 5. API Abuse
**Threat**: A malicious script spams the Firestore database or Vertex AI API endpoint to incur costs.
**Mitigation**:
- Firebase App Check ensures that only requests from genuine instances of the React application are accepted.
