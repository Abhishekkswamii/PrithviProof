import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CalculationDisclosure } from "@/components/CalculationDisclosure";
import { LiveStatus } from "@/components/LiveStatus";
import { getCategoryLabel, getActivityLabel } from "@/lib/labels";
import { formatEmissions } from "@/lib/format";
import { PenLine, Pencil, Trash2 } from "lucide-react";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { calculateEstimate } from "@/domain/calculations";
import { getFactorById } from "@/domain/factors";

import { useActivityLog } from "@/features/activities/useActivityLog";
import { NaturalLanguageForm, ActivityPreviewForm, ManualEntryForm } from "@/features/activities/ActivityForms";

export default function ActivityLogPage() {
  const {
    isInitialized,
    naturalInput,
    setNaturalInput,
    manualOpen,
    setManualOpen,
    statusMessage,
    setStatusMessage,
    deleteId,
    setDeleteId,
    editingId,
    parsing,
    previewActivity,
    setPreviewActivity,
    logForm,
    setLogForm,
    handleNaturalSubmit,
    handleConfirmPreview,
    handleManualSubmit,
    startEdit,
    confirmDelete,
    recentActivities,
  } = useActivityLog();

  if (!isInitialized) {
    return (
      <div className="max-w-content mx-auto p-6">
        <div className="animate-pulse h-6 w-48 bg-canvas-subtle rounded" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Activity Log"
        description="Log daily activities in plain language or use manual entry for precise control."
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Log an activity</CardTitle>
        </CardHeader>
        <CardContent>
          <NaturalLanguageForm
            naturalInput={naturalInput}
            setNaturalInput={setNaturalInput}
            parsing={parsing}
            onSubmit={handleNaturalSubmit}
          />

          {previewActivity && (
            <ActivityPreviewForm
              previewActivity={previewActivity}
              setPreviewActivity={setPreviewActivity}
              onSubmit={handleConfirmPreview}
            />
          )}

          <ManualEntryForm
            logForm={logForm}
            setLogForm={setLogForm}
            onSubmit={handleManualSubmit}
            editingId={editingId}
            manualOpen={manualOpen}
            setManualOpen={setManualOpen}
          />
        </CardContent>
      </Card>

      <section aria-labelledby="recent-activities">
        <h2 id="recent-activities" className="text-base font-semibold text-text-primary mb-3">Recent activities</h2>
        {recentActivities.length === 0 ? (
          <EmptyState
            icon={PenLine}
            title="No activities logged"
            description="Describe a trip, electricity use, or food habit above to start building your estimate."
          />
        ) : (
          <div className="space-y-3">
            {recentActivities.map((act) => {
              const estimate = calculateEstimate(act);
              const factor = getFactorById(act.factorId);
              return (
                <Card key={act.id}>
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-forest-700 bg-surface-green px-2 py-0.5 rounded-card border border-green-100">
                            {getCategoryLabel(act.categoryId)}
                          </span>
                          <span className="text-sm font-semibold text-text-primary">{getActivityLabel(act)}</span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {act.value} {act.unit} → <span className="font-medium text-text-primary">{formatEmissions(estimate.central, true)}</span>
                        </p>
                        <div className="mt-2 max-w-xs">
                          <ConfidenceIndicator score={act.dataQualityScore} label="Data quality" />
                        </div>
                        {factor && (
                          <div className="mt-3">
                            <CalculationDisclosure
                              activityLabel={getActivityLabel(act)}
                              activityValue={act.value}
                              activityUnit={act.unit}
                              factor={factor}
                              central={estimate.central}
                              low={estimate.low}
                              high={estimate.high}
                              dataQualityScore={act.dataQualityScore}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(act)}
                          className="min-h-touch min-w-touch inline-flex items-center justify-center rounded-card border border-border text-text-secondary hover:bg-canvas-subtle"
                          aria-label={`Edit ${getActivityLabel(act)}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(act.id)}
                          className="min-h-touch min-w-touch inline-flex items-center justify-center rounded-card border border-border text-danger hover:bg-canvas-subtle"
                          aria-label={`Delete ${getActivityLabel(act)}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete activity?"
        description="This will remove the activity from your emissions estimate. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <LiveStatus message={statusMessage} onClear={() => setStatusMessage(null)} />
    </div>
  );
}
