import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LiveStatus } from "@/components/LiveStatus";
import { Settings } from "lucide-react";

import { useSettings } from "@/features/settings/useSettings";
import { ProfileForm, AccountActions, DataControls } from "@/features/settings/SettingsForms";

export default function SettingsPage() {
  const {
    isInitialized,
    form,
    setForm,
    statusMessage,
    setStatusMessage,
    confirmDelete,
    setConfirmDelete,
    signingOut,
    isAuthenticated,
    handleSignOut,
    handleSubmit,
    handleExport,
    handleConfirmDelete,
  } = useSettings();

  if (!isInitialized || !form) {
    return (
      <div className="max-w-content mx-auto p-6">
        <div className="animate-pulse h-6 w-48 bg-canvas-subtle rounded" aria-hidden="true" />
      </div>
    );
  }

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
          <ProfileForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountActions
            isAuthenticated={isAuthenticated}
            signingOut={signingOut}
            onSignOut={handleSignOut}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data controls</CardTitle>
        </CardHeader>
        <CardContent>
          <DataControls
            onExport={handleExport}
            onDeleteRequest={() => setConfirmDelete(true)}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete all data?"
        description="This removes all activities, ledger entries and resets constraints. Stored locally in your browser."
        confirmLabel="Delete all"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <LiveStatus message={statusMessage} onClear={() => setStatusMessage(null)} />
    </div>
  );
}
