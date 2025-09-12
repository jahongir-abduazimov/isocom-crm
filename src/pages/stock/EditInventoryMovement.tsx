import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    stockService,
    type CreateInventoryMovementLogRequest,
    type InventoryMovement,
} from "@/services/stock.service";
import { LocationsService } from "@/services/locations.service";
import { notifySuccess, notifyError } from "@/lib/notification";
import request from "@/components/config";

interface User {
    id: string;
    username: string;
    email: string;
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

export default function EditInventoryMovementPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [movement, setMovement] = useState<InventoryMovement | null>(null);

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
            if (!id) {
                setError("Invalid movement ID");
                setLoadingData(false);
                return;
            }

            try {
                console.log("Starting to fetch data...");
                setLoadingData(true);
                setError(null);

                // Fetch the movement data first
                try {
                    console.log("Fetching movement data...");
                    const movementData = await stockService.getInventoryMovement(id);
                    console.log("Movement response:", movementData);
                    setMovement(movementData);

                    // Set form data from the fetched movement
                    setFormData({
                        material: movementData.material || "",
                        product: movementData.product || "",
                        from_location: movementData.from_location,
                        to_location: movementData.to_location,
                        quantity: movementData.quantity,
                        user: movementData.user,
                    });
                } catch (err) {
                    console.error("Error fetching movement:", err);
                    setError("Failed to load movement data");
                    return;
                }

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

                // Fetch users
                try {
                    console.log("Fetching users...");
                    const usersRes = await request.get("/users/");
                    console.log("Users response:", usersRes.data);
                    setUsers(usersRes.data.results || []);
                } catch (err) {
                    console.error("Error fetching users:", err);
                    setUsers([]);
                }

                console.log("Data fetching completed");
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load form data. Please refresh the page.");
            } finally {
                setLoadingData(false);
                console.log("Loading state set to false");
            }
        };

        fetchData();
    }, [id]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // At least one of material or product must be selected, but not both
        if (!formData.material && !formData.product) {
            newErrors.material =
                "Please select either a material or a product (not both)";
            newErrors.product =
                "Please select either a material or a product (not both)";
        }

        // Ensure only one is selected (additional safety check)
        if (formData.material && formData.product) {
            newErrors.material =
                "Cannot select both material and product at the same time";
            newErrors.product =
                "Cannot select both material and product at the same time";
        }

        if (!formData.from_location) {
            newErrors.from_location = "From location is required";
        }

        if (!formData.to_location) {
            newErrors.to_location = "To location is required";
        }

        if (!formData.quantity) {
            newErrors.quantity = "Quantity is required";
        } else if (isNaN(Number(formData.quantity))) {
            newErrors.quantity = "Quantity must be a valid number";
        }

        if (!formData.user) {
            newErrors.user = "User is required";
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

        if (!id) {
            setError("Invalid movement ID");
            return;
        }

        if (!validateForm()) {
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
            };

            await stockService.updateInventoryMovementLog(id, submitData);

            notifySuccess("Inventory movement updated successfully");
            navigate("/stock/inventory-movement-logs");
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to update inventory movement";
            setError(errorMessage);
            notifyError(errorMessage);
            console.error("Error updating inventory movement:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/stock/inventory-movement-logs");
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2
                        size={32}
                        className="animate-spin mx-auto mb-4 text-blue-600"
                    />
                    <p className="text-gray-600">Loading form data...</p>
                </div>
            </div>
        );
    }

    // Show error state if there's a critical error
    if (error && !movement) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
                        <h3 className="text-red-800 font-medium mb-2">
                            Failed to Load Data
                        </h3>
                        <p className="text-red-600 text-sm mb-4">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            size="sm"
                        >
                            Refresh Page
                        </Button>
                    </div>
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
                        Edit Inventory Movement
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm lg:text-base">
                        Update inventory movement details
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

                    {/* Warning if no data available */}
                    {(materials.length === 0 ||
                        locations.length === 0 ||
                        users.length === 0) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <p className="text-yellow-800 text-sm">
                                    Some data is not available. Please check if materials,
                                    locations, and users are properly configured.
                                </p>
                            </div>
                        )}

                    {/* Info message about mutual exclusion */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                        <p className="text-blue-800 text-sm">
                            <strong>Note:</strong> You can select either a material OR a
                            product, but not both at the same time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Material */}
                        <div className="space-y-2">
                            <Label htmlFor="material" className="text-sm font-medium">
                                Material{" "}
                                {formData.product && (
                                    <span className="text-gray-500">
                                        (disabled when product is selected)
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
                                <option value="">None</option>
                                {materials.length === 0 ? (
                                    <option value="" disabled>
                                        No materials available
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
                                Product{" "}
                                {formData.material && (
                                    <span className="text-gray-500">
                                        (disabled when material is selected)
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
                                <option value="">None</option>
                                {products.length === 0 ? (
                                    <option value="" disabled>
                                        No products available
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
                                From Location *
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
                                <option value="">Select from location</option>
                                {locations.length === 0 ? (
                                    <option value="" disabled>
                                        No locations available
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
                                To Location *
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
                                <option value="">Select to location</option>
                                {locations.length === 0 ? (
                                    <option value="" disabled>
                                        No locations available
                                    </option>
                                ) : (
                                    locations.map((location) => (
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

                        {/* User */}
                        <div className="space-y-2">
                            <Label htmlFor="user" className="text-sm font-medium">
                                User *
                            </Label>
                            <select
                                id="user"
                                value={formData.user}
                                onChange={(e) => handleInputChange("user", e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.user ? "border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select user</option>
                                {users.length === 0 ? (
                                    <option value="" disabled>
                                        No users available
                                    </option>
                                ) : (
                                    users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.username} ({user.email})
                                        </option>
                                    ))
                                )}
                            </select>
                            {errors.user && (
                                <p className="text-red-500 text-xs">{errors.user}</p>
                            )}
                        </div>
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
                            {loading ? "Updating..." : "Update Movement"}
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
