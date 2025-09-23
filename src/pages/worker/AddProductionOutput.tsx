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

// Updated interface with new fields: operators, operators_names, work_center_name

export default function WorkerAddProductionOutputPage() {
  const navigate = useNavigate();
  const { selectedOperator } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    order_id: "",
    step_execution: "",
    product: "",
    unit_of_measure: "",
    quantity: "",
    weight: "",
    notes: "",
  });

  // Available options
  const [orders, setOrders] = useState<any[]>([]);
  const [stepExecutions, setStepExecutions] = useState<
    ProductionStepExecution[]
  >([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selected step execution and order details
  const [selectedStepExecution, setSelectedStepExecution] =
    useState<ProductionStepExecution | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);
        // Fetch orders, step executions and products
        const [ordersResponse, stepExecutionsResponse, productsResponse] =
          await Promise.all([
            ProductionService.getOrders(),
            ProductionService.getAllStepExecutions(),
            ProductionService.getProducts(),
          ]);

        setOrders(ordersResponse.results || []);
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

  // Function to fetch order details
  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoadingOrder(true);
      const order = await ProductionService.getOrderById(orderId);
      setSelectedOrder(order);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setSelectedOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // When step execution is selected, find and store the full details
    if (field === "step_execution") {
      const stepExecution = stepExecutions.find((step) => step.id === value);
      setSelectedStepExecution(stepExecution || null);

      // Fetch order details if step execution is found
      if (stepExecution) {
        fetchOrderDetails(stepExecution.order);
      } else {
        setSelectedOrder(null);
      }
    }
  };

  const handleOrderChange = (orderId: string) => {
    setFormData((prev) => ({
      ...prev,
      order_id: orderId,
      step_execution: "", // Reset step execution when order changes
    }));
    setSelectedStepExecution(null);
    setSelectedOrder(null);
    setError(null);
  };

  // Filter step executions based on selected order
  const filteredStepExecutions = stepExecutions.filter((step) =>
    formData.order_id ? step.order === formData.order_id : false
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.order_id ||
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/worker/production-outputs")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Orqaga</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Yangi ishlab chiqarish natijasi
          </h1>
          <p className="text-gray-600 text-sm">
            Ishlab chiqarish natijasini qo'shish
          </p>
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
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Selection */}
            <div className="space-y-2">
              <Label htmlFor="order_id" className="text-sm font-medium">
                Buyurtma <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.order_id}
                onValueChange={handleOrderChange}
              >
                <SelectTrigger className=" text-base">
                  <SelectValue placeholder="Buyurtmani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.produced_product_name} -{" "}
                        {order.produced_quantity} {order.unit_of_measure}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-orders" disabled>
                      Hech qanday buyurtma topilmadi
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Step Execution */}
            <div className="space-y-2">
              <Label htmlFor="step_execution" className="text-sm font-medium">
                Ishlab chiqarish qadami <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.step_execution}
                onValueChange={(value) =>
                  handleInputChange("step_execution", value)
                }
                disabled={!formData.order_id}
              >
                <SelectTrigger className=" text-base">
                  <SelectValue
                    placeholder={
                      formData.order_id
                        ? "Qadamni tanlang"
                        : "Avval buyurtmani tanlang"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredStepExecutions.length > 0 ? (
                    filteredStepExecutions.map((step) => (
                      <SelectItem key={step.id} value={step.id}>
                        {step.production_step_name}
                      </SelectItem>
                    ))
                  ) : formData.order_id ? (
                    <SelectItem value="no-steps" disabled>
                      Bu buyurtma uchun qadam bajarish topilmadi
                    </SelectItem>
                  ) : (
                    <SelectItem value="select-order-first" disabled>
                      Avval buyurtmani tanlang
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label htmlFor="product" className="text-sm font-medium">
                Mahsulot <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.product}
                onValueChange={(value) => handleInputChange("product", value)}
              >
                <SelectTrigger className=" text-base">
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
              <Label htmlFor="quantity" className="text-sm font-medium">
                Miqdor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="Miqdor"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className=" text-base"
                required
              />
            </div>

            {/* Unit of Measure */}
            <div className="space-y-2">
              <Label htmlFor="unit_of_measure" className="text-sm font-medium">
                O'lchov birligi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.unit_of_measure}
                onValueChange={(value) =>
                  handleInputChange("unit_of_measure", value)
                }
              >
                <SelectTrigger className=" text-base">
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
              <Label htmlFor="weight" className="text-sm font-medium">
                Og'irlik (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                placeholder="Og'irlik"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                className=" text-base"
              />
            </div>
          </div>

          {/* Order Information Display */}
          {selectedStepExecution && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Tanlangan qadam va buyurtma ma'lumotlari
              </h3>

              {/* Order Information */}
              {loadingOrder ? (
                <div className="mb-3 p-3 bg-blue-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Buyurtma ma'lumotlari yuklanmoqda...
                    </span>
                  </div>
                </div>
              ) : selectedOrder ? (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">
                    Buyurtma ma'lumotlari
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-green-800 mb-1">
                        Buyurtma nomi:
                      </div>
                      <div className="text-sm text-green-700">
                        {selectedOrder.description || "Belgilanmagan"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-green-800 mb-1">
                        Buyurtma ID:
                      </div>
                      <div className="text-sm text-green-700 font-mono">
                        {selectedOrder.id.substring(0, 8)}...
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-green-800 mb-1">
                        Mahsulot:
                      </div>
                      <div className="text-sm text-green-700">
                        {selectedOrder.produced_product_name || "Belgilanmagan"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-green-800 mb-1">
                        Miqdor:
                      </div>
                      <div className="text-sm text-green-700">
                        {selectedOrder.produced_quantity}{" "}
                        {selectedOrder.unit_of_measure}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-green-800 mb-1">
                        Holat:
                      </div>
                      <div className="text-sm text-green-700">
                        {STATUS_MAPPINGS.ORDER_STATUS[
                          selectedOrder.status as keyof typeof STATUS_MAPPINGS.ORDER_STATUS
                        ] || selectedOrder.status}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Step Execution Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    Qadam nomi:
                  </div>
                  <div className="text-sm text-blue-700">
                    {selectedStepExecution.production_step_name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    Holat:
                  </div>
                  <div className="text-sm text-blue-700">
                    {STATUS_MAPPINGS.STEP_STATUS[
                      selectedStepExecution.status
                    ] || selectedStepExecution.status}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    Buyurtma:
                  </div>
                  <div className="text-sm text-blue-700">
                    {selectedOrder
                      ? selectedOrder.description || "Belgilanmagan"
                      : "Yuklanmoqda..."}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    Tayinlangan operator:
                  </div>
                  <div className="text-sm text-blue-700">
                    {selectedStepExecution.operators_names &&
                      selectedStepExecution.operators_names.length > 0 &&
                      selectedStepExecution.operators_names[0].trim()
                      ? selectedStepExecution.operators_names[0]
                      : "Tayinlanmagan"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Izohlar
            </Label>
            <Textarea
              id="notes"
              placeholder="Qo'shimcha ma'lumotlar..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
              className="text-base "
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
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
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/worker/production-outputs")}
              className=" text-base"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !formData.order_id || !formData.step_execution
              }
              className=" text-base"
            >
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
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
