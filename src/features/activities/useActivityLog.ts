import { useState } from "react";
import { useStore } from "@/data/store";
import { Activity } from "@/domain/models";
import { mapTypeToFactorId } from "@/lib/natural-language";
import { getAiRepository } from "@/lib/ai/createAiRepository";
import { ParsedActivity } from "@/lib/ai/types";

export function useActivityLog() {
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

  const handleNaturalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;

    setParsing(true);
    setStatusMessage(null);
    setPreviewActivity(null);
    try {
      const repo = await getAiRepository();
      const response = await repo.parseActivity(naturalInput);
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
      if (import.meta.env.DEV) console.error(error);
      setStatusMessage("AI parsing failed. Please use manual entry.");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewActivity) return;

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

  const confirmDelete = () => {
    if (deleteId) removeActivity(deleteId);
    setDeleteId(null);
    setStatusMessage("Activity deleted.");
  };

  const recentActivities = [...activities].reverse();

  return {
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
  };
}
