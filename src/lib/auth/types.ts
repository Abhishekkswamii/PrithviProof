export type AuthProviderId = "password" | "google";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: AuthProviderId;
}

export interface AuthState {
  initialized: boolean;
  loading: boolean;
  user: AuthUser | null;
}

export interface SignUpParams {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthSessionResult {
  user: AuthUser;
  onboardingCompleted: boolean;
}

export interface AuthRepository {
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  signUpWithEmail(params: SignUpParams): Promise<AuthUser>;
  signInWithEmail(params: SignInParams): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  sendEmailVerification(): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): AuthUser | null;
  isConfigured(): boolean;
}
