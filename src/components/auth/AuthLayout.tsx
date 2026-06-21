
import React from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas flex">
      <aside className="hidden lg:flex lg:w-1/2 bg-forest-950 text-white p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <Leaf size={22} className="text-green-500" aria-hidden="true" />
          PrithviProof
        </Link>
        <div>
          <h2 className="text-2xl font-bold mb-3">Turn estimates into evidence.</h2>
          <p className="text-white/70 leading-relaxed max-w-md">
            Create an account to save your carbon audit securely and sync across devices when you sign in.
          </p>
        </div>
        <p className="text-xs text-white/40">&copy; 2026 PrithviProof</p>
      </aside>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 text-lg font-bold text-forest-900 mb-8">
            <Leaf size={22} className="text-forest-700" aria-hidden="true" />
            PrithviProof
          </Link>

          <div className="bg-surface border border-border rounded-card p-6 shadow-card">
            <h1 className="text-xl font-bold text-text-primary mb-1">{title}</h1>
            <p className="text-sm text-text-secondary mb-6">{subtitle}</p>
            {children}
          </div>

          <p className="text-center text-sm mt-4">
            <Link to="/" className="text-text-secondary hover:text-forest-700">
              &larr; Return to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
