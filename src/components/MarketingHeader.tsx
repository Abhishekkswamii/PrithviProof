
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#why-different", label: "Why It Is Different" },
  { href: "/methodology", label: "Methodology" },
];

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-card">
      <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-base font-bold text-forest-900 shrink-0">
          <Leaf size={20} className="text-forest-700" aria-hidden="true" />
          PrithviProof
        </Link>

        <nav aria-label="Marketing navigation" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-card transition-colors min-h-touch inline-flex items-center"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/auth/sign-in"
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary min-h-touch inline-flex items-center rounded-card"
          >
            Sign In
          </Link>
          <Link
            to="/auth/sign-up"
            className="inline-flex items-center justify-center bg-forest-700 hover:bg-forest-900 text-white text-sm font-medium h-11 px-4 rounded-card min-h-touch"
          >
            Create Account
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="md:hidden min-h-touch min-w-touch inline-flex items-center justify-center rounded-card text-text-secondary hover:bg-canvas-subtle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-marketing-menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-marketing-menu"
          ref={menuRef}
          className="md:hidden border-t border-border bg-surface px-4 py-3"
          role="dialog"
          aria-label="Mobile navigation menu"
        >
          <nav aria-label="Mobile marketing navigation" className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-3 text-sm font-medium text-text-primary rounded-card hover:bg-canvas-subtle min-h-touch"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/auth/sign-in"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-3 text-sm font-medium text-text-primary rounded-card hover:bg-canvas-subtle min-h-touch"
            >
              Sign In
            </Link>
            <Link
              to="/auth/sign-up"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-3 text-sm font-medium text-forest-700 rounded-card hover:bg-surface-green min-h-touch"
            >
              Create Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
