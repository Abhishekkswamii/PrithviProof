
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/data/store";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserConstraints } from "@/domain/models";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LiveStatus } from "@/components/LiveStatus";
import { Settings, Download, Trash2, LogOut } from "lucide-react";

const TRANSPORT_OPTIONS = ["metro", "bus", "scooter", "car", "walking", "cycling"];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();
  const { isInitialized, constraints, updateConstraints, exportUserData, deleteAllData } = useStore();
  const [form, setForm] = useState<UserConstraints | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (isInitialized && !form) setForm(constraints);
  }, [isInitialized, constraints, form]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/");
    } catch {
      setStatusMessage("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  if (!isInitialized || !form) {
    return (
      <div className="max-w-content mx-auto p-6">
        <div className="animate-pulse h-6 w-48 bg-canvas-subtle rounded" aria-hidden="true" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConstraints(form);
    setStatusMessage("Profile constraints saved. Recommendations will update.");
  };

  const toggleTransport = (mode: string) => {
    const current = form.transportModes ?? [];
    const next = current.includes(mode) ? current.filter((m) => m !== mode) : [...current, mode];
    setForm({ ...form, transportModes: next });
  };

  const handleExport = () => {
    const data = exportUserData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prithviproof-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Data exported successfully.");
  };

  return (
    <div className="max-w-content mx-auto p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Settings"
        description="Profile constraints shape which recommendations are feasible for you."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings size={18} aria-hidden="true" />
            Profile constraints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <Button
              onClick={handleSignOut}
              disabled={signingOut}
              className="bg-surface text-text-primary border border-border hover:bg-canvas-subtle shadow-none h-11 w-full sm:w-auto"
            >
              <LogOut size={16} className="mr-2" aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          ) : (
            <p className="text-sm text-text-secondary">
              Sign in to save your data to your profile.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExport} className="bg-surface text-text-primary border border-border hover:bg-canvas-subtle shadow-none h-11 w-full sm:w-auto">
            <Download size={16} className="mr-2" aria-hidden="true" />
            Export data
          </Button>

          <Button
            onClick={() => setConfirmDelete(true)}
            className="bg-surface text-danger border border-danger/20 hover:bg-canvas-subtle shadow-none h-11 w-full sm:w-auto ml-0 sm:ml-2"
          >
            <Trash2 size={16} className="mr-2" aria-hidden="true" />
            Delete all data
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete all data?"
        description="This removes all activities, ledger entries and resets constraints. Stored locally in your browser."
        confirmLabel="Delete all"
        variant="danger"
        onConfirm={() => { deleteAllData(); setConfirmDelete(false); setStatusMessage("All data deleted."); }}
        onCancel={() => setConfirmDelete(false)}
      />


      <LiveStatus message={statusMessage} onClear={() => setStatusMessage(null)} />
    </div>
  );
}
