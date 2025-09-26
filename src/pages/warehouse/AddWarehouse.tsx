import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WarehouseService } from "@/services/warehouse.service";
import { useWarehousesStore } from "@/store/warehouses.store";
import { notifySuccess } from "@/lib/notification";
import { useTranslation } from "@/hooks/useTranslation";

export default function AddWarehouse() {
  const navigate = useNavigate();
  const { addWarehouse } = useWarehousesStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("warehouse.warehouses.validation.nameRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || "",
        is_active: formData.is_active,
      };

      const newWarehouse = await WarehouseService.createWarehouse(submitData);
      addWarehouse(newWarehouse);
      notifySuccess(t("warehouse.warehouses.warehouseCreated"));
      navigate("/warehouse/warehouses");
    } catch (error: any) {
      setError(error?.response?.data?.detail || t("warehouse.warehouses.warehouseNotCreated"));
      console.error("Error creating warehouse:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/warehouse/warehouses");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft size={16} />
          {t("warehouse.warehouses.back")}
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("warehouse.warehouses.addWarehouse")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("warehouse.warehouses.addWarehouseDesc")}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Warehouse Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("warehouse.warehouses.warehouseName")} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("warehouse.warehouses.warehouseNamePlaceholder")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Is Active */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("warehouse.warehouses.status")}</Label>
              <div className="flex items-center space-x-3 pt-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_active", checked)
                  }
                />
                <Label htmlFor="is_active" className="text-sm font-medium">
                  {t("warehouse.warehouses.activeStatus")}
                </Label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("warehouse.warehouses.description")}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("warehouse.warehouses.descriptionPlaceholder")}
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {loading ? t("warehouse.warehouses.creating") : t("warehouse.warehouses.createWarehouse")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {t("warehouse.warehouses.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
