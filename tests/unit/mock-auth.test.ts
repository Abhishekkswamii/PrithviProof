import { describe, expect, it, vi } from "vitest";
import { MockAuthRepository } from "@/lib/auth/MockAuthRepository";

describe("MockAuthRepository", () => {
  it("notifies listeners with null user on subscribe", () => {
    const repo = new MockAuthRepository();
    const listener = vi.fn();
    repo.onAuthStateChanged(listener);
    expect(listener).toHaveBeenCalledWith(null);
  });

  it("restores signed-in state after sign-in and clears on sign-out", async () => {
    const repo = new MockAuthRepository();
    const states: Array<string | null> = [];
    repo.onAuthStateChanged((user) => states.push(user?.uid ?? null));

    await repo.signInWithEmail({ email: "a@example.com", password: "Secret1a" });
    expect(repo.getCurrentUser()?.email).toBe("a@example.com");

    await repo.signOut();
    expect(repo.getCurrentUser()).toBeNull();
    expect(states).toEqual([null, "mock-user-1", null]);
  });
});
