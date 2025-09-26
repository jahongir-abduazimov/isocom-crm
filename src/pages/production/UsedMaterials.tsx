import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Package, AlertTriangle } from "lucide-react";
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
  type UsedMaterial,
} from "@/services/production.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import { useTranslation } from "@/hooks/useTranslation";

export default function UsedMaterialsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWorkcenter, setFilterWorkcenter] = useState("all");
  const [materials, setMaterials] = useState<UsedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<UsedMaterial | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsedMaterials();
  }, []);

  const fetchUsedMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductionService.getAllUsedMaterials();
      setMaterials(response.results);
    } catch (err) {
      setError("Failed to fetch used materials");
      console.error("Error fetching used materials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = (material: UsedMaterial) => {
    setMaterialToDelete(material);
    setDeleteModalOpen(true);
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;

    try {
      setDeleting(true);
      await ProductionService.deleteUsedMaterial(materialToDelete.id);

      // Remove the deleted material from the local state
      setMaterials((prevMaterials) =>
        prevMaterials.filter((material) => material.id !== materialToDelete.id)
      );

      notifySuccess(t("production.usedMaterials.deleteMaterial"));
      setDeleteModalOpen(false);
      setMaterialToDelete(null);
    } catch (err) {
      console.error("Error deleting used material:", err);
      notifyError(t("production.usedMaterials.deleteMaterial"));
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setMaterialToDelete(null);
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.order.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.workcenter_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkcenterFilter =
      filterWorkcenter === "all" || material.workcenter_name === filterWorkcenter;
    return matchesSearch && matchesWorkcenterFilter;
  });

  const getWorkcenterColor = (workcenter: string) => {
    switch (workcenter) {
      case "Extruder-1":
        return "bg-blue-100 text-blue-800";
      case "Extruder-2":
        return "bg-indigo-100 text-indigo-800";
      case "Laminator-1":
        return "bg-green-100 text-green-800";
      case "Bronzer-1":
        return "bg-yellow-100 text-yellow-800";
      case "Packaging-1":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatQuantity = (quantity: string) => {
    const num = parseFloat(quantity);
    return num.toFixed(2);
  };

  const getUniqueWorkcenters = () => {
    const workcenters = materials.map(m => m.workcenter_name);
    return [...new Set(workcenters)];
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("production.usedMaterials.title")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => navigate("/production/used-materials/add")}
        >
          <Plus size={20} />
          {t("production.usedMaterials.recordUsage")}
        </Button>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("production.usedMaterials.totalRecords")}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {materials.length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-100 rounded-full">
                <Package size={20} className="text-blue-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("production.usedMaterials.totalQuantity")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {materials.reduce((sum, m) => sum + parseFloat(m.quantity), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-green-100 rounded-full">
                <Package size={20} className="text-green-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("production.usedMaterials.workCenters")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-purple-600">
                  {getUniqueWorkcenters().length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-purple-100 rounded-full">
                <Eye size={20} className="text-purple-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("production.usedMaterials.avgQuantity")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-orange-600">
                  {materials.length > 0
                    ? (materials.reduce((sum, m) => sum + parseFloat(m.quantity), 0) / materials.length).toFixed(2)
                    : 0}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-orange-100 rounded-full">
                <AlertTriangle size={20} className="text-orange-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

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
                  placeholder={t("production.usedMaterials.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 w-full sm:w-auto">
              <Select value={filterWorkcenter} onValueChange={setFilterWorkcenter}>
                <SelectTrigger className="w-full sm:min-w-[140px]">
                  <SelectValue placeholder={t("production.usedMaterials.allWorkCenters")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("production.usedMaterials.allWorkCenters")}</SelectItem>
                  {getUniqueWorkcenters().map((workcenter) => (
                    <SelectItem key={workcenter} value={workcenter}>
                      {workcenter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Materials Table - Desktop */}
      {!loading && !error && (
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.usedMaterials.materialName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.usedMaterials.orderId")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.usedMaterials.quantity")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.usedMaterials.available")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.usedMaterials.workCenter")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("production.usedMaterials.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[200px] truncate">
                        {material.material_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-[100px] truncate">
                        {material.order}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">
                        {formatQuantity(material.quantity)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.available_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getWorkcenterColor(
                          material.workcenter_name
                        )}`}
                      >
                        {material.workcenter_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-3"
                          onClick={() =>
                            navigate(`/production/used-materials/${material.id}/edit`)
                          }
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteMaterial(material)}
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

      {/* Materials Cards - Mobile */}
      {!loading && !error && (
        <div className="lg:hidden space-y-4">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="space-y-3">
                {/* Material Name and Work Center */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {material.material_name}
                    </h3>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getWorkcenterColor(
                          material.workcenter_name
                        )}`}
                      >
                        {material.workcenter_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order ID */}
                <div>
                  <h4 className="font-medium text-gray-900 text-xs">{t("production.usedMaterials.orderId")}</h4>
                  <p className="text-sm text-gray-600 truncate">
                    {material.order}
                  </p>
                </div>

                {/* Quantity and Available */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("production.usedMaterials.quantity")}</h4>
                    <p className="text-sm text-gray-600">
                      {formatQuantity(material.quantity)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("production.usedMaterials.available")}</h4>
                    <p className="text-sm text-gray-600">
                      {material.available_quantity}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() =>
                      navigate(`/production/used-materials/${material.id}/edit`)
                    }
                  >
                    <Edit size={12} className="mr-1" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteMaterial(material)}
                  >
                    <Trash2 size={12} className="mr-1" />
                    {t("common.delete")}
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
          <p className="text-gray-500 text-lg mt-4">
            {t("production.usedMaterials.loadingMaterials")}
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{t("production.usedMaterials.loadingError")}: {error}</p>
          <Button
            onClick={fetchUsedMaterials}
            className="mt-4"
            variant="outline"
          >
            {t("production.usedMaterials.retry")}
          </Button>
        </div>
      )}

      {!loading && !error && filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("production.usedMaterials.noMaterialsFound")}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title={t("production.usedMaterials.deleteMaterial")}
        description={t("production.usedMaterials.deleteConfirm")}
        confirmText={deleting ? t("production.usedMaterials.deleteButton") + "..." : t("production.usedMaterials.deleteButton")}
        cancelText={t("production.usedMaterials.cancelButton")}
        onConfirm={confirmDeleteMaterial}
        onCancel={cancelDelete}
      />
    </div>
  );
}
