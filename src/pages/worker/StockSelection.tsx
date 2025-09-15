import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Plus,
  Minus,
  ArrowRight,
  Loader2,
  AlertCircle,
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
import { useWorkerStore } from "@/store/worker.store";

// Available unit of measure options
const UNIT_OPTIONS = [
  { value: "KG", label: "Kilogramm" },
  { value: "METER", label: "Metr" },
  { value: "METER_SQUARE", label: "m²" },
  { value: "METER_CUBIC", label: "m³" },
  { value: "PIECE", label: "Bo'lak" },
  { value: "LITER", label: "Litr" },
];

export default function StockSelectionPage() {
  const { id, stepId } = useParams<{ id: string; stepId: string }>();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
  const [unitSelections, setUnitSelections] = useState<{ [key: string]: string }>({});

  const {
    selectedOrder,
    selectedStep,
    stockData,
    stockLoading,
    stockError,
    selectedItems,
    fetchWorkcenterStock,
    addSelectedItem,
    removeSelectedItem,
    updateSelectedItemQuantity,
  } = useWorkerStore();

  useEffect(() => {
    if (stepId) {
      // Assuming we have workcenter_id from step, for now using stepId as workcenterId
      // In real implementation, you'd need to get workcenter_id from the step data
      fetchWorkcenterStock(stepId);
    }
  }, [stepId, fetchWorkcenterStock]);

  const handleQuantityChange = (
    itemId: string,
    type: "material" | "product",
    value: string
  ) => {
    setQuantities((prev) => ({ ...prev, [`${type}-${itemId}`]: value }));
  };

  const handleUnitChange = (
    itemId: string,
    type: "material" | "product",
    value: string
  ) => {
    setUnitSelections((prev) => ({ ...prev, [`${type}-${itemId}`]: value }));
  };

  const handleAddItem = (item: any, type: "material" | "product") => {
    const quantityKey = `${type}-${item.material__id || item.product__id}`;
    const unitKey = `${type}-${item.material__id || item.product__id}`;
    const quantity = parseFloat(quantities[quantityKey] || "0");
    const selectedUnit = unitSelections[unitKey];

    if (quantity <= 0) {
      alert("Miqdor 0 dan katta bo'lishi kerak!");
      return;
    }

    // For products, unit selection is required
    if (type === "product" && !selectedUnit) {
      alert("Birlik tanlash majburiy!");
      return;
    }

    const availableQuantity = item.quantity;
    if (quantity > availableQuantity) {
      alert(
        `Mavjud miqdor: ${availableQuantity}. Kiritilgan miqdor: ${quantity}`
      );
      return;
    }

    // For materials, use existing unit_of_measure or default
    // For products, use selected unit
    const unitOfMeasure = type === "material"
      ? (item.material__unit_of_measure || "PIECE")
      : selectedUnit;

    const selectedItem = {
      id: item.material__id || item.product__id,
      name: item.material__name || item.product__name,
      type,
      quantity,
      unit_of_measure: unitOfMeasure,
      available_quantity: availableQuantity,
    };

    addSelectedItem(selectedItem);
    setQuantities((prev) => ({ ...prev, [quantityKey]: "" }));
    // Only clear unit selection for products
    if (type === "product") {
      setUnitSelections((prev) => ({ ...prev, [unitKey]: "" }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeSelectedItem(itemId);
  };

  const handleQuantityUpdate = (itemId: string, quantity: number) => {
    updateSelectedItemQuantity(itemId, quantity);
  };

  const handleContinue = () => {
    if (selectedItems.length === 0) {
      alert("Kamida bitta material yoki mahsulot tanlanishi kerak!");
      return;
    }
    navigate(`/worker/orders/${id}/steps/${stepId}/confirm`);
  };

  if (stockLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Ombor ma'lumotlari yuklanmoqda...
        </span>
      </div>
    );
  }

  if (stockError || !stockData || !selectedOrder || !selectedStep) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Xato</h1>
        <p className="text-gray-600 mb-6">
          {stockError || "Ombor ma'lumotlari topilmadi"}
        </p>
        <Button onClick={() => navigate(`/worker/orders/${id}`)}>
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
            onClick={() => navigate(`/worker/orders/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Material va mahsulot tanlash
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              {selectedOrder.produced_product__name} -{" "}
              {selectedStep.name}
            </p>
          </div>
        </div>
      </div>

      {/* Workcenter Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {stockData.workcenter_location}
            </h2>
            <p className="text-sm text-gray-600">
              Mavjud materiallar va mahsulotlar
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materials Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Materiallar ({stockData.materials.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Mavjud materiallardan tanlang
            </p>
          </div>
          <div className="p-6 space-y-4">
            {stockData.materials.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Materiallar mavjud emas</p>
              </div>
            ) : (
              stockData.materials.map((material) => {
                const quantityKey = `material-${material.material__id}`;
                const quantity = quantities[quantityKey] || "";

                return (
                  <div
                    key={material.material__id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {material.material__name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mavjud: {material.quantity}{" "}
                          {material.material__unit_of_measure || "PIECE"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Miqdor"
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            material.material__id,
                            "material",
                            e.target.value
                          )
                        }
                        className="flex-1"
                        min="0"
                        step="0.01"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddItem(material, "material")}
                        disabled={!quantity || parseFloat(quantity) <= 0}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Qo'shish
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Mahsulotlar ({stockData.products.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Mavjud mahsulotlardan tanlang
            </p>
          </div>
          <div className="p-6 space-y-4">
            {stockData.products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Mahsulotlar mavjud emas</p>
              </div>
            ) : (
              stockData.products.map((product) => {
                const quantityKey = `product-${product.product__id}`;
                const quantity = quantities[quantityKey] || "";

                return (
                  <div
                    key={product.product__id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {product.product__name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Mavjud: {product.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Miqdor"
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              product.product__id,
                              "product",
                              e.target.value
                            )
                          }
                          className="flex-1"
                          min="0"
                          step="0.01"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(product, "product")}
                          disabled={!quantity || parseFloat(quantity) <= 0 || !unitSelections[`product-${product.product__id}`]}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Qo'shish
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 min-w-[80px]">Birlik: <span className="text-red-500">*</span></span>
                        <Select
                          value={unitSelections[`product-${product.product__id}`] || ""}
                          onValueChange={(value) =>
                            handleUnitChange(
                              product.product__id,
                              "product",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Birlik tanlang *" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_OPTIONS.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Tanlangan elementlar ({selectedItems.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Material ishlatish uchun tanlangan elementlar
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {selectedItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${item.type === "material"
                        ? "bg-blue-500"
                        : "bg-green-500"
                        }`}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.type === "material" ? "Material" : "Mahsulot"} •
                        Mavjud: {item.available_quantity} {item.unit_of_measure}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleQuantityUpdate(
                            item.id,
                            Math.max(0, item.quantity - 1)
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-2 py-1 text-sm font-medium min-w-[60px] text-center">
                        {item.quantity} {item.unit_of_measure}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleQuantityUpdate(
                            item.id,
                            Math.min(item.available_quantity, item.quantity + 1)
                          )
                        }
                        disabled={item.quantity >= item.available_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={selectedItems.length === 0}
          className="flex items-center gap-2"
        >
          Davom etish
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Ma'lumot</h4>
            <p className="text-sm text-blue-700">
              Material yoki mahsulot tanlash uchun miqdor kiriting va "Qo'shish"
              tugmasini bosing. Tanlangan elementlarni miqdorini o'zgartirish
              yoki o'chirish mumkin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
