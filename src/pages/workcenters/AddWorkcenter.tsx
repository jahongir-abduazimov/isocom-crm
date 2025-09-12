import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notifySuccess, notifyError } from "@/lib/notification";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkcentersStore } from "@/store/workcenters.store";
import { useLocationsStore } from "@/store/locations.store";

const WORKCENTER_TYPES = [
  { value: "EXTRUDER", label: "Extruder" },
  { value: "DEGASSING_AREA", label: "Degassing Area" },
  { value: "LAMINATOR", label: "Laminator" },
  { value: "BRONIROVSHIK", label: "Bronirovshik" },
  { value: "DUPLICATOR", label: "Duplicator" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "QUALITY_CONTROL", label: "Quality Control" },
  { value: "BRAK_MAYDALAGICH", label: "Brak maydalagich" },
];

const CAPACITY_UNITS = [
  { value: "kg", label: "Kilogramm" },
  { value: "m", label: "Metr" },
  { value: "m2", label: "m²" },
  { value: "piece", label: "Bo'lak" },
  { value: "liter", label: "Litr" },
];

export default function AddWorkcenterPage() {
  const navigate = useNavigate();
  const { addWorkcenter } = useWorkcentersStore();
  const { locations, fetchLocations } = useLocationsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "EXTRUDER" as const,
    location: "",
    capacity_per_hour: "",
    capacity_unit: "kg",
    last_maintenance_date: "",
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Stanok nomi majburiy";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Stanok nomi kamida 2 ta belgidan iborat bo'lishi kerak";
    }

    if (!formData.type) {
      newErrors.type = "Stanok turi majburiy";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Joylashuv majburiy";
    } else if (formData.location.trim().length < 2) {
      newErrors.location =
        "Joylashuv kamida 2 ta belgidan iborat bo'lishi kerak";
    }

    if (
      formData.capacity_per_hour.trim() &&
      (isNaN(Number(formData.capacity_per_hour)) ||
        Number(formData.capacity_per_hour) <= 0)
    ) {
      newErrors.capacity_per_hour = "Sig'im 0 dan katta bo'lishi kerak";
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

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type as
          | "EXTRUDER"
          | "DEGASSING_AREA"
          | "LAMINATOR"
          | "BRONIROVSHIK"
          | "DUPLICATOR"
          | "PACKAGING"
          | "QUALITY_CONTROL"
          | "BRAK_MAYDALAGICH",
        location: formData.location.trim(),
        capacity_per_hour: formData.capacity_per_hour
          ? Number(formData.capacity_per_hour)
          : null,
        capacity_unit: formData.capacity_per_hour
          ? formData.capacity_unit
          : null,
        last_maintenance_date: formData.last_maintenance_date || null,
        is_active: formData.active,
      };

      const success = await addWorkcenter(apiData);
      if (success) {
        notifySuccess("Stanok muvaffaqiyatli qo'shildi!");
        navigate("/workcenters");
      } else {
        notifyError("Stanok qo'shilmadi yoki xatolik yuz berdi");
      }
    } catch (e) {
      setError("Xatolik yuz berdi");
      notifyError("Stanok qo'shilmadi yoki xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/workcenters");
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
          Ortga
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Yangi stanok qo'shish
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Yangi ishlab chiqarish stanogi yaratish
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
            {/* Stanok nomi */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Stanok nomi *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Masalan: Extrusion Machine #1"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Stanok turi */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Stanok turi *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Turi tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {WORKCENTER_TYPES.map((type) => (
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

            {/* Joylashuv */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Joylashuv *
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleInputChange("location", value)}
              >
                <SelectTrigger
                  className={errors.location ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Joylashuvni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
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

            {/* Sig'im */}
            <div className="space-y-2">
              <Label
                htmlFor="capacity_per_hour"
                className="text-sm font-medium"
              >
                Sig'im (ixtiyoriy)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="capacity_per_hour"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.capacity_per_hour}
                  onChange={(e) =>
                    handleInputChange("capacity_per_hour", e.target.value)
                  }
                  placeholder="Masalan: 100"
                  className={errors.capacity_per_hour ? "border-red-500" : ""}
                />
                <Select
                  value={formData.capacity_unit}
                  onValueChange={(value) =>
                    handleInputChange("capacity_unit", value)
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPACITY_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.capacity_per_hour && (
                <p className="text-red-500 text-xs">
                  {errors.capacity_per_hour}
                </p>
              )}
            </div>

            {/* Oxirgi texnik xizmat sanasi */}
            <div className="space-y-2">
              <Label
                htmlFor="last_maintenance_date"
                className="text-sm font-medium"
              >
                Oxirgi texnik xizmat sanasi (ixtiyoriy)
              </Label>
              <Input
                id="last_maintenance_date"
                type="date"
                value={formData.last_maintenance_date}
                onChange={(e) =>
                  handleInputChange("last_maintenance_date", e.target.value)
                }
                className=""
              />
            </div>
          </div>

          {/* Tavsif */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Tavsif (ixtiyoriy)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Stanok haqida batafsil ma'lumot"
              rows={3}
            />
          </div>

          {/* Faollik */}
          <div className="flex items-center space-x-3">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                handleInputChange("active", checked)
              }
            />
            <Label htmlFor="active" className="text-sm font-medium">
              Faol holatda
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
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Bekor qilish
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
