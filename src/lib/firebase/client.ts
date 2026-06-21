
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getFirebaseConfig,
  shouldUseFirebaseEmulators,
  isAppCheckConfigured,
} from "./config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let emulatorsConnected = false;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  const config = getFirebaseConfig();
  if (!config) return null;

  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  if (!auth) {
    auth = getAuth(firebaseApp);
    connectEmulatorsIfNeeded();
    void initAppCheck(firebaseApp);
  }
  return auth;
}

export function getFirestoreDb(): Firestore | null {
  if (typeof window === "undefined") return null;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  if (!db) {
    db = getFirestore(firebaseApp);
    connectEmulatorsIfNeeded();
  }
  return db;
}

function connectEmulatorsIfNeeded(): void {
  if (emulatorsConnected || !shouldUseFirebaseEmulators()) return;
  if (!auth || !db) {
    // auth/db may not both exist yet; connect individually when created
  }
  try {
    if (auth && !emulatorsConnected) {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    }
    if (db) {
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
    }
    emulatorsConnected = true;
  } catch {
    // Already connected
    emulatorsConnected = true;
  }
}

async function initAppCheck(firebaseApp: FirebaseApp): Promise<void> {
  if (!isAppCheckConfigured()) return;
  try {
    const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import("firebase/app-check");
    if (import.meta.env.DEV) {
      // Allow localhost dev by setting debug token
      // This prints a token to the console which must be added in Firebase Console.
      (self as typeof self & { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    const siteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY!;
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn("PrithviProof: App Check initialization skipped", e);
  }
}


