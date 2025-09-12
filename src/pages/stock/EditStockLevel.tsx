import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { stockService } from "@/services/stock.service";

export default function EditStockLevelPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store hooks
  const { updateStockLevel } = useStockStore();
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

  // Fetch existing stock level data
  useEffect(() => {
    if (id) {
      fetchStockLevelData();
    }
  }, [id]);

  const fetchStockLevelData = async () => {
    if (!id) return;

    try {
      setFetchLoading(true);
      setError(null);
      const stockLevel = await stockService.getStockLevel(id);

      setFormData({
        material: stockLevel.material || "",
        product: stockLevel.product || "",
        location: stockLevel.location,
        quantity: stockLevel.quantity,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch stock level data"
      );
      console.error("Error fetching stock level:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  // Filter locations to show only WORKCENTER and WAREHOUSE types
  const filteredLocations = locations.filter(
    (location) =>
      location.location_type === "WORKCENTER" ||
      location.location_type === "WAREHOUSE"
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    if (!formData.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(formData.quantity))) {
      newErrors.quantity = "Quantity must be a valid number";
    }

    // At least one of material or product must be selected (but not both)
    if (!formData.material && !formData.product) {
      newErrors.material = "Either material or product must be selected";
      newErrors.product = "Either material or product must be selected";
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

    if (!validateForm() || !id) {
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

      // The API expects the same structure as create, so we cast it to the expected type
      const result = await updateStockLevel(id, submitData as any);

      if (result) {
        // Navigate back to stock levels page
        navigate("/stock/stock-levels");
      } else {
        setError("Failed to update stock level");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update stock level"
      );
      console.error("Error updating stock level:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/stock/stock-levels");
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 size={20} className="animate-spin" />
          Loading stock level data...
        </div>
      </div>
    );
  }

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
          Back
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Edit Stock Level
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Update stock level entry
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
                Material
              </Label>
              <Select
                value={formData.material}
                onValueChange={(value) => handleInputChange("material", value)}
              >
                <SelectTrigger
                  className={errors.material ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select material (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} ({material.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.material && (
                <p className="text-red-500 text-xs">{errors.material}</p>
              )}
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label htmlFor="product" className="text-sm font-medium">
                Product
              </Label>
              <Select
                value={formData.product}
                onValueChange={(value) => handleInputChange("product", value)}
              >
                <SelectTrigger
                  className={errors.product ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select product (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id!}>
                      {product.name} ({product.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.product && (
                <p className="text-red-500 text-xs">{errors.product}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location *
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleInputChange("location", value)}
              >
                <SelectTrigger
                  className={errors.location ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.location_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && (
                <p className="text-red-500 text-xs">{errors.location}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder="Enter quantity"
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
              <strong>Note:</strong> You can select either a material OR a
              product, but not both. Selecting one will automatically clear the
              other selection.
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
              {loading ? "Updating..." : "Update Stock Level"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
