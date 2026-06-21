import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import MethodologyContent from "./MethodologyContent";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-forest-900">
            <Leaf size={20} className="text-forest-700" aria-hidden="true" />
            PrithviProof
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/auth/sign-in" className="text-text-secondary hover:text-text-primary">Sign In</Link>
            <Link to="/auth/sign-up" className="text-forest-700 font-medium hover:underline">Create Account</Link>
          </div>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        <MethodologyContent />
      </main>
    </div>
  );
}
