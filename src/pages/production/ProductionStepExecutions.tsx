import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmModal from "@/components/ui/confirm-modal";
import {
  ProductionService,
  type ProductionStepExecution,
} from "@/services/production.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import { STATUS_MAPPINGS } from "@/config/api.config";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProductionStepExecutionsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [executions, setExecutions] = useState<ProductionStepExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] =
    useState<ProductionStepExecution | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStepExecutions();
  }, []);

  const fetchStepExecutions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductionService.getAllStepExecutions();
      setExecutions(response.results);
    } catch (err) {
      setError("Failed to fetch step executions");
      console.error("Error fetching step executions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExecution = (execution: ProductionStepExecution) => {
    setExecutionToDelete(execution);
    setDeleteModalOpen(true);
  };

  const confirmDeleteExecution = async () => {
    if (!executionToDelete) return;

    try {
      setDeleting(true);
      await ProductionService.deleteStepExecution(executionToDelete.id);

      // Remove the deleted execution from the local state
      setExecutions((prevExecutions) =>
        prevExecutions.filter(
          (execution) => execution.id !== executionToDelete.id
        )
      );

      notifySuccess(t("production.stepExecutions.deleteExecution"));
      setDeleteModalOpen(false);
      setExecutionToDelete(null);
    } catch (err) {
      console.error("Error deleting step execution:", err);
      notifyError(t("production.stepExecutions.deleteExecution"));
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setExecutionToDelete(null);
  };

  const filteredExecutions = executions.filter((execution) => {
    const matchesSearch =
      execution.production_step_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (execution.assigned_operator_name &&
        execution.assigned_operator_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      execution.order.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (execution.notes &&
        execution.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatusFilter =
      filterStatus === "all" || execution.status === filterStatus;
    return matchesSearch && matchesStatusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "SKIPPED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle size={16} className="text-green-600" />;
      case "IN_PROGRESS":
        return <Clock size={16} className="text-blue-600" />;
      case "PENDING":
        return <AlertCircle size={16} className="text-yellow-600" />;
      case "FAILED":
        return <XCircle size={16} className="text-red-600" />;
      case "SKIPPED":
        return <XCircle size={16} className="text-gray-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return t("production.stepExecutions.notStarted");
    return new Date(dateTime).toLocaleString();
  };

  const formatDuration = (durationHours: string | null) => {
    if (!durationHours) return t("production.stepExecutions.notSpecified");
    const hours = parseFloat(durationHours);
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    return `${hours}h`;
  };

  const getStatusDisplayName = (status: string) => {
    return (
      STATUS_MAPPINGS.STEP_STATUS[
      status as keyof typeof STATUS_MAPPINGS.STEP_STATUS
      ] || status
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("production.stepExecutions.title")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => navigate("/production/step-executions/add")}
        >
          <Plus size={20} />
          {t("production.stepExecutions.newExecution")}
        </Button>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("production.stepExecutions.totalExecutions")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {executions.length}
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
                <p className="text-sm font-medium text-gray-600">{t("production.stepExecutions.completed")}</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {executions.filter((e) => e.status === "COMPLETED").length}
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
                <p className="text-sm font-medium text-gray-600">{t("production.stepExecutions.inProgress")}</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">
                  {executions.filter((e) => e.status === "IN_PROGRESS").length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-100 rounded-full">
                <Clock size={20} className="text-blue-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("production.stepExecutions.pending")}</p>
                <p className="text-xl lg:text-2xl font-bold text-yellow-600">
                  {executions.filter((e) => e.status === "PENDING").length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-yellow-100 rounded-full">
                <AlertCircle
                  size={20}
                  className="text-yellow-600 lg:w-6 lg:h-6"
                />
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
                  placeholder={t("production.stepExecutions.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder={t("production.stepExecutions.allStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("production.stepExecutions.allStatus")}</SelectItem>
                  <SelectItem value="PENDING">{t("production.stepExecutions.pending")}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t("production.stepExecutions.inProgress")}</SelectItem>
                  <SelectItem value="COMPLETED">{t("production.stepExecutions.completed")}</SelectItem>
                  <SelectItem value="FAILED">{t("production.stepExecutions.failed")}</SelectItem>
                  <SelectItem value="SKIPPED">{t("production.stepExecutions.skipped")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Executions Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.stepExecutions.stepName")}
                  </th>
                  <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.stepExecutions.orderId")}
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.stepExecutions.operator")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.stepExecutions.startTime")}
                  </th>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.stepExecutions.endTime")}
                  </th>
                  <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.stepExecutions.duration")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.stepExecutions.status")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.stepExecutions.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExecutions.map((execution) => (
                  <tr key={execution.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px] truncate">
                        {execution.production_step_name}
                      </div>
                      <div className="lg:hidden mt-1">
                        <span className="text-xs text-gray-500">
                          Order: {execution.order.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-[120px] truncate">
                        {execution.order.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {execution.assigned_operator_name || t("production.stepExecutions.unassigned")}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatDateTime(execution.start_time)}
                        </span>
                        <span className="text-xs text-gray-500 md:hidden">
                          {getStatusDisplayName(execution.status)}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(execution.end_time)}
                    </td>
                    <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(execution.actual_duration_hours)}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            execution.status
                          )}`}
                        >
                          {getStatusDisplayName(execution.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3"
                          onClick={() =>
                            navigate(
                              `/production/step-executions/${execution.id}/edit`
                            )
                          }
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteExecution(execution)}
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
            {t("production.stepExecutions.loadingExecutions")}
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{t("production.stepExecutions.loadingError")}: {error}</p>
          <Button
            onClick={fetchStepExecutions}
            className="mt-4"
            variant="outline"
          >
            {t("production.stepExecutions.retry")}
          </Button>
        </div>
      )}

      {!loading && !error && filteredExecutions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("production.stepExecutions.noExecutionsFound")}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title={t("production.stepExecutions.deleteExecution")}
        description={t("production.stepExecutions.deleteConfirm")}
        confirmText={deleting ? t("production.stepExecutions.deleteButton") + "..." : t("production.stepExecutions.deleteButton")}
        cancelText={t("production.stepExecutions.cancelButton")}
        onConfirm={confirmDeleteExecution}
        onCancel={cancelDelete}
      />
    </div>
  );
}
