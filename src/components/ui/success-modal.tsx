import { CheckCircle, X } from "lucide-react";
import { Button } from "./button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = "Muvaffaqiyat!",
  message = "Amal muvaffaqiyatli bajarildi",
  onConfirm,
  confirmText = "OK",
}: SuccessModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[400px] max-w-[500px] mx-4 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
          aria-label="Yopish"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          Amal muvaffaqiyatli bajarildi
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
