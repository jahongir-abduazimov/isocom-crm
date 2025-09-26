import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notifySuccess, notifyError } from "@/lib/notification";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMaterialsStore } from "@/store/materials.store";
import { useTranslation } from "@/hooks/useTranslation";

export default function AddMaterialPage() {
  const navigate = useNavigate();
  const { addMaterial } = useMaterialsStore();
  const { t } = useTranslation();

  const MATERIAL_TYPES = [
    { value: "GRANULA", label: t("materials.granula") },
    { value: "ZAR", label: t("materials.zar") },
    { value: "OTHER", label: t("materials.other") },
  ];

  const UNITS = [
    { value: "KG", label: t("materials.kilogram") },
    { value: "METER", label: t("materials.meter") },
    { value: "METER_SQUARE", label: t("materials.squareMeter") },
    { value: "METER_CUBIC", label: t("materials.cubicMeter") },
    { value: "PIECE", label: t("materials.piece") },
    { value: "LITER", label: t("materials.liter") },
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "GRANULA",
    unit: "KG",
    description: "",
    price: "",
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("materials.validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("materials.validation.nameMinLength");
    }

    if (!formData.type) {
      newErrors.type = t("materials.validation.typeRequired");
    }

    if (!formData.unit) {
      newErrors.unit = t("materials.validation.unitRequired");
    }

    // Optional field validations (only if they have values)
    if (formData.code.trim() && formData.code.trim().length < 2) {
      newErrors.code = t("materials.validation.codeMinLength");
    }

    if (formData.description.trim() && formData.description.trim().length < 5) {
      newErrors.description = t("materials.validation.descriptionMinLength");
    }

    if (formData.price.trim() && (isNaN(Number(formData.price)) || Number(formData.price) <= 0)) {
      newErrors.price = t("materials.validation.pricePositive");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
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

      const apiData: any = {
        name: formData.name.trim(),
        unit_of_measure: formData.unit,
        type: formData.type,
        is_active: formData.active,
      };

      // Add optional fields only if they have values
      if (formData.code.trim()) {
        apiData.code = formData.code.trim();
      }
      if (formData.description.trim()) {
        apiData.description = formData.description.trim();
      }
      if (formData.price.trim()) {
        apiData.price = formData.price;
      }

      const success = await addMaterial(apiData);
      if (success) {
        notifySuccess(t("materials.materialAdded"));
        navigate("/materials");
      } else {
        notifyError(t("materials.materialNotAdded"));
      }
    } catch (e) {
      setError(t("common.error"));
      notifyError(t("materials.materialNotAdded"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/materials");
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
          {t("materials.back")}
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("materials.addMaterial")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("materials.addMaterialDesc")}
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
            {/* Material nomi */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("materials.materialName")} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("materials.materialNamePlaceholder")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Kod */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                {t("materials.code")} ({t("materials.optional")})
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder={t("materials.codePlaceholder")}
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-red-500 text-xs">{errors.code}</p>
              )}
            </div>

            {/* Material turi */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                {t("materials.materialType")} *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("materials.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-xs">{errors.type}</p>
              )}
            </div>

            {/* O'lchov birligi */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium">
                {t("materials.unitOfMeasure")} *
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange("unit", value)}
              >
                <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("materials.selectUnit")} />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-red-500 text-xs">{errors.unit}</p>
              )}
            </div>

            {/* Narx */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                {t("materials.price")} ({t("materials.optional")})
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder={t("materials.pricePlaceholder")}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-red-500 text-xs">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Tavsif */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("materials.description")} ({t("materials.optional")})
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("materials.descriptionPlaceholder")}
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
          </div>

          {/* Faollik */}
          <div className="flex items-center space-x-3">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange("active", checked)}
            />
            <Label htmlFor="active" className="text-sm font-medium">
              {t("materials.activeStatus")}
            </Label>
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
              {loading ? t("materials.saving") : t("materials.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {t("materials.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
