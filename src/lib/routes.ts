/** Internal application paths users may be redirected to after auth */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/assessment",
  "/log",
  "/recommendations",
  "/ledger",
  "/settings",
] as const;

const PUBLIC_ROUTES = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/reset-password",
  "/methodology",
] as const;

export type ProtectedRoute = (typeof PROTECTED_ROUTES)[number];

const PROTECTED_SET = new Set<string>(PROTECTED_ROUTES);

/** Validates `next` query param — only same-origin internal app paths */
export function validateNextPath(next: string | null | undefined): ProtectedRoute | null {
  if (!next || typeof next !== "string") return null;

  let pathname = next.trim();
  if (!pathname.startsWith("/") || pathname.startsWith("//") || pathname.includes("://")) {
    return null;
  }

  pathname = pathname.split("?")[0].split("#")[0];
  if (!pathname || pathname.length > 128) return null;

  if (PROTECTED_SET.has(pathname)) {
    return pathname as ProtectedRoute;
  }

  return null;
}

export function buildSignInUrl(next?: string | null): string {
  const validated = validateNextPath(next);
  return validated ? `/auth/sign-in?next=${encodeURIComponent(validated)}` : "/auth/sign-in";
}

export function buildSignUpUrl(next?: string | null): string {
  const validated = validateNextPath(next);
  return validated ? `/auth/sign-up?next=${encodeURIComponent(validated)}` : "/auth/sign-up";
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_SET.has(pathname.split("?")[0]);
}

export function getPostAuthDestination(
  onboardingCompleted: boolean,
  next: string | null | undefined
): ProtectedRoute {
  const validated = validateNextPath(next);
  if (validated) return validated;
  return onboardingCompleted ? "/dashboard" : "/assessment";
}

export function getAuditCtaDestination(
  isAuthenticated: boolean,
  onboardingCompleted: boolean
): string {
  if (!isAuthenticated) {
    return buildSignUpUrl("/assessment");
  }
  return onboardingCompleted ? "/dashboard" : "/assessment";
}
