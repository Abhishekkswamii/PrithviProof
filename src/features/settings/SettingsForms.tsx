import React from "react";
import { UserConstraints } from "@/domain/models";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogOut, Download, Trash2 } from "lucide-react";

const TRANSPORT_OPTIONS = ["metro", "bus", "scooter", "car", "walking", "cycling"];

interface ProfileFormProps {
  form: UserConstraints;
  setForm: (form: UserConstraints) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileForm({ form, setForm, onSubmit }: ProfileFormProps) {
  const toggleTransport = (mode: string) => {
    const current = form.transportModes ?? [];
    const next = current.includes(mode) ? current.filter((m) => m !== mode) : [...current, mode];
    setForm({ ...form, transportModes: next });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-text-primary mb-1">
          Monthly budget (₹)
        </label>
        <Input
          id="budget"
          type="number"
          required
          value={form.budgetAvailable}
          onChange={(e) => setForm({ ...form, budgetAvailable: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-text-primary mb-1">Location</label>
        <Input
          id="location"
          value={form.location ?? ""}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="e.g. Delhi, India"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="housing" className="block text-sm font-medium text-text-primary mb-1">Housing type</label>
          <select
            id="housing"
            className="w-full min-h-touch h-11 rounded-card border border-border bg-surface px-3 text-sm"
            value={form.housingType}
            onChange={(e) => setForm({ ...form, housingType: e.target.value as UserConstraints["housingType"] })}
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="shared">Shared accommodation</option>
          </select>
        </div>
        <div>
          <label htmlFor="ownership" className="block text-sm font-medium text-text-primary mb-1">Ownership</label>
          <select
            id="ownership"
            className="w-full min-h-touch h-11 rounded-card border border-border bg-surface px-3 text-sm"
            value={form.ownership}
            onChange={(e) => setForm({ ...form, ownership: e.target.value as UserConstraints["ownership"] })}
          >
            <option value="rent">Rent</option>
            <option value="own">Own</option>
          </select>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-text-primary mb-2">Available transport</span>
        <div className="flex flex-wrap gap-2">
          {TRANSPORT_OPTIONS.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => toggleTransport(mode)}
              className={`text-xs px-3 py-2 rounded-card border min-h-touch capitalize ${
                (form.transportModes ?? []).includes(mode)
                  ? "bg-surface-green border-green-100 text-forest-700"
                  : "bg-surface border-border text-text-secondary"
              }`}
              aria-pressed={(form.transportModes ?? []).includes(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="diet" className="block text-sm font-medium text-text-primary mb-1">Diet restrictions</label>
        <Input
          id="diet"
          value={form.dietRestrictions ?? ""}
          onChange={(e) => setForm({ ...form, dietRestrictions: e.target.value })}
          placeholder="e.g. vegetarian, no beef"
        />
      </div>

      <div>
        <label htmlFor="accessibility" className="block text-sm font-medium text-text-primary mb-1">
          Accessibility / mobility constraints
        </label>
        <Input
          id="accessibility"
          value={form.accessibilityNeeds ?? ""}
          onChange={(e) => setForm({ ...form, accessibilityNeeds: e.target.value })}
          placeholder="e.g. limited walking distance"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasCar"
          className="h-4 w-4 rounded border-border text-forest-700"
          checked={form.hasCar}
          onChange={(e) => setForm({ ...form, hasCar: e.target.checked })}
        />
        <label htmlFor="hasCar" className="text-sm font-medium text-text-primary">I own a car</label>
      </div>

      <Button type="submit" className="h-11">Save constraints</Button>
    </form>
  );
}

interface AccountActionsProps {
  isAuthenticated: boolean;
  signingOut: boolean;
  onSignOut: () => void;
}

export function AccountActions({ isAuthenticated, signingOut, onSignOut }: AccountActionsProps) {
  if (!isAuthenticated) {
    return (
      <p className="text-sm text-text-secondary">
        Sign in to save your data to your profile.
      </p>
    );
  }

  return (
    <Button
      onClick={onSignOut}
      disabled={signingOut}
      className="bg-surface text-text-primary border border-border hover:bg-canvas-subtle shadow-none h-11 w-full sm:w-auto"
    >
      <LogOut size={16} className="mr-2" aria-hidden="true" />
      {signingOut ? "Signing out…" : "Sign out"}
    </Button>
  );
}

interface DataControlsProps {
  onExport: () => void;
  onDeleteRequest: () => void;
}

export function DataControls({ onExport, onDeleteRequest }: DataControlsProps) {
  return (
    <div className="space-y-3">
      <Button onClick={onExport} className="bg-surface text-text-primary border border-border hover:bg-canvas-subtle shadow-none h-11 w-full sm:w-auto">
        <Download size={16} className="mr-2" aria-hidden="true" />
        Export data
      </Button>

      <Button
        onClick={onDeleteRequest}
        className="bg-surface text-danger border border-danger/20 hover:bg-canvas-subtle shadow-none h-11 w-full sm:w-auto ml-0 sm:ml-2"
      >
        <Trash2 size={16} className="mr-2" aria-hidden="true" />
        Delete all data
      </Button>
    </div>
  );
}
