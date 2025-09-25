import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Factory,
  Plus,
  Search,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Filter,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useWorkcentersStore } from "@/store/workcenters.store";
import { useLocationsStore } from "@/store/locations.store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const WorkcentersPage = () => {
  // Use Zustand store
  const { workcenters, loading, error, fetchWorkcenters, deleteWorkcenter } =
    useWorkcentersStore();
  const { locations, fetchLocations } = useLocationsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const filteredWorkcenters = workcenters.filter((w) => {
    // Search filter
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.type && w.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.location &&
        w.location.toLowerCase().includes(searchTerm.toLowerCase()));

    // Location filter
    const matchesLocation =
      locationFilter === "all" ||
      (locationFilter === "no-location" && !w.location) ||
      w.location === locationFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && w.is_active) ||
      (statusFilter === "inactive" && !w.is_active);

    // Type filter
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "no-type" && !w.type) ||
      (w.type && w.type.toLowerCase() === typeFilter.toLowerCase());

    return matchesSearch && matchesLocation && matchesStatus && matchesType;
  });

  useEffect(() => {
    fetchWorkcenters();
    fetchLocations();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteWorkcenter(deleteId);
      setModalOpen(false);
      setDeleteId(null);
    }
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.name : locationId;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("all");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  // Get unique types from workcenters
  const uniqueTypes = Array.from(
    new Set(workcenters.map((w) => w.type).filter(Boolean))
  ).sort();

  // Calculate statistics
  const totalWorkcenters = workcenters.length;
  const activeWorkcenters = workcenters.filter((w) => w.is_active).length;
  const inactiveWorkcenters = workcenters.filter((w) => !w.is_active).length;

  // Calculate maintenance due (workcenters that haven't been maintained in the last 30 days)
  // const thirtyDaysAgo = new Date();
  // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  // const maintenanceDue = workcenters.filter((w) => {
  //   if (!w.last_maintenance_date) return true; // No maintenance date means due
  //   return new Date(w.last_maintenance_date) < thirtyDaysAgo;
  // }).length;

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("workcenters.title")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => navigate("/workcenters/add")}
        >
          <Plus size={20} />
          {t("workcenters.newWorkcenter")}
        </Button>
      </div>

      {/* Statistics Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Workcenters Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("workcenters.totalWorkcenters")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalWorkcenters}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Factory className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Workcenters Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("workcenters.activeWorkcenters")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeWorkcenters}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Inactive Workcenters Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("workcenters.inactiveWorkcenters")}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {inactiveWorkcenters}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Maintenance Due Card */}
          {/* <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Texnik Xizmat Kerak
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {maintenanceDue}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div> */}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder={t("workcenters.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X size={16} />
              {t("workcenters.clearFilters")}
            </Button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {t("workcenters.filtering")}
              </span>
            </div>

            {/* Location Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                {t("workcenters.location")}:
              </label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("workcenters.selectLocation")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("workcenters.allLocations")}</SelectItem>
                  <SelectItem value="no-location">{t("workcenters.noLocation")}</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                {t("workcenters.status")}:
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("workcenters.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("workcenters.allStatuses")}</SelectItem>
                  <SelectItem value="active">{t("workcenters.active")}</SelectItem>
                  <SelectItem value="inactive">{t("workcenters.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                {t("workcenters.type")}:
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("workcenters.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("workcenters.allTypes")}</SelectItem>
                  <SelectItem value="no-type">{t("workcenters.noType")}</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">{t("workcenters.loadingWorkcenters")}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t("workcenters.loadingError")}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={modalOpen}
        title={t("workcenters.deleteWorkcenter")}
        description={t("workcenters.deleteConfirm")}
        confirmText={t("workcenters.deleteButton")}
        cancelText={t("workcenters.cancelButton")}
        onConfirm={handleDelete}
        onCancel={() => {
          setModalOpen(false);
          setDeleteId(null);
        }}
      />

      {/* Workcenters Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("workcenters.workcenterName")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("workcenters.type")}
                  </th>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("workcenters.location")}
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("workcenters.capacity")}
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("workcenters.lastMaintenance")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("workcenters.status")}
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("workcenters.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkcenters.map((workcenter) => (
                  <tr key={workcenter.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Factory size={16} className="text-gray-400" />
                        <div className="max-w-[120px] lg:max-w-[200px] truncate">
                          {workcenter.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workcenter.type || "-"}
                    </td>
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workcenter.location
                        ? getLocationName(workcenter.location)
                        : "-"}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workcenter.capacity_per_hour
                        ? `${workcenter.capacity_per_hour} ${workcenter.capacity_unit || ""
                        }`
                        : "-"}
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workcenter.last_maintenance_date
                        ? new Date(
                          workcenter.last_maintenance_date
                        ).toLocaleDateString("uz-UZ")
                        : "-"}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${workcenter.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {workcenter.is_active ? t("workcenters.active") : t("workcenters.inactive")}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3"
                          onClick={() =>
                            navigate(`/workcenters/${workcenter.id}/edit`)
                          }
                        >
                          <Edit size={14} className="mr-1" />
                          {t("workcenters.editButton")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setDeleteId(workcenter.id);
                            setModalOpen(true);
                          }}
                        >
                          <Trash2 size={14} className="mr-1" />
                          {t("workcenters.deleteButtonAction")}
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

      {!loading && !error && filteredWorkcenters.length === 0 && (
        <div className="text-center py-12">
          <Factory size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            {t("workcenters.noWorkcentersFound")}
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkcentersPage;
