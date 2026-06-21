import type { AuthRepository, AuthUser, SignInParams, SignUpParams } from "./types";

/** In-memory auth for tests and when Firebase is not configured */
export class MockAuthRepository implements AuthRepository {
  private user: AuthUser | null = null;
  private listeners = new Set<(user: AuthUser | null) => void>();

  isConfigured(): boolean {
    return false;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.user);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    for (const cb of this.listeners) cb(this.user);
  }

  getCurrentUser(): AuthUser | null {
    return this.user;
  }

  async signUpWithEmail(params: SignUpParams): Promise<AuthUser> {
    this.user = {
      uid: `mock-${Date.now()}`,
      email: params.email,
      displayName: params.displayName,
      photoURL: null,
      emailVerified: false,
      provider: "password",
    };
    this.notify();
    return this.user;
  }

  async signInWithEmail(params: SignInParams): Promise<AuthUser> {
    this.user = {
      uid: "mock-user-1",
      email: params.email,
      displayName: "Test User",
      photoURL: null,
      emailVerified: true,
      provider: "password",
    };
    this.notify();
    return this.user;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    this.user = {
      uid: "mock-google-1",
      email: "user@gmail.com",
      displayName: "Google User",
      photoURL: null,
      emailVerified: true,
      provider: "google",
    };
    this.notify();
    return this.user;
  }

  async sendEmailVerification(): Promise<void> {
    // no-op in mock
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    void email;
    // no-op in mock — always succeeds silently for privacy
  }

  async signOut(): Promise<void> {
    this.user = null;
    this.notify();
  }

  /** Test helper */
  setUser(user: AuthUser | null): void {
    this.user = user;
    this.notify();
  }
}
