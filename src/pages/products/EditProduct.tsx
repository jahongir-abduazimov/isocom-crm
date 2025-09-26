import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useProductsStore } from "@/store/products.store";
import { useTranslation } from "@/hooks/useTranslation";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, updateProduct, loading, error } = useProductsStore();
  const { t } = useTranslation();

  const PRODUCT_TYPES = [
    { value: "FINISHED_PRODUCT", label: t("products.finishedProduct") },
    { value: "SEMI_FINISHED_PRODUCT", label: t("products.semiFinishedProduct") },
  ];

  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "FINISHED_PRODUCT",
    description: "",
    price: "",
    is_active: true,
    length: "",
    thickness: "",
    diameter: "",
    width: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product data
  useEffect(() => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setFormData({
        name: product.name || "",
        code: product.code || "",
        type: product.type || "FINISHED_PRODUCT",
        description: product.description || "",
        price: product.price ? String(product.price) : "",
        is_active: product.is_active ?? true,
        length: product.length ? String(product.length) : "",
        thickness: product.thickness ? String(product.thickness) : "",
        diameter: product.diameter ? String(product.diameter) : "",
        width: product.width ? String(product.width) : "",
      });
    }
    setFetching(false);
  }, [products, id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("products.validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("products.validation.nameMinLength");
    }

    if (!formData.type) {
      newErrors.type = t("products.validation.typeRequired");
    }

    // Optional field validations (only if they have values)
    if (formData.code.trim() && formData.code.trim().length < 2) {
      newErrors.code = t("products.validation.codeMinLength");
    }

    if (formData.description.trim() && formData.description.trim().length < 5) {
      newErrors.description = t("products.validation.descriptionMinLength");
    }

    if (formData.price.trim() && (isNaN(Number(formData.price)) || Number(formData.price) <= 0)) {
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

    if (!id) {
      notifyError(t("products.productIdNotFound"));
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const apiData: any = {
        name: formData.name.trim(),
        type: formData.type,
        is_active: formData.is_active,
      };

      // Add optional fields only if they have values
      if (formData.code.trim()) {
        apiData.code = formData.code.trim();
      }
      if (formData.description.trim()) {
        apiData.description = formData.description.trim();
      }
      if (formData.price.trim()) {
        apiData.price = Number(formData.price);
      }

      // Add dimension fields only if they have values
      if (formData.length && formData.length.trim() !== '') {
        apiData.length = Number(formData.length);
      }
      if (formData.thickness && formData.thickness.trim() !== '') {
        apiData.thickness = Number(formData.thickness);
      }
      if (formData.diameter && formData.diameter.trim() !== '') {
        apiData.diameter = Number(formData.diameter);
      }
      if (formData.width && formData.width.trim() !== '') {
        apiData.width = Number(formData.width);
      }

      console.log("Sending product update data to backend:", apiData);
      const success = await updateProduct(id, apiData);
      if (success) {
        notifySuccess(t("products.productUpdated"));
        navigate("/products");
      } else {
        notifyError(t("products.productNotUpdated"));
      }
    } catch (e) {
      notifyError(t("common.error"));
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t("products.loadingProduct")}</p>
        </div>
      </div>
    );
  }

  const product = products.find((p) => p.id === id);
  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg mb-4">{t("products.productNotFound")}</p>
        <Button onClick={handleCancel} variant="outline">
          {t("products.backToList")}
        </Button>
      </div>
    );
  }

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
          {t("products.back")}
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("products.editProduct")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("products.editProductDesc")}
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

            {/* Kod */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                {t("products.code")} ({t("products.optional")})
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

            {/* Narx */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                {t("products.price")} ({t("products.optional")})
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

          {/* Dimension Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Uzunlik */}
            <div className="space-y-2">
              <Label htmlFor="length" className="text-sm font-medium">
                {t("products.length")} ({t("products.optional")})
              </Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                min="0"
                value={formData.length}
                onChange={(e) => handleInputChange("length", e.target.value)}
                placeholder={t("products.lengthPlaceholder")}
              />
            </div>

            {/* Qalinlik */}
            <div className="space-y-2">
              <Label htmlFor="thickness" className="text-sm font-medium">
                {t("products.thickness")} ({t("products.optional")})
              </Label>
              <Input
                id="thickness"
                type="number"
                step="0.01"
                min="0"
                value={formData.thickness}
                onChange={(e) => handleInputChange("thickness", e.target.value)}
                placeholder={t("products.thicknessPlaceholder")}
              />
            </div>

            {/* Diametr */}
            <div className="space-y-2">
              <Label htmlFor="diameter" className="text-sm font-medium">
                {t("products.diameter")} ({t("products.optional")})
              </Label>
              <Input
                id="diameter"
                type="number"
                step="0.01"
                min="0"
                value={formData.diameter}
                onChange={(e) => handleInputChange("diameter", e.target.value)}
                placeholder={t("products.diameterPlaceholder")}
              />
            </div>

            {/* Kenglik */}
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm font-medium">
                {t("products.width")} ({t("products.optional")})
              </Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                min="0"
                value={formData.width}
                onChange={(e) => handleInputChange("width", e.target.value)}
                placeholder={t("products.widthPlaceholder")}
              />
            </div>
          </div>

          {/* Tavsif */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("products.description")} ({t("products.optional")})
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
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
            <Label htmlFor="is_active" className="text-sm font-medium">
              {t("products.activeStatus")}
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
              {loading ? t("products.saving") : t("products.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {t("products.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
