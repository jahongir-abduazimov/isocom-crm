import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  Users,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StepIndicator from "@/components/ui/step-indicator";
import { useWorkerStore } from "@/store/worker.store";

export default function WorkerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    selectedOrder,
    productionSteps,
    stepsLoading,
    stepsError,
    fetchOrderSteps,
    setSelectedStep,
    currentStep,
    setCurrentStep,
  } = useWorkerStore();

  // Filter production steps based on search term
  const filteredSteps = useMemo(() => {
    if (!searchTerm.trim()) {
      return productionSteps;
    }

    const term = searchTerm.toLowerCase();
    return productionSteps.filter((step) => {
      const name = (step.name || '').toLowerCase();
      const stepType = (step.step_type || '').toLowerCase();
      const workCenterName = (step.work_center_name || '').toLowerCase();
      const workCenter = (step.work_center || '').toLowerCase();

      return (
        name.includes(term) ||
        stepType.includes(term) ||
        workCenterName.includes(term) ||
        workCenter.includes(term)
      );
    });
  }, [productionSteps, searchTerm]);

  useEffect(() => {
    fetchOrderSteps();
    setCurrentStep(2); // Set current step to 2 (Step selection)
  }, [fetchOrderSteps, setCurrentStep]);

  const formatStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "Kutilmoqda";
      case "IN_PROGRESS":
        return "Jarayonda";
      case "COMPLETED":
        return "Tugallangan";
      case "FAILED":
        return "Xato";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <PlayCircle className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "FAILED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStepSelect = (step: any) => {
    setSelectedStep(step);
    setSelectedStepId(step.id);
  };

  const handleContinue = () => {
    if (selectedStepId) {
      const selectedStep = productionSteps.find(
        (step) => step.id === selectedStepId
      );
      if (selectedStep && selectedStep.work_center) {
        navigate(`/worker/orders/${id}/steps/${selectedStep.work_center}`);
      }
    }
  };

  if (stepsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Qadamlar yuklanmoqda...</span>
      </div>
    );
  }

  if (stepsError || !selectedOrder) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Xato</h1>
        <p className="text-gray-600 mb-6">
          {stepsError || "Buyurtma topilmadi"}
        </p>
        <Button onClick={() => navigate("/worker/orders")}>
          Buyurtmalar ro'yxatiga qaytish
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
            onClick={() => navigate("/worker/orders")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Buyurtma tafsilotlari
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              {selectedOrder.produced_product__name} -{" "}
              {selectedOrder.id.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Order Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedOrder.produced_product__name}
                </h2>
                <p className="text-gray-600 mt-1">
                  Buyurtma ID: {selectedOrder.id}
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                  selectedOrder.status
                )}`}
              >
                {getStatusIcon(selectedOrder.status)}
                {formatStatus(selectedOrder.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Miqdor</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.produced_quantity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Qadamlar</h3>
            <p className="text-sm text-gray-600">
              Material ishlatish uchun qadam tanlang
            </p>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Ishlab chiqarish qadamları ({filteredSteps.length})
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Material ishlatish uchun qadam tanlang
          </p>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Qadam qidirish (nomi, turi, workcenter)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {productionSteps.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Qadamlar topilmadi
            </h3>
            <p className="text-gray-600">
              Ishlab chiqarish qadamlar mavjud emas
            </p>
          </div>
        ) : filteredSteps.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Qidiruv natijasi topilmadi
            </h3>
            <p className="text-gray-600">
              "{searchTerm}" bo'yicha qadamlar topilmadi. Boshqa kalit so'z bilan qidiring.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSteps?.map((step) => (
              <div
                key={step.id}
                className={`p-6 transition-colors cursor-pointer ${selectedStepId === step.id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "hover:bg-gray-50"
                  }`}
                onClick={() => handleStepSelect(step)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="step"
                          checked={selectedStepId === step.id}
                          onChange={() => handleStepSelect(step)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <h4 className="text-lg font-semibold text-gray-900">
                          {step.name}
                        </h4>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${step.work_center
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                      >
                        {step.work_center ? "Mavjud" : "Mavjud emas"}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Qadam turi:</span>{" "}
                        {step.step_type}
                      </div>
                      <div>
                        <span className="font-medium">Workcenter:</span>{" "}
                        {step.work_center_name || "Yo'q"}
                      </div>
                      <div>
                        <span className="font-medium">Davomiyligi:</span>{" "}
                        {step.duration_hours
                          ? `${step.duration_hours} soat`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continue Button */}
      {selectedStepId &&
        productionSteps.find((step) => step.id === selectedStepId)
          ?.work_center && (
          <div className="flex justify-end">
            <Button
              onClick={handleContinue}
              className="flex items-center gap-2"
            >
              Davom etish
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Ma'lumot</h4>
            <p className="text-sm text-blue-700">
              Faqat workcenter ga ega bo'lgan qadamlar uchun material ishlatish
              mumkin. Qadam tanlash uchun radio button ni bosing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
