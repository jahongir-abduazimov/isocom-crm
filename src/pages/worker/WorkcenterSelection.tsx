import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Search,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Factory,
  Zap,
  Wrench,
  Wind,
  Layers,
  Copy,
  Package,
  Shield,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StepIndicator from "@/components/ui/step-indicator";
import { useWorkerStore } from "@/store/worker.store";

export default function WorkcenterSelectionPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    workcenters,
    workcentersLoading,
    workcentersError,
    fetchWorkcenters,
    setSelectedWorkcenterType,
    setSelectedWorkcenterId,
    setCurrentStep,
  } = useWorkerStore();

  useEffect(() => {
    fetchWorkcenters();
    setCurrentStep(1); // Set current step to 1 (Workcenter selection)
  }, [fetchWorkcenters, setCurrentStep]);

  const getWorkcenterIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "EXTRUDER":
        return <Factory className="h-6 w-6" />;
      case "DEGASSING_AREA":
        return <Wind className="h-6 w-6" />;
      case "LAMINATOR":
        return <Layers className="h-6 w-6" />;
      case "BRONIROVSHIK":
        return <Zap className="h-6 w-6" />;
      case "DUPLICATOR":
        return <Copy className="h-6 w-6" />;
      case "PACKAGING":
        return <Package className="h-6 w-6" />;
      case "QUALITY_CONTROL":
        return <Shield className="h-6 w-6" />;
      case "BRAK_MAYDALAGICH":
        return <Trash2 className="h-6 w-6" />;
      default:
        return <Wrench className="h-6 w-6" />;
    }
  };

  const getWorkcenterTypeLabel = (type: string) => {
    switch (type.toUpperCase()) {
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
        return type;
    }
  };

  const getWorkcenterTypeDescription = (type: string) => {
    switch (type.toUpperCase()) {
      case "EXTRUDER":
        return "Plastik mahsulotlar ishlab chiqarish";
      case "DEGASSING_AREA":
        return "Gaz chiqarish va tayyorlash maydoni";
      case "LAMINATOR":
        return "Qog'oz va film laminatsiyasi";
      case "BRONIROVSHIK":
        return "Metall buyumlarni bron qilish";
      case "DUPLICATOR":
        return "Nusxa ko'chirish va takrorlash";
      case "PACKAGING":
        return "Mahsulotlarni qadoqlash";
      case "QUALITY_CONTROL":
        return "Sifat nazorati va tekshirish";
      case "BRAK_MAYDALAGICH":
        return "Brak mahsulotlarni maydalash";
      default:
        return "Ishlab chiqarish jarayoni";
    }
  };

  const getWorkcenterTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "EXTRUDER":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "DEGASSING_AREA":
        return "bg-cyan-100 text-cyan-600 border-cyan-200";
      case "LAMINATOR":
        return "bg-green-100 text-green-600 border-green-200";
      case "BRONIROVSHIK":
        return "bg-purple-100 text-purple-600 border-purple-200";
      case "DUPLICATOR":
        return "bg-indigo-100 text-indigo-600 border-indigo-200";
      case "PACKAGING":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "QUALITY_CONTROL":
        return "bg-emerald-100 text-emerald-600 border-emerald-200";
      case "BRAK_MAYDALAGICH":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const filteredWorkcenters = workcenters.filter(
    (workcenter) =>
      workcenter.type !== "BRAK_MAYDALAGICH" &&
      (workcenter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getWorkcenterTypeLabel(workcenter.type)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const handleWorkcenterSelect = (workcenter: any) => {
    setSelectedWorkcenterType(workcenter.type);
    setSelectedWorkcenterId(workcenter.id);
    navigate(`/worker/workcenter-type/${workcenter.type}`);
  };

  if (workcentersLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Workcenterlar yuklanmoqda...</span>
      </div>
    );
  }

  if (workcentersError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Xato</h1>
        <p className="text-gray-600 mb-6">{workcentersError}</p>
        <Button onClick={() => fetchWorkcenters()}>Qayta urinish</Button>
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
            onClick={() => navigate("/worker")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Workcenter tanlash
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Material ishlatish uchun workcenter tanlang
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <StepIndicator currentStep={1} />

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Workcenter nomi yoki turi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Workcenters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWorkcenters.map((workcenter) => (
          <div
            key={workcenter.id}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => handleWorkcenterSelect(workcenter)}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${getWorkcenterTypeColor(
                  workcenter.type
                )}`}
              >
                {getWorkcenterIcon(workcenter.type)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {workcenter.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {getWorkcenterTypeLabel(workcenter.type)}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {getWorkcenterTypeDescription(workcenter.type)}
              </p>
              {workcenter.description && (
                <p className="text-xs text-gray-400 mb-4">
                  {workcenter.description}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
              >
                Tanlash
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkcenters.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Workcenterlar topilmadi
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Qidiruv shartlariga mos workcenterlar yo'q"
              : "Hozircha workcenterlar mavjud emas"}
          </p>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Ma'lumot</h4>
            <p className="text-sm text-blue-700">
              Workcenter tanlash orqali siz shu workcenter turi bo'yicha
              buyurtmalar va ishlab chiqarish qadamlarini ko'rishingiz mumkin.
              Tanlangan workcenter turi bo'yicha mavjud buyurtmalar ro'yxati
              ko'rsatiladi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
