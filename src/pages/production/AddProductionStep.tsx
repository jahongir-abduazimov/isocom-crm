import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProductionService } from "@/services/production.service";
import { useTranslation } from "@/hooks/useTranslation";

const STEP_TYPES = [
    { value: "EXTRUSION", label: "Ekstruziya" },
    { value: "DEGASSING", label: "Gaz chiqarish" },
    { value: "LAMINATION", label: "Laminatsiya" },
    { value: "BRONZING", label: "Bronzalash" },
    { value: "DUPLICATION", label: "Duplikatsiya" },
    { value: "PACKAGING", label: "Qadoqlash" },
    { value: "QUALITY_CONTROL", label: "Sifat nazorati" },
    { value: "WAREHOUSE_TRANSFER", label: "Ombor ko'chirish" },
    { value: "CUSTOMER_DELIVERY", label: "Mijozga yetkazish" },
];

export default function AddProductionStepPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        step_type: "",
        description: "",
        duration_hours: "",
        is_required: true,
        order_sequence: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t("production.addStep.stepNameRequired");
        }

        if (!formData.step_type) {
            newErrors.step_type = t("production.addStep.stepTypeRequired");
        }

        if (!formData.order_sequence) {
            newErrors.order_sequence = t("production.addStep.orderSequenceRequired");
        } else if (isNaN(Number(formData.order_sequence)) || Number(formData.order_sequence) < 1) {
            newErrors.order_sequence = t("production.addStep.orderSequencePositive");
        }

        if (formData.duration_hours && (isNaN(Number(formData.duration_hours)) || Number(formData.duration_hours) < 0)) {
            newErrors.duration_hours = t("production.addStep.durationPositive");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string | boolean) => {
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

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const submitData = {
                name: formData.name.trim(),
                step_type: formData.step_type as any,
                description: formData.description.trim() || null,
                duration_hours: formData.duration_hours ? formData.duration_hours : null,
                is_required: formData.is_required,
                order_sequence: Number(formData.order_sequence),
            };

            await ProductionService.createProductionStep(submitData);

            // Navigate back to production steps page
            navigate("/production/steps");
        } catch (err) {
            setError(err instanceof Error ? err.message : t("production.addStep.createError"));
            console.error("Error creating production step:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/production/steps");
    };

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
                        {t("production.addStep.title")}
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm lg:text-base">
                        {t("production.addStep.subtitle")}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Step Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                {t("production.addStep.stepName")} *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder={t("production.addStep.enterStepName")}
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            )}
                        </div>

                        {/* Step Type */}
                        <div className="space-y-2">
                            <Label htmlFor="step_type" className="text-sm font-medium">
                                {t("production.addStep.stepType")} *
                            </Label>
                            <Select
                                value={formData.step_type}
                                onValueChange={(value) => handleInputChange("step_type", value)}
                            >
                                <SelectTrigger className={errors.step_type ? "border-red-500" : ""}>
                                    <SelectValue placeholder={t("production.addStep.selectStepType")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {STEP_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.step_type && (
                                <p className="text-red-500 text-xs">{errors.step_type}</p>
                            )}
                        </div>

                        {/* Order Sequence */}
                        <div className="space-y-2">
                            <Label htmlFor="order_sequence" className="text-sm font-medium">
                                {t("production.addStep.orderSequence")} *
                            </Label>
                            <Input
                                id="order_sequence"
                                type="number"
                                min="1"
                                value={formData.order_sequence}
                                onChange={(e) => handleInputChange("order_sequence", e.target.value)}
                                placeholder={t("production.addStep.enterOrderSequence")}
                                className={errors.order_sequence ? "border-red-500" : ""}
                            />
                            {errors.order_sequence && (
                                <p className="text-red-500 text-xs">{errors.order_sequence}</p>
                            )}
                        </div>

                        {/* Duration Hours */}
                        <div className="space-y-2">
                            <Label htmlFor="duration_hours" className="text-sm font-medium">
                                {t("production.addStep.duration")}
                            </Label>
                            <Input
                                id="duration_hours"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.duration_hours}
                                onChange={(e) => handleInputChange("duration_hours", e.target.value)}
                                placeholder={t("production.addStep.enterDuration")}
                                className={errors.duration_hours ? "border-red-500" : ""}
                            />
                            {errors.duration_hours && (
                                <p className="text-red-500 text-xs">{errors.duration_hours}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            {t("production.addStep.description")}
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder={t("production.addStep.enterDescription")}
                            rows={3}
                        />
                    </div>

                    {/* Is Required */}
                    <div className="flex items-center space-x-3">
                        <Switch
                            id="is_required"
                            checked={formData.is_required}
                            onCheckedChange={(checked) => handleInputChange("is_required", checked)}
                        />
                        <Label htmlFor="is_required" className="text-sm font-medium">
                            {t("production.addStep.requiredStep")}
                        </Label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {loading ? t("production.addStep.creating") : t("production.addStep.createStep")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                            className="w-full sm:w-auto sm:min-w-[120px]"
                        >
                            {t("common.cancel")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
