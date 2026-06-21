
import React, { useState, Suspense } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import { signInSchema } from "@/lib/auth/schemas";
import { getPostAuthDestination } from "@/lib/routes";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-secondary">Loading…</div>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");
  const { signIn, signInWithGoogle, isFirebaseEnabled } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const firebaseReady = isFirebaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[String(i.path[0])] = i.message;
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    if (!firebaseReady) {
      setError("Firebase is not configured.");
      return;
    }
    setLoading(true);
    try {
      const session = await signIn(parsed.data);
      setStatus("Signed in successfully. Redirecting…");
      navigate(getPostAuthDestination(session.onboardingCompleted, next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    if (!firebaseReady) {
      setError("Firebase is not configured.");
      return;
    }
    setLoading(true);
    try {
      const session = await signInWithGoogle();
      navigate(getPostAuthDestination(session.onboardingCompleted, next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Access your saved carbon audit and evidence ledger.">


      {error && (
        <div className="flex items-start gap-2 bg-canvas-subtle border border-danger/20 text-text-primary text-sm rounded-card p-3 mb-4" role="alert">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-danger" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {status && (
        <div className="text-sm text-forest-700 bg-surface-green border border-green-100 rounded-card p-3 mb-4" role="status" aria-live="polite">
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "email-error" : undefined} />
          {fieldErrors.email && <p id="email-error" className="text-xs text-danger mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">Password</label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-11" aria-invalid={!!fieldErrors.password} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 min-h-touch min-w-touch inline-flex items-center justify-center text-text-secondary" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-xs text-danger mt-1">{fieldErrors.password}</p>}
        </div>

        <div className="text-right">
          <Link to="/auth/reset-password" className="text-xs text-forest-700 hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-11">{loading ? "Signing in…" : "Sign In"}</Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-surface px-2 text-text-secondary">or</span></div>
      </div>

      <button type="button" onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-2 border border-border rounded-card min-h-touch h-11 text-sm font-medium text-text-primary hover:bg-canvas-subtle">
        Continue with Google
      </button>

      <p className="text-center text-sm text-text-secondary mt-4">
        No account? <Link to={next ? `/auth/sign-up?next=${encodeURIComponent(next)}` : "/auth/sign-up"} className="text-forest-700 font-medium hover:underline">Create one</Link>
      </p>
    </AuthLayout>
  );
}
