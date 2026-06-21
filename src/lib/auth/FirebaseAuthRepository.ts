
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  inMemoryPersistence,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { AuthRepository, AuthUser, SignInParams, SignUpParams } from "./types";
import { mapAuthError } from "./errors";

function mapFirebaseUser(user: FirebaseUser): AuthUser {
  const provider =
    user.providerData[0]?.providerId === "google.com" ? "google" : "password";
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    provider,
  };
}

export class FirebaseAuthRepository implements AuthRepository {
  private getAuth() {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured");
    return auth;
  }

  isConfigured(): boolean {
    return isFirebaseConfigured();
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    const auth = this.getAuth();
    void import("firebase/auth").then(({ browserLocalPersistence }) =>
      setPersistence(auth, browserLocalPersistence).catch(() =>
        setPersistence(auth, inMemoryPersistence)
      )
    );

    return onAuthStateChanged(auth, (user) => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  }

  getCurrentUser(): AuthUser | null {
    const auth = this.getAuth();
    const user = auth.currentUser;
    return user ? mapFirebaseUser(user) : null;
  }

  async signUpWithEmail(params: SignUpParams): Promise<AuthUser> {
    try {
      const auth = this.getAuth();
      const cred = await createUserWithEmailAndPassword(auth, params.email, params.password);
      await updateProfile(cred.user, { displayName: params.displayName });
      return mapFirebaseUser(cred.user);
    } catch (e) {
      throw new Error(mapAuthError(e));
    }
  }

  async signInWithEmail(params: SignInParams): Promise<AuthUser> {
    try {
      const auth = this.getAuth();
      const cred = await signInWithEmailAndPassword(auth, params.email, params.password);
      return mapFirebaseUser(cred.user);
    } catch (e) {
      throw new Error(mapAuthError(e));
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const auth = this.getAuth();
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      return mapFirebaseUser(cred.user);
    } catch (e) {
      throw new Error(mapAuthError(e));
    }
  }

  async sendEmailVerification(): Promise<void> {
    try {
      const auth = this.getAuth();
      if (!auth.currentUser) throw new Error("No signed-in user");
      await sendEmailVerification(auth.currentUser);
    } catch (e) {
      throw new Error(mapAuthError(e));
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const auth = this.getAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      throw new Error(mapAuthError(e));
    }
  }

  async signOut(): Promise<void> {
    try {
      const auth = this.getAuth();
      await signOut(auth);
    } catch (e) {
      throw new Error(mapAuthError(e));
    }
  }
}
