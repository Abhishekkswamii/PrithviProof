import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { localFactors } from "@/domain/factors";
import { Loader2, Sparkles, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { ParsedActivity, ParsedCategory } from "@/lib/ai/types";

interface NaturalLanguageFormProps {
  naturalInput: string;
  setNaturalInput: (val: string) => void;
  parsing: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function NaturalLanguageForm({ naturalInput, setNaturalInput, parsing, onSubmit }: NaturalLanguageFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
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
  );
}

interface ActivityPreviewFormProps {
  previewActivity: ParsedActivity;
  setPreviewActivity: (act: ParsedActivity | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ActivityPreviewForm({ previewActivity, setPreviewActivity, onSubmit }: ActivityPreviewFormProps) {
  return (
    <div className="mt-6 border border-border rounded-card overflow-hidden bg-surface shadow-sm">
      <div className="bg-canvas-subtle px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
          <Sparkles size={12} />
          AI Activity Preview
        </span>
      </div>
      <form onSubmit={onSubmit} className="p-4 space-y-4">
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
  );
}

interface LogFormState {
  categoryId: string;
  factorId: string;
  value: string;
  unit: string;
  dataQualityScore: string;
}

interface ManualEntryFormProps {
  logForm: LogFormState;
  setLogForm: (form: LogFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  editingId: string | null;
  manualOpen: boolean;
  setManualOpen: (open: boolean) => void;
}

export function ManualEntryForm({ logForm, setLogForm, onSubmit, editingId, manualOpen, setManualOpen }: ManualEntryFormProps) {
  return (
    <>
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
        <form onSubmit={onSubmit} className="mt-4 pt-4 border-t border-border space-y-4">
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
    </>
  );
}
