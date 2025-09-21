import type { ReactNode } from "react";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export default function ConfirmModal({
  open,
  title = "Tasdiqlash",
  description = "Ushbu amalni bajarishni xohlaysizmi?",
  confirmText = "O'chirish",
  cancelText = "Bekor qilish",
  onConfirm,
  onCancel,
  children,
}: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-[60vw]">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-4 text-gray-700">{description}</p>
        {children}
        <div className="flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
