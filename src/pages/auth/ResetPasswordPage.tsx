
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export default function ResetPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const parsed = resetPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setFieldError(null);
    if (!isFirebaseConfigured()) {
      setError("Password reset requires Firebase configuration.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(parsed.data.email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="We will email you a link to choose a new password.">
      {error && (
        <div className="flex items-start gap-2 border border-danger/20 rounded-card p-3 mb-4 text-sm" role="alert">
          <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="flex items-start gap-2 bg-surface-green border border-green-100 rounded-card p-4 text-sm" role="status" aria-live="polite">
          <CheckCircle2 size={18} className="text-forest-700 shrink-0" />
          <p>If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!fieldError} />
            {fieldError && <p className="text-xs text-danger mt-1">{fieldError}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-text-secondary mt-4">
        <Link to="/auth/sign-in" className="text-forest-700 hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
