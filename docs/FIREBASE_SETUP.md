# Firebase Setup for PrithviProof

This guide walks through configuring Firebase for production authentication, Firestore persistence, and local emulator development. **Never commit real credentials, service-account JSON files, or private keys.**

## 1. Create a Firebase project

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**.
3. Name the project (for example, `prithviproof`).
4. Disable Google Analytics if you do not need it, or enable it and note the measurement ID.

## 2. Register the web application

1. In Project settings, open **Your apps** → **Web** (`</>`).
2. Register the app with a nickname such as `PrithviProof Web`.
3. Copy the Firebase config values into `.env.local` using the placeholders in `.env.example`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (if Analytics is enabled)

## 3. Enable Email/Password authentication

1. Go to **Build** → **Authentication** → **Sign-in method**.
2. Enable **Email/Password**.
3. Leave “Email link” disabled unless you plan to support it later.

## 4. Enable Google sign-in

1. In **Authentication** → **Sign-in method**, enable **Google**.
2. Set a public-facing project support email.
3. Save the provider configuration.

## 5. Add authorized domains

1. In **Authentication** → **Settings** → **Authorized domains**, add:
   - `localhost`
   - Your Vercel preview domain (for example, `*.vercel.app` is not supported—add each preview host you use)
   - Your production domain (for example, `prithviproof.vercel.app`)

## 6. Create the Firestore database

1. Go to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Start in **production mode** (security rules in this repo replace the defaults).
4. Choose a region close to your users.

## 7. Install and use the Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

Select the project you created and give it an alias such as `prithviproof`.

## 8. Start emulators (local development and CI)

From the repository root:

```bash
npm run emulators
```

For app development against emulators, set in `.env.local`:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-prithviproof
```

Use the same placeholder web config values as in `.env.example`; the client connects Auth to port `9099` and Firestore to port `8080` when emulator mode is enabled.

Emulator UI: `http://localhost:4000`

## 9. Deploy rules and indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Run rules unit tests before deploying:

```bash
npm run test:rules
```

## 10. Configure Vercel environment variables

In the Vercel project → **Settings** → **Environment Variables**, add every `NEXT_PUBLIC_FIREBASE_*` value from step 2 plus:

- `NEXT_PUBLIC_APP_URL` — your production URL
- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false` in Production

Redeploy after changing environment variables.

## 11. Configure App Check (after deployment validation)

App Check is **optional** and disabled unless explicitly configured.

1. In Firebase Console → **Build** → **App Check**, register the web app with **reCAPTCHA Enterprise**.
2. Create a site key in Google Cloud Console.
3. Set in Vercel (and `.env.local` only when testing App Check):

```env
NEXT_PUBLIC_FIREBASE_APP_CHECK_ENABLED=true
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY=your-site-key
```

4. Use **Monitor** mode first; enable enforcement only after verifying legitimate traffic.
5. Keep App Check disabled (`NEXT_PUBLIC_FIREBASE_APP_CHECK_ENABLED=false`) during local development and emulator tests.

## Security notes

- Client route guards improve UX only; **Firestore Security Rules** enforce data access.
- Judge Demo mode never uploads seed data automatically.
- Local-to-account migration requires explicit user confirmation and is idempotent.
- Tests and CI must use emulators or mocks—never the production Firebase project.

## Useful commands

| Command | Purpose |
|--------|---------|
| `npm run emulators` | Start Auth + Firestore emulators |
| `npm run test:rules` | Run Firestore rules unit tests |
| `firebase deploy --only firestore:rules` | Deploy security rules |
| `firebase deploy --only firestore:indexes` | Deploy composite indexes |
