import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProductionService } from "@/services/production.service";

const STEP_TYPES = [
  { value: "EXTRUSION", label: "Ekstruziya" },
  { value: "DEGASSING", label: "Gaz chiqarish" },
  { value: "LAMINATION", label: "Laminatsiya" },
  { value: "BRONZING", label: "Bronzalash" },
  { value: "DUPLICATION", label: "Duplikatsiya" },
  { value: "PACKAGING", label: "Qadoqlash" },
  { value: "QUALITY_CONTROL", label: "Sifat nazorati" },
  { value: "WAREHOUSE_TRANSFER", label: "Ombor ko'chirish" },
  { value: "CUSTOMER_DELIVERY", label: "Mijozga yetkazish" },
];

export default function EditProductionStepPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    step_type: "",
    description: "",
    duration_hours: "",
    is_required: true,
    order_sequence: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch production step data
  useEffect(() => {
    const fetchProductionStep = async () => {
      if (!id) {
        setError("Invalid step ID");
        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        setError(null);
        const step = await ProductionService.getProductionStepById(id);

        setFormData({
          name: step.name,
          step_type: step.step_type,
          description: step.description || "",
          duration_hours: step.duration_hours || "",
          is_required: step.is_required,
          order_sequence: step.order_sequence.toString(),
        });
      } catch (err) {
        setError("Failed to fetch production step");
        console.error("Error fetching production step:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchProductionStep();
  }, [id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Step name is required";
    }

    if (!formData.step_type) {
      newErrors.step_type = "Step type is required";
    }

    if (!formData.order_sequence) {
      newErrors.order_sequence = "Order sequence is required";
    } else if (
      isNaN(Number(formData.order_sequence)) ||
      Number(formData.order_sequence) < 1
    ) {
      newErrors.order_sequence = "Order sequence must be a positive number";
    }

    if (
      formData.duration_hours &&
      (isNaN(Number(formData.duration_hours)) ||
        Number(formData.duration_hours) < 0)
    ) {
      newErrors.duration_hours = "Duration must be a positive number";
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

    if (!id) {
      setError("Invalid step ID");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        name: formData.name.trim(),
        step_type: formData.step_type as any,
        description: formData.description.trim() || null,
        duration_hours: formData.duration_hours
          ? formData.duration_hours
          : null,
        is_required: formData.is_required,
        order_sequence: Number(formData.order_sequence),
      };

      await ProductionService.updateProductionStep(id, submitData);

      // Navigate back to production steps page
      navigate("/production/steps");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update production step"
      );
      console.error("Error updating production step:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/production/steps");
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading production step...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg mb-4">Error: {error}</p>
        <Button onClick={handleCancel} variant="outline">
          Back to Steps
        </Button>
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
            Edit Production Step
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Update production workflow step details
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
            {/* Step Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Step Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter step name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Step Type */}
            <div className="space-y-2">
              <Label htmlFor="step_type" className="text-sm font-medium">
                Step Type *
              </Label>
              <Select
                value={formData.step_type}
                onValueChange={(value) => handleInputChange("step_type", value)}
              >
                <SelectTrigger
                  className={errors.step_type ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  {STEP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.step_type && (
                <p className="text-red-500 text-xs">{errors.step_type}</p>
              )}
            </div>

            {/* Order Sequence */}
            <div className="space-y-2">
              <Label htmlFor="order_sequence" className="text-sm font-medium">
                Order Sequence *
              </Label>
              <Input
                id="order_sequence"
                type="number"
                min="1"
                value={formData.order_sequence}
                onChange={(e) =>
                  handleInputChange("order_sequence", e.target.value)
                }
                placeholder="Enter order sequence"
                className={errors.order_sequence ? "border-red-500" : ""}
              />
              {errors.order_sequence && (
                <p className="text-red-500 text-xs">{errors.order_sequence}</p>
              )}
            </div>

            {/* Duration Hours */}
            <div className="space-y-2">
              <Label htmlFor="duration_hours" className="text-sm font-medium">
                Duration (Hours)
              </Label>
              <Input
                id="duration_hours"
                type="number"
                step="0.01"
                min="0"
                value={formData.duration_hours}
                onChange={(e) =>
                  handleInputChange("duration_hours", e.target.value)
                }
                placeholder="Enter duration in hours"
                className={errors.duration_hours ? "border-red-500" : ""}
              />
              {errors.duration_hours && (
                <p className="text-red-500 text-xs">{errors.duration_hours}</p>
              )}
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
              placeholder="Enter step description"
              rows={3}
            />
          </div>

          {/* Is Required */}
          <div className="flex items-center space-x-3">
            <Switch
              id="is_required"
              checked={formData.is_required}
              onCheckedChange={(checked) =>
                handleInputChange("is_required", checked)
              }
            />
            <Label htmlFor="is_required" className="text-sm font-medium">
              Required Step
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
              {loading ? "Updating..." : "Update Step"}
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
