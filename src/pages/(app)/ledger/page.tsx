
import React, { useState } from "react";
import { useStore } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transitionLedgerState, isValidTransition, calculateTotalSavings } from "@/domain/ledger";
import { LedgerRecord, LedgerState } from "@/domain/models";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ShieldCheck, Clock, ArrowRight, CheckCircle2, AlertOctagon } from "lucide-react";
import { formatEmissions } from "@/lib/format";

const STATE_ORDER: LedgerState[] = ["estimated", "planned", "in-progress", "verified", "rejected"];

function getStateIcon(state: LedgerState) {
  switch (state) {
    case "planned": return <Clock className="text-amber" size={16} aria-hidden="true" />;
    case "in-progress": return <ArrowRight className="text-blue" size={16} aria-hidden="true" />;
    case "verified": return <CheckCircle2 className="text-forest-700" size={16} aria-hidden="true" />;
    case "rejected": return <AlertOctagon className="text-danger" size={16} aria-hidden="true" />;
    default: return null;
  }
}

function formatStateLabel(state: LedgerState): string {
  return state === "in-progress" ? "In progress" : state.charAt(0).toUpperCase() + state.slice(1);
}

export default function Ledger() {
  const { isInitialized, ledger, updateLedgerRecord } = useStore();
  const [pendingTransition, setPendingTransition] = useState<{ record: LedgerRecord; newState: LedgerState } | null>(null);

  if (!isInitialized) {
    return (
      <div className="max-w-content mx-auto p-6">
        <div className="animate-pulse h-6 w-48 bg-canvas-subtle rounded" aria-hidden="true" />
      </div>
    );
  }

  const totals = calculateTotalSavings(ledger);
  const inProgressCount = ledger.filter((l) => l.state === "in-progress").length;
  const rejectedCount = ledger.filter((l) => l.state === "rejected").length;

  const handleStateChange = (record: LedgerRecord, newState: LedgerState) => {
    if (newState === "verified" || newState === "rejected") {
      setPendingTransition({ record, newState });
      return;
    }
    try {
      const updated = transitionLedgerState(record, newState);
      updateLedgerRecord(updated);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  const confirmTransition = () => {
    if (!pendingTransition) return;
    try {
      const updated = transitionLedgerState(pendingTransition.record, pendingTransition.newState);
      updateLedgerRecord(updated);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
    setPendingTransition(null);
  };

  return (
    <div className="max-w-content mx-auto p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Evidence Ledger"
        description="Track what you planned, what you completed, and what has verified evidence."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Ledger summary">
        <MetricCard label="Projected savings" value={totals.projected.toFixed(1)} subtext="kg CO₂e/month" variant="amber" />
        <MetricCard label="In progress" value={String(inProgressCount)} subtext="actions underway" />
        <MetricCard label="Verified savings" value={totals.verified.toFixed(1)} subtext="kg CO₂e/month" variant="green" />
        <MetricCard label="Rejected" value={String(rejectedCount)} subtext="not counted" />
      </section>

      <div className="bg-canvas-subtle border border-border rounded-card p-4 text-sm text-text-secondary">
        <p>
          <strong className="text-text-primary">Projected savings do not count as verified.</strong> Only actions moved to Verified status — with supporting evidence — count toward realized reductions.
        </p>
      </div>

      {ledger.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No ledger entries yet"
          description="Add a recommendation to your evidence ledger to start tracking planned actions."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {STATE_ORDER.filter((s) => s !== "estimated" || ledger.some((l) => l.state === "estimated")).map((state) => {
            const records = ledger.filter((l) => l.state === state);
            if (state === "estimated" && records.length === 0) return null;
            return (
              <div key={state} className="space-y-3">
                <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                  {getStateIcon(state)}
                  {formatStateLabel(state)}
                  <span className="text-text-secondary font-normal">({records.length})</span>
                </h2>
                {records.length === 0 ? (
                  <p className="text-xs text-text-secondary p-3 border border-dashed border-border rounded-card text-center">No entries</p>
                ) : (
                  records.map((record) => (
                    <Card key={record.id}>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm leading-snug">{record.title}</CardTitle>
                        <StatusBadge status={record.state} className="mt-2 w-fit" />
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="text-sm">
                          {record.state === "verified" ? (
                            <p className="text-forest-700 font-medium">Verified: {formatEmissions(record.verifiedSavingsKgCO2e, true)}</p>
                          ) : (
                            <p className="text-text-secondary">Expected saving: <span className="text-text-primary font-medium">{formatEmissions(record.projectedSavingsKgCO2e, true)}</span></p>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary">
                          Updated {new Date(record.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs font-medium text-text-secondary mb-2">Next actions</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(["planned", "in-progress", "verified", "rejected"] as LedgerState[]).map((s) => {
                              if (!isValidTransition(record.state, s) || record.state === s) return null;
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => handleStateChange(record, s)}
                                  className="text-xs px-2.5 py-1.5 bg-surface border border-border rounded-card hover:bg-canvas-subtle min-h-touch"
                                >
                                  Mark {formatStateLabel(s).toLowerCase()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={pendingTransition !== null}
        title={pendingTransition?.newState === "verified" ? "Verify this action?" : "Reject this action?"}
        description={
          pendingTransition?.newState === "verified"
            ? "This will count the projected savings as verified. Only confirm if you have evidence the action was completed."
            : "Rejected actions are removed from projected savings totals. Verified savings will be reset to zero."
        }
        confirmLabel={pendingTransition?.newState === "verified" ? "Verify" : "Reject"}
        variant={pendingTransition?.newState === "rejected" ? "danger" : "default"}
        onConfirm={confirmTransition}
        onCancel={() => setPendingTransition(null)}
      />
    </div>
  );
}
