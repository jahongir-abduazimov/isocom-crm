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
import {
  ProductionService,
  type ProductionStep,
} from "@/services/production.service";
import { notifySuccess, notifyError } from "@/lib/notification";

export default function ProductionStepsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStepType, setFilterStepType] = useState("all");
  const [steps, setSteps] = useState<ProductionStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<ProductionStep | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProductionSteps();
  }, []);

  const fetchProductionSteps = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductionService.getProductionSteps();
      setSteps(response.results);
    } catch (err) {
      setError("Failed to fetch production steps");
      console.error("Error fetching production steps:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStep = (step: ProductionStep) => {
    setStepToDelete(step);
    setDeleteModalOpen(true);
  };

  const confirmDeleteStep = async () => {
    if (!stepToDelete) return;

    try {
      setDeleting(true);
      await ProductionService.deleteProductionStep(stepToDelete.id);

      // Remove the deleted step from the local state
      setSteps((prevSteps) =>
        prevSteps.filter((step) => step.id !== stepToDelete.id)
      );

      notifySuccess("Production step deleted successfully");
      setDeleteModalOpen(false);
      setStepToDelete(null);
    } catch (err) {
      console.error("Error deleting production step:", err);
      notifyError("Failed to delete production step");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setStepToDelete(null);
  };

  const filteredSteps = steps.filter((step) => {
    const matchesSearch =
      step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (step.description &&
        step.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      step.step_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatusFilter =
      filterStatus === "all" ||
      (filterStatus === "required" && step.is_required) ||
      (filterStatus === "optional" && !step.is_required);
    const matchesStepTypeFilter =
      filterStepType === "all" || step.step_type === filterStepType;
    return matchesSearch && matchesStatusFilter && matchesStepTypeFilter;
  });

  const getStepTypeColor = (stepType: string) => {
    switch (stepType) {
      case "EXTRUSION":
        return "bg-blue-100 text-blue-800";
      case "DEGASSING":
        return "bg-purple-100 text-purple-800";
      case "LAMINATION":
        return "bg-green-100 text-green-800";
      case "BRONZING":
        return "bg-yellow-100 text-yellow-800";
      case "DUPLICATION":
        return "bg-orange-100 text-orange-800";
      case "PACKAGING":
        return "bg-pink-100 text-pink-800";
      case "QUALITY_CONTROL":
        return "bg-red-100 text-red-800";
      case "WAREHOUSE_TRANSFER":
        return "bg-indigo-100 text-indigo-800";
      case "CUSTOMER_DELIVERY":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (durationHours: string | null) => {
    if (!durationHours) return "Not specified";
    const hours = parseFloat(durationHours);
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    return `${hours}h`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Production Steps
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Define and manage production workflow steps
          </p>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => navigate("/production/steps/add")}
        >
          <Plus size={20} />
          New Step
        </Button>
      </div>

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Steps</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {steps.length}
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
                  Required Steps
                </p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">
                  {steps.filter((s) => s.is_required).length}
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
                  Optional Steps
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-600">
                  {steps.filter((s) => !s.is_required).length}
                </p>
              </div>
              <div className="p-2 lg:p-3 bg-gray-100 rounded-full">
                <Eye size={20} className="text-gray-600 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Duration
                </p>
                <p className="text-xl lg:text-2xl font-bold text-purple-600">
                  {steps.length > 0
                    ? Math.round(
                        steps.reduce((acc, step) => {
                          const duration = step.duration_hours
                            ? parseFloat(step.duration_hours)
                            : 0;
                          return acc + duration;
                        }, 0) / steps.length
                      )
                    : 0}
                  h
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
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Search steps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="All Steps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Steps</SelectItem>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStepType} onValueChange={setFilterStepType}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="EXTRUSION">Extrusion</SelectItem>
                  <SelectItem value="DEGASSING">Degassing</SelectItem>
                  <SelectItem value="LAMINATION">Lamination</SelectItem>
                  <SelectItem value="BRONZING">Bronzing</SelectItem>
                  <SelectItem value="DUPLICATION">Duplication</SelectItem>
                  <SelectItem value="PACKAGING">Packaging</SelectItem>
                  <SelectItem value="QUALITY_CONTROL">
                    Quality Control
                  </SelectItem>
                  <SelectItem value="WAREHOUSE_TRANSFER">
                    Warehouse Transfer
                  </SelectItem>
                  <SelectItem value="CUSTOMER_DELIVERY">
                    Customer Delivery
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Steps Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)]">
            <table className="w-full max-w-[calc(100vw-290px)] lg:max-w-[calc(100vw-350px)] overflow-x-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {/* <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th> */}
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Step Name
                  </th>
                  <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Step Type
                  </th>
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required
                  </th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSteps.map((step) => (
                  <tr key={step.id} className="hover:bg-gray-50">
                    {/* <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {step.order_sequence}
                    </td> */}
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-[120px] lg:max-w-[200px] truncate">
                        {step.name}
                      </div>
                      <div className="lg:hidden mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStepTypeColor(
                            step.step_type
                          )}`}
                        >
                          {step.step_type.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStepTypeColor(
                          step.step_type
                        )}`}
                      >
                        {step.step_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="hidden xl:table-cell px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div
                        className="truncate"
                        title={step.description || "No description"}
                      >
                        {step.description || "No description"}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatDuration(step.duration_hours)}
                        </span>
                        <span className="text-xs text-gray-500 md:hidden">
                          {step.is_required ? "Required" : "Optional"}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          step.is_required
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {step.is_required ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1 lg:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3"
                          onClick={() =>
                            navigate(`/production/steps/${step.id}/edit`)
                          }
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs lg:text-sm px-2 lg:px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteStep(step)}
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
            Loading production steps...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Error: {error}</p>
          <Button
            onClick={fetchProductionSteps}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && filteredSteps.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No production steps found matching your criteria.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Production Step"
        description={`Are you sure you want to delete "${stepToDelete?.name}"? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={confirmDeleteStep}
        onCancel={cancelDelete}
      />
    </div>
  );
}
