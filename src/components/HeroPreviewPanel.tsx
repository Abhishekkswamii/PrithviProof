import React from "react";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { formatEmissions, formatEmissionsRange } from "@/lib/format";
import { getCategoryLabel, getCategoryColorClass } from "@/lib/labels";
import { AlertCircle, ArrowRight } from "lucide-react";

/** Static preview values derived from Judge Demo seed data calculations */
const PREVIEW = {
  central: 164.7,
  low: 126.9,
  high: 202.5,
  confidence: 77,
  categories: [
    { id: "transport", central: 12.0, max: 98.7 },
    { id: "energy", central: 85.2, max: 98.7 },
    { id: "food", central: 67.5, max: 98.7 },
  ],
  projectedSavings: 120,
  verifiedSavings: 0,
};

export function HeroPreviewPanel() {
  const maxVal = PREVIEW.high;

  return (
    <div className="bg-surface rounded-card border border-border shadow-card p-5 space-y-4" aria-label="Product preview">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-text-secondary">Monthly emissions estimate</p>
          <p className="text-3xl font-bold text-text-primary tabular-nums mt-0.5">
            {formatEmissions(PREVIEW.central)}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Range: {formatEmissionsRange(PREVIEW.low, PREVIEW.high)}
          </p>
        </div>
        <div className="w-28">
          <ConfidenceIndicator score={PREVIEW.confidence} label="Confidence" />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-text-secondary mb-2">By category</p>
        <div className="space-y-2">
          {PREVIEW.categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <span className="text-xs text-text-secondary w-16 shrink-0">{getCategoryLabel(cat.id)}</span>
              <div className="flex-1 h-2 bg-canvas-subtle rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getCategoryColorClass(cat.id)}`}
                  style={{ width: `${(cat.central / maxVal) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-text-primary tabular-nums w-12 text-right">
                {cat.central.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-canvas-subtle rounded-card p-3 flex items-start gap-2">
        <AlertCircle size={16} className="text-amber shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold text-text-primary">Biggest uncertainty: Food habits</p>
          <p className="text-xs text-text-primary mt-0.5">Answering one more question could narrow your range by ~18%.</p>
        </div>
      </div>

      <div className="border border-border rounded-card p-3">
        <p className="text-xs font-medium text-forest-700 mb-1">Next clarification</p>
        <p className="text-sm text-text-primary">What best describes your diet?</p>
        <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
          <ArrowRight size={12} aria-hidden="true" /> Targets food category uncertainty
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border">
        <div>
          <p className="text-xs text-text-secondary">Projected savings</p>
          <p className="text-sm font-semibold text-forest-700 tabular-nums">{formatEmissions(PREVIEW.projectedSavings, true)}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Verified savings</p>
          <p className="text-sm font-semibold text-forest-700 tabular-nums">{formatEmissions(PREVIEW.verifiedSavings, true)}</p>
        </div>
      </div>
    </div>
  );
}
