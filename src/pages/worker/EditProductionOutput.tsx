import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { STATUS_MAPPINGS } from "@/config/api.config";
import { useAuthStore } from "@/store/auth.store";

export default function WorkerEditProductionOutputPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedOperator } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    step_execution: "",
    product: "",
    unit_of_measure: "",
    quantity: "",
    weight: "",
    gross_weight: "",
    tare_weight: "",
    uses_spool: false,
    quality_status: "",
    notes: "",
  });

  // Available options
  const [stepExecutions, setStepExecutions] = useState<
    ProductionStepExecution[]
  >([]);
  const [products, setProducts] = useState<any[]>([]);
  const [currentOutput, setCurrentOutput] = useState<ProductionOutput | null>(
    null
  );

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) {
        setError("Ishlab chiqarish natijasi ID si topilmadi");
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        setError(null);

        // Fetch production output, step executions and products
        const [outputResponse, stepExecutionsResponse, productsResponse] =
          await Promise.all([
            ProductionService.getProductionOutputById(id),
            ProductionService.getAllStepExecutions(),
            ProductionService.getProducts(),
          ]);

        setCurrentOutput(outputResponse);
        setStepExecutions(stepExecutionsResponse.results);
        setProducts(productsResponse.results || []);

        // Set form data
        setFormData({
          step_execution: outputResponse.step_execution,
          product: outputResponse.product,
          unit_of_measure: outputResponse.unit_of_measure,
          quantity: outputResponse.quantity,
          weight: outputResponse.weight,
          gross_weight: outputResponse.gross_weight || "",
          tare_weight: outputResponse.tare_weight || "",
          uses_spool: outputResponse.uses_spool,
          quality_status: outputResponse.quality_status,
          notes: outputResponse.notes,
        });
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Ma'lumotlarni yuklashda xato");
      } finally {
        setDataLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleInputChange = (field: string, value: string | boolean) => {
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
      !formData.quality_status ||
      !id
    ) {
      setError("Barcha majburiy maydonlarni to'ldiring");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const outputData: Omit<ProductionOutput, "id" | "product_name"> = {
        ...formData,
        quantity: formData.quantity,
        weight: formData.weight || "0",
        operator: selectedOperator?.id || currentOutput?.operator,
        created_at: currentOutput?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await ProductionService.updateProductionOutput(id, outputData);
      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        navigate("/worker/production-outputs");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ishlab chiqarish natijasini yangilashda xato"
      );
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
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
          Muvaffaqiyatli yangilandi!
        </h1>
        <p className="text-gray-600 mb-6">
          Ishlab chiqarish natijasi muvaffaqiyatli yangilandi.
        </p>
        <Button onClick={() => navigate("/worker/production-outputs")}>
          Natijalar ro'yxatiga qaytish
        </Button>
      </div>
    );
  }

  if (error && !currentOutput) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-red-600">Xato</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate("/worker/production-outputs")}>
          Orqaga qaytish
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
              Ishlab chiqarish natijasini tahrirlash
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              {currentOutput?.product_name} mahsulotining ishlab chiqarish
              natijasini tahrirlash
            </p>
          </div>
        </div>
      </div>

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

            {/* Spool Usage Checkbox */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uses_spool"
                  checked={formData.uses_spool}
                  onCheckedChange={(checked) => {
                    handleInputChange("uses_spool", checked as boolean);
                  }}
                />
                <Label htmlFor="uses_spool" className="text-sm font-medium">
                  Mahsulot karton/spulda (tare bilan)
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Agar mahsulot karton yoki spulda bo'lsa, bu qismni belgilang
              </p>
            </div>

            {/* Weight Fields - Conditional based on spool usage */}
            {!formData.uses_spool ? (
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium">
                  Mahsulot og'irligi (kg) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Mahsulotning toza og'irligini kiriting"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Faqat mahsulotning o'zi (karton/spul hisobga olinmagan)
                </p>
              </div>
            ) : (
              <>
                {/* Tare Weight - Required when using spool */}
                <div className="space-y-2">
                  <Label htmlFor="tare_weight" className="text-sm font-medium">
                    Karton/Spul og'irligi (kg) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tare_weight"
                    type="number"
                    step="0.1"
                    placeholder="Bo'sh karton/spul og'irligi"
                    value={formData.tare_weight}
                    onChange={(e) => handleInputChange("tare_weight", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Bo'sh karton yoki spulning og'irligi
                  </p>
                </div>

                {/* Gross Weight - Optional, if provided NET weight will be calculated */}
                <div className="space-y-2">
                  <Label htmlFor="gross_weight" className="text-sm font-medium">
                    Jami og'irlik (kg)
                  </Label>
                  <Input
                    id="gross_weight"
                    type="number"
                    step="0.1"
                    placeholder="Mahsulot + karton/spul birgalikda"
                    value={formData.gross_weight}
                    onChange={(e) => handleInputChange("gross_weight", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Agar jami og'irlikni kiritasangiz, toza og'irlik avtomatik hisoblanadi
                  </p>
                </div>

                {/* NET Weight - Only show if gross_weight is not provided */}
                {!formData.gross_weight && (
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium">
                      Toza mahsulot og'irligi (kg) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Faqat mahsulotning o'zi"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Karton/spul hisobga olinmagan toza mahsulot og'irligi
                    </p>
                  </div>
                )}

                {/* Spool Count Info for PIECE UOM */}
                {formData.unit_of_measure === "PIECE" && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Dona hisobida</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Dona hisobida bo'lsa, karton/spul soni avtomatik hisoblanadi
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Quality Status */}
            {/* <div className="space-y-2">
              <Label htmlFor="quality_status">
                Sifat holati <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.quality_status}
                onValueChange={(value) =>
                  handleInputChange("quality_status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sifat holatini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                  <SelectItem value="PASSED">O'tdi</SelectItem>
                  <SelectItem value="FAILED">O'tmadi</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
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
              Barcha majburiy maydonlarni to'ldiring. Qadam, mahsulot, o'lchov
              birligi va sifat holatini ro'yxatdan tanlang. O'zgarishlar
              saqlangandan so'ng natijalar ro'yxatiga qaytishingiz mumkin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
