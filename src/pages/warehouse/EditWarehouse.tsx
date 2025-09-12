import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WarehouseService } from "@/services/warehouse.service";
import { useWarehousesStore } from "@/store/warehouses.store";
import { notifySuccess } from "@/lib/notification";

export default function EditWarehouse() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { warehouses, updateWarehouse } = useWarehousesStore();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadWarehouse = async () => {
      if (!id) return;

      try {
        const warehouse = warehouses.find((w) => w.id === id);
        if (warehouse) {
          setFormData({
            name: warehouse.name,
            description: warehouse.description || "",
            is_active: warehouse.is_active,
          });
        } else {
          // If not in store, fetch from API
          const fetchedWarehouse = await WarehouseService.getWarehouseById(id);
          setFormData({
            name: fetchedWarehouse.name,
            description: fetchedWarehouse.description || "",
            is_active: fetchedWarehouse.is_active,
          });
        }
      } catch (error: any) {
        setError(error?.response?.data?.detail || "Failed to load warehouse");
        console.error("Error loading warehouse:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadWarehouse();
  }, [id, warehouses]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Warehouse name is required";
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
    if (!id) return;

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

      const updatedWarehouse = await WarehouseService.updateWarehouse(
        id,
        submitData
      );
      updateWarehouse(id, updatedWarehouse);
      notifySuccess("Warehouse updated successfully");
      navigate("/warehouse/warehouses");
    } catch (error: any) {
      setError(error?.response?.data?.detail || "Failed to update warehouse");
      console.error("Error updating warehouse:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/warehouse/warehouses");
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
            Edit Warehouse
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Update warehouse information
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
            {/* Warehouse Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Warehouse Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter warehouse name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter warehouse description"
              rows={3}
            />
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
              {loading ? "Updating..." : "Update Warehouse"}
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
