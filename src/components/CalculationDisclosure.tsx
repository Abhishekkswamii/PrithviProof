import React from "react";
import { Disclosure } from "@/components/ui/disclosure";
import { EmissionFactor } from "@/domain/models";
import { formatEmissions } from "@/lib/format";

interface CalculationDisclosureProps {
  activityLabel: string;
  activityValue: number;
  activityUnit: string;
  factor: EmissionFactor;
  central: number;
  low: number;
  high: number;
  dataQualityScore: number;
}

export function CalculationDisclosure({
  activityLabel,
  activityValue,
  activityUnit,
  factor,
  central,
  low,
  high,
  dataQualityScore,
}: CalculationDisclosureProps) {
  return (
    <Disclosure title="Calculation details">
      <div className="space-y-3 text-sm text-text-secondary">
        <p className="font-medium text-text-primary">{activityLabel}</p>
        <div className="bg-canvas-subtle rounded-card p-3 font-mono text-xs space-y-1">
          <p>
            {activityValue} {activityUnit} × {factor.value} kg CO₂e/{factor.unit} ={" "}
            <span className="text-forest-700 font-semibold">{formatEmissions(central)}</span>
          </p>
          <p>Range: {formatEmissions(low)} – {formatEmissions(high)}</p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-text-secondary">Source</dt>
            <dd className="font-medium text-text-primary">{factor.provenance.sourceName}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Year</dt>
            <dd className="font-medium text-text-primary">{factor.provenance.year}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Geography</dt>
            <dd className="font-medium text-text-primary">{factor.provenance.geography}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Data quality</dt>
            <dd className="font-medium text-text-primary">{dataQualityScore}%</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Factor uncertainty</dt>
            <dd className="font-medium text-text-primary">±{factor.uncertaintyPercent}%</dd>
          </div>
        </dl>
      </div>
    </Disclosure>
  );
}
