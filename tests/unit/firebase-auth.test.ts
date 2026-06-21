import { describe, expect, it, vi, beforeEach } from "vitest";
import { FirebaseAuthRepository } from "@/lib/auth/FirebaseAuthRepository";
import { mapAuthError } from "@/lib/auth/errors";

// Mock firebase/auth
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return () => {}; })
}));

// Mock the getFirebaseAuth
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseAuth: vi.fn(() => ({}))
}));

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail 
} from "firebase/auth";

describe("FirebaseAuthRepository", () => {
  const repo = new FirebaseAuthRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles sign up errors", async () => {
    const error = new Error("auth/email-already-in-use");
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(error);
    await expect(repo.signUpWithEmail({ email: "test@test.com", password: "pw", displayName: "Test" }))
      .rejects.toThrow(mapAuthError(error));
  });

  it("handles sign in errors", async () => {
    const error = new Error("auth/wrong-password");
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(error);
    await expect(repo.signInWithEmail({ email: "test@test.com", password: "pw" }))
      .rejects.toThrow(mapAuthError(error));
  });

  it("handles google sign in errors", async () => {
    const error = new Error("auth/popup-closed-by-user");
    vi.mocked(signInWithPopup).mockRejectedValueOnce(error);
    await expect(repo.signInWithGoogle())
      .rejects.toThrow(mapAuthError(error));
  });

  it("handles sign out errors", async () => {
    const error = new Error("Network error");
    vi.mocked(signOut).mockRejectedValueOnce(error);
    await expect(repo.signOut())
      .rejects.toThrow(mapAuthError(error));
  });

  it("handles reset password errors", async () => {
    const error = new Error("auth/user-not-found");
    vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(error);
    await expect(repo.sendPasswordResetEmail("test@test.com"))
      .rejects.toThrow(mapAuthError(error));
  });
});
