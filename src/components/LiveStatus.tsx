
import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStatusProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClear?: () => void;
  duration?: number;
}

export function LiveStatus({ message, type = "success", onClear, duration = 4000 }: LiveStatusProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onClear?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClear]);

  if (!message || !visible) return null;

  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-20 lg:bottom-6 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-card border shadow-card text-sm font-medium max-w-sm",
        type === "success" && "bg-surface-green border-green-100 text-forest-900",
        type === "error" && "bg-surface border-danger/20 text-danger",
        type === "info" && "bg-surface border-border text-text-primary"
      )}
    >
      <Icon size={18} aria-hidden="true" />
      {message}
    </div>
  );
}
