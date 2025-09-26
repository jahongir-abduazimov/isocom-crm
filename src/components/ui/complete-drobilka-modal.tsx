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
import { type DrobilkaProcess } from "@/services/recycling.service";
import { Package, CheckCircle } from "lucide-react";

interface CompleteDrobilkaModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    drobilkaProcess: DrobilkaProcess | null;
}

export default function CompleteDrobilkaModal({
    open,
    onClose,
    onSuccess,
    drobilkaProcess,
}: CompleteDrobilkaModalProps) {
    const { completeDrobilka, loading, error } = useRecyclingStore();

    const [outputQuantity, setOutputQuantity] = useState("");
    const [notes, setNotes] = useState("");

    const handleCompleteDrobilka = async () => {
        if (!drobilkaProcess || !outputQuantity) {
            return;
        }

        try {
            const success = await completeDrobilka(drobilkaProcess.id, {
                output_quantity: outputQuantity,
                completed_at: new Date().toISOString(),
                notes,
            });

            if (success) {
                onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error("Error completing drobilka:", error);
        }
    };

    const handleClose = () => {
        setOutputQuantity("");
        setNotes("");
        onClose();
    };

    if (!drobilkaProcess) {
        return null;
    }

    const inputQuantity = parseFloat(drobilkaProcess.input_quantity);
    const isValidOutput = parseFloat(outputQuantity) <= inputQuantity && parseFloat(outputQuantity) > 0;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Drobilka Jarayonini Yakunlash
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Process Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Jarayon Ma'lumotlari
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Drobilka Turi</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {drobilkaProcess.drobilka_type_display}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Stanok</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {drobilkaProcess.work_center_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Kirish Miqdori</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {drobilkaProcess.input_quantity} KG
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Mas'ul Operator</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {drobilkaProcess.lead_operator_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Operators List */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            Ishchi Operatorlar
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {drobilkaProcess.operators_details.map((operator) => (
                                <div key={operator.id} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-800">
                                        {operator.name}
                                        {operator.id === drobilkaProcess.lead_operator && " (Mas'ul)"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Output Quantity */}
                    <div>
                        <Label htmlFor="outputQuantity">Chiqish Miqdori (KG)</Label>
                        <div className="relative">
                            <Input
                                id="outputQuantity"
                                type="number"
                                step="0.01"
                                min="0"
                                max={inputQuantity}
                                value={outputQuantity}
                                onChange={(e) => setOutputQuantity(e.target.value)}
                                placeholder="0.00"
                                className="pr-12"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Package className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        {!isValidOutput && outputQuantity && (
                            <p className="text-sm text-red-600 mt-1">
                                Miqdor 0 dan katta va {inputQuantity} dan kichik bo'lishi kerak
                            </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                            Maksimal miqdor: {inputQuantity} KG
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Izohlar</Label>
                        <Textarea
                            id="notes"
                            placeholder="Drobilka jarayoni haqida qo'shimcha ma'lumotlar..."
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
                            onClick={handleCompleteDrobilka}
                            disabled={loading || !isValidOutput}
                            className="min-w-[120px]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Yakunlanmoqda...
                                </div>
                            ) : (
                                "Yakunlash"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}