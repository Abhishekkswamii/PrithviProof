
import React, { useState } from "react";
import { useStore } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity } from "@/domain/models";
import { localFactors } from "@/domain/factors";
import { calculateEstimate } from "@/domain/calculations";
import { getFactorById } from "@/domain/factors";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CalculationDisclosure } from "@/components/CalculationDisclosure";
import { LiveStatus } from "@/components/LiveStatus";
import { parseNaturalLanguageEntry, mapTypeToFactorId } from "@/lib/natural-language";
import { getCategoryLabel, getActivityLabel } from "@/lib/labels";
import { formatEmissions } from "@/lib/format";
import { PenLine, ChevronDown, ChevronUp, Pencil, Trash2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { getAiRepository } from "@/lib/ai/createAiRepository";
import { ParsedActivity, ParsedCategory } from "@/lib/ai/types";

export default function ActivityLogPage() {
  const { isInitialized, activities, addActivity, updateActivity, removeActivity } = useStore();
  const [naturalInput, setNaturalInput] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [parsing, setParsing] = useState(false);
  const [previewActivity, setPreviewActivity] = useState<ParsedActivity | null>(null);

  const [logForm, setLogForm] = useState({
    categoryId: "transport",
    factorId: "f-scooter-gas",
    value: "",
    unit: "km",
    dataQualityScore: "80",
  });

  if (!isInitialized) {
    return (
      <div className="max-w-content mx-auto p-6">
        <div className="animate-pulse h-6 w-48 bg-canvas-subtle rounded" aria-hidden="true" />
      </div>
    );
  }

  const handleNaturalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;

    setParsing(true);
    setStatusMessage(null);
    setPreviewActivity(null);
    try {
      const response = await getAiRepository().parseActivity(naturalInput);
      const activity = response.activities[0];
      if (activity) {
        if (activity.clarificationNeeded && activity.clarificationQuestion) {
          setStatusMessage(activity.clarificationQuestion);
        } else {
          setPreviewActivity(activity);
        }
      } else {
        setStatusMessage("Could not parse entry. Please try again or use manual entry.");
      }
    } catch (error: unknown) {
      console.error(error);
      setStatusMessage("AI parsing failed. Please use manual entry.");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewActivity) return;

    // Use deterministic engine to map to exact factor
    const mappedCategoryId = previewActivity.category === "shopping" ? "purchases" : previewActivity.category;
    const factorId = mapTypeToFactorId(mappedCategoryId as Activity["categoryId"], previewActivity.activityType);
    
    addActivity({
      id: `act-${Date.now()}`,
      categoryId: mappedCategoryId as Activity["categoryId"],
      factorId,
      value: previewActivity.quantity,
      unit: previewActivity.unit as Activity["unit"],
      dataQualityScore: previewActivity.confidence,
    });
    
    setNaturalInput("");
    setPreviewActivity(null);
    setStatusMessage("Activity logged successfully.");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.value) return;
    const activity: Activity = {
      id: editingId ?? `act-manual-${Date.now()}`,
      categoryId: logForm.categoryId as Activity["categoryId"],
      factorId: logForm.factorId,
      value: parseFloat(logForm.value),
      unit: logForm.unit as Activity["unit"],
      dataQualityScore: parseInt(logForm.dataQualityScore),
    };
    if (editingId) {
      updateActivity(activity);
      setEditingId(null);
      setStatusMessage("Activity updated.");
    } else {
      addActivity(activity);
      setStatusMessage("Activity logged successfully.");
    }
    setLogForm({ ...logForm, value: "" });
  };

  const startEdit = (act: Activity) => {
    setEditingId(act.id);
    setManualOpen(true);
    setLogForm({
      categoryId: act.categoryId,
      factorId: act.factorId,
      value: String(act.value),
      unit: act.unit,
      dataQualityScore: String(act.dataQualityScore),
    });
  };

  const recentActivities = [...activities].reverse();

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
          <form onSubmit={handleNaturalSubmit} className="space-y-3">
            <label htmlFor="natural-input" className="block text-sm font-medium text-text-primary">
              Describe your activity
            </label>
            <Input
              id="natural-input"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder='e.g. "12 km by Delhi Metro"'
              aria-describedby="natural-hint"
            />
            <p id="natural-hint" className="text-xs text-text-secondary">
              Include a number and unit. Keywords like metro, electricity, or diet help match the right emission factor.
            </p>
            <Button type="submit" disabled={!naturalInput.trim() || parsing} className="h-11">
              {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {parsing ? "Parsing..." : "Log Activity"}
            </Button>
          </form>

          {previewActivity && (
            <div className="mt-6 border border-border rounded-card overflow-hidden bg-surface shadow-sm">
              <div className="bg-canvas-subtle px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                  <Sparkles size={12} />
                  AI Activity Preview
                </span>
              </div>
              <form onSubmit={handleConfirmPreview} className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Category</label>
                    <select
                      className="w-full h-9 rounded-card border border-border bg-surface px-2 text-sm"
                      value={previewActivity.category}
                      onChange={(e) => setPreviewActivity({ ...previewActivity, category: e.target.value as ParsedCategory })}
                    >
                      <option value="transport">Transport</option>
                      <option value="energy">Energy</option>
                      <option value="food">Food</option>
                      <option value="purchases">Purchases</option>
                      <option value="waste">Waste</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Activity Type</label>
                    <Input
                      className="h-9"
                      value={previewActivity.activityType}
                      onChange={(e) => setPreviewActivity({ ...previewActivity, activityType: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Quantity</label>
                    <Input
                      type="number"
                      step="any"
                      className="h-9"
                      value={previewActivity.quantity}
                      onChange={(e) => setPreviewActivity({ ...previewActivity, quantity: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Unit</label>
                    <Input
                      className="h-9"
                      value={previewActivity.unit}
                      onChange={(e) => setPreviewActivity({ ...previewActivity, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary bg-canvas-subtle p-2 rounded">
                  <AlertCircle size={14} className="text-forest-600" />
                  PrithviProof deterministic engine will map this to the exact emission factor and calculate your savings.
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" className="bg-surface text-forest-700 border border-forest-700 hover:bg-forest-50" onClick={() => setPreviewActivity(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Confirm and Save
                  </Button>
                </div>
              </form>
            </div>
          )}

          <button
            type="button"
            onClick={() => setManualOpen(!manualOpen)}
            className="flex items-center gap-2 text-sm font-medium text-forest-700 mt-5 min-h-touch"
            aria-expanded={manualOpen}
          >
            {manualOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
            Manual entry
          </button>

          {manualOpen && (
            <form onSubmit={handleManualSubmit} className="mt-4 pt-4 border-t border-border space-y-4">
              <div>
                <label htmlFor="factor" className="block text-sm font-medium text-text-primary mb-1">Emission source</label>
                <select
                  id="factor"
                  className="w-full min-h-touch h-11 rounded-card border border-border bg-surface px-3 text-sm"
                  value={logForm.factorId}
                  onChange={(e) => {
                    const factor = localFactors.find((f) => f.id === e.target.value);
                    if (factor) {
                      setLogForm({ ...logForm, factorId: factor.id, categoryId: factor.category, unit: factor.unit });
                    }
                  }}
                >
                  {localFactors.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.unit})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="value" className="block text-sm font-medium text-text-primary mb-1">
                    Amount ({logForm.unit})
                  </label>
                  <Input id="value" type="number" step="any" required value={logForm.value} onChange={(e) => setLogForm({ ...logForm, value: e.target.value })} />
                </div>
                <div className="w-28">
                  <label htmlFor="quality" className="block text-sm font-medium text-text-primary mb-1">Confidence</label>
                  <Input id="quality" type="number" min="0" max="100" required value={logForm.dataQualityScore} onChange={(e) => setLogForm({ ...logForm, dataQualityScore: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="h-11 w-full sm:w-auto">
                {editingId ? "Update Activity" : "Log Activity"}
              </Button>
            </form>
          )}
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
        onConfirm={() => {
          if (deleteId) removeActivity(deleteId);
          setDeleteId(null);
          setStatusMessage("Activity deleted.");
        }}
        onCancel={() => setDeleteId(null)}
      />

      <LiveStatus message={statusMessage} onClear={() => setStatusMessage(null)} />
    </div>
  );
}
