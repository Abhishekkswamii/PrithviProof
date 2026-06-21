
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useStore } from "@/data/store";
import { buildSignInUrl } from "@/lib/routes";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { initialized, loading, isAuthenticated } = useAuth();
  const { isInitialized } = useStore();
  const navigate = useNavigate();
  const location = useLocation(); const pathname = location.pathname;

  const ready = initialized && isInitialized;
  const allowed = isAuthenticated;

  React.useEffect(() => {
    if (!ready || loading) return;
    if (!allowed) {
      navigate(buildSignInUrl(pathname));
    }
  }, [ready, loading, allowed, navigate, pathname]);

  if (!ready || loading) {
    return (
      <main id="main-content" className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
        <h1 className="sr-only">Loading</h1>
        <p className="text-sm text-text-secondary">Loading your audit…</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main id="main-content" className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
        <h1 className="sr-only">Redirecting</h1>
        <p className="text-sm text-text-secondary">Redirecting to sign in…</p>
      </main>
    );
  }

  return <>{children}</>;
}
