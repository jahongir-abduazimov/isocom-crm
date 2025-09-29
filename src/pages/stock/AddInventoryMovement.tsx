import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Select components removed - using native HTML select instead
import {
  stockService,
  type CreateInventoryMovementLogRequest,
} from "@/services/stock.service";
import { LocationsService } from "@/services/locations.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import request from "@/components/config/index";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/hooks/useTranslation";


interface User {
  id: string;
  username: string;
  email: string;
  role_display_uz?: string;
}

interface Material {
  id: string;
  name: string;
  code?: string;
  type?: string;
}

interface Product {
  id: string;
  name: string;
  code?: string;
  type?: string;
}

interface Location {
  id: string;
  name: string;
  location_type: string;
}

export default function AddInventoryMovementPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedOperator, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stockLevels, setStockLevels] = useState<any[]>([]);

  // Check if current user is superadmin
  const isSuperAdmin = user?.is_superuser || false;
  const isOperator = user?.is_operator || false;

  const [formData, setFormData] = useState<CreateInventoryMovementLogRequest>({
    material: "",
    product: "",
    from_location: "",
    to_location: "",
    quantity: "",
    user: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting to fetch data...");
        setLoadingData(true);
        setError(null);

        // Fetch materials
        try {
          console.log("Fetching materials...");
          const materialsRes = await request.get("/materials/");
          console.log("Materials response:", materialsRes.data);
          setMaterials(materialsRes.data.results || []);
        } catch (err) {
          console.error("Error fetching materials:", err);
          setMaterials([]);
        }

        // Fetch products
        try {
          console.log("Fetching products...");
          const productsRes = await request.get("/products/");
          console.log("Products response:", productsRes.data);
          setProducts(productsRes.data.results || []);
        } catch (err) {
          console.error("Error fetching products:", err);
          setProducts([]);
        }

        // Fetch locations
        try {
          console.log("Fetching locations...");
          const locationsData = await LocationsService.getLocations();
          console.log("Locations response:", locationsData);
          setLocations(locationsData.results || []);
        } catch (err) {
          console.error("Error fetching locations:", err);
          setLocations([]);
        }

        // Fetch users only for superadmin
        if (isSuperAdmin) {
          try {
            console.log("Fetching users...");
            const usersRes = await request.get("/users/");
            console.log("Users response:", usersRes.data);
            setUsers(usersRes.data.results || []);
          } catch (err) {
            console.error("Error fetching users:", err);
            setUsers([]);
          }
        }

        // Fetch stock levels
        try {
          console.log("Fetching stock levels...");
          const stockRes = await stockService.getStockLevels();
          console.log("Stock levels response:", stockRes);
          setStockLevels(stockRes.results || []);
        } catch (err) {
          console.error("Error fetching stock levels:", err);
          setStockLevels([]);
        }


        console.log("Data fetching completed");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t("inventoryMovements.loadError"));
      } finally {
        setLoadingData(false);
        console.log("Loading state set to false");
      }
    };

    fetchData();
  }, []);

  const checkStockAvailability = () => {
    if (!formData.from_location || !formData.quantity) {
      return { available: true, message: "" };
    }

    const requestedQuantity = Number(formData.quantity);
    if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
      return { available: true, message: "" };
    }

    // Check stock for material
    if (formData.material) {
      const stockLevel = stockLevels.find(
        (stock) =>
          stock.material === formData.material &&
          stock.location === formData.from_location
      );

      if (!stockLevel) {
        const materialName = materials.find(m => m.id === formData.material)?.name || "Unknown Material";
        const locationName = locations.find(l => l.id === formData.from_location)?.name || "Unknown Location";
        return {
          available: false,
          message: `${materialName} material is not available at ${locationName} location!`
        };
      }

      const availableQuantity = Number(stockLevel.quantity);
      if (availableQuantity < requestedQuantity) {
        const materialName = materials.find(m => m.id === formData.material)?.name || "Unknown Material";
        const locationName = locations.find(l => l.id === formData.from_location)?.name || "Unknown Location";
        return {
          available: false,
          message: `${materialName} material is not available in sufficient quantity at ${locationName} location! Available: ${availableQuantity}, Requested: ${requestedQuantity}`
        };
      }
    }

    // Check stock for product
    if (formData.product) {
      const stockLevel = stockLevels.find(
        (stock) =>
          stock.product === formData.product &&
          stock.location === formData.from_location
      );

      if (!stockLevel) {
        const productName = products.find(p => p.id === formData.product)?.name || "Unknown Product";
        const locationName = locations.find(l => l.id === formData.from_location)?.name || "Unknown Location";
        return {
          available: false,
          message: `${productName} product is not available at ${locationName} location!`
        };
      }

      const availableQuantity = Number(stockLevel.quantity);
      if (availableQuantity < requestedQuantity) {
        const productName = products.find(p => p.id === formData.product)?.name || "Unknown Product";
        const locationName = locations.find(l => l.id === formData.from_location)?.name || "Unknown Location";
        return {
          available: false,
          message: `${productName} product is not available in sufficient quantity at ${locationName} location! Available: ${availableQuantity}, Requested: ${requestedQuantity}`
        };
      }
    }

    return { available: true, message: "" };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // At least one of material or product must be selected, but not both
    if (!formData.material && !formData.product) {
      newErrors.material = t("inventoryMovements.materialRequired");
      newErrors.product = t("inventoryMovements.productRequired");
    }

    // Ensure only one is selected (additional safety check)
    if (formData.material && formData.product) {
      newErrors.material = t("inventoryMovements.bothSelected");
      newErrors.product = t("inventoryMovements.bothSelected");
    }

    if (!formData.from_location) {
      newErrors.from_location = t("inventoryMovements.fromLocationRequired");
    }

    if (!formData.to_location) {
      newErrors.to_location = t("inventoryMovements.toLocationRequired");
    }

    if (!formData.quantity) {
      newErrors.quantity = t("inventoryMovements.quantityRequired");
    } else if (isNaN(Number(formData.quantity))) {
      newErrors.quantity = t("inventoryMovements.quantityInvalid");
    }

    // Validation based on user role
    if (isSuperAdmin) {
      // For superadmin, check if user is selected
      if (!formData.user) {
        newErrors.user = t("inventoryMovements.userRequired");
      }
    } else if (isOperator) {
      // For operator, check if selectedOperator is available
      if (!selectedOperator) {
        newErrors.user = t("inventoryMovements.selectOperatorFirstError");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof CreateInventoryMovementLogRequest,
    value: string
  ) => {
    // Clear material when product is selected and vice versa
    if (field === "material" && value) {
      setFormData((prev) => ({
        ...prev,
        material: value,
        product: "", // Clear product when material is selected
      }));
    } else if (field === "product" && value) {
      setFormData((prev) => ({
        ...prev,
        product: value,
        material: "", // Clear material when product is selected
      }));
    } else if (field === "from_location") {
      setFormData((prev) => ({
        ...prev,
        from_location: value,
        // Clear to_location if it's the same as the new from_location
        to_location: prev.to_location === value ? "" : prev.to_location,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Clear related field errors when switching between material and product
    if (field === "material" && value) {
      setErrors((prev) => ({
        ...prev,
        product: "",
      }));
    } else if (field === "product" && value) {
      setErrors((prev) => ({
        ...prev,
        material: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check stock availability before submitting
    const stockCheck = checkStockAvailability();
    if (!stockCheck.available) {
      setError(stockCheck.message);
      notifyError(stockCheck.message);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        // Only include material or product, not both
        material: formData.material || undefined,
        product: formData.product || undefined,
        // Use different user based on role
        user: isSuperAdmin ? formData.user : (selectedOperator?.id || ""),
      };

      await stockService.createInventoryMovementLog(submitData);

      notifySuccess(t("inventoryMovements.createSuccess"));
      navigate("/stock/inventory-movement-logs");
    } catch (err: any) {
      let errorMessage = t("inventoryMovements.createError");

      // Handle different types of errors
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      notifyError(errorMessage);
      console.error("Error creating inventory movement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/stock/inventory-movement-logs");
  };

  // Get current stock level for selected material/product and location
  const getCurrentStockLevel = () => {
    if (!formData.from_location || (!formData.material && !formData.product)) {
      return null;
    }

    const stockLevel = stockLevels.find((stock) => {
      if (formData.material) {
        return stock.material === formData.material && stock.location === formData.from_location;
      } else if (formData.product) {
        return stock.product === formData.product && stock.location === formData.from_location;
      }
      return false;
    });

    return stockLevel;
  };

  const currentStock = getCurrentStockLevel();

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2
            size={32}
            className="animate-spin mx-auto mb-4 text-blue-600"
          />
          <p className="text-gray-600">{t("inventoryMovements.loadingFormData")}</p>
        </div>
      </div>
    );
  }

  // Show error state if there's a critical error
  if (
    error &&
    materials.length === 0 &&
    products.length === 0 &&
    locations.length === 0
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
            <h3 className="text-red-800 font-medium mb-2">
              {t("inventoryMovements.failedToLoadData")}
            </h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              {t("inventoryMovements.refreshPage")}
            </Button>
          </div>
        </div>
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
          {t("inventoryMovements.back")}
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("inventoryMovements.addMovementTitle")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("inventoryMovements.createMovement")}
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

          {/* Warning if no data available */}
          {(materials.length === 0 ||
            locations.length === 0 ||
            (isSuperAdmin && users.length === 0)) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800 text-sm">
                  {t("inventoryMovements.dataNotAvailable")}
                </p>
              </div>
            )}

          {/* Warning if no operator selected (only for operators) */}
          {isOperator && !selectedOperator && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">
                {t("inventoryMovements.selectOperatorFirst")}
              </p>
            </div>
          )}

          {/* Info message about mutual exclusion */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>{t("common.note")}:</strong> {t("inventoryMovements.mutualExclusionNote")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Material */}
            <div className="space-y-2">
              <Label htmlFor="material" className="text-sm font-medium">
                {t("inventoryMovements.material")}{" "}
                {formData.product && (
                  <span className="text-gray-500">
                    ({t("inventoryMovements.materialDisabled")})
                  </span>
                )}
              </Label>
              <select
                id="material"
                value={formData.material}
                onChange={(e) => handleInputChange("material", e.target.value)}
                disabled={!!formData.product}
                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.material ? "border-red-500" : "border-gray-300"
                  } ${formData.product ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="">{t("inventoryMovements.none")}</option>
                {materials.length === 0 ? (
                  <option value="" disabled>
                    {t("inventoryMovements.noMaterialsAvailable")}
                  </option>
                ) : (
                  materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} {material.code && `(${material.code})`}
                    </option>
                  ))
                )}
              </select>
              {errors.material && (
                <p className="text-red-500 text-xs">{errors.material}</p>
              )}
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label htmlFor="product" className="text-sm font-medium">
                {t("inventoryMovements.product")}{" "}
                {formData.material && (
                  <span className="text-gray-500">
                    ({t("inventoryMovements.productDisabled")})
                  </span>
                )}
              </Label>
              <select
                id="product"
                value={formData.product}
                onChange={(e) => handleInputChange("product", e.target.value)}
                disabled={!!formData.material}
                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.product ? "border-red-500" : "border-gray-300"
                  } ${formData.material ? "bg-gray-100 cursor-not-allowed" : ""}`}
              >
                <option value="">{t("inventoryMovements.none")}</option>
                {products.length === 0 ? (
                  <option value="" disabled>
                    {t("inventoryMovements.noProductsAvailable")}
                  </option>
                ) : (
                  products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.code && `(${product.code})`}
                    </option>
                  ))
                )}
              </select>
              {errors.product && (
                <p className="text-red-500 text-xs">{errors.product}</p>
              )}
            </div>

            {/* From Location */}
            <div className="space-y-2">
              <Label htmlFor="from_location" className="text-sm font-medium">
                {t("inventoryMovements.fromLocationLabel")}
              </Label>
              <select
                id="from_location"
                value={formData.from_location}
                onChange={(e) =>
                  handleInputChange("from_location", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.from_location ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <option value="">{t("inventoryMovements.selectFromLocation")}</option>
                {locations.length === 0 ? (
                  <option value="" disabled>
                    {t("inventoryMovements.noLocationsAvailable")}
                  </option>
                ) : (
                  locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.location_type})
                    </option>
                  ))
                )}
              </select>
              {errors.from_location && (
                <p className="text-red-500 text-xs">{errors.from_location}</p>
              )}
            </div>

            {/* To Location */}
            <div className="space-y-2">
              <Label htmlFor="to_location" className="text-sm font-medium">
                {t("inventoryMovements.toLocationLabel")}
              </Label>
              <select
                id="to_location"
                value={formData.to_location}
                onChange={(e) =>
                  handleInputChange("to_location", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.to_location ? "border-red-500" : "border-gray-300"
                  }`}
              >
                <option value="">{t("inventoryMovements.selectToLocation")}</option>
                {locations.length === 0 ? (
                  <option value="" disabled>
                    {t("inventoryMovements.noLocationsAvailable")}
                  </option>
                ) : (
                  locations
                    .filter((location) => location.id !== formData.from_location)
                    .map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} ({location.location_type})
                      </option>
                    ))
                )}
              </select>
              {errors.to_location && (
                <p className="text-red-500 text-xs">{errors.to_location}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                {t("inventoryMovements.quantityLabel")}
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                placeholder={t("inventoryMovements.enterQuantity")}
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs">{errors.quantity}</p>
              )}

              {/* Stock Level Display */}
              {currentStock && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>{t("inventoryMovements.currentStock")}:</strong> {currentStock.quantity}
                  </p>
                  {formData.quantity && !isNaN(Number(formData.quantity)) && (
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>{t("inventoryMovements.afterMovement")}:</strong> {Number(currentStock.quantity) - Number(formData.quantity)}
                    </p>
                  )}
                </div>
              )}

              {/* Stock Warning */}
              {currentStock && formData.quantity && !isNaN(Number(formData.quantity)) &&
                Number(currentStock.quantity) < Number(formData.quantity) && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>{t("inventoryMovements.stockWarning")}</strong> {t("inventoryMovements.insufficientStock", { available: currentStock.quantity, requested: formData.quantity })}
                    </p>
                  </div>
                )}

              {/* No Stock Warning */}
              {formData.from_location && (formData.material || formData.product) && !currentStock && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>{t("inventoryMovements.noStockWarning")}</strong> {t("inventoryMovements.noStockAvailable")}
                  </p>
                </div>
              )}
            </div>

            {/* User Selection - Different based on role */}
            {isSuperAdmin ? (
              /* User Selection for SuperAdmin */
              <div className="space-y-2">
                <Label htmlFor="user" className="text-sm font-medium">
                  {t("inventoryMovements.userLabel")}
                </Label>
                <select
                  id="user"
                  value={formData.user}
                  onChange={(e) => handleInputChange("user", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${errors.user ? "border-red-500" : "border-gray-300"
                    }`}
                >
                  <option value="">{t("inventoryMovements.selectUser")}</option>
                  {users.length === 0 ? (
                    <option value="" disabled>
                      {t("inventoryMovements.noUsersAvailable")}
                    </option>
                  ) : (
                    users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role_display_uz || user.email})
                      </option>
                    ))
                  )}
                </select>
                {errors.user && (
                  <p className="text-red-500 text-xs">{errors.user}</p>
                )}
              </div>
            ) : (
              /* Selected Operator Display for Operators */
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("inventoryMovements.selectedOperator")}
                </Label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50">
                  {selectedOperator ? (
                    <span className="text-gray-900">
                      {selectedOperator.username} ({selectedOperator.role_display_uz})
                    </span>
                  ) : (
                    <span className="text-gray-500">{t("inventoryMovements.noOperatorSelected")}</span>
                  )}
                </div>
                {errors.user && (
                  <p className="text-red-500 text-xs">{errors.user}</p>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={
                loading ||
                (isOperator && !selectedOperator) ||
                (isSuperAdmin && !formData.user) ||
                (currentStock && formData.quantity && Number(currentStock.quantity) < Number(formData.quantity)) ||
                (!currentStock && formData.from_location && (formData.material || formData.product))
              }
              className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[120px]"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {loading ? t("inventoryMovements.creating") : t("inventoryMovements.create")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
