import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmModal from "@/components/ui/confirm-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProductionService,
  type ProductionOutput,
} from "@/services/production.service";
import { STATUS_MAPPINGS } from "@/config/api.config";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProductionOutputsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [outputs, setOutputs] = useState<ProductionOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [outputToDelete, setOutputToDelete] = useState<ProductionOutput | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // Fetch production outputs from API
  useEffect(() => {
    const fetchOutputs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ProductionService.getProductionOutputs();
        setOutputs(response.results);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch production outputs"
        );
        console.error("Error fetching production outputs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutputs();
  }, []);

  // Handle delete confirmation
  const handleDeleteClick = (output: ProductionOutput) => {
    setOutputToDelete(output);
    setDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!outputToDelete) return;

    try {
      setDeleting(true);
      await ProductionService.deleteProductionOutput(outputToDelete.id);

      // Remove the deleted output from the state
      setOutputs((prev) =>
        prev.filter((output) => output.id !== outputToDelete.id)
      );

      // Close modal and reset state
      setDeleteModalOpen(false);
      setOutputToDelete(null);
    } catch (err) {
      console.error("Error deleting production output:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete production output"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setOutputToDelete(null);
  };

  const filteredOutputs = outputs.filter((output) => {
    const matchesSearch =
      output.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      output.step_execution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      output.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      output.quality_status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "passed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("production.outputs.title")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => navigate("/production/outputs/add")}
        >
          <Plus size={20} />
          {t("production.outputs.newOutput")}
        </Button>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("production.outputs.totalOutputs")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {outputs.length}
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
                <p className="text-sm font-medium text-gray-600">{t("production.outputs.passed")}</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {outputs.filter((o) => o.quality_status === "PASSED").length}
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
                <p className="text-sm font-medium text-gray-600">{t("production.outputs.failed")}</p>
                <p className="text-xl lg:text-2xl font-bold text-red-600">
                  {outputs.filter((o) => o.quality_status === "FAILED").length}
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
                  {t("production.outputs.totalWeight")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-purple-600">
                  {outputs
                    .reduce((acc, output) => acc + parseFloat(output.weight), 0)
                    .toFixed(1)}{" "}
                  kg
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-purple-100 rounded-full">
                <Eye size={20} className="text-purple-600 lg:w-6 lg:h-6" />
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
                  placeholder={t("production.outputs.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder={t("production.outputs.allQualityStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("production.outputs.allQualityStatus")}</SelectItem>
                  <SelectItem value="passed">{t("production.outputs.passed")}</SelectItem>
                  <SelectItem value="failed">{t("production.outputs.failed")}</SelectItem>
                  <SelectItem value="pending">{t("production.outputs.pending")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Outputs Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.outputs.id")}
                  </th>
                  <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.outputs.stepExecution")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.outputs.product")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.outputs.quantity")}
                  </th>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.outputs.unit")}
                  </th>
                  <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.outputs.weight")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.outputs.qualityStatus")}
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.outputs.notes")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.outputs.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOutputs.map((output) => (
                  <tr key={output.id} className="hover:bg-gray-50">
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {output.id.slice(0, 8)}...
                    </td>
                    <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {output.step_execution.slice(0, 8)}...
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px] truncate">
                        {output.product_name}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{output.quantity}</span>
                        <span className="text-xs text-gray-500 lg:hidden">
                          {STATUS_MAPPINGS.UNIT_OF_MEASURE[
                            output.unit_of_measure as keyof typeof STATUS_MAPPINGS.UNIT_OF_MEASURE
                          ] || output.unit_of_measure}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {STATUS_MAPPINGS.UNIT_OF_MEASURE[
                        output.unit_of_measure as keyof typeof STATUS_MAPPINGS.UNIT_OF_MEASURE
                      ] || output.unit_of_measure}
                    </td>
                    <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {output.weight} kg
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(
                          output.quality_status
                        )}`}
                      >
                        {STATUS_MAPPINGS.QUALITY_STATUS[
                          output.quality_status as keyof typeof STATUS_MAPPINGS.QUALITY_STATUS
                        ] || output.quality_status}
                      </span>
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {output.notes || "-"}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3"
                          onClick={() =>
                            navigate(`/production/outputs/${output.id}/edit`)
                          }
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(output)}
                        >
                          <Trash2 size={14} />
                        </Button>
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
            {t("production.outputs.loadingOutputs")}
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{t("production.outputs.loadingError")}: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            {t("production.outputs.retry")}
          </Button>
        </div>
      )}

      {!loading && !error && filteredOutputs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("production.outputs.noOutputsFound")}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title={t("production.outputs.deleteOutput")}
        description={t("production.outputs.deleteConfirm")}
        confirmText={deleting ? t("production.outputs.deleteButton") + "..." : t("production.outputs.deleteButton")}
        cancelText={t("production.outputs.cancelButton")}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
