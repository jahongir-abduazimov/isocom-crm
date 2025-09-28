import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBunkerStore } from "@/store/bunker.store";

interface ContainerFormData {
  container_name: string;
  empty_weight_kg: number;
  max_capacity_kg: number;
  current_capacity_kg: number;
}

const EditContainer: React.FC = () => {
  const { bunkerId, containerId } = useParams<{
    bunkerId: string;
    containerId: string;
  }>();
  const navigate = useNavigate();
  const {
    containers,
    containersLoading,
    containersError,
    updateContainer,
    fetchContainersByBunker,
  } = useBunkerStore();

  const [formData, setFormData] = useState<ContainerFormData>({
    container_name: "",
    empty_weight_kg: 0,
    max_capacity_kg: 0,
    current_capacity_kg: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContainer = async () => {
      if (!bunkerId || !containerId) return;

      setIsLoading(true);
      try {
        await fetchContainersByBunker(bunkerId);
      } finally {
        setIsLoading(false);
      }
    };

    loadContainer();
  }, [bunkerId, containerId, fetchContainersByBunker]);

  useEffect(() => {
    if (containers.length > 0 && containerId) {
      const container = containers.find((c) => c.id === containerId);
      if (container) {
        setFormData({
          container_name: container.container_name,
          empty_weight_kg: parseFloat(container.empty_weight_kg),
          max_capacity_kg: parseFloat(container.max_capacity_kg),
          current_capacity_kg: parseFloat(container.current_capacity_kg),
        });
      }
    }
  }, [containers, containerId]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.container_name.trim()) {
      newErrors.container_name = "Container nomi kiritilishi shart";
    }

    if (formData.empty_weight_kg <= 0) {
      newErrors.empty_weight_kg = "Bo'sh og'irlik 0 dan katta bo'lishi kerak";
    }

    if (formData.max_capacity_kg <= 0) {
      newErrors.max_capacity_kg = "Maksimal sig'im 0 dan katta bo'lishi kerak";
    }

    if (formData.max_capacity_kg <= formData.empty_weight_kg) {
      newErrors.max_capacity_kg =
        "Maksimal sig'im bo'sh og'irlikdan katta bo'lishi kerak";
    }

    if (formData.current_capacity_kg < 0) {
      newErrors.current_capacity_kg =
        "Joriy sig'im 0 dan kichik bo'lishi mumkin emas";
    }

    if (formData.current_capacity_kg > formData.max_capacity_kg) {
      newErrors.current_capacity_kg =
        "Joriy sig'im maksimal sig'imdan katta bo'lishi mumkin emas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !containerId || !bunkerId) return;

    setIsSubmitting(true);
    try {
      await updateContainer(containerId, {
        bunker: bunkerId,
        container_name: formData.container_name,
        empty_weight_kg: formData.empty_weight_kg.toString(),
        max_capacity_kg: formData.max_capacity_kg.toString(),
        current_capacity_kg: formData.current_capacity_kg.toString(),
      });

      navigate(`/worker/bunkers/${bunkerId}/containers`);
    } catch (error) {
      console.error("Error updating container:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ContainerFormData,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Container ma'lumotlari yuklanmoqda...
        </span>
      </div>
    );
  }

  const currentContainer = containers.find((c) => c.id === containerId);
  if (!currentContainer) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Container topilmadi</h1>
        <p className="text-gray-600 mb-6">So'ralgan container mavjud emas</p>
        <Button
          onClick={() => navigate(`/worker/bunkers/${bunkerId}/containers`)}
        >
          Containerlar ro'yxatiga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/worker/bunkers/${bunkerId}/containers`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Orqaga
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Container Tahrirlash
          </h1>
          <p className="text-gray-600 mt-2">
            {currentContainer.container_name} containerni tahrirlash
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Container Ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="container_name">Container Nomi *</Label>
                <Input
                  id="container_name"
                  value={formData.container_name}
                  onChange={(e) =>
                    handleInputChange("container_name", e.target.value)
                  }
                  placeholder="Container nomini kiriting"
                  className={errors.container_name ? "border-red-500" : ""}
                />
                {errors.container_name && (
                  <p className="text-sm text-red-500">
                    {errors.container_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="empty_weight_kg">Bo'sh Og'irlik (kg) *</Label>
                <Input
                  id="empty_weight_kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.empty_weight_kg}
                  onChange={(e) =>
                    handleInputChange(
                      "empty_weight_kg",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  className={errors.empty_weight_kg ? "border-red-500" : ""}
                />
                {errors.empty_weight_kg && (
                  <p className="text-sm text-red-500">
                    {errors.empty_weight_kg}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_capacity_kg">Maksimal Sig'im (kg) *</Label>
                <Input
                  id="max_capacity_kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.max_capacity_kg}
                  onChange={(e) =>
                    handleInputChange(
                      "max_capacity_kg",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  className={errors.max_capacity_kg ? "border-red-500" : ""}
                />
                {errors.max_capacity_kg && (
                  <p className="text-sm text-red-500">
                    {errors.max_capacity_kg}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_capacity_kg">Joriy Sig'im (kg)</Label>
                <Input
                  id="current_capacity_kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.current_capacity_kg}
                  onChange={(e) =>
                    handleInputChange(
                      "current_capacity_kg",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  className={errors.current_capacity_kg ? "border-red-500" : ""}
                />
                {errors.current_capacity_kg && (
                  <p className="text-sm text-red-500">
                    {errors.current_capacity_kg}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Containerning hozirgi to'ldirilgan miqdori
                </p>
              </div>
            </div>

            {containersError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{containersError}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || containersLoading}
                className="flex items-center gap-2"
              >
                {isSubmitting || containersLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSubmitting || containersLoading
                  ? "Yangilanmoqda..."
                  : "Yangilash"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate(`/worker/bunkers/${bunkerId}/containers`)
                }
                disabled={isSubmitting || containersLoading}
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

export default EditContainer;
