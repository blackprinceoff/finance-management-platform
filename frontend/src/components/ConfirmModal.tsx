import React, { useEffect } from "react";
import Button from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmClassName?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  confirmClassName = "bg-red-600 hover:bg-red-700",
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 shadow-2xl transition-all duration-300">
        <h3 className="text-lg font-semibold text-apple-900">{title}</h3>
        <p className="mt-2 text-sm text-apple-500">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <button
            onClick={onConfirm}
            className={`flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:shadow-md active:scale-95 ${confirmClassName}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
