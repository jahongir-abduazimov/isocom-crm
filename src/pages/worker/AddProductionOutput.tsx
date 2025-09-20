import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProductionService,
  type ProductionStepExecution,
} from "@/services/production.service";
import { STATUS_MAPPINGS } from "@/config/api.config";
import { useAuthStore } from "@/store/auth.store";

export default function WorkerAddProductionOutputPage() {
  const navigate = useNavigate();
  const { selectedOperator } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    step_execution: "",
    product: "",
    unit_of_measure: "",
    quantity: "",
    weight: "",
    notes: "",
  });

  // Available options
  const [stepExecutions, setStepExecutions] = useState<
    ProductionStepExecution[]
  >([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);
        // Fetch step executions and products
        const [stepExecutionsResponse, productsResponse] = await Promise.all([
          ProductionService.getAllStepExecutions(),
          ProductionService.getProducts(),
        ]);

        setStepExecutions(stepExecutionsResponse.results);
        setProducts(productsResponse.results || []);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Ma'lumotlarni yuklashda xato");
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.step_execution ||
      !formData.product ||
      !formData.quantity ||
      !formData.unit_of_measure ||
      !selectedOperator
    ) {
      setError("Barcha majburiy maydonlarni to'ldiring va operator tanlang");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const outputData = {
        ...formData,
        quantity: formData.quantity,
        weight: formData.weight || "0",
        quality_status: "PENDING", // Default quality status
        operator: selectedOperator?.id, // Add operator ID
      };

      await ProductionService.createProductionOutput(outputData);
      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        navigate("/worker/production-outputs");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ishlab chiqarish natijasini yaratishda xato"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Ma'lumotlar yuklanmoqda...</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-green-600">
          Muvaffaqiyatli yaratildi!
        </h1>
        <p className="text-gray-600 mb-6">
          Ishlab chiqarish natijasi muvaffaqiyatli yaratildi.
        </p>
        <Button onClick={() => navigate("/worker/production-outputs")}>
          Natijalar ro'yxatiga qaytish
        </Button>
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
            onClick={() => navigate("/worker/production-outputs")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Yangi ishlab chiqarish natijasi
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Ishlab chiqarish natijasini qo'shish
            </p>
          </div>
        </div>
      </div>

      {/* Selected Operator Info */}
      {/* {selectedOperator && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Tanlangan operator
              </h4>
              <p className="text-sm text-blue-700">
                {selectedOperator.full_name} (
                {selectedOperator.role_display_uz || selectedOperator.role})
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step Execution */}
            <div className="space-y-2">
              <Label htmlFor="step_execution">
                Ishlab chiqarish qadami <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.step_execution}
                onValueChange={(value) =>
                  handleInputChange("step_execution", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Qadamni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {stepExecutions.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.production_step_name} - {step.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label htmlFor="product">
                Mahsulot <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.product}
                onValueChange={(value) => handleInputChange("product", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mahsulotni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name || product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Miqdor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="Miqdor"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
              />
            </div>

            {/* Unit of Measure */}
            <div className="space-y-2">
              <Label htmlFor="unit_of_measure">
                O'lchov birligi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.unit_of_measure}
                onValueChange={(value) =>
                  handleInputChange("unit_of_measure", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="O'lchov birligini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_MAPPINGS.UNIT_OF_MEASURE).map(
                    ([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">Og'irlik (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                placeholder="Og'irlik"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Izohlar</Label>
            <Textarea
              id="notes"
              placeholder="Qo'shimcha ma'lumotlar..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
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
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/worker/production-outputs")}
            >
              Bekor qilish
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Ma'lumot</h4>
            <p className="text-sm text-blue-700">
              Barcha majburiy maydonlarni to'ldiring. Qadam, mahsulot va o'lchov
              birligini ro'yxatdan tanlang. Operator tanlangan bo'lishi kerak.
              Sifat holati avtomatik ravishda "Kutilmoqda" ga o'rnatiladi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
