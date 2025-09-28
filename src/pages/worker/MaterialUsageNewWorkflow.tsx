import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StepIndicator from "@/components/ui/step-indicator";
import { useWorkerStore } from "@/store/worker.store";

export default function MaterialUsageNewWorkflowPage() {
  const navigate = useNavigate();
  const { workcenterType, orderId } = useParams<{
    workcenterType: string;
    orderId: string;
    stepId: string;
  }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    selectedOrder,
    selectedStep,
    selectedWorkcenterId,
    stockData,
    selectedItems,
    // stockLoading,
    stockError,
    submitting,
    submitError,
    fetchWorkcenterStock,
    addSelectedItem,
    removeSelectedItem,
    updateSelectedItemQuantity,
    clearSelectedItems,
    submitBulkCreateByWorkcenterType,
    getOrCreateStepExecution,
    setCurrentStep,
  } = useWorkerStore();

  // Get the selected workcenter ID from the store
  const workcenterId = selectedWorkcenterId;

  useEffect(() => {
    setCurrentStep(4); // Set current step to 4 (Material usage)

    // Get or create step execution when component mounts
    if (orderId && workcenterType) {
      getOrCreateStepExecution(orderId, workcenterType);
    }
  }, [orderId, workcenterType, getOrCreateStepExecution, setCurrentStep]);

  // Fetch stock data when workcenter ID is available
  useEffect(() => {
    if (workcenterId) {
      fetchWorkcenterStock(workcenterId);
    }
  }, [workcenterId, fetchWorkcenterStock]);

  const getWorkcenterTypeLabel = (type: string) => {
    switch (type?.toUpperCase()) {
      case "EXTRUDER":
        return "Extruder";
      case "DEGASSING_AREA":
        return "Degassing Area";
      case "LAMINATOR":
        return "Laminator";
      case "BRONIROVSHIK":
        return "Bronirovshik";
      case "DUPLICATOR":
        return "Duplicator";
      case "PACKAGING":
        return "Packaging";
      case "QUALITY_CONTROL":
        return "Quality Control";
      case "BRAK_MAYDALAGICH":
        return "Brak maydalagich";
      default:
        return type || "Workcenter";
    }
  };

  const filteredMaterials =
    stockData?.materials?.filter((material) =>
      material.material__name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const filteredProducts =
    stockData?.products?.filter((product) =>
      product.product__name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleAddMaterial = (material: any) => {
    addSelectedItem({
      id: material.material__id,
      name: material.material__name,
      type: "material",
      quantity: 0,
      unit_of_measure: material.material__unit_of_measure,
      available_quantity: material.quantity,
    });
  };

  const handleAddProduct = (product: any) => {
    addSelectedItem({
      id: product.product__id,
      name: product.product__name,
      type: "product",
      quantity: 0,
      unit_of_measure: "PIECE", // Default unit for products
      available_quantity: product.quantity,
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateSelectedItemQuantity(itemId, quantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeSelectedItem(itemId);
  };

  const handleSubmit = async () => {
    const result = await submitBulkCreateByWorkcenterType();
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/worker");
      }, 2000);
    }
  };

    // const handleLoadStock = () => {
    //   if (workcenterId) {
    //     fetchWorkcenterStock(workcenterId);
    //   }
    // };

  if (submitting) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Materiallar qo'shilmoqda...</span>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Muvaffaqiyatli!
        </h2>
        <p className="text-gray-600 mb-6">
          Materiallar muvaffaqiyatli qo'shildi va ishlatilgan materiallar
          yaratildi.
        </p>
        <Button onClick={() => navigate("/worker")}>
          Operator paneliga qaytish
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
            onClick={() =>
              navigate(
                `/worker/workcenter-type/${workcenterType}/order/${orderId}`
              )
            }
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Material ishlatish
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              {getWorkcenterTypeLabel(workcenterType || "")} -{" "}
              {selectedOrder?.produced_product_name} - {selectedStep?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <StepIndicator currentStep={4} />

      {/* Load Stock Button */}
      {/* <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Workcenter zaxirasi
            </h3>
            <p className="text-sm text-gray-600">
              {getWorkcenterTypeLabel(workcenterType || "")} workcenter da
              mavjud material va maxsulotlarni ko'rish
            </p>
          </div>
          <Button onClick={handleLoadStock} disabled={stockLoading}>
            {stockLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Yuklanmoqda...
              </>
            ) : (
              "Zaxirani yuklash"
            )}
          </Button>
        </div>
      </div> */}

      {stockError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Xato</h4>
              <p className="text-sm text-red-700">{stockError}</p>
            </div>
          </div>
        </div>
      )}

      {stockData && (
        <>
          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Material yoki maxsulot nomi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Available Materials */}
          {filteredMaterials.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Mavjud Materiallar
                </h3>
                <p className="text-sm text-gray-600">
                  {stockData.workcenter_location}
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <div key={material.material__id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {material.material__name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mavjud: {material.quantity}{" "}
                          {material.material__unit_of_measure}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddMaterial(material)}
                        disabled={selectedItems.some(
                          (item) =>
                            item.id === material.material__id &&
                            item.type === "material"
                        )}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Qo'shish
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Products */}
          {filteredProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Mavjud Maxsulotlar
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <div key={product.product__id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {product.product__name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mavjud: {product.quantity} dona
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddProduct(product)}
                        disabled={selectedItems.some(
                          (item) =>
                            item.id === product.product__id &&
                            item.type === "product"
                        )}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Qo'shish
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Tanlangan Materiallar
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelectedItems}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Barchasini o'chirish
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {selectedItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      Mavjud: {item.available_quantity} {item.unit_of_measure}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(
                          item.id,
                          Math.max(0, item.quantity - 1)
                        )
                      }
                      disabled={item.quantity <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.id,
                          Math.max(0, parseFloat(e.target.value) || 0)
                        )
                      }
                      className="w-20 text-center"
                      min="0"
                      max={item.available_quantity}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(
                          item.id,
                          Math.min(item.available_quantity, item.quantity + 1)
                        )
                      }
                      disabled={item.quantity >= item.available_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 ml-2">
                      {item.unit_of_measure}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {selectedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Materiallarni tasdiqlash
              </h3>
              <p className="text-sm text-gray-600">
                {selectedItems.length} ta material/maxsulot tanlandi
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting || selectedItems.some((item) => item.quantity <= 0)
              }
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Materiallarni qo'shish
            </Button>
          </div>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Xato</h4>
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Ma'lumot</h4>
            <p className="text-sm text-blue-700">
              Materiallarni tanlash va miqdorini belgilash orqali ishlatilgan
              materiallar yaratiladi. Bu jarayon avtomatik ravishda stock level
              ni yangilaydi va step execution yaratadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
