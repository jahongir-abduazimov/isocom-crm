import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRecyclingStore } from "@/store/recycling.store";
import { type RecyclingBatch } from "@/services/recycling.service";
import { Package, CheckCircle, AlertCircle } from "lucide-react";

interface CompleteRecyclingBatchModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    batch: RecyclingBatch | null;
}

export default function CompleteRecyclingBatchModal({
    open,
    onClose,
    onSuccess,
    batch,
}: CompleteRecyclingBatchModalProps) {
    const { completeRecyclingBatch, loading, error } = useRecyclingStore();

    const [notes, setNotes] = useState("");

    const handleCompleteBatch = async () => {
        if (!batch) {
            return;
        }

        try {
            const success = await completeRecyclingBatch(batch.id);
            if (success) {
                onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error("Error completing recycling batch:", error);
        }
    };

    const handleClose = () => {
        setNotes("");
        onClose();
    };

    if (!batch) {
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
                                <p className="text-sm font-medium text-gray-600">Partiya Raqami</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {batch.batch_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Boshlangan Vaqt</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(batch.started_at).toLocaleString("uz-UZ")}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Boshlagan Operator</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {batch.started_by.full_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Holat</p>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    {batch.status === "IN_PROCESS" ? "Jarayonda" : "Yakunlangan"}
                                </span>
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

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">
                                    Muhim eslatma
                                </p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Partiyani yakunlagach, barcha braklar qayta ishlangan deb hisoblanadi
                                    va ular VT granulasi sifatida omborga qo'shiladi.
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
                            disabled={loading}
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
