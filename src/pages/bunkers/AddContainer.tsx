import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, Loader2, Package } from "lucide-react";
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

const AddContainer: React.FC = () => {
  const { bunkerId } = useParams<{ bunkerId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    createContainer,
    containersLoading,
    containersError,
    currentBunker,
    fetchBunkerById,
  } = useBunkerStore();

  const [formData, setFormData] = useState<ContainerFormData>({
    container_name: "",
    empty_weight_kg: 0,
    max_capacity_kg: 0,
    current_capacity_kg: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bunkerId && !currentBunker) {
      fetchBunkerById(bunkerId);
    }
  }, [bunkerId, currentBunker, fetchBunkerById]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.container_name.trim()) {
      newErrors.container_name = t("containers.validation.nameRequired");
    }

    if (formData.empty_weight_kg <= 0) {
      newErrors.empty_weight_kg = t(
        "containers.validation.emptyWeightRequired"
      );
    }

    if (formData.max_capacity_kg <= 0) {
      newErrors.max_capacity_kg = t(
        "containers.validation.maxCapacityRequired"
      );
    }

    if (formData.max_capacity_kg <= formData.empty_weight_kg) {
      newErrors.max_capacity_kg = t(
        "containers.validation.maxCapacityGreaterThanEmpty"
      );
    }

    if (formData.current_capacity_kg < 0) {
      newErrors.current_capacity_kg = t(
        "containers.validation.currentCapacityNotNegative"
      );
    }

    if (formData.current_capacity_kg > formData.max_capacity_kg) {
      newErrors.current_capacity_kg = t(
        "containers.validation.currentCapacityNotExceedMax"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !bunkerId) return;

    setIsSubmitting(true);
    try {
      await createContainer({
        bunker: bunkerId,
        container_name: formData.container_name,
        empty_weight_kg: formData.empty_weight_kg.toString(),
        max_capacity_kg: formData.max_capacity_kg.toString(),
        current_capacity_kg: formData.current_capacity_kg.toString(),
      });

      navigate(`/bunkers/${bunkerId}`);
    } catch (error) {
      console.error("Error creating container:", error);
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
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (containersLoading && !currentBunker) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          {t("containers.loadingBunker")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/bunkers/${bunkerId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t("common.back")}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("containers.addContainer")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("containers.addContainerDesc", {
              bunkerName: currentBunker?.name,
            })}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            {t("containers.containerDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Container Name */}
              <div className="space-y-2">
                <Label htmlFor="container_name">{t("containers.name")} *</Label>
                <Input
                  id="container_name"
                  value={formData.container_name}
                  onChange={(e) =>
                    handleInputChange("container_name", e.target.value)
                  }
                  placeholder={t("containers.namePlaceholder")}
                  className={errors.container_name ? "border-red-500" : ""}
                />
                {errors.container_name && (
                  <p className="text-sm text-red-500">
                    {errors.container_name}
                  </p>
                )}
              </div>

              {/* Empty Weight */}
              <div className="space-y-2">
                <Label htmlFor="empty_weight_kg">
                  {t("containers.emptyWeight")} (kg) *
                </Label>
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

              {/* Max Capacity */}
              <div className="space-y-2">
                <Label htmlFor="max_capacity_kg">
                  {t("containers.maxCapacity")} (kg) *
                </Label>
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

              {/* Current Capacity */}
              <div className="space-y-2">
                <Label htmlFor="current_capacity_kg">
                  {t("containers.currentCapacity")} (kg)
                </Label>
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
                  {t("containers.currentCapacityHint")}
                </p>
              </div>
            </div>

            {/* Bunker Info */}
            {currentBunker && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">
                  {t("containers.bunkerInfo")}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">
                      {t("bunkers.name")}:
                    </span>
                    <span className="ml-2 text-blue-900">
                      {currentBunker.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      {t("bunkers.capacity")}:
                    </span>
                    <span className="ml-2 text-blue-900">
                      {currentBunker.capacity_kg} kg
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {containersError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{containersError}</p>
              </div>
            )}

            {/* Actions */}
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
                  ? t("containers.creating")
                  : t("containers.createContainer")}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/bunkers/${bunkerId}`)}
                disabled={isSubmitting || containersLoading}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddContainer;
