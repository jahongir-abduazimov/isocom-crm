import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStockStore } from "@/store/stock.store";
import { useMaterialsStore } from "@/store/materials.store";
import { useProductsStore } from "@/store/products.store";
import { useLocationsStore } from "@/store/locations.store";
import { useWorkcentersStore } from "@/store/workcenters.store";
import { useWarehousesStore } from "@/store/warehouses.store";
import { useTranslation } from "@/hooks/useTranslation";
import { notifySuccess, notifyError } from "@/lib/notification";

export default function AddStockLevelPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store hooks
  const { createStockLevel } = useStockStore();
  const { materials, fetchMaterials } = useMaterialsStore();
  const { products, fetchProducts } = useProductsStore();
  const { locations, fetchLocations } = useLocationsStore();
  const { fetchWorkcenters } = useWorkcentersStore();
  const { fetchWarehouses } = useWarehousesStore();

  const [formData, setFormData] = useState({
    material: "",
    product: "",
    location: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data on component mount
  useEffect(() => {
    fetchMaterials();
    fetchProducts();
    fetchLocations();
    fetchWorkcenters();
    fetchWarehouses();
  }, [
    fetchMaterials,
    fetchProducts,
    fetchLocations,
    fetchWorkcenters,
    fetchWarehouses,
  ]);

  // Filter locations to show only WORKCENTER and WAREHOUSE types
  const filteredLocations = locations.filter(
    (location) =>
      location.location_type === "WORKCENTER" ||
      location.location_type === "WAREHOUSE"
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.location) {
      newErrors.location = t("stockLevels.locationRequired");
    }

    if (!formData.quantity) {
      newErrors.quantity = t("stockLevels.quantityRequired");
    } else if (isNaN(Number(formData.quantity))) {
      newErrors.quantity = t("stockLevels.quantityInvalid");
    }

    // At least one of material or product must be selected (but not both)
    if (!formData.material && !formData.product) {
      newErrors.material = t("stockLevels.materialOrProductRequired");
      newErrors.product = t("stockLevels.materialOrProductRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // If selecting material, clear product
      if (field === "material" && value) {
        newData.product = "";
      }

      // If selecting product, clear material
      if (field === "product" && value) {
        newData.material = "";
      }

      return newData;
    });

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
        material: formData.material || undefined,
        product: formData.product || undefined,
        location: formData.location,
        quantity: formData.quantity,
      };

      const result = await createStockLevel(submitData);

      if (result) {
        notifySuccess(t("stockLevels.createSuccess"));
        // Navigate back to stock levels page
        navigate("/stock/stock-levels");
      } else {
        setError(t("stockLevels.createError"));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("stockLevels.createError");
      setError(errorMessage);
      notifyError(errorMessage);
      console.error("Error creating stock level:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/stock/stock-levels");
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
          {t("stockLevels.back")}
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("stockLevels.addStockLevelTitle")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("stockLevels.createStockLevel")}
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
            {/* Material */}
            <div className="space-y-2">
              <Label htmlFor="material" className="text-sm font-medium">
                {t("stockLevels.material")}
              </Label>
              <Select
                value={formData.material}
                onValueChange={(value) => handleInputChange("material", value)}
              >
                <SelectTrigger
                  className={errors.material ? "border-red-500" : ""}
                >
                  <SelectValue placeholder={t("stockLevels.selectMaterial")} />
                </SelectTrigger>
                <SelectContent>
                  {materials.length === 0 ? (
                    <SelectItem value="" disabled>
                      {t("stockLevels.noMaterialsAvailable")}
                    </SelectItem>
                  ) : (
                    materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} ({material.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.material && (
                <p className="text-red-500 text-xs">{errors.material}</p>
              )}
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label htmlFor="product" className="text-sm font-medium">
                {t("stockLevels.product")}
              </Label>
              <Select
                value={formData.product}
                onValueChange={(value) => handleInputChange("product", value)}
              >
                <SelectTrigger
                  className={errors.product ? "border-red-500" : ""}
                >
                  <SelectValue placeholder={t("stockLevels.selectProduct")} />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <SelectItem value="" disabled>
                      {t("stockLevels.noProductsAvailable")}
                    </SelectItem>
                  ) : (
                    products.map((product) => (
                      <SelectItem key={product.id} value={product.id!}>
                        {product.name} ({product.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.product && (
                <p className="text-red-500 text-xs">{errors.product}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                {t("stockLevels.locationLabel")}
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleInputChange("location", value)}
              >
                <SelectTrigger
                  className={errors.location ? "border-red-500" : ""}
                >
                  <SelectValue placeholder={t("stockLevels.selectLocation")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations.length === 0 ? (
                    <SelectItem value="" disabled>
                      {t("stockLevels.noLocationsAvailable")}
                    </SelectItem>
                  ) : (
                    filteredLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.location_type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.location && (
                <p className="text-red-500 text-xs">{errors.location}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                {t("stockLevels.quantityLabel")}
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder={t("stockLevels.enterQuantity")}
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-700 text-sm">
              <strong>{t("common.note")}:</strong> {t("stockLevels.mutualExclusionNote")}
            </p>
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
              {loading ? t("stockLevels.creating") : t("stockLevels.create")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
