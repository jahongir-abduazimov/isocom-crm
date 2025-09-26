import { useState, useEffect } from "react";
import { Plus, Search, Loader2, Trash2, Edit, CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductionStore } from "@/store/production.store";
import { STATUS_MAPPINGS } from "@/config/api.config";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useTranslation } from "@/hooks/useTranslation";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { orders, loading, error, fetchOrders, deleteOrder } = useProductionStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.produced_product_name &&
        order.produced_product_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete);
        setDeleteModalOpen(false);
        setOrderToDelete(null);
        // Optionally show success message
      } catch (error) {
        console.error("Failed to delete order:", error);
        // Error is already handled in the store
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("production.orders.title")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto"
          onClick={() => navigate("/production/orders/add")}
        >
          <Plus size={20} />
          {t("production.orders.newOrder")}
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder={t("production.orders.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 w-full sm:w-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:min-w-[140px]">
                <SelectValue placeholder={t("production.orders.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("production.orders.allStatuses")}</SelectItem>
                <SelectItem value="pending">{t("production.orders.pending")}</SelectItem>
                <SelectItem value="in_progress">{t("production.orders.inProgress")}</SelectItem>
                <SelectItem value="completed">{t("production.orders.completed")}</SelectItem>
                <SelectItem value="cancelled">{t("production.orders.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">{t("production.orders.loadingOrders")}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t("production.orders.loadingError")}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => navigate(`/production/orders/${order.id}`)}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {order.produced_product_name || "N/A"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("production.orders.orderNumber", { orderId: order.id.slice(0, 8) + "..." })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                {/* Quantity and Unit */}
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">{t("production.orders.quantity")}</span>
                    <p className="text-sm font-medium text-gray-900">
                      {order.produced_quantity} {formatUnitOfMeasure(order.unit_of_measure)}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t("production.orders.progress")}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {order.completion_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${order.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">{t("production.orders.startDate")}</span>
                      <p className="text-sm text-gray-900">
                        {formatDate(order.start_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {order.description && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {order.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 sm:px-3 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/production/orders/${order.id}/edit`);
                      }}
                    >
                      <Edit size={12} className="sm:mr-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 sm:px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(order.id);
                      }}
                    >
                      <Trash2 size={12} className="sm:mr-1" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-700 w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/production/orders/${order.id}`);
                    }}
                  >
                    {t("production.orders.viewDetails")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("production.orders.noOrdersFound")}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title={t("production.orders.deleteOrder")}
        description={t("production.orders.deleteConfirm")}
        confirmText={t("production.orders.deleteButton")}
        cancelText={t("production.orders.cancelButton")}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
