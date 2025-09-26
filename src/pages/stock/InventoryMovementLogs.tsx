import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
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
import { stockService, type InventoryMovement } from "@/services/stock.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import { useMaterialsStore } from "@/store/materials.store";
import { useLocationsStore } from "@/store/locations.store";
import { useProductsStore } from "@/store/products.store";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/hooks/useTranslation";

export default function InventoryMovementLogsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] =
    useState<InventoryMovement | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Get materials, locations, and products from stores
  const { materials, fetchMaterials } = useMaterialsStore();
  const { locations, fetchLocations } = useLocationsStore();
  const { products, fetchProducts } = useProductsStore();
  const { user, selectedOperator } = useAuthStore();

  // Check user roles
  const isOperator = user?.role === "WORKER" || user?.is_operator;
  const isSuperAdmin = user?.is_superuser || false;

  useEffect(() => {
    fetchInventoryMovements();
    fetchMaterials();
    fetchLocations();
    fetchProducts();
  }, [selectedOperator]); // Refetch when selectedOperator changes

  const fetchInventoryMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Starting to fetch inventory movements...");

      // Determine which user ID to filter by based on role
      let userIdToFilter: string | undefined;

      if (isSuperAdmin) {
        // Superadmin can see all movements, no filtering
        userIdToFilter = undefined;
      } else if (isOperator && selectedOperator) {
        // Operator sees only movements for the selected operator
        userIdToFilter = selectedOperator.id;
      } else if (user) {
        // Regular user sees only their own movements
        userIdToFilter = user.id;
      }

      console.log("Filtering by user ID:", userIdToFilter);

      const response = await stockService.getInventoryMovements({
        userId: userIdToFilter
      });
      console.log("Received response:", response);
      setMovements(response.results);
      console.log("Set movements:", response.results);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("inventoryMovements.fetchError");
      setError(errorMessage);
      console.error("Error fetching inventory movements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovement = (movement: InventoryMovement) => {
    setMovementToDelete(movement);
    setDeleteModalOpen(true);
  };

  const confirmDeleteMovement = async () => {
    if (!movementToDelete) return;

    try {
      setDeleting(true);
      await stockService.deleteInventoryMovement(movementToDelete.id);

      // Remove the deleted movement from the local state
      setMovements((prevMovements) =>
        prevMovements.filter((movement) => movement.id !== movementToDelete.id)
      );

      notifySuccess(t("inventoryMovements.deleteSuccess"));
      setDeleteModalOpen(false);
      setMovementToDelete(null);
    } catch (err) {
      console.error("Error deleting inventory movement:", err);
      notifyError(t("inventoryMovements.deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setMovementToDelete(null);
  };

  // Helper functions to get names from IDs
  const getMaterialName = (materialId: string | null) => {
    if (!materialId) return t("inventoryMovements.unknown");
    const material = materials.find((m) => m.id === materialId);
    return material ? material.name : materialId;
  };

  const getProductName = (productId: string | null) => {
    if (!productId) return t("inventoryMovements.unknown");
    const product = products.find((p) => p.id === productId);
    return product ? product.name : productId;
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find((l) => l.id === locationId);
    return location ? location.name : locationId;
  };

  const filteredMovements = movements.filter((movement) => {
    const materialName = getMaterialName(movement.material);
    const productName = getProductName(movement.product);
    const fromLocationName = getLocationName(movement.from_location);
    const toLocationName = getLocationName(movement.to_location);

    const matchesSearch =
      materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.quantity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fromLocationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toLocationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTypeFilter =
      filterType === "all" ||
      (filterType === "material" && movement.material !== null) ||
      (filterType === "product" && movement.product !== null);

    return matchesSearch && matchesTypeFilter;
  });

  const getMovementTypeColor = (movement: InventoryMovement) => {
    if (movement.material !== null) {
      return "bg-blue-100 text-blue-800";
    } else if (movement.product !== null) {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getMovementTypeLabel = (movement: InventoryMovement) => {
    if (movement.material !== null) {
      return t("inventoryMovements.material");
    } else if (movement.product !== null) {
      return t("inventoryMovements.product");
    }
    return t("inventoryMovements.unknown");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("inventoryMovements.title")}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => navigate("/stock/inventory-movement-logs/add")}
        >
          <Plus size={20} />
          {t("inventoryMovements.addMovement")}
        </Button>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t("inventoryMovements.totalMovements")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {movements.length}
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
                  {t("inventoryMovements.materialMovements")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">
                  {movements.filter((m) => m.material !== null).length}
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
                  {t("inventoryMovements.productMovements")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {movements.filter((m) => m.product !== null).length}
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
                  {t("inventoryMovements.totalQuantity")}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-purple-600">
                  {movements
                    .reduce((acc, movement) => {
                      return acc + parseFloat(movement.quantity);
                    }, 0)
                    .toFixed(0)}
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
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder={t("inventoryMovements.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:min-w-[140px]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:min-w-[140px]">
                  <SelectValue placeholder={t("inventoryMovements.filterAll")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("inventoryMovements.filterAll")}</SelectItem>
                  <SelectItem value="material">{t("inventoryMovements.filterMaterial")}</SelectItem>
                  <SelectItem value="product">{t("inventoryMovements.filterProduct")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Movements Table - Desktop */}
      {!loading && !error && (
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className={`overflow-x-auto w-full ${isOperator ? 'max-w-full' : 'max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]'}`}>
            <table className={`w-full ${isOperator ? 'max-w-full' : 'max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]'} overflow-x-auto`}>
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventoryMovements.element")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventoryMovements.type")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventoryMovements.quantity")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventoryMovements.fromLocation")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventoryMovements.toLocation")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventoryMovements.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[200px] truncate">
                        {movement.material
                          ? getMaterialName(movement.material)
                          : getProductName(movement.product)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeColor(
                          movement
                        )}`}
                      >
                        {getMovementTypeLabel(movement)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">{movement.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div
                        className="truncate"
                        title={getLocationName(movement.from_location)}
                      >
                        {getLocationName(movement.from_location)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium">
                        {getLocationName(movement.to_location)}
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
                              `/stock/inventory-movement-logs/${movement.id}/edit`
                            )
                          }
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteMovement(movement)}
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

      {/* Movements Cards - Mobile */}
      {!loading && !error && (
        <div className="lg:hidden space-y-4">
          {filteredMovements.map((movement) => (
            <div key={movement.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="space-y-3">
                {/* Element Name and Type */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {movement.material
                        ? getMaterialName(movement.material)
                        : getProductName(movement.product)}
                    </h3>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeColor(
                          movement
                        )}`}
                      >
                        {getMovementTypeLabel(movement)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("inventoryMovements.quantity")}</h4>
                    <p className="text-sm text-gray-600">
                      {movement.quantity}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("inventoryMovements.date")}</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(movement.created_at)}
                    </p>
                  </div>
                </div>

                {/* Locations */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("inventoryMovements.fromLocation")}</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {getLocationName(movement.from_location)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-xs">{t("inventoryMovements.toLocation")}</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {getLocationName(movement.to_location)}
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
                      navigate(
                        `/stock/inventory-movement-logs/${movement.id}/edit`
                      )
                    }
                  >
                    <Edit size={12} className="mr-1" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteMovement(movement)}
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
            {t("inventoryMovements.movementsLoading")}
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{t("common.error")}: {error}</p>
          <p className="text-gray-500 text-sm mt-2">
            {t("inventoryMovements.errorDetails")}
          </p>
          <Button
            onClick={fetchInventoryMovements}
            className="mt-4"
            variant="outline"
          >
            {t("inventoryMovements.retry")}
          </Button>
        </div>
      )}

      {!loading && !error && filteredMovements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t("inventoryMovements.noMovementsFound")}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title={t("inventoryMovements.deleteMovement")}
        description={t("inventoryMovements.deleteConfirmation")}
        confirmText={deleting ? t("inventoryMovements.deleting") : t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={confirmDeleteMovement}
        onCancel={cancelDelete}
      />
    </div>
  );
}
