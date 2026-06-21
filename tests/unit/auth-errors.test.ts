import { describe, expect, it } from "vitest";
import { mapAuthError } from "@/lib/auth/errors";

describe("mapAuthError", () => {
  it("maps credential errors to a generic message", () => {
    expect(mapAuthError({ code: "auth/wrong-password" })).toBe("Email or password is incorrect.");
    expect(mapAuthError({ code: "auth/user-not-found" })).toBe("Email or password is incorrect.");
  });

  it("does not expose internal auth codes in the default message", () => {
    const message = mapAuthError({ code: "auth/internal-error" });
    expect(message).not.toContain("auth/");
  });

  it("maps email already in use without confirming arbitrary emails on sign-in", () => {
    expect(mapAuthError({ code: "auth/email-already-in-use" })).toContain("already exists");
  });
});
