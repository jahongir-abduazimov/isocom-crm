import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Settings,
    Search,
    ArrowRight,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Play,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StepIndicator from "@/components/ui/step-indicator";
import { useWorkerStore } from "@/store/worker.store";

export default function ProductionStepSelectionByWorkcenterTypePage() {
    const navigate = useNavigate();
    const { workcenterType, orderId } = useParams<{
        workcenterType: string;
        orderId: string;
    }>();
    const [searchTerm, setSearchTerm] = useState("");

    const {
        productionStepsByWorkcenterType,
        stepsLoading,
        stepsError,
        fetchProductionStepsByWorkcenterType,
        setSelectedStep,
        setCurrentStep,
    } = useWorkerStore();

    useEffect(() => {
        if (workcenterType) {
            fetchProductionStepsByWorkcenterType(workcenterType);
            setCurrentStep(3); // Set current step to 3 (Production step selection)
        }
    }, [workcenterType, fetchProductionStepsByWorkcenterType, setCurrentStep]);

    const getWorkcenterTypeLabel = (type: string) => {
        switch (type?.toUpperCase()) {
            case "EXTRUDER":
                return "Extruder";
            case "DEGASSING_AREA":
                return "Degassing Area";
            case "LAMINATOR":
                return "Laminator";
            case "BRONIROVSHIK":
                return "Bronirovshik";
            case "DUPLICATOR":
                return "Duplicator";
            case "PACKAGING":
                return "Packaging";
            case "QUALITY_CONTROL":
                return "Quality Control";
            case "BRAK_MAYDALAGICH":
                return "Brak maydalagich";
            default:
                return type || "Workcenter";
        }
    };

    const getStepTypeIcon = (stepType: string) => {
        switch (stepType?.toUpperCase()) {
            case "EXTRUSION":
                return <Settings className="h-5 w-5" />;
            case "LAMINATION":
                return <Play className="h-5 w-5" />;
            case "BRONING":
                return <CheckCircle className="h-5 w-5" />;
            default:
                return <Settings className="h-5 w-5" />;
        }
    };

    const getStepTypeLabel = (stepType: string) => {
        switch (stepType?.toUpperCase()) {
            case "EXTRUSION":
                return "Ekstruziya";
            case "LAMINATION":
                return "Laminatsiya";
            case "BRONING":
                return "Bron qilish";
            default:
                return stepType || "Jarayon";
        }
    };

    const filteredSteps = productionStepsByWorkcenterType?.production_steps?.filter((step) =>
        step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        step.step_type.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleStepSelect = (step: any) => {
        setSelectedStep(step);
        navigate(`/worker/workcenter-type/${workcenterType}/order/${orderId}/step/${step.id}`);
    };

    if (stepsLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Ishlab chiqarish qadamlari yuklanmoqda...</span>
            </div>
        );
    }

    if (stepsError) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Xato</h1>
                <p className="text-gray-600 mb-6">{stepsError}</p>
                <Button onClick={() => workcenterType && fetchProductionStepsByWorkcenterType(workcenterType)}>
                    Qayta urinish
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/worker/workcenter-type/${workcenterType}`)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Orqaga
                    </Button>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            Ishlab chiqarish qadami tanlash
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm lg:text-base">
                            {getWorkcenterTypeLabel(workcenterType || "")} workcenter turi uchun ishlab chiqarish qadamlari
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <StepIndicator currentStep={3} />

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Qadam nomi yoki turi bo'yicha qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Steps List */}
            <div className="bg-white rounded-lg shadow-sm border">
                {filteredSteps.length === 0 ? (
                    <div className="text-center py-12">
                        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Ishlab chiqarish qadamlari topilmadi
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm
                                ? "Qidiruv shartlariga mos qadamlar yo'q"
                                : `${getWorkcenterTypeLabel(workcenterType || "")} workcenter turi uchun ishlab chiqarish qadamlari mavjud emas`}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredSteps.map((step) => (
                            <div
                                key={step.id}
                                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => handleStepSelect(step)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-blue-600">
                                                {getStepTypeIcon(step.step_type)}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {step.name}
                                            </h3>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-100 text-blue-800 text-sm font-medium">
                                                {getStepTypeLabel(step.step_type)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Qadam ID:</span>{" "}
                                                {step.id.slice(0, 8)}...
                                            </div>
                                            {step.duration_hours && (
                                                <div>
                                                    <span className="font-medium">Davomiyligi:</span>{" "}
                                                    {step.duration_hours} soat
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Tartib:</span>{" "}
                                                {step.order_sequence}
                                            </div>
                                        </div>
                                        {step.description && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                {step.description}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStepSelect(step);
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            Tanlash
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Ma'lumot</h4>
                        <p className="text-sm text-blue-700">
                            Ishlab chiqarish qadami tanlash orqali siz shu qadam uchun kerakli materiallarni
                            ishlatish jarayonini boshlaysiz. Qadam tanlash uchun ustiga bosing yoki "Tanlash" tugmasini bosing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
