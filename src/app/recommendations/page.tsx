"use client";

import React from "react";
import { useStore } from "@/data/store";
import { rankRecommendations } from "@/domain/recommendations";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, DollarSign, Lightbulb, Zap } from "lucide-react";
import { LedgerRecord } from "@/domain/models";
import { useRouter } from "next/navigation";

export default function Recommendations() {
  const { isInitialized, recommendations, constraints, ledger, addLedgerRecord } = useStore();
  const router = useRouter();

  if (!isInitialized) return <div className="p-8 text-center" aria-live="polite">Loading recommendations...</div>;

  const activeLedgerIds = ledger.filter(l => l.state !== "rejected").map(l => l.recommendationId);
  const ranked = rankRecommendations(recommendations, constraints, activeLedgerIds);

  const handleAccept = (rec: import('@/domain/models').Recommendation) => {
    const newRecord: LedgerRecord = {
      id: `led-${Date.now()}`,
      recommendationId: rec.id,
      title: rec.title,
      state: "planned",
      projectedSavingsKgCO2e: rec.expectedReductionKgCO2e,
      verifiedSavingsKgCO2e: 0,
      updatedAt: new Date().toISOString()
    };
    addLedgerRecord(newRecord);
    router.push("/ledger");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <header className="mb-8 border-b border-charcoal-200 pb-4">
        <h1 className="text-3xl font-bold text-charcoal-900 flex items-center gap-2">
          <Lightbulb className="text-amber-500" /> Constraint-Aware Recommendations
        </h1>
        <p className="text-charcoal-600 mt-2">
          These actions have been filtered to ensure they are actually feasible for a {constraints.ownership}er in a {constraints.housingType} within budget.
        </p>
      </header>

      {ranked.length === 0 ? (
        <div className="text-center p-12 bg-charcoal-50 rounded-lg border border-charcoal-200">
          <CheckCircle2 size={48} className="text-forest-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-charcoal-800">You&apos;re doing great!</h2>
          <p className="text-charcoal-600 mt-2">No new recommendations available for your current constraints.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ranked.map((rec, idx) => (
            <Card key={rec.id} className="flex flex-col border-teal-200 overflow-hidden relative">
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                  Highest Impact
                </div>
              )}
              <CardHeader className="bg-teal-50 pb-4">
                <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1">{rec.categoryId}</div>
                <CardTitle className="text-xl">{rec.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-4 space-y-4">
                <p className="text-charcoal-700 text-sm">{rec.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm bg-charcoal-50 p-3 rounded border border-charcoal-100">
                  <div className="flex flex-col">
                    <span className="text-charcoal-500 text-xs">Expected Reduction</span>
                    <span className="font-semibold text-forest-700 flex items-center gap-1">
                      <Zap size={14} /> {rec.expectedReductionKgCO2e} kgCO2e
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-charcoal-500 text-xs">Cost Estimate</span>
                    <span className="font-semibold text-charcoal-800 flex items-center gap-1">
                      <DollarSign size={14} /> {rec.costEstimateUSD}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-charcoal-500 text-xs">Confidence</span>
                    <span className="font-semibold text-charcoal-800">{rec.confidencePercent}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-charcoal-500 text-xs">Effort (1-10)</span>
                    <span className="font-semibold text-charcoal-800">{rec.effortScore}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button onClick={() => handleAccept(rec)} className="w-full bg-teal-600 hover:bg-teal-700">
                  Add to Ledger (Commit)
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
