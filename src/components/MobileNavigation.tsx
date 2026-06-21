
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Leaf,
  LayoutDashboard,
  ClipboardList,
  PenLine,
  Lightbulb,
  MoreHorizontal,
  ShieldCheck,
  BookOpen,
  Settings,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "Assessment", icon: ClipboardList },
  { href: "/log", label: "Activities", icon: PenLine },
  { href: "/recommendations", label: "Actions", icon: Lightbulb },
];

const moreNav = [
  { href: "/ledger", label: "Evidence Ledger", icon: ShieldCheck },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNavigation() {
  const location = useLocation(); const pathname = location.pathname;
  const [moreOpen, setMoreOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [moreOpen]);

  const isMoreActive = moreNav.some((item) => pathname === item.href);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-surface border-b border-border">
        <div className="px-4 h-12 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-forest-900">
            <Leaf size={18} className="text-forest-700" aria-hidden="true" />
            PrithviProof
          </Link>

        </div>
      </header>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border safe-area-pb"
        aria-label="Mobile bottom navigation"
      >
        <ul className="flex items-stretch">
          {bottomNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  to={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 min-h-touch text-[11px] font-medium",
                    isActive ? "text-forest-700" : "text-text-secondary"
                  )}
                >
                  <item.icon size={20} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              aria-controls="mobile-more-drawer"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 min-h-touch w-full text-[11px] font-medium",
                isMoreActive || moreOpen ? "text-forest-700" : "text-text-secondary"
              )}
            >
              <MoreHorizontal size={20} aria-hidden="true" />
              More
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-forest-950/40 z-50"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-more-drawer"
            ref={drawerRef}
            role="dialog"
            aria-label="More navigation"
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-card border-t border-border p-4 pb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">More</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="min-h-touch min-w-touch inline-flex items-center justify-center rounded-card text-text-secondary"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <ul className="space-y-1">
              {moreNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 text-sm font-medium rounded-card min-h-touch",
                        isActive ? "bg-surface-green text-forest-900" : "text-text-primary hover:bg-canvas-subtle"
                      )}
                    >
                      <item.icon size={18} aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}

            </ul>
          </div>
        </>
      )}
    </>
  );
}
