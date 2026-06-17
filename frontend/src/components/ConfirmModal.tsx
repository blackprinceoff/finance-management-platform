import React from "react";
import Button from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
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
            className="flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 hover:shadow-md active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
