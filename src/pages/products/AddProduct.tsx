import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useProductsStore } from "../../store/products.store";
import { useTranslation } from "@/hooks/useTranslation";

export default function AddProductPage() {
  const navigate = useNavigate();
  const { addProduct, loading, error } = useProductsStore();
  const { t } = useTranslation();

  const PRODUCT_TYPES = [
    { value: "FINISHED_PRODUCT", label: t("products.finishedProduct") },
    { value: "SEMI_FINISHED_PRODUCT", label: t("products.semiFinishedProduct") },
  ];

  const UNITS = [
    { value: "dona", label: t("products.piece") },
    { value: "kg", label: t("products.kilogram") },
    { value: "m", label: t("products.meter") },
    { value: "m2", label: t("products.squareMeter") },
    { value: "m3", label: t("products.cubicMeter") },
    { value: "litr", label: t("products.liter") },
  ];
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    code: "",
    type: "FINISHED_PRODUCT",
    unit: "dona",
    description: "",
    price: "",
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("products.validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("products.validation.nameMinLength");
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t("products.validation.slugRequired");
    } else if (formData.slug.trim().length < 2) {
      newErrors.slug = t("products.validation.slugMinLength");
    }

    if (!formData.code.trim()) {
      newErrors.code = t("products.validation.codeRequired");
    } else if (formData.code.trim().length < 2) {
      newErrors.code = t("products.validation.codeMinLength");
    }

    if (!formData.type) {
      newErrors.type = t("products.validation.typeRequired");
    }

    if (!formData.unit) {
      newErrors.unit = t("products.validation.unitRequired");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("products.validation.descriptionRequired");
    } else if (formData.description.trim().length < 5) {
      newErrors.description = t("products.validation.descriptionMinLength");
    }

    if (!formData.price.trim()) {
      newErrors.price = t("products.validation.priceRequired");
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = t("products.validation.pricePositive");
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
      await addProduct({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        code: formData.code.trim(),
        type: formData.type,
        unit: formData.unit,
        description: formData.description.trim(),
        price: formData.price,
        is_active: formData.active,
      });
      navigate("/products");
    } catch (e) {
      // Error handled by Zustand store
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t("products.back")}
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("products.addProduct")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("products.addProductDesc")}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maxsulot nomi */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("products.productName")} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("products.productNamePlaceholder")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                {t("products.slug")} *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder={t("products.slugPlaceholder")}
                className={errors.slug ? "border-red-500" : ""}
              />
              {errors.slug && (
                <p className="text-red-500 text-xs">{errors.slug}</p>
              )}
            </div>

            {/* Kod */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                {t("products.code")} *
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder={t("products.codePlaceholder")}
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-red-500 text-xs">{errors.code}</p>
              )}
            </div>

            {/* Maxsulot turi */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                {t("products.productType")} *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("products.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((type) => (
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
                {t("products.unit")} *
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange("unit", value)}
              >
                <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("products.selectUnit")} />
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
                {t("products.price")} *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder={t("products.pricePlaceholder")}
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
              {t("products.description")} *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("products.descriptionPlaceholder")}
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
              {t("products.activeStatus")}
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {loading ? t("products.saving") : t("products.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {t("products.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
