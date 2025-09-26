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
import { useRecyclingStore } from "@/store/recycling.store";
import { type Recycling } from "@/services/recycling.service";
import RecyclingDetailsModal from "@/components/ui/recycling-details-modal";

export default function ReprocessingPage() {
  const { recyclings, loading, error, totalCount, fetchRecyclings } =
    useRecyclingStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScrapType, setFilterScrapType] = useState("all");
  const [filterReason, setFilterReason] = useState("all");
  const [selectedRecycling, setSelectedRecycling] = useState<Recycling | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchRecyclings();
  }, [fetchRecyclings]);

  const filteredRecyclings = recyclings.filter((recycling) => {
    // Check if scrap_details exists before accessing its properties
    if (!recycling.scrap_details) {
      return false; // Skip items without scrap_details
    }

    const matchesSearch =
      (recycling.scrap_details.scrap_type_display || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (recycling.scrap_details.reason_display || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (recycling.recycled_by_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (recycling.scrap_details.notes || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (recycling.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

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
    ...new Set(
      recyclings
        .filter((recycling) => recycling.scrap_details)
        .map((recycling) => recycling.scrap_details.scrap_type)
    ),
  ];
  const uniqueReasons = [
    ...new Set(
      recyclings
        .filter((recycling) => recycling.scrap_details)
        .map((recycling) => recycling.scrap_details.reason)
    ),
  ];

  const handleRowClick = (recycling: Recycling) => {
    setSelectedRecycling(recycling);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecycling(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Brak Qayta Ishlashlar
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
                  Jami Qayta Ishlashlar
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {totalCount}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-100 rounded-full">
                <Eye size={20} className="text-blue-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Qattiq Braklar
                </p>
                <p className="text-xl lg:text-2xl font-bold text-red-600">
                  {
                    recyclings.filter(
                      (r) => r.scrap_details && r.scrap_details.scrap_type === "HARD"
                    ).length
                  }
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
                <p className="text-sm font-medium text-gray-600">
                  Yumshoq Braklar
                </p>
                <p className="text-xl lg:text-2xl font-bold text-orange-600">
                  {
                    recyclings.filter(
                      (r) => r.scrap_details && r.scrap_details.scrap_type === "SOFT"
                    ).length
                  }
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-orange-100 rounded-full">
                <Eye size={20} className="text-orange-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Jami Qayta Ishlandi
                </p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {recyclings
                    .filter((r) => r.recycled_quantity)
                    .reduce(
                      (sum, r) => sum + parseFloat(r.recycled_quantity),
                      0
                    )
                    .toFixed(2)}{" "}
                  KG
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-green-100 rounded-full">
                <Eye size={20} className="text-green-600 lg:w-6 lg:h-6" />
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
                  placeholder="Qayta ishlashlar bo'yicha qidiruv..."
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
                      {recyclings.find(
                        (r) => r.scrap_details && r.scrap_details.scrap_type === type
                      )?.scrap_details?.scrap_type_display || type}
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
                      {recyclings.find((r) => r.scrap_details && r.scrap_details.reason === reason)
                        ?.scrap_details?.reason_display || reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Recyclings Table */}
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
                    onClick={() => handleRowClick(recycling)}
                  >
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px]">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScrapTypeColor(
                            recycling.scrap_details?.scrap_type || ""
                          )}`}
                        >
                          {recycling.scrap_details?.scrap_type_display || "Noma'lum"}
                        </span>
                      </div>
                      <div className="lg:hidden mt-1">
                        <span className="text-sm font-medium">
                          {recycling.recycled_quantity}{" "}
                          {recycling.scrap_details?.unit_of_measure || ""}
                        </span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {recycling.recycled_quantity}{" "}
                          {recycling.scrap_details?.unit_of_measure || ""}
                        </span>
                        <span className="text-xs text-gray-500">
                          Asl: {recycling.scrap_details?.quantity || "0"}{" "}
                          {recycling.scrap_details?.unit_of_measure || ""}
                        </span>
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${getReasonColor(
                            recycling.scrap_details?.reason || ""
                          )}`}
                        >
                          {recycling.scrap_details?.reason_display || "Noma'lum"}
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
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-lg mt-4">
            Qayta ishlashlar yuklanmoqda...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Xatolik: {error}</p>
          <button
            onClick={fetchRecyclings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {!loading && !error && filteredRecyclings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Qidiruv shartlariga mos qayta ishlashlar topilmadi.
          </p>
        </div>
      )}

      {/* Recycling Details Modal */}
      <RecyclingDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        recycling={selectedRecycling}
      />
    </div>
  );
}
