import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Play,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScrapStore } from "@/store/scrap.store";
import { useRecyclingStore } from "@/store/recycling.store";
import { useWorkcentersStore } from "@/store/workcenters.store";
import { useUsersStore } from "@/store/users.store";
import { type DrobilkaProcess } from "@/services/recycling.service";
import StartRecyclingBatchModal from "@/components/ui/start-recycling-batch-modal";
import StartDrobilkaModal from "@/components/ui/start-drobilka-modal";
import CompleteDrobilkaModal from "@/components/ui/complete-drobilka-modal";
import CompleteRecyclingBatchModal from "@/components/ui/complete-recycling-batch-modal";

export default function OperatorReprocessingPage() {
  const {
    scraps,
    loading: scrapsLoading,
    error: scrapsError,
    fetchScraps,
  } = useScrapStore();
  const {
    currentBatch,
    drobilkaProcesses,
    loading: recyclingLoading,
    error: recyclingError,
    fetchDrobilkaProcesses,
    getCurrentTotals,
  } = useRecyclingStore();
  const { fetchWorkcenters } = useWorkcentersStore();
  const { fetchUsers } = useUsersStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterScrapType, setFilterScrapType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "scraps" | "processes">("overview");

  // Modal states
  const [startBatchModalOpen, setStartBatchModalOpen] = useState(false);
  const [startDrobilkaModalOpen, setStartDrobilkaModalOpen] = useState(false);
  const [completeDrobilkaModalOpen, setCompleteDrobilkaModalOpen] = useState(false);
  const [completeBatchModalOpen, setCompleteBatchModalOpen] = useState(false);
  const [selectedDrobilkaType, setSelectedDrobilkaType] = useState<"HARD" | "SOFT">("HARD");
  const [selectedDrobilkaProcess, setSelectedDrobilkaProcess] = useState<DrobilkaProcess | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading initial data...");
        await Promise.all([
          fetchScraps(),
          fetchDrobilkaProcesses(),
          getCurrentTotals(),
          fetchWorkcenters(),
          fetchUsers({ is_active: true })
        ]);
        console.log("Initial data loaded successfully");
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadData();
  }, [fetchScraps, fetchDrobilkaProcesses, getCurrentTotals, fetchWorkcenters, fetchUsers]);

  // Filter scraps for reprocessing (only PENDING status)
  const availableScraps = Array.isArray(scraps) ? scraps.filter(scrap => scrap.status === "PENDING") : [];

  const filteredScraps = availableScraps.filter((scrap) => {
    const matchesSearch =
      scrap.scrap_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scrap.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scrap.recorded_by?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scrap.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScrapTypeFilter =
      filterScrapType === "all" || scrap.scrap_type === filterScrapType;

    const matchesStatusFilter =
      filterStatus === "all" || scrap.status === filterStatus;

    return matchesSearch && matchesScrapTypeFilter && matchesStatusFilter;
  });

  // Get available quantities for drobilka operations
  const hardScraps = availableScraps.filter(scrap => scrap.scrap_type === "HARD");
  const softScraps = availableScraps.filter(scrap => scrap.scrap_type === "SOFT");

  const totalHardQuantity = hardScraps.reduce((sum, scrap) => sum + parseFloat(scrap.quantity || "0"), 0);
  const totalSoftQuantity = softScraps.reduce((sum, scrap) => sum + parseFloat(scrap.quantity || "0"), 0);

  // Get active drobilka processes
  const activeDrobilkaProcesses = Array.isArray(drobilkaProcesses) ? drobilkaProcesses.filter(process => !process.completed_at) : [];
  const completedDrobilkaProcesses = Array.isArray(drobilkaProcesses) ? drobilkaProcesses.filter(process => process.completed_at) : [];

  const getScrapTypeColor = (scrapType: string) => {
    switch (scrapType) {
      case "HARD":
        return "bg-red-100 text-red-800";
      case "SOFT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROCESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get unique values for filter options
  const uniqueScrapTypes = [...new Set(availableScraps.map((scrap) => scrap.scrap_type).filter(Boolean))];
  const uniqueStatuses = [...new Set(availableScraps.map((scrap) => scrap.status).filter(Boolean))];

  // Handlers
  const handleStartBatch = () => {
    setStartBatchModalOpen(true);
  };

  const handleStartDrobilka = (type: "HARD" | "SOFT") => {
    setSelectedDrobilkaType(type);
    setStartDrobilkaModalOpen(true);
  };

  const handleCompleteDrobilka = (process: DrobilkaProcess) => {
    setSelectedDrobilkaProcess(process);
    setCompleteDrobilkaModalOpen(true);
  };

  const handleCompleteBatch = () => {
    setCompleteBatchModalOpen(true);
  };

  const handleModalSuccess = async () => {
    try {
      await Promise.all([
        fetchScraps(),
        fetchDrobilkaProcesses(),
        getCurrentTotals()
      ]);
    } catch (error) {
      console.error("Error refreshing data after modal success:", error);
    }
  };

  const loading = scrapsLoading || recyclingLoading;
  const error = scrapsError || recyclingError;

  // Debug information
  console.log("Reprocessing page state:", {
    scrapsLoading,
    recyclingLoading,
    scrapsError,
    recyclingError,
    scraps: scraps,
    scrapsType: typeof scraps,
    scrapsIsArray: Array.isArray(scraps),
    scrapsLength: Array.isArray(scraps) ? scraps.length : "not array",
    drobilkaProcesses: drobilkaProcesses,
    drobilkaProcessesType: typeof drobilkaProcesses,
    drobilkaProcessesIsArray: Array.isArray(drobilkaProcesses),
    currentBatch: currentBatch?.id || "none"
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Brak Qayta Ishlash
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Braklarni ko'rish, qayta ishlash jarayonini boshqarish va
            natijalarni kuzatish
          </p>
        </div>
        <div className="flex gap-2">
          {!currentBatch && (
            <Button onClick={handleStartBatch} disabled={loading || availableScraps.length === 0}>
              <Play className="w-4 h-4 mr-2" />
              Partiyani Boshlash
            </Button>
          )}
          {currentBatch && currentBatch.status === "IN_PROCESS" && (
            <Button onClick={handleCompleteBatch} variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Partiyani Yakunlash
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Qayta Ishlash Uchun Tayyor
                </p>
                <p className="text-xl lg:text-2xl font-bold text-yellow-600">
                  {availableScraps.length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-yellow-100 rounded-full">
                <Clock size={20} className="text-yellow-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qattiq Braklar</p>
                <p className="text-xl lg:text-2xl font-bold text-red-600">
                  {totalHardQuantity.toFixed(1)} KG
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-red-100 rounded-full">
                <Package size={20} className="text-red-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yumshoq Braklar</p>
                <p className="text-xl lg:text-2xl font-bold text-orange-600">
                  {totalSoftQuantity.toFixed(1)} KG
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-orange-100 rounded-full">
                <Package size={20} className="text-orange-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Aktiv Jarayonlar
                </p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">
                  {activeDrobilkaProcesses.length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-100 rounded-full">
                <Settings size={20} className="text-blue-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Batch Status */}
      {currentBatch && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Joriy Qayta Ishlash Partiyasi
              </h3>
              <p className="text-sm text-gray-600">
                Partiya: {currentBatch.batch_number} |
                Boshlangan: {formatDate(currentBatch.started_at)} |
                Holat: <span className={`font-medium ${currentBatch.status === "IN_PROCESS" ? "text-blue-600" : "text-green-600"}`}>
                  {currentBatch.status === "IN_PROCESS" ? "Jarayonda" : "Yakunlangan"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              {currentBatch.status === "IN_PROCESS" && (
                <>
                  <Button
                    onClick={() => handleStartDrobilka("HARD")}
                    disabled={totalHardQuantity <= 0}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Hard Drobilka
                  </Button>
                  <Button
                    onClick={() => handleStartDrobilka("SOFT")}
                    disabled={totalSoftQuantity <= 0}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Soft Drobilka
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <Package size={16} />
                Umumiy Ko'rinish
              </div>
            </button>
            <button
              onClick={() => setActiveTab("scraps")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "scraps"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                Braklar ({availableScraps.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("processes")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "processes"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center gap-2">
                <Settings size={16} />
                Drobilka Jarayonlari ({activeDrobilkaProcesses.length})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Filters and Search */}
      {!loading && !error && activeTab !== "overview" && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder={
                    activeTab === "scraps"
                      ? "Braklar bo'yicha qidiruv..."
                      : "Drobilka jarayonlari bo'yicha qidiruv..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
              <Select
                value={filterScrapType}
                onValueChange={setFilterScrapType}
              >
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="Brak turi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha turlar</SelectItem>
                  {uniqueScrapTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "HARD"
                        ? "Qattiq"
                        : type === "SOFT"
                          ? "Yumshoq"
                          : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeTab === "scraps" && (
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="min-w-[140px]">
                    <SelectValue placeholder="Holat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha holatlar</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "PENDING"
                          ? "Kutilmoqda"
                          : status === "IN_PROCESS"
                            ? "Jarayonda"
                            : status === "COMPLETED"
                              ? "Yakunlangan"
                              : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {activeTab === "overview" ? (
            // Overview Tab
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Qayta Ishlash Jarayoni
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">1. Qattiq Braklar</h4>
                  <p className="text-sm text-red-700 mb-2">
                    {totalHardQuantity.toFixed(1)} KG mavjud
                  </p>
                  <p className="text-xs text-red-600">
                    Hard drobilkada maydalanadi
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">2. Yumshoq Braklar</h4>
                  <p className="text-sm text-orange-700 mb-2">
                    {totalSoftQuantity.toFixed(1)} KG mavjud
                  </p>
                  <p className="text-xs text-orange-600">
                    Maydalangan qattiq braklar qo'shiladi
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">3. Soft Drobilka</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Barcha yumshoq braklar
                  </p>
                  <p className="text-xs text-blue-600">
                    VT granulasi olinadi
                  </p>
                </div>
              </div>

              {!currentBatch && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Qayta ishlash jarayonini boshlash uchun "Partiyani Boshlash" tugmasini bosing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "scraps" ? (
            // Scraps table
            <div className="overflow-x-auto w-full">
              <table className="w-full overflow-x-auto">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brak turi
                    </th>
                    <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miqdor
                    </th>
                    <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sabab
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holat
                    </th>
                    <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qayd etgan
                    </th>
                    <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vaqt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScraps.map((scrap) => (
                    <tr
                      key={scrap.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-[120px] lg:max-w-[200px]">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScrapTypeColor(
                              scrap.scrap_type
                            )}`}
                          >
                            {scrap.scrap_type === "HARD" ? "Qattiq" : "Yumshoq"}
                          </span>
                        </div>
                        <div className="lg:hidden mt-1">
                          <span className="text-sm font-medium">
                            {scrap.quantity || "0"} {scrap.unit_of_measure || "KG"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {scrap.quantity || "0"} {scrap.unit_of_measure || "KG"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-700">
                            {scrap.reason || "Noma'lum"}
                          </span>
                          {scrap.notes && (
                            <div
                              className="truncate text-xs text-gray-500"
                              title={scrap.notes}
                            >
                              {scrap.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${getStatusColor(
                              scrap.status
                            )}`}
                          >
                            {scrap.status === "PENDING" ? "Kutilmoqda" :
                              scrap.status === "IN_PROCESS" ? "Jarayonda" : "Yakunlangan"}
                          </span>
                          <span className="text-xs text-gray-500 md:hidden mt-1">
                            {scrap.recorded_by?.full_name || "Noma'lum"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {scrap.recorded_by?.full_name || "Noma'lum"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatDate(scrap.created_at || new Date().toISOString())}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Drobilka processes table
            <div className="overflow-x-auto w-full">
              <table className="w-full overflow-x-auto">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drobilka Turi
                    </th>
                    <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stanok
                    </th>
                    <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miqdorlar
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mas'ul Operator
                    </th>
                    <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holat
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeDrobilkaProcesses.map((process) => (
                    <tr
                      key={process.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-[120px] lg:max-w-[200px]">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScrapTypeColor(
                              process.drobilka_type
                            )}`}
                          >
                            {process.drobilka_type_display}
                          </span>
                        </div>
                        <div className="lg:hidden mt-1">
                          <span className="text-sm font-medium">
                            {process.input_quantity} KG
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {process.work_center_name}
                          </span>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-700">
                            Kirish: {process.input_quantity} KG
                          </span>
                          <span className="text-xs text-gray-700">
                            Chiqish: {process.output_quantity || "Jarayonda"} KG
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {process.lead_operator_name}
                          </span>
                          <span className="text-xs text-gray-500 md:hidden mt-1">
                            {process.operators_details.length} operator
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-600 font-medium">
                            Jarayonda
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(process.started_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCompleteDrobilka(process)}
                            className="text-xs"
                          >
                            <CheckCircle size={12} className="mr-1" />
                            Yakunlash
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {completedDrobilkaProcesses.map((process) => (
                    <tr
                      key={process.id}
                      className="hover:bg-gray-50 transition-colors bg-green-50"
                    >
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-[120px] lg:max-w-[200px]">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScrapTypeColor(
                              process.drobilka_type
                            )}`}
                          >
                            {process.drobilka_type_display}
                          </span>
                        </div>
                        <div className="lg:hidden mt-1">
                          <span className="text-sm font-medium">
                            {process.output_quantity} KG
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {process.work_center_name}
                          </span>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-700">
                            Kirish: {process.input_quantity} KG
                          </span>
                          <span className="text-xs text-green-700 font-medium">
                            Chiqish: {process.output_quantity} KG
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {process.lead_operator_name}
                          </span>
                          <span className="text-xs text-gray-500 md:hidden mt-1">
                            {process.operators_details.length} operator
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="text-xs text-green-600 font-medium">
                            Yakunlangan
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(process.completed_at!)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-lg mt-4">
            Ma'lumotlar yuklanmoqda...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Xatolik: {error}</p>
          <button
            onClick={async () => {
              try {
                await Promise.all([
                  fetchScraps(),
                  fetchDrobilkaProcesses(),
                  getCurrentTotals()
                ]);
              } catch (error) {
                console.error("Error retrying data fetch:", error);
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {activeTab === "scraps" && filteredScraps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Qayta ishlash uchun tayyor braklar topilmadi.
              </p>
            </div>
          )}
          {activeTab === "processes" && activeDrobilkaProcesses.length === 0 && completedDrobilkaProcesses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Drobilka jarayonlari topilmadi.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <StartRecyclingBatchModal
        open={startBatchModalOpen}
        onClose={() => setStartBatchModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <StartDrobilkaModal
        open={startDrobilkaModalOpen}
        onClose={() => setStartDrobilkaModalOpen(false)}
        onSuccess={handleModalSuccess}
        drobilkaType={selectedDrobilkaType}
        availableQuantity={selectedDrobilkaType === "HARD" ? totalHardQuantity : totalSoftQuantity}
        recyclingBatchId={currentBatch?.id}
      />

      <CompleteDrobilkaModal
        open={completeDrobilkaModalOpen}
        onClose={() => setCompleteDrobilkaModalOpen(false)}
        onSuccess={handleModalSuccess}
        drobilkaProcess={selectedDrobilkaProcess}
      />

      <CompleteRecyclingBatchModal
        open={completeBatchModalOpen}
        onClose={() => setCompleteBatchModalOpen(false)}
        onSuccess={handleModalSuccess}
        batch={currentBatch}
      />
    </div>
  );
}
