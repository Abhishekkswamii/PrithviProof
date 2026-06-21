# Firebase App Check Setup

Firebase App Check helps protect your backend resources from abuse, such as billing fraud or phishing, by ensuring requests come from your genuine app and a legitimate device.

To fully enforce Firebase App Check for PrithviProof using reCAPTCHA Enterprise, complete these manual steps:

## 1. Create a reCAPTCHA Enterprise Site Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/security/recaptcha) (make sure you are in the `prithviproof` project).
2. Click **Create Key**.
3. Name your key (e.g., "PrithviProof Web App").
4. Select **Web site** as the platform.
5. Add your authorized domains:
   - `prithviproof.web.app`
   - `prithviproof.firebaseapp.com`
   - *(Note: Do **NOT** add `localhost` or `127.0.0.1` here. We use debug providers for local development.)*
6. Choose the integration type (usually **Score-based (no challenge)**).
7. Create the key and copy the generated **Site Key**.

## 2. Register App Check in Firebase

1. Go to your [Firebase Console](https://console.firebase.google.com/project/prithviproof/appcheck/products).
2. Click on **App Check** in the left navigation menu.
3. Select the **Web App** from your registered apps.
4. Choose **reCAPTCHA Enterprise** as the provider.
5. Enter the Site Key you copied from Google Cloud.
6. Click **Save**.

## 3. Local Development Configuration

Since `localhost` is not an allowed reCAPTCHA domain, local development uses the Firebase App Check Debug Provider.

1. In your `.env.local` file, add your reCAPTCHA Site Key (the client still needs to initialize with it):
   ```
   VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=your-site-key-here
   ```
2. Run your local dev server: `npm run dev`.
3. Open your browser's Developer Tools Console. You will see a message like:
   `App Check debug token: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. You will need to add it to your app's App Check settings in the Firebase console for it to work.`
4. Copy this debug token.
5. In the Firebase Console, go to **App Check** > **Apps** > Your Web App > **Manage Debug Tokens**.
6. Add the copied debug token and save it.

*Note: Never commit your `.env.local` or the debug token to source control.*

## 4. Verify Metrics and Enforce

**Do not enable enforcement immediately.** Enabling enforcement blocks any requests without a valid App Check token.

1. Deploy your app to production: `firebase deploy --only hosting`.
2. Wait a few days and monitor the App Check request metrics in the Firebase Console.
3. Ensure that legitimate requests (from your domains) are passing App Check and that there are no unexpected rejections.
4. Once you have verified the metrics, go to the Firebase Console App Check settings and click **Enforce** for your services (Firestore, Authentication, Vertex AI in Firebase).
