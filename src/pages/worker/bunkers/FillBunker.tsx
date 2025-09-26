import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBunkerStore } from "@/store/bunker.store";
import { useAuthStore } from "@/store/auth.store";
import type { FillBunkerRequest } from "@/services/bunker.service";

interface MaterialItem {
  material: string;
  quantity_kg: number;
}

interface FillFormData {
  container_previous_weight_kg: number;
  notes: string;
  materials: MaterialItem[];
}

const FillBunker: React.FC = () => {
  const { bunkerId } = useParams<{ bunkerId: string }>();
  const navigate = useNavigate();
  const {
    currentBunker,
    containers,
    materials,
    orders,
    fillLoading,
    fillError,
    fetchContainersByBunker,
    fetchMaterials,
    fetchOrders,
    fillBunker,
  } = useBunkerStore();

  const { selectedOperator } = useAuthStore();

  console.log(orders)

  const [formData, setFormData] = useState<FillFormData>({
    container_previous_weight_kg: 0,
    notes: "",
    materials: [{ material: "", quantity_kg: 0 }],
  });

  const [selectedContainer, setSelectedContainer] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bunkerId) {
      fetchContainersByBunker(bunkerId);
      fetchMaterials();
      fetchOrders();
    }
  }, [
    bunkerId,
    fetchContainersByBunker,
    fetchMaterials,
    fetchOrders,
  ]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedContainer) {
      newErrors.container = "Container tanlanishi shart";
    }

    if (!selectedOperator) {
      newErrors.operator = "Operator tanlanmagan. Iltimos, operator tanlang.";
    }

    if (!selectedOrder) {
      newErrors.order = "Buyurtma tanlanishi shart";
    }

    if (formData.container_previous_weight_kg <= 0) {
      newErrors.container_previous_weight_kg =
        "Container oldingi og'irligi 0 dan katta bo'lishi kerak";
    }

    if (formData.materials.length === 0) {
      newErrors.materials = "Kamida bitta material qo'shilishi kerak";
    }

    formData.materials.forEach((material, index) => {
      if (!material.material) {
        newErrors[`material_${index}`] = "Material tanlanishi shart";
      }
      if (material.quantity_kg <= 0) {
        newErrors[`quantity_${index}`] = "Miqdor 0 dan katta bo'lishi kerak";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !bunkerId) return;

    setIsSubmitting(true);
    try {
      const fillRequest: FillBunkerRequest = {
        bunker: bunkerId,
        container: selectedContainer,
        filled_by: selectedOperator?.id || "",
        order: selectedOrder,
        container_previous_weight_kg: formData.container_previous_weight_kg,
        notes: formData.notes,
        materials: formData.materials.filter(
          (m) => m.material && m.quantity_kg > 0
        ),
      };

      await fillBunker(fillRequest);
      navigate(`/worker/bunkers/${bunkerId}/status`);
    } catch (error) {
      console.error("Error filling bunker:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [...prev.materials, { material: "", quantity_kg: 0 }],
    }));
  };

  const removeMaterial = (index: number) => {
    if (formData.materials.length > 1) {
      setFormData((prev) => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index),
      }));
    }
  };

  const updateMaterial = (
    index: number,
    field: keyof MaterialItem,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.map((material, i) =>
        i === index ? { ...material, [field]: value } : material
      ),
    }));

    // Clear error when user starts typing
    const errorKey =
      field === "material" ? `material_${index}` : `quantity_${index}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleInputChange = (
    field: keyof FillFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/worker/bunkers/list`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Orqaga
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bunker To'ldirish
          </h1>
          <p className="text-gray-600 mt-2">
            {currentBunker?.name} bunkerini materiallar bilan to'ldirish
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Bunker To'ldirish Ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="container">Container *</Label>
                <Select
                  value={selectedContainer}
                  onValueChange={setSelectedContainer}
                >
                  <SelectTrigger
                    className={errors.container ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Container tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {containers.map((container) => (
                      <SelectItem key={container.id} value={container.id}>
                        {container.container_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.container && (
                  <p className="text-sm text-red-500">{errors.container}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Buyurtma *</Label>
                <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                  <SelectTrigger
                    className={errors.order ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Buyurtma tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.produced_product__name} - {order.produced_quantity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.order && (
                  <p className="text-sm text-red-500">{errors.order}</p>
                )}
              </div>
            </div>

            {/* Selected Operator Display */}
            {/* {selectedOperator && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-900">Tanlangan Operator:</span>
                  <span className="text-sm text-blue-700">
                    {selectedOperator.first_name} {selectedOperator.last_name}
                  </span>
                </div>
              </div>
            )} */}

            {!selectedOperator && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  Operator tanlanmagan. Iltimos, operator tanlang.
                </p>
              </div>
            )}

            {/* Container Weight */}
            <div className="space-y-2">
              <Label htmlFor="container_previous_weight_kg">
                Container Oldingi Og'irligi (kg) *
              </Label>
              <Input
                id="container_previous_weight_kg"
                type="number"
                step="0.01"
                min="0"
                value={formData.container_previous_weight_kg}
                onChange={(e) =>
                  handleInputChange(
                    "container_previous_weight_kg",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0.00"
                className={
                  errors.container_previous_weight_kg ? "border-red-500" : ""
                }
              />
              {errors.container_previous_weight_kg && (
                <p className="text-sm text-red-500">
                  {errors.container_previous_weight_kg}
                </p>
              )}
            </div>

            {/* Materials */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Materiallar *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMaterial}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Material qo'shish
                </Button>
              </div>

              {formData.materials.map((material, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`material_${index}`}>Material</Label>
                      <Select
                        value={material.material}
                        onValueChange={(value) =>
                          updateMaterial(index, "material", value)
                        }
                      >
                        <SelectTrigger
                          className={
                            errors[`material_${index}`] ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Material tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials.map((mat) => (
                            <SelectItem key={mat.id} value={mat.id}>
                              {mat.name} ({mat.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`material_${index}`] && (
                        <p className="text-sm text-red-500">
                          {errors[`material_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="flex-1">
                      <Label htmlFor={`quantity_${index}`}>Miqdor (kg)</Label>
                      <Input
                        id={`quantity_${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={material.quantity_kg}
                        onChange={(e) =>
                          updateMaterial(
                            index,
                            "quantity_kg",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        className={
                          errors[`quantity_${index}`] ? "border-red-500" : ""
                        }
                      />
                      {errors[`quantity_${index}`] && (
                        <p className="text-sm text-red-500">
                          {errors[`quantity_${index}`]}
                        </p>
                      )}
                    </div>

                    <div className="pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                        disabled={formData.materials.length === 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {errors.materials && (
                <p className="text-sm text-red-500">{errors.materials}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Izohlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Qo'shimcha ma'lumotlar..."
                rows={3}
              />
            </div>

            {fillError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{fillError}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || fillLoading}
                className="flex items-center gap-2"
              >
                {isSubmitting || fillLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSubmitting || fillLoading
                  ? "To'ldirilmoqda..."
                  : "Bunkerni To'ldirish"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/worker/bunkers/list`)}
                disabled={isSubmitting || fillLoading}
              >
                Bekor qilish
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FillBunker;
