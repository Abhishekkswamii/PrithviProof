
import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-forest-950/40 bg-surface rounded-card border border-border p-0 max-w-md w-[calc(100%-2rem)] shadow-card open:animate-in"
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          {variant === "danger" && (
            <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div>
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-text-primary">
              {title}
            </h2>
            <p id="confirm-dialog-desc" className="text-sm text-text-secondary mt-1">
              {description}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="bg-surface text-text-primary border border-border hover:bg-canvas-subtle shadow-none h-11"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={variant === "danger" ? "bg-danger hover:bg-danger/90 h-11" : "bg-forest-700 hover:bg-forest-900 h-11"}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
