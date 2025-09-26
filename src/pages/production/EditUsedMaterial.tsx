import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProductionService } from "@/services/production.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import { useTranslation } from "@/hooks/useTranslation";

interface Order {
    id: string;
    produced_product_name?: string;
    status: string;
    produced_quantity: string;
    unit_of_measure: string;
}

interface Material {
    id: string;
    name: string;
    code: string;
}

interface StepExecution {
    id: string;
    production_step_name: string;
    order: string;
}

export default function EditUsedMaterialPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [stepExecutions, setStepExecutions] = useState<StepExecution[]>([]);
    const [currentMaterial, setCurrentMaterial] = useState<any>(null);

    const [formData, setFormData] = useState({
        order: "",
        material: "",
        quantity: "",
        step_execution: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const fetchInitialData = async () => {
        try {
            setLoadingData(true);
            const [ordersResponse, materialsResponse, stepExecutionsResponse, usedMaterialsResponse] = await Promise.all([
                ProductionService.getOrders(),
                ProductionService.getMaterials(),
                ProductionService.getAllStepExecutions(),
                ProductionService.getAllUsedMaterials(),
            ]);

            setOrders(ordersResponse.results);
            setMaterials(materialsResponse.results || []);
            setStepExecutions(stepExecutionsResponse.results);

            // Find the current used material
            const currentUsedMaterial = usedMaterialsResponse.results.find((item: any) => item.id === id);
            if (currentUsedMaterial) {
                setCurrentMaterial(currentUsedMaterial);
                setFormData({
                    order: currentUsedMaterial.order,
                    material: currentUsedMaterial.material,
                    quantity: currentUsedMaterial.quantity,
                    step_execution: currentUsedMaterial.step_execution,
                });
            } else {
                setError("Used material not found");
            }
        } catch (err) {
            console.error("Error fetching initial data:", err);
            setError("Failed to load form data");
        } finally {
            setLoadingData(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.order) {
            newErrors.order = t("production.addUsedMaterial.orderRequired");
        }

        if (!formData.material) {
            newErrors.material = t("production.addUsedMaterial.materialRequired");
        }

        if (!formData.quantity) {
            newErrors.quantity = t("production.addUsedMaterial.quantityRequired");
        } else if (isNaN(Number(formData.quantity))) {
            newErrors.quantity = t("production.addUsedMaterial.quantityValid");
        }

        if (!formData.step_execution) {
            newErrors.step_execution = t("production.addUsedMaterial.stepExecutionRequired");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !id) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const submitData = {
                order: formData.order,
                material: formData.material,
                quantity: formData.quantity,
                step_execution: formData.step_execution,
            };

            await ProductionService.updateUsedMaterial(id, submitData);

            notifySuccess(t("production.editUsedMaterial.recordUpdated"));
            navigate("/production/used-materials");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t("production.editUsedMaterial.updateError");
            setError(errorMessage);
            notifyError(errorMessage);
            console.error("Error updating used material:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/production/used-materials");
    };

    // Filter step executions based on selected order
    const filteredStepExecutions = stepExecutions.filter(step =>
        !formData.order || step.order === formData.order
    );

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 text-lg mt-4">{t("production.editUsedMaterial.loadingData")}</p>
                </div>
            </div>
        );
    }

    if (error && !currentMaterial) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{t("production.editUsedMaterial.materialNotFound")}: {error}</p>
                    <Button onClick={handleCancel} variant="outline">
                        {t("production.editUsedMaterial.backToMaterials")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center gap-2 w-fit"
                >
                    <ArrowLeft size={16} />
                    Back
                </Button>
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        {t("production.editUsedMaterial.title")}
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm lg:text-base">
                        {t("production.editUsedMaterial.subtitle")}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Current Material Info */}
                    {currentMaterial && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <p className="text-blue-800 text-sm">
                                <strong>{t("production.editUsedMaterial.editing")}:</strong> {currentMaterial.material_name} - {t("production.addUsedMaterial.quantity")}: {currentMaterial.quantity}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Order Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="order" className="text-sm font-medium">
                                {t("production.addUsedMaterial.order")} *
                            </Label>
                            <Select
                                value={formData.order}
                                onValueChange={(value) => handleInputChange("order", value)}
                            >
                                <SelectTrigger className={errors.order ? "border-red-500" : ""}>
                                    <SelectValue placeholder={t("production.addUsedMaterial.selectOrder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {orders.map((order) => (
                                        <SelectItem key={order.id} value={order.id}>
                                            {order.produced_product_name || t("production.addUsedMaterial.unknownProduct")} -{" "}
                                            {order.produced_quantity} {order.unit_of_measure} (
                                            {order.status})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.order && (
                                <p className="text-red-500 text-xs">{errors.order}</p>
                            )}
                        </div>

                        {/* Material Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="material" className="text-sm font-medium">
                                {t("production.addUsedMaterial.material")} *
                            </Label>
                            <Select
                                value={formData.material}
                                onValueChange={(value) => handleInputChange("material", value)}
                            >
                                <SelectTrigger className={errors.material ? "border-red-500" : ""}>
                                    <SelectValue placeholder={t("production.addUsedMaterial.selectMaterial")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {materials.map((material) => (
                                        <SelectItem key={material.id} value={material.id}>
                                            {material.code} - {material.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.material && (
                                <p className="text-red-500 text-xs">{errors.material}</p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-sm font-medium">
                                {t("production.addUsedMaterial.quantity")} *
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange("quantity", e.target.value)}
                                placeholder={t("production.addUsedMaterial.enterQuantity")}
                                className={errors.quantity ? "border-red-500" : ""}
                            />
                            {errors.quantity && (
                                <p className="text-red-500 text-xs">{errors.quantity}</p>
                            )}
                        </div>

                        {/* Step Execution */}
                        <div className="space-y-2">
                            <Label htmlFor="step_execution" className="text-sm font-medium">
                                {t("production.addUsedMaterial.stepExecution")} *
                            </Label>
                            <Select
                                value={formData.step_execution}
                                onValueChange={(value) => handleInputChange("step_execution", value)}
                                disabled={!formData.order}
                            >
                                <SelectTrigger className={errors.step_execution ? "border-red-500" : ""}>
                                    <SelectValue placeholder={formData.order ? t("production.addUsedMaterial.selectStepExecution") : t("production.addUsedMaterial.selectOrderFirst")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredStepExecutions.map((step) => (
                                        <SelectItem key={step.id} value={step.id}>
                                            {step.production_step_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.step_execution && (
                                <p className="text-red-500 text-xs">{errors.step_execution}</p>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 w-full sm:w-auto"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {loading ? t("production.editUsedMaterial.updating") : t("production.editUsedMaterial.updateRecord")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            {t("common.cancel")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
