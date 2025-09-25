import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocationsStore } from "@/store/locations.store";
import { useWarehousesStore } from "@/store/warehouses.store";
import { useWorkcentersStore } from "@/store/workcenters.store";
import { LocationsService } from "@/services/locations.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useTranslation } from "@/hooks/useTranslation";

export default function LocationsPage() {
  const navigate = useNavigate();
  const { locations, loading, error, fetchLocations, removeLocation } = useLocationsStore();
  const { warehouses, fetchWarehouses } = useWarehousesStore();
  const { workcenters, fetchWorkcenters } = useWorkcentersStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchLocations();
    fetchWarehouses();
    fetchWorkcenters();
  }, [fetchLocations, fetchWarehouses, fetchWorkcenters]);

  const handleDelete = async () => {
    if (!locationToDelete) return;

    try {
      setDeleting(true);
      await LocationsService.deleteLocation(locationToDelete);
      removeLocation(locationToDelete);
      notifySuccess(t("warehouse.locationDeleted"));
      setShowDeleteModal(false);
      setLocationToDelete(null);
    } catch (error: any) {
      notifyError(error?.response?.data?.detail || t("warehouse.locationNotDeleted"));
    } finally {
      setDeleting(false);
    }
  };

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.location_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatusFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && location.is_active) ||
      (filterStatus === "inactive" && !location.is_active);
    const matchesTypeFilter =
      filterType === "all" || location.location_type === filterType;
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case "WAREHOUSE":
        return "bg-blue-100 text-blue-800";
      case "WORKCENTER":
        return "bg-green-100 text-green-800";
      case "WORKSHOP":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case "WAREHOUSE":
        return t("warehouse.warehouse");
      case "WORKCENTER":
        return t("warehouse.workCenter");
      case "WORKSHOP":
        return t("warehouse.workshop");
      default:
        return type;
    }
  };

  const getWarehouseName = (warehouseId: string | null) => {
    if (!warehouseId) return "-";
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    return warehouse ? warehouse.name : warehouseId;
  };

  const getWorkCenterName = (workCenterId: string | null) => {
    if (!workCenterId) return "-";
    const workCenter = workcenters.find((wc) => wc.id === workCenterId);
    return workCenter ? workCenter.name : workCenterId;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("warehouse.locations")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => navigate("/warehouse/locations/add")}
        >
          <Plus size={20} />
          {t("warehouse.newLocation")}
        </Button>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("warehouse.totalLocations")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {locations.length}
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
                  {t("warehouse.activeLocations")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {locations.filter((l) => l.is_active).length}
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
                <p className="text-sm font-medium text-gray-600">{t("warehouse.warehouses")}</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">
                  {
                    locations.filter((l) => l.location_type === "WAREHOUSE")
                      .length
                  }
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
                  {t("warehouse.workCenters")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {
                    locations.filter((l) => l.location_type === "WORKCENTER")
                      .length
                  }
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
                  placeholder={t("warehouse.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder={t("warehouse.allStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("warehouse.allStatus")}</SelectItem>
                  <SelectItem value="active">{t("warehouse.active")}</SelectItem>
                  <SelectItem value="inactive">{t("warehouse.inactive")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder={t("warehouse.allTypes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("warehouse.allTypes")}</SelectItem>
                  <SelectItem value="WAREHOUSE">{t("warehouse.warehouse")}</SelectItem>
                  <SelectItem value="WORKCENTER">{t("warehouse.workCenter")}</SelectItem>
                  <SelectItem value="WORKSHOP">{t("warehouse.workshop")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Locations Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.name")}
                  </th>
                  <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.type")}
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.warehouse")}
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.workCenter")}
                  </th>
                  <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.created")}
                  </th>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.status")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("warehouse.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px] truncate">
                        {location.name}
                      </div>
                      <div className="lg:hidden mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLocationTypeColor(
                            location.location_type
                          )}`}
                        >
                          {getLocationTypeLabel(location.location_type)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {location.is_active ? t("warehouse.active") : t("warehouse.inactive")}
                        </span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLocationTypeColor(
                          location.location_type
                        )}`}
                      >
                        {location.location_type}
                      </span>
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {getWarehouseName(location.warehouse)}
                      </div>
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {getWorkCenterName(location.work_center)}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(location.created_at).toLocaleDateString()}
                    </td>
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${location.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {location.is_active ? t("warehouse.active") : t("warehouse.inactive")}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3"
                          onClick={() =>
                            navigate(`/warehouse/locations/${location.id}/edit`)
                          }
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setLocationToDelete(location.id);
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

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-lg mt-4">{t("warehouse.loadingLocations")}</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{t("warehouse.error")}: {error}</p>
          <Button onClick={fetchLocations} className="mt-4" variant="outline">
            {t("warehouse.retry")}
          </Button>
        </div>
      )}

      {!loading && !error && filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("warehouse.noLocationsFound")}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title={t("warehouse.deleteLocation")}
        description={t("warehouse.deleteConfirm")}
        confirmText={deleting ? t("warehouse.deleting") : t("warehouse.deleteButtonAction")}
        cancelText={t("warehouse.cancelButton")}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setLocationToDelete(null);
        }}
      />
    </div>
  );
}
