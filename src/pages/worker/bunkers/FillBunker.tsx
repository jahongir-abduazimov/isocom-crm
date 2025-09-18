import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Package, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { bunkerService, type FillBunkerRequest } from "@/services/bunker.service";

export interface Material {
    id: string;
    name: string;
    unit_of_measure: string;
}

export interface Operator {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface FillBunkerFormData {
    material_id: string;
    weighed_quantity_kg: string;
    operator_id: string;
}

const FillBunker: React.FC = () => {
    const { bunkerId } = useParams<{ bunkerId: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FillBunkerFormData>({
        material_id: "",
        weighed_quantity_kg: "",
        operator_id: "",
    });

    const [materials, setMaterials] = useState<Material[]>([]);
    const [operators, setOperators] = useState<Operator[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchMaterials();
        fetchOperators();
    }, []);

    const fetchMaterials = async () => {
        try {
            const data = await bunkerService.fetchMaterials();
            setMaterials(data);
        } catch (error) {
            console.error("Error fetching materials:", error);
            setError("Materiallar ro'yxatini olishda xatolik yuz berdi");
        }
    };

    const fetchOperators = async () => {
        try {
            const data = await bunkerService.fetchOperators();
            setOperators(data);
        } catch (error) {
            console.error("Error fetching operators:", error);
            setError("Operatorlar ro'yxatini olishda xatolik yuz berdi");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.material_id || !formData.weighed_quantity_kg || !formData.operator_id) {
            setError("Barcha maydonlarni to'ldiring");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const request: FillBunkerRequest = {
                material_id: formData.material_id,
                weighed_quantity_kg: parseFloat(formData.weighed_quantity_kg),
                operator_id: formData.operator_id,
            };

            await bunkerService.fillBunker(bunkerId!, request);
            setSuccess(true);

            // Reset form
            setFormData({
                material_id: "",
                weighed_quantity_kg: "",
                operator_id: "",
            });

            // Show success message for 3 seconds then redirect
            setTimeout(() => {
                navigate("/worker/bunkers");
            }, 3000);

        } catch (error) {
            console.error("Error filling bunker:", error);
            setError(error instanceof Error ? error.message : "Bakni to'ldirishda xatolik yuz berdi");
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FillBunkerFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError(null);
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto mt-12">
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Muvaffaqiyatli!</h2>
                    <p className="text-gray-600 mb-4">Bak muvaffaqiyatli to'ldirildi</p>
                    <p className="text-sm text-gray-500">3 soniyadan so'ng baklar ro'yxatiga qaytamiz...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Bak To'ldirish</h1>
                        <p className="text-gray-600">Ekstruder bakini material bilan to'ldiring</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Material Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="material_id" className="text-sm font-medium text-gray-700">
                            Material *
                        </Label>
                        <Select
                            value={formData.material_id}
                            onValueChange={(value) => handleInputChange('material_id', value)}
                            required
                        >
                            <option value="">Material tanlang</option>
                            {materials.map((material) => (
                                <option key={material.id} value={material.id}>
                                    {material.name} ({material.unit_of_measure})
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Weighed Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="weighed_quantity_kg" className="text-sm font-medium text-gray-700">
                            Tarozida o'lchangan miqdor (kg) *
                        </Label>
                        <Input
                            id="weighed_quantity_kg"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.weighed_quantity_kg}
                            onChange={(e) => handleInputChange('weighed_quantity_kg', e.target.value)}
                            placeholder="Masalan: 25.5"
                            required
                        />
                    </div>

                    {/* Operator Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="operator_id" className="text-sm font-medium text-gray-700">
                            Operator *
                        </Label>
                        <Select
                            value={formData.operator_id}
                            onValueChange={(value) => handleInputChange('operator_id', value)}
                            required
                        >
                            <option value="">Operator tanlang</option>
                            {operators.map((operator) => (
                                <option key={operator.id} value={operator.id}>
                                    {operator.first_name} {operator.last_name} ({operator.username}) - {operator.role}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span className="text-red-700">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/worker/bunkers")}
                            className="flex-1"
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    To'ldirilmoqda...
                                </>
                            ) : (
                                "Bakni To'ldirish"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FillBunker;
