import { describe, expect, it } from "vitest";
import {
  buildSignInUrl,
  buildSignUpUrl,
  getAuditCtaDestination,
  getPostAuthDestination,
  isProtectedPath,
  validateNextPath,
} from "@/lib/routes";

describe("validateNextPath", () => {
  it("accepts protected internal paths", () => {
    expect(validateNextPath("/assessment")).toBe("/assessment");
    expect(validateNextPath("/dashboard")).toBe("/dashboard");
  });

  it("rejects external and malformed paths", () => {
    expect(validateNextPath("https://evil.com/dashboard")).toBeNull();
    expect(validateNextPath("//evil.com")).toBeNull();
    expect(validateNextPath("/auth/sign-in")).toBeNull();
    expect(validateNextPath("/methodology")).toBeNull();
    expect(validateNextPath(null)).toBeNull();
    expect(validateNextPath("")).toBeNull();
  });

  it("strips query and hash before validation", () => {
    expect(validateNextPath("/log?foo=bar")).toBe("/log");
    expect(validateNextPath("/ledger#section")).toBe("/ledger");
  });
});

describe("buildSignInUrl", () => {
  it("includes validated next param", () => {
    expect(buildSignInUrl("/assessment")).toBe("/auth/sign-in?next=%2Fassessment");
    expect(buildSignInUrl("https://evil.com")).toBe("/auth/sign-in");
  });
});

describe("buildSignUpUrl", () => {
  it("includes validated next param", () => {
    expect(buildSignUpUrl("/assessment")).toBe("/auth/sign-up?next=%2Fassessment");
  });
});

describe("getAuditCtaDestination", () => {
  it("sends signed-out users to sign-up with assessment next", () => {
    expect(getAuditCtaDestination(false, false)).toBe("/auth/sign-up?next=%2Fassessment");
  });

  it("routes authenticated users by onboarding state", () => {
    expect(getAuditCtaDestination(true, false)).toBe("/assessment");
    expect(getAuditCtaDestination(true, true)).toBe("/dashboard");
  });
});

describe("getPostAuthDestination", () => {
  it("prefers validated next route", () => {
    expect(getPostAuthDestination(true, "/log")).toBe("/log");
  });

  it("falls back to assessment or dashboard", () => {
    expect(getPostAuthDestination(false, null)).toBe("/assessment");
    expect(getPostAuthDestination(true, null)).toBe("/dashboard");
  });
});

describe("isProtectedPath", () => {
  it("identifies protected routes", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/")).toBe(false);
  });
});
