import React from "react";
import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  score: number;
  label?: string;
  className?: string;
}

function getConfidenceLevel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "High", color: "bg-green-500" };
  if (score >= 60) return { text: "Moderate", color: "bg-teal" };
  if (score >= 40) return { text: "Fair", color: "bg-amber" };
  return { text: "Low", color: "bg-coral" };
}

export function ConfidenceIndicator({ score, label = "Data confidence", className }: ConfidenceIndicatorProps) {
  const level = getConfidenceLevel(score);
  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-text-secondary">{label}</span>
        <span className="font-semibold text-text-primary">{clampedScore}% · {level.text}</span>
      </div>
      <div
        className="h-2 bg-canvas-subtle rounded-full overflow-hidden"
        role="meter"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clampedScore}%`}
      >
        <div
          className={cn("h-full rounded-full transition-all", level.color)}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
    </div>
  );
}
