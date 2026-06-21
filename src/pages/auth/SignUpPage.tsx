
import React, { useState, Suspense } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import { signUpSchema } from "@/lib/auth/schemas";
import { getPostAuthDestination } from "@/lib/routes";
import { isFirebaseConfigured } from "@/lib/firebase/config";

function SignUpForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");
  const { signUp, signInWithGoogle, isFirebaseEnabled } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = signUpSchema.safeParse({
      displayName,
      email,
      password,
      confirmPassword,
      acceptTerms,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[String(i.path[0])] = i.message;
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    if (!isFirebaseConfigured()) {
      setError("Firebase is not configured.");
      return;
    }
    setLoading(true);
    try {
      await signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        displayName: parsed.data.displayName,
      });
      setStatus("Account created. Verification email sent. Redirecting…");
      const dest = getPostAuthDestination(false, next);
      navigate(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start tracking your emissions with honest estimates.">


      {error && (
        <div className="flex items-start gap-2 bg-canvas-subtle border border-danger/20 text-sm rounded-card p-3 mb-4" role="alert">
          <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
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
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">Full name</label>
          <Input id="name" autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} aria-invalid={!!fieldErrors.displayName} />
          {fieldErrors.displayName && <p className="text-xs text-danger mt-1">{fieldErrors.displayName}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!fieldErrors.email} />
          {fieldErrors.email && <p className="text-xs text-danger mt-1">{fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">Password</label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-11" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 min-h-touch min-w-touch inline-flex items-center justify-center text-text-secondary" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-xs text-danger mt-1">{fieldErrors.password}</p>}
          <p className="text-xs text-text-secondary mt-1">At least 8 characters with uppercase, lowercase and a number.</p>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-text-primary mb-1">Confirm password</label>
          <Input id="confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} aria-invalid={!!fieldErrors.confirmPassword} />
          {fieldErrors.confirmPassword && <p className="text-xs text-danger mt-1">{fieldErrors.confirmPassword}</p>}
        </div>
        <div className="flex items-start gap-2">
          <input type="checkbox" id="terms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border" aria-invalid={!!fieldErrors.acceptTerms} />
          <label htmlFor="terms" className="text-xs text-text-secondary">
            I agree to the <Link to="/#privacy" className="text-forest-700 hover:underline">terms and privacy policy</Link>.
          </label>
        </div>
        {fieldErrors.acceptTerms && <p className="text-xs text-danger">{fieldErrors.acceptTerms}</p>}

        <Button type="submit" disabled={loading} className="w-full h-11">{loading ? "Creating account…" : "Create Account"}</Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-surface px-2 text-text-secondary">or</span></div>
      </div>

      <button type="button" onClick={() => signInWithGoogle().then((session) => navigate(getPostAuthDestination(session.onboardingCompleted, next))).catch((e) => setError(e instanceof Error ? e.message : "Google sign-in failed."))} disabled={loading} className="w-full flex items-center justify-center border border-border rounded-card min-h-touch h-11 text-sm font-medium hover:bg-canvas-subtle">
        Continue with Google
      </button>

      <p className="text-center text-sm text-text-secondary mt-4">
        Already have an account? <Link to={next ? `/auth/sign-in?next=${encodeURIComponent(next)}` : "/auth/sign-in"} className="text-forest-700 font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-secondary">Loading…</div>}>
      <SignUpForm />
    </Suspense>
  );
}
