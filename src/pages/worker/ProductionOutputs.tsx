import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  Eye,
  Plus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
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
import {
  ProductionService,
  type ProductionOutput,
  type ProductionStepExecution,
} from "@/services/production.service";
import { useAuthStore } from "@/store/auth.store";
import ConfirmModal from "@/components/ui/confirm-modal";

export default function WorkerProductionOutputsPage() {
  const navigate = useNavigate();
  const { selectedOperator } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [outputs, setOutputs] = useState<ProductionOutput[]>([]);
  const [stepExecutions, setStepExecutions] = useState<
    Record<string, ProductionStepExecution>
  >({});
  const [loading, setLoading] = useState(true);

  // Delete states
  const [deleteOutput, setDeleteOutput] = useState<ProductionOutput | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch production outputs from API
  useEffect(() => {
    const fetchProductionOutputs = async () => {
      try {
        setLoading(true);
        const response = await ProductionService.getProductionOutputs();
        setOutputs(response.results);

        // Fetch step execution details for each output
        const stepExecutionMap: Record<string, ProductionStepExecution> = {};

        for (const output of response.results) {
          try {
            const stepExecution = await ProductionService.getStepExecutionById(
              output.step_execution
            );
            stepExecutionMap[output.step_execution] = stepExecution;
          } catch (error) {
            console.error(
              `Error fetching step execution ${output.step_execution}:`,
              error
            );
            // Fallback data if API fails
            stepExecutionMap[output.step_execution] = {
              id: output.step_execution,
              order: output.order_id || "",
              production_step: "",
              production_step_name: `Step ${output.step_execution.slice(0, 8)}`,
              status: "COMPLETED",
              assigned_operator: output.operator || null,
              assigned_operator_name: output.operator_name || null,
              operators: output.operator ? [output.operator] : [],
              operators_count: output.operator ? 1 : 0,
              operators_names: output.operator_name ? [output.operator_name] : [],
              work_center: null,
              work_center_name: null,
              start_time: null,
              end_time: null,
              actual_duration_hours: null,
              notes: null,
              quality_notes: null,
              quantity_processed: "0",
            };
          }
        }

        setStepExecutions(stepExecutionMap);
      } catch (error) {
        console.error("Error fetching production outputs:", error);
        setError("Ishlab chiqarish natijalarini yuklashda xato yuz berdi");
        // Set empty array if API fails
        setOutputs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductionOutputs();
  }, []);

  const filteredOutputs = outputs.filter((output) => {
    // Filter by selected operator first
    const matchesOperator =
      !selectedOperator || output.operator === selectedOperator.id;

    const matchesSearch =
      output.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      output.step_execution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      output?.order_description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      output?.order_product_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (output.notes &&
        output.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterStatus === "all" ||
      output.quality_status.toLowerCase() === filterStatus.toLowerCase();
    return matchesOperator && matchesSearch && matchesFilter;
  });

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "passed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "passed":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatQualityStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case "PASSED":
        return "O'tdi";
      case "FAILED":
        return "O'tmadi";
      case "PENDING":
        return "Kutilmoqda";
      default:
        return status;
    }
  };

  // Delete functionality
  const handleDelete = async () => {
    if (!deleteOutput) return;

    try {
      setDeleteLoading(true);
      await ProductionService.deleteProductionOutput(deleteOutput.id);

      // Update local state
      setOutputs(prev => prev.filter(output => output.id !== deleteOutput.id));
      setDeleteOutput(null);
    } catch (error) {
      console.error("Error deleting production output:", error);
      // You could add a toast notification here for better UX
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Ishlab chiqarish natijalari yuklanmoqda...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/worker")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Ishlab chiqarish natijalari
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Ishlab chiqarish natijalarini ko'rish va boshqarish
            </p>
          </div>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => navigate("/worker/production-outputs/add")}
        >
          <Plus size={20} />
          Yangi natija
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900 mb-1">
                Xato
              </h4>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Sahifani qayta yuklash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operator Info */}
      {!selectedOperator && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-1">
                Operator tanlanmagan
              </h4>
              <p className="text-sm text-yellow-700">
                Ishlab chiqarish natijalarini ko'rish uchun avval operator
                tanlang.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Jami natijalar
              </p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {filteredOutputs.length}
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
              <p className="text-sm font-medium text-gray-600">O'tgan</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">
                {
                  filteredOutputs.filter((o) => o.quality_status === "PASSED")
                    .length
                }
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-green-100 rounded-full">
              <CheckCircle size={20} className="text-green-600 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">O'tmagan</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">
                {
                  filteredOutputs.filter((o) => o.quality_status === "FAILED")
                    .length
                }
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-red-100 rounded-full">
              <XCircle size={20} className="text-red-600 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jami og'irlik</p>
              <p className="text-xl lg:text-2xl font-bold text-purple-600">
                {filteredOutputs
                  .reduce((acc, output) => acc + parseFloat(output.weight), 0)
                  .toFixed(1)}{" "}
                kg
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-purple-100 rounded-full">
              <Package size={20} className="text-purple-600 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Mahsulot, qadam yoki order bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="min-w-[140px]">
                <SelectValue placeholder="Barcha holatlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="passed">O'tgan</SelectItem>
                <SelectItem value="failed">O'tmagan</SelectItem>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Outputs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full overflow-x-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qadam
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahsulot
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miqdor
                </th>
                <th className="hidden lg:table-cell px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Og'irlik
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sifat holati
                </th>
                <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Izohlar
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOutputs.map((output) => (
                <tr key={output.id} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-[120px] truncate">
                      {stepExecutions[output.step_execution]
                        ?.production_step_name ||
                        `Step ${output.step_execution.slice(0, 8)}`}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-[120px] lg:max-w-[200px] truncate">
                      {output.product_name}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-[120px] truncate">
                      {output.order_description || output.order_product_name}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">
                      {output.quantity} {output.unit_of_measure}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {output.weight} kg
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(
                        output.quality_status
                      )}`}
                    >
                      {getQualityIcon(output.quality_status)}
                      {formatQualityStatus(output.quality_status)}
                    </span>
                  </td>
                  <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {output.notes || "-"}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/worker/production-outputs/${output.id}/edit`)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteOutput(output)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOutputs.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Natijalar topilmadi
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== "all"
              ? "Qidiruv shartlariga mos natijalar yo'q"
              : "Hozircha ishlab chiqarish natijalari mavjud emas"}
          </p>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Ma'lumot</h4>
            <p className="text-sm text-blue-700">
              Bu sahifada ishlab chiqarish natijalarini ko'rishingiz mumkin.
              Yangi natija qo'shish uchun "Yangi natija" tugmasini bosing. Sifat
              holati: O'tgan (yashil), O'tmagan (qizil), Kutilmoqda (sariq).
              Tahrirlash va o'chirish uchun har bir qatorning oxiridagi tugmalardan foydalaning.
            </p>
          </div>
        </div>
      </div>


      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteOutput}
        title="Ishlab chiqarish natijasini o'chirish"
        description={`"${deleteOutput?.product_name}" mahsulotining ishlab chiqarish natijasini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        confirmText={deleteLoading ? "O'chirilmoqda..." : "O'chirish"}
        cancelText="Bekor qilish"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOutput(null)}
      />
    </div>
  );
}
