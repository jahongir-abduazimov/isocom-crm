import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScrapStore } from "@/store/scrap.store";
import { type Scrap } from "@/services/scrap.service";
import ScrapDetailsModal from "@/components/ui/scrap-details-modal";

export default function DefectsPage() {
  const { scraps, loading, error, totalCount, fetchScraps } = useScrapStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScrapType, setFilterScrapType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterReason, setFilterReason] = useState("all");
  const [selectedScrap, setSelectedScrap] = useState<Scrap | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchScraps();
  }, [fetchScraps]);

  const filteredScraps = scraps.filter((scrap) => {
    const matchesSearch =
      scrap.scrap_type
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      scrap.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scrap.recorded_by.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    ...new Set(scraps.map((scrap) => scrap.scrap_type)),
  ];
  const uniqueStatuses = [...new Set(scraps.map((scrap) => scrap.status))];
  const uniqueReasons = [...new Set(scraps.map((scrap) => scrap.reason))];

  const handleRowClick = (scrap: Scrap) => {
    setSelectedScrap(scrap);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedScrap(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Braklar
          </h1>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Jami Braklar
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {totalCount}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-red-100 rounded-full">
                <Eye size={20} className="text-red-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kutilmoqda</p>
                <p className="text-xl lg:text-2xl font-bold text-yellow-600">
                  {scraps.filter((s) => s.status === "PENDING").length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-yellow-100 rounded-full">
                <Eye size={20} className="text-yellow-600 lg:w-6 lg:h-6" />
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
                  {scraps.filter((s) => s.status === "COMPLETED").length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-green-100 rounded-full">
                <Eye size={20} className="text-green-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Qayta ishlangan
                </p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">
                  {scraps.filter((s) => s.status === "IN_PROCESS").length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-100 rounded-full">
                <Eye size={20} className="text-blue-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

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
                  placeholder="Braklar bo'yicha qidiruv..."
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
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha holatlar</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="Sabab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha sabablar</SelectItem>
                  {uniqueReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Scraps Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
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
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xabar berilgan vaqt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredScraps.map((scrap) => (
                  <tr
                    key={scrap.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(scrap)}
                  >
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px]">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScrapTypeColor(
                            scrap.scrap_type
                          )}`}
                        >
                          {scrap.scrap_type}
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
                          {scrap.reason}
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
                          {scrap.status}
                        </span>
                        <span className="text-xs text-gray-500 md:hidden mt-1">
                          {scrap.recorded_by.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {scrap.recorded_by.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatDate(scrap.created_at)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-lg mt-4">Braklar yuklanmoqda...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Xatolik: {error}</p>
          <button
            onClick={() => fetchScraps()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {!loading && !error && filteredScraps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Qidiruv shartlariga mos braklar topilmadi.
          </p>
        </div>
      )}

      {/* Scrap Details Modal */}
      <ScrapDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        scrap={selectedScrap}
      />
    </div>
  );
}
