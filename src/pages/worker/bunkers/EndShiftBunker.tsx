import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Package,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  bunkerService,
  type FillBunkerEndShiftRequest,
  type FillBunkerEndShiftResponse,
  type BunkerStatus,
} from "@/services/bunker.service";
import { ProductionService } from "@/services/production.service";
import { useAuthStore } from "@/store/auth.store";

export interface StepExecution {
  id: string;
  order: string;
  order_description?: string;
  order_product_name?: string;
  production_step: string;
  production_step_name: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  assigned_operator: string;
  assigned_operator_name: string;
  work_center: string;
  start_time: string | null;
  end_time: string | null;
  actual_duration_hours: number | null;
  notes: string;
  quality_notes: string;
  quantity_processed: number | null;
}

export interface Material {
  material__id: string;
  material__name: string;
  material__unit_of_measure: string;
  quantity: number;
}

interface MaterialEntry {
  material_id: string;
  weighed_quantity_kg: number;
}

interface EndShiftFormData {
  order_id: string;
  step_execution_id: string;
  materials: MaterialEntry[];
  notes: string;
}

const EndShiftBunker: React.FC = () => {
  const { bunkerId } = useParams<{ bunkerId: string }>();
  const navigate = useNavigate();
  const { selectedOperator } = useAuthStore();

  const [formData, setFormData] = useState<EndShiftFormData>({
    order_id: "",
    step_execution_id: "",
    materials: [],
    notes: "",
  });

  const [orders, setOrders] = useState<any[]>([]);
  console.log(orders)
  const [stepExecutions, setStepExecutions] = useState<StepExecution[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [bunkerStatus, setBunkerStatus] = useState<
    | (BunkerStatus & {
      current_level_kg: number;
      available_capacity_kg: number;
      capacity_kg: number;
      fill_percentage: number;
    })
    | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<FillBunkerEndShiftResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadBunkerData();
  }, [bunkerId]);

  const loadBunkerData = async () => {
    try {
      setLoading(true);
      const data = await bunkerService.fetchBunkerStatus(bunkerId!);

      // Ensure numeric values are properly converted
      const processedData: BunkerStatus & {
        current_level_kg: number;
        available_capacity_kg: number;
        capacity_kg: number;
        fill_percentage: number;
      } = {
        ...data,
        current_level_kg: parseFloat(data.bunker_remaining_kg) || 0,
        available_capacity_kg: parseFloat(data.bunker_capacity_kg) - parseFloat(data.bunker_remaining_kg) || 0,
        capacity_kg: parseFloat(data.bunker_capacity_kg) || 0,
        fill_percentage: (parseFloat(data.bunker_remaining_kg) / parseFloat(data.bunker_capacity_kg)) * 100 || 0,
        work_center: "", // BunkerFillSession doesn't have work_center
        is_full: parseFloat(data.bunker_remaining_kg) >= parseFloat(data.bunker_capacity_kg),
        recent_fills: [], // BunkerFillSession doesn't have recent_fills
        last_updated: data.filled_at,
      };

      setBunkerStatus(processedData);

      // Load orders
      setOrdersLoading(true);
      try {
        const ordersResponse = await ProductionService.getOrders();
        setOrders(ordersResponse.results || []);
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }

      // Load all step executions (same as AddProductionOutput)
      try {
        const stepData = await bunkerService.fetchAllStepExecutions();
        setStepExecutions(stepData);
      } catch (error) {
        console.error("Error loading step executions:", error);
        setStepExecutions([]);
      }

      // Load materials from workcenter stock
      // Note: BunkerFillSession doesn't have work_center, so we'll skip this for now
      // or use a default work center if needed
      setMaterialsLoading(true);
      try {
        // You might need to get the work center from somewhere else or use a default
        setMaterials([]);
      } catch (error) {
        console.error("Error loading materials:", error);
        setMaterials([]);
      } finally {
        setMaterialsLoading(false);
      }
    } catch (error) {
      console.error("Error loading bunker data:", error);
      setError("Bak ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOperator?.id) {
      setError("Operator tanlanmagan! Iltimos, operator tanlang.");
      return;
    }

    if (!formData.order_id) {
      setError("Buyurtmani tanlang!");
      return;
    }

    if (!formData.step_execution_id) {
      setError("Qadam bajarishni tanlang!");
      return;
    }

    if (formData.materials.length === 0) {
      setError("Kamida bitta material qo'shing!");
      return;
    }

    // Validate that all selected materials have valid quantities
    const invalidMaterials = formData.materials.filter(
      (m) => m.weighed_quantity_kg <= 0
    );
    if (invalidMaterials.length > 0) {
      setError("Barcha materiallar uchun to'g'ri miqdor kiriting!");
      return;
    }

    // Validate that no material quantity exceeds available stock
    const exceededMaterials = formData.materials.filter((material) => {
      const materialInfo = materials.find(
        (m) => m.material__id === material.material_id
      );
      return (
        materialInfo && material.weighed_quantity_kg > materialInfo.quantity
      );
    });
    if (exceededMaterials.length > 0) {
      setError(
        "Ba'zi materiallar uchun kiritilgan miqdor mavjud miqdordan oshib ketdi!"
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const request: FillBunkerEndShiftRequest = {
        materials: formData.materials,
        operator_id: selectedOperator.id,
        step_execution_id: formData.step_execution_id,
        notes: formData.notes || undefined,
      };

      const result = await bunkerService.fillBunkerEndShift(bunkerId!, request);
      setSuccess(result);

      // Reset form
      setFormData({
        order_id: "",
        step_execution_id: "",
        materials: [],
        notes: "",
      });
    } catch (error) {
      console.error("Error filling bunker at end of shift:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Bak to'ldirishda xatolik yuz berdi"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof EndShiftFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleOrderChange = (orderId: string) => {
    setFormData((prev) => ({
      ...prev,
      order_id: orderId,
      step_execution_id: "", // Reset step execution when order changes
    }));
    setError(null);
  };

  const addMaterial = useCallback(
    (materialId: string, quantity: number = 0) => {
      setFormData((prev) => ({
        ...prev,
        materials: [
          ...prev.materials,
          { material_id: materialId, weighed_quantity_kg: quantity },
        ],
      }));
    },
    []
  );

  const removeMaterial = useCallback((materialId: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.material_id !== materialId),
    }));
  }, []);

  const updateMaterialQuantity = useCallback(
    (materialId: string, quantity: number) => {
      const material = materials.find((m) => m.material__id === materialId);

      if (material && quantity > material.quantity) {
        setError(
          `Mavjud miqdor: ${material.quantity} ${material.material__unit_of_measure || "DONA"
          }. Kiritilgan miqdor: ${quantity}`
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        materials: prev.materials.map((material) =>
          material.material_id === materialId
            ? { ...material, weighed_quantity_kg: quantity }
            : material
        ),
      }));
    },
    [materials]
  );

  const isMaterialSelected = useCallback(
    (materialId: string) => {
      return formData.materials.some((m) => m.material_id === materialId);
    },
    [formData.materials]
  );

  const getSelectedMaterialQuantity = useCallback(
    (materialId: string) => {
      const material = formData.materials.find(
        (m) => m.material_id === materialId
      );
      return material?.weighed_quantity_kg || 0;
    },
    [formData.materials]
  );

  const handleMaterialInputChange = useCallback(
    (materialId: string, value: string) => {
      setInputValues((prev) => ({ ...prev, [materialId]: value }));
    },
    []
  );

  const handleAddMaterial = useCallback(
    (materialId: string, inputValue: string) => {
      const quantity = parseFloat(inputValue) || 0;
      const material = materials.find((m) => m.material__id === materialId);

      if (quantity > 0 && material && quantity <= material.quantity) {
        addMaterial(materialId, quantity);
        setInputValues((prev) => ({ ...prev, [materialId]: "" }));
      } else if (material && quantity > material.quantity) {
        setError(
          `Mavjud miqdor: ${material.quantity} ${material.material__unit_of_measure || "DONA"
          }. Kiritilgan miqdor: ${quantity}`
        );
      }
    },
    [materials, addMaterial]
  );

  const totalSelectedQuantity = useMemo(() => {
    return formData.materials.reduce(
      (total, material) => total + material.weighed_quantity_kg,
      0
    );
  }, [formData.materials]);

  const isInputValid = useCallback(
    (materialId: string, inputValue: string) => {
      const quantity = parseFloat(inputValue) || 0;
      const material = materials.find((m) => m.material__id === materialId);
      return material && quantity <= material.quantity;
    },
    [materials]
  );

  const getInputError = useCallback(
    (materialId: string, inputValue: string) => {
      const quantity = parseFloat(inputValue) || 0;
      const material = materials.find((m) => m.material__id === materialId);
      if (material && quantity > material.quantity) {
        return `Mavjud: ${material.quantity} ${material.material__unit_of_measure || "DONA"
          }`;
      }
      return null;
    },
    [materials]
  );

  // Filter step executions based on selected order
  const filteredStepExecutions = useMemo(() => {
    if (!formData.order_id) {
      return [];
    }
    return stepExecutions.filter(step => step.order === formData.order_id);
  }, [stepExecutions, formData.order_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Bak ma'lumotlari yuklanmoqda...
        </span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Muvaffaqiyatli!
            </h2>
            <p className="text-gray-600 mb-6">{success.message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/worker/bunkers/list")}
              className="flex-1"
            >
              Baklar Ro'yxatiga Qaytish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Smena Oxiri - Bak To'ldirish
            </h1>
            <p className="text-gray-600">
              Smena oxirida bakni to'ldiring va qolgan materiallarni hisoblang
            </p>
          </div>
        </div>
      </div>

      {/* Bunker Information */}
      {bunkerStatus && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bak Ma'lumotlari
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Bak Nomi
              </Label>
              <p className="text-gray-900 font-semibold">
                {bunkerStatus.bunker_name}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Hajm</Label>
              <p className="text-gray-900">
                {bunkerStatus.capacity_kg.toFixed(1)} kg
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Operator Display */}
          {selectedOperator ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Joriy Operator
              </h4>
              <p className="text-blue-800">
                {selectedOperator.first_name} {selectedOperator.last_name} (
                {selectedOperator.username}) - {selectedOperator.role}
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-900 mb-2">
                Operator Tanlanmagan
              </h4>
              <p className="text-red-800">
                Iltimos, avval operator tanlang. Operator tanlanmaguncha bu
                operatsiyani bajara olmaysiz.
              </p>
            </div>
          )}

          {/* Order Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="order_id"
              className="text-sm font-medium text-gray-700"
            >
              Buyurtma *
            </Label>
            <Select
              value={formData.order_id}
              onValueChange={handleOrderChange}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Buyurtmani tanlang" />
              </SelectTrigger>
              <SelectContent>
                {ordersLoading ? (
                  <SelectItem value="loading" disabled>
                    Buyurtmalar yuklanmoqda...
                  </SelectItem>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.produced_product_name} - {order.produced_quantity} {order.unit_of_measure}
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

          {/* Step Execution Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="step_execution_id"
              className="text-sm font-medium text-gray-700"
            >
              Qadam Bajarish *
            </Label>
            <Select
              value={formData.step_execution_id}
              onValueChange={(value) =>
                handleInputChange("step_execution_id", value)
              }
              required
              disabled={!formData.order_id}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={formData.order_id ? "Qadam bajarishni tanlang" : "Avval buyurtmani tanlang"} />
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

          {/* Materials Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Mavjud Materiallar
              </Label>
            </div>

            {materialsLoading ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Loader2 className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
                <p>Materiallar yuklanmoqda...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Bu ish markazida materiallar mavjud emas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => {
                  const isSelected = isMaterialSelected(material.material__id);
                  const quantity = getSelectedMaterialQuantity(
                    material.material__id
                  );

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
                            {material.material__unit_of_measure || "DONA"}
                          </p>
                        </div>
                        {isSelected && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeMaterial(material.material__id)
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {isSelected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium text-gray-700 min-w-[100px]">
                              Og'irlik (kg):
                            </Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max={material.quantity}
                              value={quantity}
                              onChange={(e) => {
                                const newQuantity =
                                  parseFloat(e.target.value) || 0;
                                updateMaterialQuantity(
                                  material.material__id,
                                  newQuantity
                                );
                              }}
                              className={`flex-1 ${quantity > material.quantity
                                ? "border-red-500 focus:border-red-500"
                                : ""
                                }`}
                              placeholder="0.0"
                            />
                          </div>
                          {quantity > material.quantity && (
                            <p className="text-sm text-red-600">
                              Mavjud: {material.quantity}{" "}
                              {material.material__unit_of_measure || "DONA"}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max={material.quantity}
                              placeholder="Og'irlik (kg)"
                              className={`flex-1 ${inputValues[material.material__id] &&
                                !isInputValid(
                                  material.material__id,
                                  inputValues[material.material__id]
                                )
                                ? "border-red-500 focus:border-red-500"
                                : ""
                                }`}
                              value={inputValues[material.material__id] || ""}
                              onChange={(e) =>
                                handleMaterialInputChange(
                                  material.material__id,
                                  e.target.value
                                )
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleAddMaterial(
                                    material.material__id,
                                    inputValues[material.material__id] || ""
                                  );
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleAddMaterial(
                                  material.material__id,
                                  inputValues[material.material__id] || ""
                                )
                              }
                              disabled={
                                !inputValues[material.material__id] ||
                                parseFloat(
                                  inputValues[material.material__id] || "0"
                                ) <= 0 ||
                                !isInputValid(
                                  material.material__id,
                                  inputValues[material.material__id] || ""
                                )
                              }
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-4 w-4" />
                              Qo'shish
                            </Button>
                          </div>
                          {inputValues[material.material__id] &&
                            !isInputValid(
                              material.material__id,
                              inputValues[material.material__id]
                            ) && (
                              <p className="text-sm text-red-600">
                                {getInputError(
                                  material.material__id,
                                  inputValues[material.material__id]
                                )}
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Materials Summary */}
            {formData.materials.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-blue-900">
                    Tanlangan Materiallar ({formData.materials.length})
                  </h4>
                  <div className="text-sm font-bold text-blue-900">
                    Jami: {totalSelectedQuantity.toFixed(1)} kg
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.materials.map((material, index) => {
                    const materialInfo = materials.find(
                      (m) => m.material__id === material.material_id
                    );
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-800">
                            {materialInfo?.material__name ||
                              "Noma'lum material"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-900">
                            {material.weighed_quantity_kg} kg
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMaterial(material.material_id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-sm font-medium text-gray-700"
            >
              Eslatma
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Smena oxiri haqida eslatma..."
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/worker/bunkers/list")}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                !selectedOperator?.id ||
                !formData.order_id ||
                !formData.step_execution_id ||
                formData.materials.length === 0
              }
              className="flex-1 bg-primary"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  To'ldirilmoqda...
                </>
              ) : (
                "Smena Oxirida Bakni To'ldirish"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EndShiftBunker;
