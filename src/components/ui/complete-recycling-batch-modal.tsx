import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRecyclingStore } from "@/store/recycling.store";
import { type RecyclingBatch } from "@/services/recycling.service";
import { Package, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

interface CompleteRecyclingBatchModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (finalVtQuantity: number, notes?: string) => void;
  recyclingBatch: RecyclingBatch | null;
}

export default function CompleteRecyclingBatchModal({
  open,
  onClose,
  onSuccess,
  recyclingBatch,
}: CompleteRecyclingBatchModalProps) {
  const { loading, error } = useRecyclingStore();

  const [finalVtQuantity, setFinalVtQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!finalVtQuantity || parseFloat(finalVtQuantity) <= 0) {
      errors.finalVtQuantity = "Final VT miqdori 0 dan katta bo'lishi kerak";
    }

    if (
      recyclingBatch &&
      parseFloat(finalVtQuantity) >
      Number(recyclingBatch.total_hard_scrap || 0) + Number(recyclingBatch.total_soft_scrap || 0)
    ) {
      errors.finalVtQuantity =
        "Final VT miqdori jami input miqdoridan katta bo'lmasligi kerak";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteBatch = async () => {
    if (!recyclingBatch) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      onSuccess(parseFloat(finalVtQuantity), notes.trim() || undefined);
      handleClose();
    } catch (error) {
      console.error("Error completing recycling batch:", error);
    }
  };

  const handleClose = () => {
    setFinalVtQuantity("");
    setNotes("");
    setFormErrors({});
    onClose();
  };

  if (!recyclingBatch) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Qayta Ishlash Partiyasini Yakunlash
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Batch Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Partiya Ma'lumotlari
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Partiya Raqami
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {recyclingBatch.batch_number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Boshlangan Vaqt
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(recyclingBatch.started_at).toLocaleString("uz-UZ")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Boshlagan Operator
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {recyclingBatch.started_by?.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Holat</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {recyclingBatch.status === "IN_PROGRESS"
                    ? "Jarayonda"
                    : "Yakunlangan"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Qattiq Brak</p>
                <p className="text-lg font-semibold text-red-600">
                  {recyclingBatch.total_hard_scrap} KG
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Yumshoq Brak
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  {recyclingBatch.total_soft_scrap} KG
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Jami Input Miqdor
                </p>
              </div>
              <p className="text-xl font-bold text-green-900 mt-1">
                {(
                  Number(recyclingBatch.total_hard_scrap || 0) +
                  Number(recyclingBatch.total_soft_scrap || 0)
                ).toFixed(2)}{" "}
                KG
              </p>
            </div>
          </div>
        </div>

        {/* Process Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Qayta Ishlash Jarayoni Yakunlandi
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Qattiq braklar hard drobilkada maydalandi</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Maydalangan qattiq braklar yumshoq brakka qo'shildi</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Barcha yumshoq braklar soft drobilkada qayta ishlandi</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>VT granulasi ko'rinishida tayyor mahsulot olinadi</span>
            </div>
          </div>
        </div>

        {/* Final VT Quantity Input */}
        <div>
          <Label htmlFor="finalVtQuantity">Final VT Miqdori (KG)</Label>
          <div className="relative">
            <Input
              id="finalVtQuantity"
              type="number"
              step="0.01"
              min="0"
              max={
                Number(recyclingBatch.total_hard_scrap || 0) +
                Number(recyclingBatch.total_soft_scrap || 0)
              }
              value={finalVtQuantity}
              onChange={(e) => setFinalVtQuantity(e.target.value)}
              placeholder="0.00"
              className={`pr-12 ${formErrors.finalVtQuantity ? "border-red-500" : ""
                }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Package className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          {formErrors.finalVtQuantity && (
            <p className="text-sm text-red-600 mt-1">
              {formErrors.finalVtQuantity}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-1">
            Maksimal miqdor:{" "}
            {(
              Number(recyclingBatch.total_hard_scrap || 0) +
              Number(recyclingBatch.total_soft_scrap || 0)
            ).toFixed(2)}{" "}
            KG
          </p>
          {finalVtQuantity && !formErrors.finalVtQuantity && (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Samaradorlik:</strong>{" "}
                {(
                  (parseFloat(finalVtQuantity) /
                    (Number(recyclingBatch.total_hard_scrap || 0) +
                      Number(recyclingBatch.total_soft_scrap || 0))) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-sm text-green-700">
                Yo'qotish:{" "}
                {(
                  Number(recyclingBatch.total_hard_scrap || 0) +
                  Number(recyclingBatch.total_soft_scrap || 0) -
                  parseFloat(finalVtQuantity)
                ).toFixed(2)}{" "}
                KG
              </p>
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Muhim eslatma
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Partiyani yakunlagach, barcha braklar qayta ishlangan deb
                hisoblanadi va ular VT granulasi sifatida omborga qo'shiladi.
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Yakunlovchi Izohlar</Label>
          <Textarea
            id="notes"
            placeholder="Qayta ishlash jarayoni haqida yakunlovchi ma'lumotlar..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleCompleteBatch}
            disabled={
              loading || !finalVtQuantity || Object.keys(formErrors).length > 0
            }
            className="min-w-[140px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Yakunlanmoqda...
              </div>
            ) : (
              "Partiyani Yakunlash"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
