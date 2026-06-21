import { describe, expect, it } from "vitest";
import { resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/auth/schemas";

describe("signUpSchema", () => {
  const valid = {
    displayName: "Ada Lovelace",
    email: "ada@example.com",
    password: "Secure1pass",
    confirmPassword: "Secure1pass",
    acceptTerms: true as const,
  };

  it("accepts valid sign-up input", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = signUpSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
  });

  it("requires uppercase, lowercase and number", () => {
    expect(signUpSchema.safeParse({ ...valid, password: "alllowercase1", confirmPassword: "alllowercase1" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, password: "ALLUPPERCASE1", confirmPassword: "ALLUPPERCASE1" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, password: "NoNumbers", confirmPassword: "NoNumbers" }).success).toBe(false);
  });

  it("requires matching passwords and terms acceptance", () => {
    expect(signUpSchema.safeParse({ ...valid, confirmPassword: "Secure1pasX" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, acceptTerms: false }).success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("requires email and password", () => {
    expect(signInSchema.safeParse({ email: "user@example.com", password: "x" }).success).toBe(true);
    expect(signInSchema.safeParse({ email: "bad", password: "x" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "user@example.com", password: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires a valid email", () => {
    expect(resetPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
    expect(resetPasswordSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});
