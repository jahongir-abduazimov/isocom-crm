import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Settings,
  Activity,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductionStore } from "@/store/production.store";
import { useWorkerStore } from "@/store/worker.store";
import { STATUS_MAPPINGS } from "@/config/api.config";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useTranslation } from "@/hooks/useTranslation";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    selectedOrder,
    loading,
    error,
    fetchOrderById,
    deleteOrder,
    setSelectedOrder,
  } = useProductionStore();

  const { operators, fetchOperators } = useWorkerStore();

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
    // Fetch operators for displaying operator information
    fetchOperators();

    return () => {
      setSelectedOrder(null);
    };
  }, [id, fetchOrderById, setSelectedOrder, fetchOperators]);

  const formatStatus = (status: string) => {
    return (
      STATUS_MAPPINGS.ORDER_STATUS[
      status.toUpperCase() as keyof typeof STATUS_MAPPINGS.ORDER_STATUS
      ] || status
    );
  };

  const formatUnitOfMeasure = (unit: string) => {
    return (
      STATUS_MAPPINGS.UNIT_OF_MEASURE[
      unit as keyof typeof STATUS_MAPPINGS.UNIT_OF_MEASURE
      ] || unit
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("production.orderDetail.notAvailable");
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Helper function to get operator details by ID
  const getOperatorById = (operatorId: string) => {
    return operators.find((operator) => operator.id === operatorId);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (id) {
      try {
        await deleteOrder(id);
        setDeleteModalOpen(false);
        navigate("/production/orders");
      } catch (error) {
        console.error("Failed to delete order:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t("production.orderDetail.loadingOrder")}</span>
      </div>
    );
  }

  if (error || !selectedOrder) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t("production.orderDetail.orderNotFound")}</h1>
        <p className="text-gray-600 mb-6">
          {error || t("production.orderDetail.orderNotFoundDesc")}
        </p>
        <Button onClick={() => navigate("/production/orders")}>
          {t("production.orderDetail.backToOrders")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/production/orders")}
            className="flex items-center gap-2 w-fit"
          >
            <ArrowLeft size={16} />
            {t("production.orderDetail.backToOrders")}
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {t("production.orderDetail.title")}
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              {t("production.orderDetail.orderNumber")} #{selectedOrder.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/production/orders/${selectedOrder.id}/edit`)
            }
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Edit size={16} />
            {t("production.orderDetail.editOrder")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteClick}
            className="flex items-center gap-2 w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
            {t("production.orderDetail.delete")}
          </Button>
        </div>
      </div>

      {/* Order Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedOrder.produced_product_name || t("production.orderDetail.notAvailable")}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedOrder.description}
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
                  <p className="text-sm text-gray-600">{t("production.orderDetail.quantity")}</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.produced_quantity}{" "}
                    {formatUnitOfMeasure(selectedOrder.unit_of_measure)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">{t("production.orderDetail.progress")}</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.completion_percentage}%
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("production.orderDetail.completionProgress")}</span>
                <span className="font-medium text-gray-900">
                  {selectedOrder.completion_percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${selectedOrder.completion_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{t("production.orderDetail.timeline")}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">{t("production.orderDetail.startDate")}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedOrder.start_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">{t("production.orderDetail.completionDate")}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedOrder.completion_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">{t("production.orderDetail.created")}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operators Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t("production.orderDetail.assignedOperators")}
            </h3>
          </div>
          {selectedOrder.operators && selectedOrder.operators.length > 0 ? (
            <div className="space-y-3">
              {selectedOrder.operators.map((operatorId, index) => {
                const operator = getOperatorById(operatorId);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {(operator &&
                            `${operator.first_name} ${operator.last_name}`.trim()) ||
                            operator?.username}
                        </span>
                        {operator && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {operator.role}
                          </span>
                        )}
                      </div>
                      {operator && (
                        <div className="mt-1 text-xs text-gray-600">
                          {operator.email}
                          {operator.work_center && (
                            <span className="ml-2">
                              • {operator.work_center}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">{t("production.orderDetail.noOperatorsAssigned")}</p>
          )}
        </div>

        {/* Current Step Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t("production.orderDetail.currentStep")}
            </h3>
          </div>
          {selectedOrder.current_step ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedOrder.current_step.production_step_name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedOrder.current_step.status
                    )}`}
                  >
                    {getStatusIcon(selectedOrder.current_step.status)}
                    {formatStatus(selectedOrder.current_step.status)}
                  </span>
                </div>
                {selectedOrder.current_step.assigned_operator && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-3 w-3" />
                    <span>
                      {(() => {
                        const operator = getOperatorById(selectedOrder.current_step.assigned_operator);
                        return (
                          operator?.first_name && operator?.last_name
                            ? `${operator.first_name} ${operator.last_name}`.trim()
                            : operator?.username || selectedOrder.current_step.assigned_operator_name
                        );
                      })()}
                    </span>
                  </div>
                )}
                {selectedOrder.current_step.work_center && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{selectedOrder.current_step.work_center}</span>
                  </div>
                )}
                {selectedOrder.current_step.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Notes: </span>
                    {selectedOrder.current_step.notes}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">{t("production.orderDetail.noCurrentStep")}</p>
          )}
        </div>
      </div>

      {/* Used Materials Section */}
      {selectedOrder.used_materials &&
        selectedOrder.used_materials.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t("production.orderDetail.usedMaterials")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">
                      {t("production.orderDetail.material")}
                    </th>
                    <th className="text-left py-2 font-medium text-gray-700">
                      {t("production.orderDetail.quantity")}
                    </th>
                    <th className="text-left py-2 font-medium text-gray-700">
                      {t("production.orderDetail.available")}
                    </th>
                    <th className="text-left py-2 font-medium text-gray-700">
                      {t("production.orderDetail.workCenter")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.used_materials.map((material) => (
                    <tr key={material.id} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">
                        {material.material_name}
                      </td>
                      <td className="py-3 text-gray-600">
                        {material.quantity}
                      </td>
                      <td className="py-3 text-gray-600">
                        {material.available_quantity}
                      </td>
                      <td className="py-3 text-gray-600">
                        {material.workcenter_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Step Executions Section */}
      {selectedOrder.step_executions &&
        selectedOrder.step_executions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t("production.orderDetail.productionSteps")}
              </h3>
            </div>
            <div className="space-y-4">
              {selectedOrder.step_executions.map((step, index) => (
                <div
                  key={step.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {step.production_step_name}
                        </h4>
                        {step.assigned_operator && (
                          <p className="text-sm text-gray-600">
                            {t("production.orderDetail.operator")}:{" "}
                            {(() => {
                              const operator = getOperatorById(step.assigned_operator);
                              return (
                                operator?.first_name && operator?.last_name
                                  ? `${operator.first_name} ${operator.last_name}`.trim()
                                  : operator?.username || step.assigned_operator_name
                              );
                            })()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        step.status
                      )}`}
                    >
                      {getStatusIcon(step.status)}
                      {formatStatus(step.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {step.start_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">{t("production.orderDetail.startTime")}</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(step.start_time)}
                          </p>
                        </div>
                      </div>
                    )}
                    {step.end_time && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">{t("production.orderDetail.endTime")}</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(step.end_time)}
                          </p>
                        </div>
                      </div>
                    )}
                    {step.actual_duration_hours && (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">{t("production.orderDetail.duration")}</p>
                          <p className="font-medium text-gray-900">
                            {step.actual_duration_hours}h
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(step.notes || step.quality_notes) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {step.notes && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 font-medium">
                            {t("production.orderDetail.notes")}:
                          </p>
                          <p className="text-sm text-gray-800">{step.notes}</p>
                        </div>
                      )}
                      {step.quality_notes && (
                        <div>
                          <p className="text-sm text-gray-600 font-medium">
                            {t("production.orderDetail.qualityNotes")}:
                          </p>
                          <p className="text-sm text-gray-800">
                            {step.quality_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title={t("production.orderDetail.deleteOrder")}
        description={t("production.orderDetail.deleteConfirm")}
        confirmText={t("production.orderDetail.deleteButton")}
        cancelText={t("production.orderDetail.cancelButton")}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
