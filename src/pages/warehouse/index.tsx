import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWarehousesStore } from "@/store/warehouses.store";
import { WarehouseService } from "@/services/warehouse.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useTranslation } from "@/hooks/useTranslation";

// Updated to match actual API data structure

export default function WarehousesPage() {
  const navigate = useNavigate();
  const { warehouses, loading, error, fetchWarehouses, removeWarehouse } =
    useWarehousesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<string | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleDelete = async () => {
    if (!warehouseToDelete) return;

    try {
      setDeleting(true);
      await WarehouseService.deleteWarehouse(warehouseToDelete);
      removeWarehouse(warehouseToDelete);
      notifySuccess(t("warehouse.warehouses.warehouseDeleted"));
      setShowDeleteModal(false);
      setWarehouseToDelete(null);
    } catch (error: any) {
      notifyError(
        error?.response?.data?.detail || t("warehouse.warehouses.warehouseNotDeleted")
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesSearch =
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (warehouse.description &&
        warehouse.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatusFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && warehouse.is_active) ||
      (filterStatus === "inactive" && !warehouse.is_active);
    return matchesSearch && matchesStatusFilter;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("warehouse.warehouses.title")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => navigate("/warehouse/warehouses/add")}
        >
          <Plus size={20} />
          {t("warehouse.warehouses.newWarehouse")}
        </Button>
      </div>

      {/* Filters and Search */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder={t("warehouse.warehouses.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 w-full sm:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:min-w-[140px]">
                  <SelectValue placeholder={t("warehouse.warehouses.allStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("warehouse.warehouses.allStatus")}</SelectItem>
                  <SelectItem value="active">{t("warehouse.warehouses.active")}</SelectItem>
                  <SelectItem value="inactive">{t("warehouse.warehouses.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Warehouses Table - Desktop */}
      {!loading && !error && (
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.warehouses.name")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.warehouses.description")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.warehouses.created")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.warehouses.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.warehouses.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[200px] truncate">
                        {warehouse.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div
                        className="truncate"
                        title={warehouse.description || t("warehouse.warehouses.noDescription")}
                      >
                        {warehouse.description || t("warehouse.warehouses.noDescription")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(warehouse.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${warehouse.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {warehouse.is_active ? t("warehouse.warehouses.active") : t("warehouse.warehouses.inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-3"
                          onClick={() =>
                            navigate(
                              `/warehouse/warehouses/${warehouse.id}/edit`
                            )
                          }
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setWarehouseToDelete(warehouse.id);
                            setShowDeleteModal(true);
                          }}
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

      {/* Warehouses Cards - Mobile */}
      {!loading && !error && (
        <div className="lg:hidden space-y-4">
          {filteredWarehouses.map((warehouse) => (
            <div key={warehouse.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="space-y-3">
                {/* Warehouse Name and Status */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {warehouse.name}
                    </h3>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${warehouse.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {warehouse.is_active ? t("warehouse.warehouses.active") : t("warehouse.warehouses.inactive")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {warehouse.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("warehouse.warehouses.description")}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {warehouse.description}
                    </p>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <h4 className="font-medium text-gray-900 text-xs">{t("warehouse.warehouses.created")}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(warehouse.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() =>
                      navigate(`/warehouse/warehouses/${warehouse.id}/edit`)
                    }
                  >
                    <Edit size={12} className="mr-1" />
                    {t("warehouse.warehouses.editButton")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs text-red-600 hover:text-red-700"
                    onClick={() => {
                      setWarehouseToDelete(warehouse.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={12} className="mr-1" />
                    {t("warehouse.warehouses.deleteButtonAction")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-lg mt-4">{t("warehouse.warehouses.loadingWarehouses")}</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{t("warehouse.warehouses.error")}: {error}</p>
          <Button onClick={fetchWarehouses} className="mt-4" variant="outline">
            {t("warehouse.warehouses.retry")}
          </Button>
        </div>
      )}

      {!loading && !error && filteredWarehouses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("warehouse.warehouses.noWarehousesFound")}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title={t("warehouse.warehouses.deleteWarehouse")}
        description={t("warehouse.warehouses.deleteConfirm")}
        confirmText={deleting ? t("warehouse.warehouses.deleting") : t("warehouse.warehouses.deleteButtonAction")}
        cancelText={t("warehouse.warehouses.cancelButton")}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setWarehouseToDelete(null);
        }}
      />
    </div>
  );
}
