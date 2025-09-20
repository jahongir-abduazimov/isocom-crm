import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
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
import { type Scrap } from "@/services/scrap.service";
import { type Recycling } from "@/services/recycling.service";
import ScrapDetailsModal from "@/components/ui/scrap-details-modal";
import RecyclingDetailsModal from "@/components/ui/recycling-details-modal";

export default function OperatorReprocessingPage() {
  const {
    scraps,
    loading: scrapsLoading,
    error: scrapsError,
    fetchScraps,
  } = useScrapStore();
  const {
    recyclings,
    loading: recyclingsLoading,
    error: recyclingsError,
    fetchRecyclings,
  } = useRecyclingStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterScrapType, setFilterScrapType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterReason, setFilterReason] = useState("all");
  const [activeTab, setActiveTab] = useState<"pending" | "reprocessed">(
    "pending"
  );

  const [selectedScrap, setSelectedScrap] = useState<Scrap | null>(null);
  const [selectedRecycling, setSelectedRecycling] = useState<Recycling | null>(
    null
  );
  const [scrapModalOpen, setScrapModalOpen] = useState(false);
  const [recyclingModalOpen, setRecyclingModalOpen] = useState(false);

  useEffect(() => {
    fetchScraps();
    fetchRecyclings();
  }, [fetchScraps, fetchRecyclings]);

  // Filter scraps for reprocessing (only PENDING and CONFIRMED)
  const availableScraps = scraps.filter(
    (scrap) => scrap.status === "PENDING" || scrap.status === "CONFIRMED"
  );

  const filteredScraps = availableScraps.filter((scrap) => {
    const matchesSearch =
      scrap.scrap_type_display
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      scrap.reason_display.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scrap.reported_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scrap.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScrapTypeFilter =
      filterScrapType === "all" || scrap.scrap_type === filterScrapType;

    const matchesStatusFilter =
      filterStatus === "all" || scrap.status === filterStatus;

    const matchesReasonFilter =
      filterReason === "all" || scrap.reason === filterReason;

    return (
      matchesSearch &&
      matchesScrapTypeFilter &&
      matchesStatusFilter &&
      matchesReasonFilter
    );
  });

  const filteredRecyclings = recyclings.filter((recycling) => {
    const matchesSearch =
      recycling.scrap_details.scrap_type_display
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      recycling.scrap_details.reason_display
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      recycling.recycled_by_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      recycling.scrap_details.notes
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      recycling.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScrapTypeFilter =
      filterScrapType === "all" ||
      recycling.scrap_details.scrap_type === filterScrapType;

    const matchesReasonFilter =
      filterReason === "all" || recycling.scrap_details.reason === filterReason;

    return matchesSearch && matchesScrapTypeFilter && matchesReasonFilter;
  });

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
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "RECYCLED":
        return "bg-blue-100 text-blue-800";
      case "WRITTEN_OFF":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "MATERIAL_DEFECT":
        return "bg-red-100 text-red-800";
      case "MACHINE_ERROR":
        return "bg-orange-100 text-orange-800";
      case "OPERATOR_ERROR":
        return "bg-purple-100 text-purple-800";
      case "QUALITY_ISSUE":
        return "bg-yellow-100 text-yellow-800";
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
  const uniqueScrapTypes = [
    ...new Set([
      ...availableScraps.map((scrap) => scrap.scrap_type),
      ...recyclings.map((r) => r.scrap_details.scrap_type),
    ]),
  ];
  const uniqueStatuses = [
    ...new Set(availableScraps.map((scrap) => scrap.status)),
  ];
  const uniqueReasons = [
    ...new Set([
      ...availableScraps.map((scrap) => scrap.reason),
      ...recyclings.map((r) => r.scrap_details.reason),
    ]),
  ];

  const handleScrapRowClick = (scrap: Scrap) => {
    setSelectedScrap(scrap);
    setScrapModalOpen(true);
  };

  const handleRecyclingRowClick = (recycling: Recycling) => {
    setSelectedRecycling(recycling);
    setRecyclingModalOpen(true);
  };

  const handleCloseScrapModal = () => {
    setScrapModalOpen(false);
    setSelectedScrap(null);
  };

  const handleCloseRecyclingModal = () => {
    setRecyclingModalOpen(false);
    setSelectedRecycling(null);
  };

  const handleReprocessScrap = (scrap: Scrap) => {
    // TODO: Implement reprocessing functionality
    console.log("Reprocess scrap:", scrap);
  };

  const loading = scrapsLoading || recyclingsLoading;
  const error = scrapsError || recyclingsError;

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
                <p className="text-sm font-medium text-gray-600">Kutilmoqda</p>
                <p className="text-xl lg:text-2xl font-bold text-orange-600">
                  {availableScraps.filter((s) => s.status === "PENDING").length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-orange-100 rounded-full">
                <AlertCircle
                  size={20}
                  className="text-orange-600 lg:w-6 lg:h-6"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tasdiqlangan
                </p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {
                    availableScraps.filter((s) => s.status === "CONFIRMED")
                      .length
                  }
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-green-100 rounded-full">
                <CheckCircle
                  size={20}
                  className="text-green-600 lg:w-6 lg:h-6"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Qayta Ishlangan
                </p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">
                  {recyclings.length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-100 rounded-full">
                <RefreshCw size={20} className="text-blue-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package size={16} />
                Qayta Ishlash Uchun Tayyor ({availableScraps.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("reprocessed")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reprocessed"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw size={16} />
                Qayta Ishlangan ({recyclings.length})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Filters and Search */}
      {!loading && !error && (
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
                    activeTab === "pending"
                      ? "Qayta ishlash uchun tayyor braklar bo'yicha qidiruv..."
                      : "Qayta ishlangan braklar bo'yicha qidiruv..."
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
              {activeTab === "pending" && (
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
                          : status === "CONFIRMED"
                          ? "Tasdiqlangan"
                          : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="Sabab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha sabablar</SelectItem>
                  {uniqueReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason === "MATERIAL_DEFECT"
                        ? "Material nuqsoni"
                        : reason === "MACHINE_ERROR"
                        ? "Mashina xatosi"
                        : reason === "OPERATOR_ERROR"
                        ? "Operator xatosi"
                        : reason === "QUALITY_ISSUE"
                        ? "Sifat muammosi"
                        : reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {activeTab === "pending" ? (
            // Pending scraps table
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
                      Xabar beruvchi
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
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
                            {scrap.scrap_type_display}
                          </span>
                        </div>
                        <div className="lg:hidden mt-1">
                          <span className="text-sm font-medium">
                            {scrap.quantity} {scrap.unit_of_measure}
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {scrap.quantity} {scrap.unit_of_measure}
                          </span>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${getReasonColor(
                              scrap.reason
                            )}`}
                          >
                            {scrap.reason_display}
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
                            {scrap.status_display}
                          </span>
                          <span className="text-xs text-gray-500 md:hidden mt-1">
                            {scrap.reported_by_name}
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {scrap.reported_by_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScrapRowClick(scrap)}
                            className="text-xs"
                          >
                            <Eye size={12} className="mr-1" />
                            Ko'rish
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReprocessScrap(scrap)}
                            className="text-xs"
                          >
                            <RefreshCw size={12} className="mr-1" />
                            Qayta Ishlash
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Reprocessed recyclings table
            <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
              <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brak turi
                    </th>
                    <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qayta Ishlandi
                    </th>
                    <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sabab
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qayta Ishlagan
                    </th>
                    <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qayta Ishlandi vaqt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecyclings.map((recycling) => (
                    <tr
                      key={recycling.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRecyclingRowClick(recycling)}
                    >
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-[120px] lg:max-w-[200px]">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScrapTypeColor(
                              recycling.scrap_details.scrap_type
                            )}`}
                          >
                            {recycling.scrap_details.scrap_type_display}
                          </span>
                        </div>
                        <div className="lg:hidden mt-1">
                          <span className="text-sm font-medium">
                            {recycling.recycled_quantity}{" "}
                            {recycling.scrap_details.unit_of_measure}
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {recycling.recycled_quantity}{" "}
                            {recycling.scrap_details.unit_of_measure}
                          </span>
                          <span className="text-xs text-gray-500">
                            Asl: {recycling.scrap_details.quantity}{" "}
                            {recycling.scrap_details.unit_of_measure}
                          </span>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${getReasonColor(
                              recycling.scrap_details.reason
                            )}`}
                          >
                            {recycling.scrap_details.reason_display}
                          </span>
                          {recycling.notes && (
                            <div
                              className="truncate text-xs text-gray-500"
                              title={recycling.notes}
                            >
                              {recycling.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {recycling.recycled_by_name || "Noma'lum"}
                          </span>
                          <span className="text-xs text-gray-500 md:hidden mt-1">
                            {formatDate(recycling.recycled_at)}
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatDate(recycling.recycled_at)}
                          </span>
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
            onClick={() => {
              fetchScraps();
              fetchRecyclings();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {activeTab === "pending" && filteredScraps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Qayta ishlash uchun tayyor braklar topilmadi.
              </p>
            </div>
          )}
          {activeTab === "reprocessed" && filteredRecyclings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Qayta ishlangan braklar topilmadi.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ScrapDetailsModal
        open={scrapModalOpen}
        onClose={handleCloseScrapModal}
        scrap={selectedScrap}
      />
      <RecyclingDetailsModal
        open={recyclingModalOpen}
        onClose={handleCloseRecyclingModal}
        recycling={selectedRecycling}
      />
    </div>
  );
}
