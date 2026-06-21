
import React, { useState } from "react";
import { useStore } from "@/data/store";
import { rankRecommendations } from "@/domain/recommendations";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LiveStatus } from "@/components/LiveStatus";
import { CheckCircle2, IndianRupee } from "lucide-react";
import { LedgerRecord, UserConstraints } from "@/domain/models";
import { getCategoryLabel, getHousingLabel, getOwnershipLabel } from "@/lib/labels";
import { formatEmissions } from "@/lib/format";

function buildConstraintSummary(constraints: UserConstraints): string {
  const parts = [
    `${getOwnershipLabel(constraints.ownership)}`,
    getHousingLabel(constraints.housingType),
    `budget ₹${constraints.budgetAvailable.toLocaleString("en-IN")}`,
    constraints.hasCar ? "has car" : "no car",
  ];
  if (constraints.transportModes?.length) {
    parts.push(`transport: ${constraints.transportModes.join(", ")}`);
  }
  if (constraints.dietRestrictions) {
    parts.push(`diet: ${constraints.dietRestrictions}`);
  }
  return parts.join(" · ");
}

export default function Recommendations() {
  const { isInitialized, recommendations, constraints, ledger, addLedgerRecord } = useStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isInitialized) {
    return (
      <div className="max-w-content mx-auto p-6">
        <div className="animate-pulse h-6 w-48 bg-canvas-subtle rounded" aria-hidden="true" />
      </div>
    );
  }

  const activeLedgerIds = ledger.filter((l) => l.state !== "rejected").map((l) => l.recommendationId);
  const ranked = rankRecommendations(recommendations, constraints, activeLedgerIds);

  const handleAccept = (rec: (typeof ranked)[0]) => {
    const newRecord: LedgerRecord = {
      id: `led-${Date.now()}`,
      recommendationId: rec.id,
      title: rec.title,
      state: "planned",
      projectedSavingsKgCO2e: rec.expectedReductionKgCO2e,
      verifiedSavingsKgCO2e: 0,
      updatedAt: new Date().toISOString(),
    };
    addLedgerRecord(newRecord);
    setAddedId(rec.id);
    setStatusMessage(`"${rec.title}" added to your evidence ledger.`);
  };

  return (
    <div className="max-w-content mx-auto p-4 sm:p-6">
      <PageHeader
        title="Recommendations"
        description="Ranked actions filtered by your profile constraints and feasibility."
      />

      <div className="bg-canvas-subtle border border-border rounded-card p-4 mb-6 text-sm">
        <p className="font-medium text-text-primary mb-1">Constraints applied</p>
        <p className="text-text-secondary">{buildConstraintSummary(constraints)}</p>
      </div>

      {ranked.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="You're doing great"
          description="No new recommendations match your current constraints and ledger entries."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ranked.map((rec, idx) => (
            <Card
              key={rec.id}
              className={idx === 0 ? "md:col-span-2 flex flex-col md:flex-row md:items-stretch" : "flex flex-col"}
            >
              <div className="flex-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-forest-700 bg-surface-green px-2 py-0.5 rounded-card border border-green-100">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-medium text-text-secondary uppercase">{getCategoryLabel(rec.categoryId)}</span>
                    {idx === 0 && (
                      <span className="text-xs font-medium text-teal ml-auto">Highest impact</span>
                    )}
                  </div>
                  <CardTitle className="text-base">{rec.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-text-secondary">{rec.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-canvas-subtle rounded-card p-2.5 border border-border">
                      <span className="text-text-secondary block">Expected reduction</span>
                      <span className="font-semibold text-forest-700">{formatEmissions(rec.expectedReductionKgCO2e, true)}</span>
                    </div>
                    <div className="bg-canvas-subtle rounded-card p-2.5 border border-border">
                      <span className="text-text-secondary block">Confidence</span>
                      <span className="font-semibold text-text-primary">{rec.confidencePercent}%</span>
                    </div>
                    <div className="bg-canvas-subtle rounded-card p-2.5 border border-border">
                      <span className="text-text-secondary block">Effort</span>
                      <span className="font-semibold text-text-primary">{rec.effortScore}/10</span>
                    </div>
                    <div className="bg-canvas-subtle rounded-card p-2.5 border border-border">
                      <span className="text-text-secondary block">Cost</span>
                      <span className="font-semibold text-text-primary flex items-center gap-0.5">
                        <IndianRupee size={12} aria-hidden="true" />
                        ~₹{Math.round(rec.costEstimateUSD * 83).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="bg-canvas-subtle rounded-card p-2.5 border border-border col-span-2 sm:col-span-2">
                      <span className="text-text-secondary block">Feasibility</span>
                      <span className="font-semibold text-text-primary">
                        {rec.requiredConstraints ? "Matches your housing & budget" : "No special requirements"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface-green rounded-card p-3 border border-green-100">
                    <p className="text-xs font-semibold text-forest-700 mb-1">Why this fits you</p>
                    <p className="text-xs text-text-secondary">
                      {idx === 0
                        ? "Best balance of impact, confidence and low effort for your profile."
                        : rec.effortScore <= 3
                          ? "Low effort action compatible with your constraints."
                          : "Meaningful reduction that fits your housing and budget profile."}
                    </p>
                  </div>
                  <Disclosure title="How this was ranked">
                    <p className="text-xs text-text-secondary mt-2">
                      Score = (expected reduction × confidence) ÷ (cost + effort weight). Filtered by ownership ({constraints.ownership}), housing ({constraints.housingType}), and budget (₹{constraints.budgetAvailable.toLocaleString("en-IN")}).
                    </p>
                  </Disclosure>
                </CardContent>
              </div>
              <CardFooter className={idx === 0 ? "md:w-48 md:flex md:items-end md:p-5" : "pt-0"}>
                <Button
                  onClick={() => handleAccept(rec)}
                  disabled={addedId === rec.id}
                  className="w-full h-11"
                >
                  {addedId === rec.id ? "Added to ledger" : "Add to Evidence Ledger"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <LiveStatus message={statusMessage} onClear={() => setStatusMessage(null)} />
    </div>
  );
}
