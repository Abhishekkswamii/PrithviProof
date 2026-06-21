import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-10 px-4 bg-surface rounded-card border border-border", className)}>
      <Icon size={40} className="text-text-secondary mx-auto mb-3" aria-hidden="true" />
      <h2 className="text-base font-semibold text-text-primary mb-1">{title}</h2>
      <p className="text-sm text-text-secondary max-w-sm mx-auto mb-4">{description}</p>
      {action}
    </div>
  );
}
