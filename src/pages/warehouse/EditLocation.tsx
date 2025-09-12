import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LocationsService } from "@/services/locations.service";
import { useLocationsStore } from "@/store/locations.store";
import { useWarehousesStore } from "@/store/warehouses.store";
import { useWorkcentersStore } from "@/store/workcenters.store";
import { notifySuccess } from "@/lib/notification";

export default function EditLocation() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { locations, updateLocation } = useLocationsStore();
    const { warehouses, fetchWarehouses } = useWarehousesStore();
    const { workcenters, fetchWorkcenters } = useWorkcentersStore();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        location_type: "" as "WAREHOUSE" | "WORKCENTER" | "WORKSHOP" | "",
        warehouse: "",
        work_center: "",
        is_active: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchWarehouses();
        fetchWorkcenters();
    }, [fetchWarehouses, fetchWorkcenters]);

    useEffect(() => {
        const loadLocation = async () => {
            if (!id) return;

            try {
                const location = locations.find((l) => l.id === id);
                if (location) {
                    setFormData({
                        name: location.name,
                        location_type: location.location_type,
                        warehouse: location.warehouse || "",
                        work_center: location.work_center || "",
                        is_active: location.is_active,
                    });
                } else {
                    // If not in store, fetch from API
                    const fetchedLocation = await LocationsService.getLocationById(id);
                    setFormData({
                        name: fetchedLocation.name,
                        location_type: fetchedLocation.location_type,
                        warehouse: fetchedLocation.warehouse || "",
                        work_center: fetchedLocation.work_center || "",
                        is_active: fetchedLocation.is_active,
                    });
                }
            } catch (error: any) {
                setError(error?.response?.data?.detail || "Failed to load location");
                console.error("Error loading location:", error);
            } finally {
                setInitialLoading(false);
            }
        };

        loadLocation();
    }, [id, locations]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Location name is required";
        }

        if (!formData.location_type) {
            newErrors.location_type = "Location type is required";
        }

        if (formData.location_type === "WAREHOUSE" && !formData.warehouse) {
            newErrors.warehouse = "Warehouse is required for warehouse location type";
        }

        if (formData.location_type === "WORKCENTER" && !formData.work_center) {
            newErrors.work_center =
                "Work center is required for work center location type";
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

        // Clear related fields when location type changes
        if (field === "location_type") {
            setFormData((prev) => ({
                ...prev,
                warehouse: "",
                work_center: "",
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const submitData = {
                name: formData.name.trim(),
                location_type: formData.location_type as "WAREHOUSE" | "WORKCENTER" | "WORKSHOP",
                warehouse:
                    formData.location_type === "WAREHOUSE" ? formData.warehouse : null,
                work_center:
                    formData.location_type === "WORKCENTER" ? formData.work_center : null,
                is_active: formData.is_active,
            };

            const updatedLocation = await LocationsService.updateLocation(id, submitData);
            updateLocation(id, updatedLocation);
            notifySuccess("Location updated successfully");
            navigate("/warehouse/locations");
        } catch (error: any) {
            setError(error?.response?.data?.detail || "Failed to update location");
            console.error("Error updating location:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/warehouse/locations");
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                        Edit Location
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm lg:text-base">
                        Update location information
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
                        {/* Location Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Location Name *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Enter location name"
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs">{errors.name}</p>
                            )}
                        </div>

                        {/* Location Type */}
                        <div className="space-y-2">
                            <Label htmlFor="location_type" className="text-sm font-medium">
                                Location Type *
                            </Label>
                            <Select
                                value={formData.location_type}
                                onValueChange={(
                                    value: "WAREHOUSE" | "WORKCENTER" | "WORKSHOP"
                                ) => handleInputChange("location_type", value)}
                            >
                                <SelectTrigger
                                    className={errors.location_type ? "border-red-500" : ""}
                                >
                                    <SelectValue placeholder="Select location type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                                    <SelectItem value="WORKCENTER">Work Center</SelectItem>
                                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.location_type && (
                                <p className="text-red-500 text-xs">{errors.location_type}</p>
                            )}
                        </div>
                    </div>

                    {/* Warehouse Selection (only for WAREHOUSE type) */}
                    {formData.location_type === "WAREHOUSE" && (
                        <div className="space-y-2">
                            <Label htmlFor="warehouse" className="text-sm font-medium">
                                Warehouse *
                            </Label>
                            <Select
                                value={formData.warehouse}
                                onValueChange={(value) => handleInputChange("warehouse", value)}
                            >
                                <SelectTrigger
                                    className={errors.warehouse ? "border-red-500" : ""}
                                >
                                    <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.warehouse && (
                                <p className="text-red-500 text-xs">{errors.warehouse}</p>
                            )}
                        </div>
                    )}

                    {/* Work Center Selection (only for WORKCENTER type) */}
                    {formData.location_type === "WORKCENTER" && (
                        <div className="space-y-2">
                            <Label htmlFor="work_center" className="text-sm font-medium">
                                Work Center *
                            </Label>
                            <Select
                                value={formData.work_center}
                                onValueChange={(value) =>
                                    handleInputChange("work_center", value)
                                }
                            >
                                <SelectTrigger
                                    className={errors.work_center ? "border-red-500" : ""}
                                >
                                    <SelectValue placeholder="Select work center" />
                                </SelectTrigger>
                                <SelectContent>
                                    {workcenters.map((workcenter) => (
                                        <SelectItem key={workcenter.id} value={workcenter.id}>
                                            {workcenter.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.work_center && (
                                <p className="text-red-500 text-xs">{errors.work_center}</p>
                            )}
                        </div>
                    )}

                    {/* Is Active */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="flex items-center space-x-3 pt-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) =>
                                    handleInputChange("is_active", checked)
                                }
                            />
                            <Label htmlFor="is_active" className="text-sm font-medium">
                                Active
                            </Label>
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
                            {loading ? "Updating..." : "Update Location"}
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
