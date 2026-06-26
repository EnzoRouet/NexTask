"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isLoading = false,
  isDestructive = true,
}: Readonly<ConfirmModalProps>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-100">
      <div
        className="bg-surface border border-border-dim rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex gap-4 items-start">
            <div
              className={`p-2 rounded-full shrink-0 ${isDestructive ? "bg-red-500/10 text-red-500" : "bg-accent/10 text-accent"}`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-main tracking-tight">
                {title}
              </h3>
              <p className="text-sm text-text-muted mt-2">{description}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-background border-t border-border-dim flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-text-main bg-surface border border-border-dim rounded-md hover:bg-surface-hover hover:border-border-focus transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                : "bg-accent hover:opacity-90"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
