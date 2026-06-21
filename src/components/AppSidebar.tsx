
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Leaf,
  LayoutDashboard,
  ClipboardList,
  PenLine,
  Lightbulb,
  ShieldCheck,
  Settings,
  RotateCcw,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "Assessment", icon: ClipboardList },
  { href: "/log", label: "Activities", icon: PenLine },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/ledger", label: "Evidence Ledger", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation(); const pathname = location.pathname;

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-sidebar bg-canvas-subtle border-r border-border z-40"
      aria-label="Application sidebar"
    >
      <div className="px-4 py-5 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2 text-base font-bold text-forest-900">
          <Leaf size={20} className="text-forest-700" aria-hidden="true" />
          PrithviProof
        </Link>
        <p className="text-xs text-text-secondary mt-1 font-medium">Audit &amp; Verification</p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-card min-h-touch transition-colors",
                    isActive
                      ? "bg-surface-green text-forest-900 border-l-[3px] border-forest-700 pl-[9px]"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface/60 border-l-[3px] border-transparent pl-[9px]"
                  )}
                >
                  <item.icon size={18} aria-hidden="true" className={isActive ? "text-forest-700" : ""} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>


    </aside>
  );
}
