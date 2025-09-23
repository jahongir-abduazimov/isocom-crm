import { useState } from "react";
import { Package, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRecyclingStore } from "@/store/recycling.store";
import { type DrobilkaProcess } from "@/services/recycling.service";
import { toast } from "sonner";

interface CompleteDrobilkaModalProps {
    open: boolean;
    onClose: () => void;
    process: DrobilkaProcess | null;
    onSuccess: () => void;
}

export default function CompleteDrobilkaModal({
    open,
    onClose,
    process,
    onSuccess,
}: CompleteDrobilkaModalProps) {
    const { completeDrobilka, loading } = useRecyclingStore();

    const [outputQuantity, setOutputQuantity] = useState("");
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!process) {
            toast.error("Drobilka jarayoni mavjud emas");
            return;
        }

        if (!outputQuantity || parseFloat(outputQuantity) <= 0) {
            toast.error("Noto'g'ri chiqim miqdori kiritildi");
            return;
        }

        const success = await completeDrobilka(process.id, {
            output_quantity: outputQuantity,
            completed_at: new Date().toISOString(),
            notes: notes || undefined,
        });

        if (success) {
            toast.success("Drobilka jarayoni muvaffaqiyatli yakunlandi");
            onSuccess();
            handleClose();
        } else {
            toast.error("Drobilka jarayonini yakunlashda xatolik yuz berdi");
        }
    };

    const handleClose = () => {
        setOutputQuantity("");
        setNotes("");
        onClose();
    };

    const calculateEfficiency = () => {
        if (!process || !outputQuantity) return null;
        const input = parseFloat(process.input_quantity);
        const output = parseFloat(outputQuantity);
        return ((output / input) * 100).toFixed(1);
    };

    if (!process) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Drobilka Jarayonini Yakunlash
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Process Info */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-800">{process.work_center_name}</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <p className="text-sm text-blue-600">
                                    <span className="font-medium">Turi:</span> {process.drobilka_type_display}
                                </p>
                                <p className="text-sm text-blue-600">
                                    <span className="font-medium">Kirim:</span> {process.input_quantity} KG
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-blue-600">
                                    <span className="font-medium">Mas'ul:</span> {process.lead_operator_name}
                                </p>
                                <p className="text-sm text-blue-600">
                                    <span className="font-medium">Operatorlar:</span> {process.operators.length} ta
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Output Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="output-quantity">Chiqim Miqdori (KG)</Label>
                        <Input
                            id="output-quantity"
                            type="number"
                            step="0.01"
                            min="0"
                            max={process.input_quantity}
                            value={outputQuantity}
                            onChange={(e) => setOutputQuantity(e.target.value)}
                            placeholder="Chiqim miqdorini kiriting"
                            required
                        />
                        <p className="text-sm text-gray-600">
                            Maksimal: {process.input_quantity} KG
                        </p>
                    </div>

                    {/* Efficiency Display */}
                    {outputQuantity && calculateEfficiency() && (
                        <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-800">
                                    Samaradorlik: {calculateEfficiency()}%
                                </span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                                {process.input_quantity} KG dan {outputQuantity} KG chiqdi
                            </p>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Izohlar</Label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Jarayon haqida qo'shimcha izohlar..."
                            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Bekor qilish
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Yakunlanmoqda..." : "Yakunlash"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
