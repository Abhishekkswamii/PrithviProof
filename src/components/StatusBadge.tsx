import React from "react";
import { LedgerState } from "@/domain/models";
import { cn } from "@/lib/utils";

const statusConfig: Record<LedgerState, { label: string; className: string }> = {
  estimated: { label: "Estimated", className: "bg-canvas-subtle text-text-primary border-border" },
  planned: { label: "Planned", className: "bg-canvas-subtle text-text-primary border-border" },
  "in-progress": { label: "In progress", className: "bg-surface border-blue/30 text-forest-700" },
  verified: { label: "Verified", className: "bg-surface-green border-green-100 text-forest-700" },
  rejected: { label: "Rejected", className: "bg-surface border-danger/20 text-danger" },
};

interface StatusBadgeProps {
  status: LedgerState | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as LedgerState] ?? {
    label: String(status),
    className: "bg-canvas-subtle text-text-primary border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-card border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
