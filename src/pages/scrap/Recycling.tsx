import { useState, useEffect } from "react";
import {
  Play,
  Square,
  RefreshCw,
  Factory,
  Package,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecyclingStore } from "@/store/recycling.store";
import { useWorkcentersStore } from "@/store/workcenters.store";
import { useUsersStore } from "@/store/users.store";
import { type DrobilkaProcess } from "@/services/recycling.service";
import StartDrobilkaModal from "@/components/ui/start-drobilka-modal";
import CompleteDrobilkaModal from "@/components/ui/complete-drobilka-modal";
import { toast } from "sonner";

export default function RecyclingPage() {
  const {
    currentBatch,
    currentTotals,
    drobilkaProcesses,
    loading,
    error,
    startRecyclingBatch,
    getCurrentTotals,
    completeRecyclingBatch,
    fetchDrobilkaProcesses,
    clearError,
  } = useRecyclingStore();

  const { workcenters, fetchWorkcenters } = useWorkcentersStore();
  const { users, fetchUsers } = useUsersStore();

  const [startDrobilkaModalOpen, setStartDrobilkaModalOpen] = useState(false);
  const [completeDrobilkaModalOpen, setCompleteDrobilkaModalOpen] =
    useState(false);
  const [selectedDrobilka, setSelectedDrobilka] =
    useState<DrobilkaProcess | null>(null);

  useEffect(() => {
    getCurrentTotals();
    fetchDrobilkaProcesses();
    fetchWorkcenters();
    fetchUsers();
  }, [getCurrentTotals, fetchDrobilkaProcesses, fetchWorkcenters, fetchUsers]);

  const handleStartRecyclingBatch = async () => {
    const success = await startRecyclingBatch();
    if (success) {
      toast.success("Qayta ishlash partiyasi muvaffaqiyatli boshlandi");
      getCurrentTotals();
    } else {
      toast.error("Qayta ishlash partiyasini boshlashda xatolik yuz berdi");
    }
  };

  const handleCompleteRecyclingBatch = async () => {
    if (!currentBatch) return;

    const success = await completeRecyclingBatch(currentBatch.id);
    if (success) {
      toast.success("Qayta ishlash partiyasi muvaffaqiyatli yakunlandi");
      getCurrentTotals();
    } else {
      toast.error("Qayta ishlash partiyasini yakunlashda xatolik yuz berdi");
    }
  };

  const handleStartDrobilka = () => {
    if (!currentBatch) {
      toast.error("Qayta ishlash partiyasi mavjud emas");
      return;
    }
    setStartDrobilkaModalOpen(true);
  };

  const handleCompleteDrobilka = (process: DrobilkaProcess) => {
    setSelectedDrobilka(process);
    setCompleteDrobilkaModalOpen(true);
  };

  const handleRefresh = () => {
    getCurrentTotals();
    fetchDrobilkaProcesses();
  };

  const getDrobilkaTypeDisplay = (type: string) => {
    return type === "HARD" ? "Qattiq" : "Yumshoq";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROCESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "IN_PROCESS":
        return "Jarayonda";
      case "COMPLETED":
        return "Yakunlangan";
      default:
        return status;
    }
  };

  if (loading && !currentTotals) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Qayta Ishlash (Recycling)</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yangilash
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <Button
            onClick={clearError}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Yopish
          </Button>
        </div>
      )}

      {/* Current Totals Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Joriy Braklar Miqdori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {currentTotals?.hard_scrap_total || "0.00"}
              </div>
              <div className="text-sm text-orange-600">Qattiq Braklar (KG)</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentTotals?.soft_scrap_total || "0.00"}
              </div>
              <div className="text-sm text-blue-600">Yumshoq Braklar (KG)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(
                  parseFloat(currentTotals?.hard_scrap_total || "0") +
                  parseFloat(currentTotals?.soft_scrap_total || "0")
                ).toFixed(2)}
              </div>
              <div className="text-sm text-green-600">Jami Braklar (KG)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Batch Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Joriy Qayta Ishlash Partiyasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentBatch ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {currentBatch.batch_number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Boshlangan:{" "}
                    {new Date(currentBatch.started_at).toLocaleString("uz-UZ")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Boshlagan: {currentBatch.started_by.full_name}
                  </p>
                </div>
                <Badge className={getStatusColor(currentBatch.status)}>
                  {getStatusDisplay(currentBatch.status)}
                </Badge>
              </div>

              {currentBatch.total_input && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold">
                      {currentBatch.total_input}
                    </div>
                    <div className="text-sm text-gray-600">
                      Kirim Miqdori (KG)
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold">
                      {currentBatch.total_output || "0.00"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Chiqim Miqdori (KG)
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleStartDrobilka}
                  disabled={currentBatch.status === "COMPLETED"}
                >
                  <Factory className="h-4 w-4 mr-2" />
                  Drobilka Boshlash
                </Button>

                {currentBatch.status === "IN_PROCESS" && (
                  <Button
                    onClick={handleCompleteRecyclingBatch}
                    variant="outline"
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Partiyani Yakunlash
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Factory className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Qayta ishlash partiyasi mavjud emas
              </h3>
              <p className="text-gray-600 mb-4">
                Yangi qayta ishlash partiyasini boshlash uchun tugmani bosing
              </p>
              <Button onClick={handleStartRecyclingBatch} disabled={loading}>
                <Play className="h-4 w-4 mr-2" />
                Partiya Boshlash
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drobilka Processes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Drobilka Jarayonlari
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drobilkaProcesses.length > 0 ? (
            <div className="space-y-4">
              {drobilkaProcesses.map((process) => (
                <div key={process.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">
                        {process.work_center_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {getDrobilkaTypeDisplay(process.drobilka_type)} •
                        {new Date(process.started_at).toLocaleString("uz-UZ")}
                      </p>
                    </div>
                    <Badge
                      className={getStatusColor(
                        process.completed_at ? "COMPLETED" : "IN_PROCESS"
                      )}
                    >
                      {process.completed_at ? "Yakunlangan" : "Jarayonda"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold">
                        {process.input_quantity}
                      </div>
                      <div className="text-xs text-gray-600">Kirim (KG)</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold">
                        {process.output_quantity || "0.00"}
                      </div>
                      <div className="text-xs text-gray-600">Chiqim (KG)</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-semibold">
                        {process.operators.length}
                      </div>
                      <div className="text-xs text-gray-600">Operatorlar</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="font-semibold text-xs">
                        {process.lead_operator_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        Mas'ul Operator
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!process.completed_at && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteDrobilka(process)}
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Yakunlash
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Factory className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Drobilka jarayonlari mavjud emas
              </h3>
              <p className="text-gray-600">
                Drobilka jarayonlarini ko'rish uchun qayta ishlash partiyasini
                boshlang
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <StartDrobilkaModal
        open={startDrobilkaModalOpen}
        onClose={() => setStartDrobilkaModalOpen(false)}
        currentBatch={currentBatch}
        workcenters={workcenters.filter((w) => w.type === "BRAK_MAYDALAGICH")}
        operators={users.filter((u) => u.is_operator)}
        onSuccess={() => {
          setStartDrobilkaModalOpen(false);
          fetchDrobilkaProcesses();
          getCurrentTotals();
        }}
      />

      <CompleteDrobilkaModal
        open={completeDrobilkaModalOpen}
        onClose={() => {
          setCompleteDrobilkaModalOpen(false);
          setSelectedDrobilka(null);
        }}
        process={selectedDrobilka}
        onSuccess={() => {
          setCompleteDrobilkaModalOpen(false);
          setSelectedDrobilka(null);
          fetchDrobilkaProcesses();
          getCurrentTotals();
        }}
      />
    </div>
  );
}
