import { useState, useEffect } from "react";
import {
  Play,
  Square,
  RefreshCw,
  Factory,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRecyclingStore } from "@/store/recycling.store";
import { useScrapStore } from "@/store/scrap.store";
import StartRecyclingBatchModal from "@/components/ui/start-recycling-batch-modal";
import StartDrobilkaModal from "@/components/ui/start-drobilka-modal";
import CompleteDrobilkaModal from "@/components/ui/complete-drobilka-modal";
import CompleteRecyclingBatchModal from "@/components/ui/complete-recycling-batch-modal";
import { toast } from "sonner";

export default function RecyclingWorkflow() {
  const {
    currentBatch,
    currentTotals,
    drobilkaProcesses,
    activeDrobilkaProcesses,
    loading,
    error,
    startRecyclingBatch,
    getCurrentTotals,
    completeRecyclingBatch,
    fetchDrobilkaProcesses,
    clearError,
    refreshData,
  } = useRecyclingStore();

  const { refreshData: refreshScrapData } = useScrapStore();

  // Modal holatlari
  const [startBatchModalOpen, setStartBatchModalOpen] = useState(false);
  const [startDrobilkaModalOpen, setStartDrobilkaModalOpen] = useState(false);
  const [completeDrobilkaModalOpen, setCompleteDrobilkaModalOpen] =
    useState(false);
  const [completeBatchModalOpen, setCompleteBatchModalOpen] = useState(false);
  const [selectedDrobilkaType, setSelectedDrobilkaType] = useState<
    "HARD" | "SOFT"
  >("HARD");
  const [selectedDrobilkaProcess, setSelectedDrobilkaProcess] =
    useState<any>(null);

  // Auto refresh
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([getCurrentTotals(), fetchDrobilkaProcesses()]);
    };

    loadData();
  }, [getCurrentTotals, fetchDrobilkaProcesses]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      await refreshData();
      await refreshScrapData();
    }, 30000); // 30 soniya

    return () => clearInterval(interval);
  }, [autoRefresh, refreshData, refreshScrapData]);

  const handleStartRecyclingBatch = async () => {
    const success = await startRecyclingBatch();
    if (success) {
      toast.success("Qayta ishlash partiyasi muvaffaqiyatli boshlandi");
      await Promise.all([getCurrentTotals(), fetchDrobilkaProcesses()]);
    } else {
      toast.error("Qayta ishlash partiyasini boshlashda xatolik yuz berdi");
    }
  };

  const handleCompleteRecyclingBatch = async (
    finalVtQuantity: number,
    notes?: string
  ) => {
    if (!currentBatch) return;

    const success = await completeRecyclingBatch(currentBatch.id, {
      final_vt_quantity: finalVtQuantity,
      notes,
    });

    if (success) {
      toast.success("Qayta ishlash partiyasi muvaffaqiyatli yakunlandi");
      await Promise.all([getCurrentTotals(), fetchDrobilkaProcesses()]);
    } else {
      toast.error("Qayta ishlash partiyasini yakunlashda xatolik yuz berdi");
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refreshData(), refreshScrapData()]);
    toast.success("Ma'lumotlar yangilandi");
  };

  // Workflow bosqichlari
  const workflowSteps = [
    {
      id: 1,
      title: "Brak To'planishi",
      description: "Brak materiallar to'planmoqda",
      icon: <Package className="h-5 w-5" />,
      status:
        currentTotals &&
          (currentTotals.hard_scrap > 0 || currentTotals.soft_scrap > 0)
          ? "completed"
          : "pending",
    },
    {
      id: 2,
      title: "Qayta Ishlash Boshlanishi",
      description: "Partiya yaratilmoqda",
      icon: <Play className="h-5 w-5" />,
      status: currentBatch ? "completed" : "pending",
    },
    {
      id: 3,
      title: "Qattiq Brak Drobilka",
      description: "Qattiq braklar maydalanmoqda",
      icon: <Factory className="h-5 w-5" />,
      status: drobilkaProcesses.some(
        (p) => p.drobilka_type === "HARD" && p.completed_at
      )
        ? "completed"
        : drobilkaProcesses.some((p) => p.drobilka_type === "HARD")
          ? "active"
          : "pending",
    },
    {
      id: 4,
      title: "Yumshoq Brak Drobilka",
      description: "Yumshoq braklar qayta ishlanmoqda",
      icon: <Factory className="h-5 w-5" />,
      status: drobilkaProcesses.some(
        (p) => p.drobilka_type === "SOFT" && p.completed_at
      )
        ? "completed"
        : drobilkaProcesses.some((p) => p.drobilka_type === "SOFT")
          ? "active"
          : "pending",
    },
    {
      id: 5,
      title: "Yakuniy Qayta Ishlash",
      description: "VT granulasi tayyorlanmoqda",
      icon: <CheckCircle className="h-5 w-5" />,
      status: currentBatch?.status === "COMPLETED" ? "completed" : "pending",
    },
  ];

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Progress hisoblash
  const completedSteps = workflowSteps.filter(
    (step) => step.status === "completed"
  ).length;
  const progress = (completedSteps / workflowSteps.length) * 100;

  if (loading && !currentTotals && !currentBatch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">
            Qayta ishlash ma'lumotlari yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sarlavha va boshqaruv */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Brak Qayta Ishlash Jarayoni
          </h1>
          <p className="text-gray-600">
            To'liq qayta ishlash workflow monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {autoRefresh ? "Avtomatik" : "Qo'lda"}
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Jarayon Progressi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Umumiy progress</span>
              <span className="text-sm text-gray-600">
                {completedSteps}/{workflowSteps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-gray-600">
              {progress.toFixed(1)}% yakunlangan
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Joriy to'plangan braklar */}
      {currentTotals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Joriy To'plangan Braklar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <Factory className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {currentTotals.hard_scrap} kg
                </div>
                <div className="text-sm text-red-800">Qattiq Brak</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {currentTotals.soft_scrap} kg
                </div>
                <div className="text-sm text-blue-800">Yumshoq Brak</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setStartBatchModalOpen(true)}
                disabled={
                  currentTotals.hard_scrap === 0 &&
                  currentTotals.soft_scrap === 0
                }
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Qayta Ishlashni Boshlash
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Faol partiya */}
      {currentBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Faol Qayta Ishlash Partiyasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Partiya raqami:</p>
                  <p className="font-semibold">{currentBatch.batch_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Holat:</p>
                  <Badge
                    className={
                      currentBatch.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {currentBatch.status_display}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Boshlangan:</p>
                  <p className="font-semibold">
                    {new Date(currentBatch.started_at).toLocaleString("uz-UZ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mas'ul:</p>
                  <p className="font-semibold">
                    {currentBatch.started_by?.full_name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Qattiq brak:</p>
                  <p className="text-lg font-bold text-red-600">
                    {currentBatch.total_hard_scrap} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Yumshoq brak:</p>
                  <p className="text-lg font-bold text-blue-600">
                    {currentBatch.total_soft_scrap} kg
                  </p>
                </div>
              </div>

              {currentBatch.final_vt_quantity && (
                <div>
                  <p className="text-sm text-gray-600">Yakuniy VT miqdori:</p>
                  <p className="text-lg font-bold text-green-600">
                    {currentBatch.final_vt_quantity} kg
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow bosqichlari */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Qayta Ishlash Bosqichlari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${step.status === "active"
                    ? "bg-blue-50 border-blue-200"
                    : step.status === "completed"
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${step.status === "active"
                        ? "bg-blue-100"
                        : step.status === "completed"
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : step.status === "active" ? (
                      <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>

                <div className="flex-shrink-0">
                  <Badge className={getStepStatusColor(step.status)}>
                    {step.status === "completed"
                      ? "Yakunlangan"
                      : step.status === "active"
                        ? "Faol"
                        : "Kutilmoqda"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Faol drobilka jarayonlari */}
      {activeDrobilkaProcesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Faol Drobilka Jarayonlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDrobilkaProcesses.map((process) => (
                <div
                  key={process.id}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">
                      {process.drobilka_type_display}
                    </h4>
                    <Badge className="bg-blue-100 text-blue-800">Faol</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stanok:</span>
                      <span className="font-medium">
                        {process.work_center_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kirish miqdori:</span>
                      <span className="font-medium">
                        {process.input_quantity} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mas'ul operator:</span>
                      <span className="font-medium">
                        {process.lead_operator_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Operatorlar:</span>
                      <span className="font-medium">
                        <Users className="h-4 w-4 inline mr-1" />
                        {process.operators_details.length}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDrobilkaProcess(process);
                        setCompleteDrobilkaModalOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Square className="h-3 w-3" />
                      Yakunlash
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drobilka boshlash tugmalari */}
      {currentBatch && currentBatch.status === "IN_PROGRESS" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Drobilka Jarayonlarini Boshqarish
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setSelectedDrobilkaType("HARD");
                  setStartDrobilkaModalOpen(true);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Factory className="h-4 w-4" />
                Qattiq Brak Drobilka
              </Button>

              <Button
                onClick={() => {
                  setSelectedDrobilkaType("SOFT");
                  setStartDrobilkaModalOpen(true);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Factory className="h-4 w-4" />
                Yumshoq Brak Drobilka
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yakunlash tugmasi */}
      {currentBatch &&
        currentBatch.status === "IN_PROGRESS" &&
        drobilkaProcesses
          .filter((p) => p.drobilka_type === "HARD")
          .some((p) => p.completed_at) &&
        drobilkaProcesses
          .filter((p) => p.drobilka_type === "SOFT")
          .some((p) => p.completed_at) && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Button
                  onClick={() => setCompleteBatchModalOpen(true)}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Qayta Ishlash Partiyasini Yakunlash
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Modallar */}
      <StartRecyclingBatchModal
        open={startBatchModalOpen}
        onClose={() => setStartBatchModalOpen(false)}
        onSuccess={handleStartRecyclingBatch}
      />

      <StartDrobilkaModal
        open={startDrobilkaModalOpen}
        onClose={() => setStartDrobilkaModalOpen(false)}
        drobilkaType={selectedDrobilkaType}
        recyclingBatch={currentBatch?.id}
        onSuccess={() => {
          setStartDrobilkaModalOpen(false);
          fetchDrobilkaProcesses();
        }}
      />

      {selectedDrobilkaProcess && (
        <CompleteDrobilkaModal
          open={completeDrobilkaModalOpen}
          onClose={() => setCompleteDrobilkaModalOpen(false)}
          drobilkaProcess={selectedDrobilkaProcess}
          onSuccess={() => {
            setCompleteDrobilkaModalOpen(false);
            setSelectedDrobilkaProcess(null);
            fetchDrobilkaProcesses();
          }}
        />
      )}

      <CompleteRecyclingBatchModal
        open={completeBatchModalOpen}
        onClose={() => setCompleteBatchModalOpen(false)}
        recyclingBatch={currentBatch}
        onSuccess={handleCompleteRecyclingBatch}
      />
    </div>
  );
}
