import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { WorkcentersService } from "@/services/workcenters.service";
import { useLocationsStore } from "@/store/locations.store";
import { useTranslation } from "@/hooks/useTranslation";

export default function EditWorkcenterPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateWorkcenter } = useWorkcentersStore();
  const { locations, fetchLocations } = useLocationsStore();
  const { t } = useTranslation();

  const WORKCENTER_TYPES = [
    { value: "EXTRUDER", label: t("workcenters.extruder") },
    { value: "DEGASSING_AREA", label: t("workcenters.degassingArea") },
    { value: "LAMINATOR", label: t("workcenters.laminator") },
    { value: "BRONIROVSHIK", label: t("workcenters.bronirovshik") },
    { value: "DUPLICATOR", label: t("workcenters.duplicator") },
    { value: "PACKAGING", label: t("workcenters.packaging") },
    { value: "QUALITY_CONTROL", label: t("workcenters.qualityControl") },
    { value: "BRAK_MAYDALAGICH", label: t("workcenters.brakMaydalagich") },
  ];

  const CAPACITY_UNITS = [
    { value: "kg", label: t("workcenters.kilogram") },
    { value: "m", label: t("workcenters.meter") },
    { value: "m2", label: t("workcenters.squareMeter") },
    { value: "piece", label: t("workcenters.piece") },
    { value: "liter", label: t("workcenters.liter") },
  ];
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "EXTRUDER" as "EXTRUDER" | "DEGASSING_AREA" | "LAMINATOR" | "BRONIROVSHIK" | "DUPLICATOR" | "PACKAGING" | "QUALITY_CONTROL" | "BRAK_MAYDALAGICH",
    location: "",
    capacity_per_hour: "",
    capacity_unit: "kg",
    last_maintenance_date: "",
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        navigate("/workcenters");
        return;
      }

      try {
        setInitialLoading(true);
        // Fetch both workcenter and locations data
        await Promise.all([
          fetchLocations(),
          WorkcentersService.getWorkcenterById(id).then((workcenter) => {
            setFormData({
              name: workcenter.name,
              description: workcenter.description,
              type: workcenter.type,
              location: workcenter.location,
              capacity_per_hour: workcenter.capacity_per_hour
                ? workcenter.capacity_per_hour.toString()
                : "",
              capacity_unit: workcenter.capacity_unit || "kg",
              last_maintenance_date: workcenter.last_maintenance_date
                ? workcenter.last_maintenance_date.split("T")[0]
                : "",
              active: workcenter.is_active,
            });
          }),
        ]);
      } catch (err) {
        notifyError(t("workcenters.loadingWorkcenter"));
        navigate("/workcenters");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, fetchLocations]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("workcenters.validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("workcenters.validation.nameMinLength");
    }

    if (!formData.type) {
      newErrors.type = t("workcenters.validation.typeRequired");
    }

    if (!formData.location.trim()) {
      newErrors.location = t("workcenters.validation.locationRequired");
    } else if (formData.location.trim().length < 2) {
      newErrors.location = t("workcenters.validation.locationMinLength");
    }

    if (
      formData.capacity_per_hour.trim() &&
      (isNaN(Number(formData.capacity_per_hour)) ||
        Number(formData.capacity_per_hour) <= 0)
    ) {
      newErrors.capacity_per_hour = t("workcenters.validation.capacityPositive");
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

    if (!validateForm() || !id) {
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

      const success = await updateWorkcenter(id, apiData);
      if (success) {
        notifySuccess(t("workcenters.workcenterUpdated"));
        navigate("/workcenters");
      } else {
        notifyError(t("workcenters.workcenterNotUpdated"));
      }
    } catch (e) {
      setError(t("common.error"));
      notifyError(t("workcenters.workcenterNotUpdated"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/workcenters");
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          {t("workcenters.loadingWorkcenter")}
        </span>
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
          {t("workcenters.back")}
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("workcenters.editWorkcenter")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("workcenters.editWorkcenterDesc")}
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
            {/* Stanok nomi */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("workcenters.workcenterName")} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("workcenters.workcenterNamePlaceholder")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Stanok turi */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                {t("workcenters.workcenterType")} *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("workcenters.selectType")} />
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
                {t("workcenters.location")} *
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleInputChange("location", value)}
              >
                <SelectTrigger
                  className={errors.location ? "border-red-500" : ""}
                >
                  <SelectValue placeholder={t("workcenters.selectLocation")} />
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
                {t("workcenters.capacityOptional")}
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
                  placeholder={t("workcenters.capacityPlaceholder")}
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
                {t("workcenters.lastMaintenanceDate")}
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
              {t("workcenters.descriptionOptional")}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("workcenters.descriptionPlaceholder")}
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
              {t("workcenters.activeStatus")}
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
              {loading ? t("workcenters.saving") : t("workcenters.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {t("workcenters.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
