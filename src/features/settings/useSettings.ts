import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/data/store";
import { useAuth } from "@/providers/AuthProvider";
import { UserConstraints } from "@/domain/models";

export function useSettings() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form) {
      updateConstraints(form);
      setStatusMessage("Profile constraints saved. Recommendations will update.");
    }
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

  const handleConfirmDelete = () => {
    deleteAllData();
    setConfirmDelete(false);
    setStatusMessage("All data deleted.");
  };

  return {
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
  };
}
