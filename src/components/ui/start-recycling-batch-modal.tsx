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
import { useScrapStore } from "@/store/scrap.store";
import { Package, AlertCircle, CheckCircle } from "lucide-react";

interface StartRecyclingBatchModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function StartRecyclingBatchModal({
    open,
    onClose,
    onSuccess,
}: StartRecyclingBatchModalProps) {
    const { startRecyclingBatch, getCurrentTotals, loading, error } = useRecyclingStore();
    const { scraps } = useScrapStore();
    const [notes, setNotes] = useState("");

    // Get available scraps for recycling
    const availableScraps = scraps.filter(scrap => scrap.status === "PENDING");
    const hardScraps = availableScraps.filter(scrap => scrap.scrap_type === "HARD");
    const softScraps = availableScraps.filter(scrap => scrap.scrap_type === "SOFT");

    const totalHardQuantity = hardScraps.reduce((sum, scrap) => sum + parseFloat(scrap.quantity), 0);
    const totalSoftQuantity = softScraps.reduce((sum, scrap) => sum + parseFloat(scrap.quantity), 0);

    const handleStartBatch = async () => {
        try {
            const success = await startRecyclingBatch();
            if (success) {
                await getCurrentTotals();
                onSuccess();
                onClose();
                setNotes("");
            }
        } catch (error) {
            console.error("Error starting recycling batch:", error);
        }
    };

    const handleClose = () => {
        setNotes("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Qayta Ishlash Partiyasini Boshlash
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current Scrap Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Hozirgi Braklar Miqdori
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-full">
                                        <Package className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Qattiq Braklar</p>
                                        <p className="text-xl font-bold text-red-600">
                                            {totalHardQuantity.toFixed(2)} KG
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {hardScraps.length} ta brak
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-full">
                                        <Package className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Yumshoq Braklar</p>
                                        <p className="text-xl font-bold text-orange-600">
                                            {totalSoftQuantity.toFixed(2)} KG
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {softScraps.length} ta brak
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Process Information */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            Qayta Ishlash Jarayoni
                        </h3>
                        <div className="space-y-2 text-sm text-blue-800">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>1. Qattiq braklar hard drobilkada maydalanadi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>2. Maydalangan qattiq braklar yumshoq brakka qo'shiladi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>3. Barcha yumshoq braklar soft drobilkada qayta ishlanadi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>4. Natijada VT granulasi olinadi</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Izohlar</Label>
                        <Textarea
                            id="notes"
                            placeholder="Qayta ishlash jarayoni haqida qo'shimcha ma'lumotlar..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Warning */}
                    {availableScraps.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                <p className="text-sm text-yellow-800">
                                    Qayta ishlash uchun tayyor braklar mavjud emas.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={handleClose} disabled={loading}>
                            Bekor qilish
                        </Button>
                        <Button
                            onClick={handleStartBatch}
                            disabled={loading || availableScraps.length === 0}
                            className="min-w-[120px]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Boshlanmoqda...
                                </div>
                            ) : (
                                "Boshlash"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
