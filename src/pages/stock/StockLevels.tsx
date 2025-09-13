import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
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
import { stockService, type StockLevel } from "@/services/stock.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import { useMaterialsStore } from "@/store/materials.store";
import { useLocationsStore } from "@/store/locations.store";
import { useProductsStore } from "@/store/products.store";
import { useStockStore } from "@/store/stock.store";

export default function StockLevelsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockLevel | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Get materials, products, and locations from stores
  const { materials, fetchMaterials } = useMaterialsStore();
  const { products, fetchProducts } = useProductsStore();
  const { locations, fetchLocations } = useLocationsStore();
  const { deleteStockLevel } = useStockStore();

  useEffect(() => {
    fetchStockLevels();
    fetchMaterials();
    fetchProducts();
    fetchLocations();
  }, []);

  const fetchStockLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await stockService.getStockLevels();
      setStockLevels(response.results);
    } catch (err) {
      setError("Failed to fetch stock levels");
      console.error("Error fetching stock levels:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (item: StockLevel) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      const success = await deleteStockLevel(itemToDelete.id);

      if (success) {
        // Remove from local state as well
        setStockLevels((prevItems) =>
          prevItems.filter((item) => item.id !== itemToDelete.id)
        );

        notifySuccess("Stock level deleted successfully");
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } else {
        notifyError("Failed to delete stock level");
      }
    } catch (err) {
      console.error("Error deleting stock level:", err);
      notifyError(
        err instanceof Error ? err.message : "Failed to delete stock level"
      );
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Helper functions to get names from IDs
  const getMaterialName = (materialId: string | null) => {
    if (!materialId) return "Unknown";
    const material = materials.find((m) => m.id === materialId);
    return material ? material.name : materialId;
  };

  const getProductName = (productId: string | null) => {
    if (!productId) return "Unknown";
    const product = products.find((p) => p.id === productId);
    return product ? product.name : productId;
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find((l) => l.id === locationId);
    return location ? location.name : locationId;
  };

  const filteredStockLevels = stockLevels.filter((item) => {
    const materialName = getMaterialName(item.material);
    const productName = getProductName(item.product);
    const locationName = getLocationName(item.location);

    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTypeFilter =
      filterType === "all" ||
      (filterType === "material" && item.material !== null) ||
      (filterType === "product" && item.product !== null);

    return matchesSearch && matchesTypeFilter;
  });

  const getItemType = (item: StockLevel) => {
    return item.material ? "Material" : "Product";
  };

  const getItemTypeColor = (item: StockLevel) => {
    return item.material
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  const formatQuantity = (quantity: string) => {
    const num = parseFloat(quantity);
    return num.toLocaleString();
  };

  const getStockStatus = (quantity: string) => {
    const num = parseFloat(quantity);
    if (num === 0) return "OUT_OF_STOCK";
    if (num < 50) return "LOW";
    if (num > 1000) return "HIGH";
    return "NORMAL";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800";
      case "LOW":
        return "bg-yellow-100 text-yellow-800";
      case "NORMAL":
        return "bg-green-100 text-green-800";
      case "HIGH":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return <AlertTriangle size={16} className="text-red-600" />;
      case "LOW":
        return <TrendingDown size={16} className="text-yellow-600" />;
      case "NORMAL":
        return <CheckCircle size={16} className="text-green-600" />;
      case "HIGH":
        return <TrendingUp size={16} className="text-blue-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  // Calculate summary statistics
  const totalItems = stockLevels.length;
  const materialItems = stockLevels.filter(
    (item) => item.material !== null
  ).length;
  const productItems = stockLevels.filter(
    (item) => item.product !== null
  ).length;
  const totalQuantity = stockLevels.reduce(
    (sum, item) => sum + parseFloat(item.quantity),
    0
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Stock Levels
          </h1>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => navigate("/stock/stock-levels/add")}
        >
          <Plus size={20} />
          New Movement
        </Button>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {totalItems}
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
                <p className="text-sm font-medium text-gray-600">Materials</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {materialItems}
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
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-xl lg:text-2xl font-bold text-purple-600">
                  {productItems}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-purple-100 rounded-full">
                <Package size={20} className="text-purple-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Quantity
                </p>
                <p className="text-xl lg:text-2xl font-bold text-orange-600">
                  {totalQuantity.toLocaleString()}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-orange-100 rounded-full">
                <TrendingUp
                  size={20}
                  className="text-orange-600 lg:w-6 lg:h-6"
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
                  placeholder="Search stock levels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="material">Materials</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Stock Levels Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStockLevels.map((item) => {
                  const status = getStockStatus(item.quantity);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-[120px] lg:max-w-[200px] truncate">
                          {item.material
                            ? getMaterialName(item.material)
                            : item.product
                            ? getProductName(item.product)
                            : "Unknown Item"}
                        </div>
                        <div className="lg:hidden mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getItemTypeColor(
                              item
                            )}`}
                          >
                            {getItemType(item)}
                          </span>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getItemTypeColor(
                            item
                          )}`}
                        >
                          {getItemType(item)}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatQuantity(item.quantity)}
                          </span>
                          <span className="text-xs text-gray-500 md:hidden">
                            {status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              status
                            )}`}
                          >
                            {status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div
                          className="truncate"
                          title={getLocationName(item.location)}
                        >
                          {getLocationName(item.location)}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1 lg:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs lg:text-sm px-2 lg:px-3"
                            onClick={() =>
                              navigate(`/stock/stock-levels/${item.id}/edit`)
                            }
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-lg mt-4">Loading stock levels...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error: {error}</p>
          <Button onClick={fetchStockLevels} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && filteredStockLevels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No stock levels found matching your criteria.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Stock Level"
        description={`Are you sure you want to delete this stock level? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDeleteItem}
        onCancel={cancelDelete}
      />
    </div>
  );
}
