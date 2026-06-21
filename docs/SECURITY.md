# Security Architecture

## Firestore Rules
Data in Firestore is fiercely protected by `firestore.rules`.
1. **Default Deny**: Everything is denied by default.
2. **Ownership Enforcement**: Users can only read or write to `users/{uid}/*` where `{uid}` matches their own authentication token.
3. **Schema Validation**: Firestore rules use a custom `dataHasOnly` function to prevent extraneous fields, and type assertions (`is number`, `is string`) to ensure data integrity at the database level.
4. **Immutability**: Users cannot delete or forge their `LedgerRecord` entries' states improperly. They can only advance the state machine forward.

## App Check
The frontend utilizes Firebase App Check with Google reCAPTCHA Enterprise to attest that requests are originating from our authorized React client.

## Content Security Policy
A strict CSP is defined in `firebase.json` headers to prevent Cross-Site Scripting (XSS) and unauthorized data egress.
