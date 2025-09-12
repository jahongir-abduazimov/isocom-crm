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

export default function UsedMaterialsPage() {
  const navigate = useNavigate();
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

      notifySuccess("Used material deleted successfully");
      setDeleteModalOpen(false);
      setMaterialToDelete(null);
    } catch (err) {
      console.error("Error deleting used material:", err);
      notifyError("Failed to delete used material");
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Used Materials
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Track materials consumption in production
          </p>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => navigate("/production/used-materials/add")}
        >
          <Plus size={20} />
          Record Usage
        </Button>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
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
                  Total Quantity
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
                  Work Centers
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
                  Avg Quantity
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
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
              <Select value={filterWorkcenter} onValueChange={setFilterWorkcenter}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="All Work Centers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Work Centers</SelectItem>
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

      {/* Materials Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material Name
                  </th>
                  <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Center
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px] truncate">
                        {material.material_name}
                      </div>
                      <div className="lg:hidden mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getWorkcenterColor(
                            material.workcenter_name
                          )}`}
                        >
                          {material.workcenter_name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-[100px] truncate">
                        {material.order}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatQuantity(material.quantity)}
                        </span>
                        <span className="text-xs text-gray-500 md:hidden">
                          Available: {material.available_quantity}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {material.available_quantity}
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getWorkcenterColor(
                          material.workcenter_name
                        )}`}
                      >
                        {material.workcenter_name}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3"
                          onClick={() =>
                            navigate(`/production/used-materials/${material.id}/edit`)
                          }
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-lg mt-4">
            Loading used materials...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error: {error}</p>
          <Button
            onClick={fetchUsedMaterials}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No used materials found matching your criteria.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Used Material"
        description={`Are you sure you want to delete the usage record for "${materialToDelete?.material_name}"? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDeleteMaterial}
        onCancel={cancelDelete}
      />
    </div>
  );
}
