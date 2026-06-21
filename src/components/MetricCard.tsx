import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  variant?: "default" | "green" | "amber" | "blue";
  className?: string;
}

const variantStyles = {
  default: "bg-surface border-border",
  green: "bg-surface-green border-green-100",
  amber: "bg-surface border-border",
  blue: "bg-surface border-border",
};

const valueStyles = {
  default: "text-text-primary",
  green: "text-forest-700",
  amber: "text-amber",
  blue: "text-blue",
};

export function MetricCard({ label, value, subtext, variant = "default", className }: MetricCardProps) {
  return (
    <div className={cn("rounded-card border p-4 shadow-card", variantStyles[variant], className)}>
      <p className="text-xs font-medium text-text-secondary mb-1">{label}</p>
      <p className={cn("text-2xl font-bold tabular-nums", valueStyles[variant])}>{value}</p>
      {subtext && <p className="text-xs text-text-secondary mt-1.5">{subtext}</p>}
    </div>
  );
}
