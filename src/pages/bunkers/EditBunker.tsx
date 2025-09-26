import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBunkerStore } from "@/store/bunker.store";
import { useWorkcentersStore } from "@/store/workcenters.store";

const EditBunkerPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { bunkers, updateBunker, fetchBunkers } = useBunkerStore();
  const { workcenters, fetchWorkcenters } = useWorkcentersStore();

  const [formData, setFormData] = useState({
    name: "",
    work_center: "",
    capacity_kg: "",
    is_filled: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bunkerNotFound, setBunkerNotFound] = useState(false);

  useEffect(() => {
    fetchWorkcenters();
    fetchBunkers();
  }, [fetchWorkcenters, fetchBunkers]);

  useEffect(() => {
    if (id && bunkers.length > 0) {
      const bunker = bunkers.find((b) => b.id === id);
      if (bunker) {
        setFormData({
          name: bunker.name,
          work_center: bunker.work_center,
          capacity_kg: bunker.capacity_kg,
          is_filled: bunker.is_filled,
        });
      } else {
        setBunkerNotFound(true);
      }
    }
  }, [id, bunkers]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("bunkers.validation.nameRequired");
    }

    if (!formData.work_center) {
      newErrors.work_center = t("bunkers.validation.workCenterRequired");
    }

    if (!formData.capacity_kg || parseFloat(formData.capacity_kg) <= 0) {
      newErrors.capacity_kg = t("bunkers.validation.capacityRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      return;
    }

    setLoading(true);
    try {
      await updateBunker(id, {
        name: formData.name,
        work_center: formData.work_center,
        capacity_kg: formData.capacity_kg,
        is_filled: formData.is_filled,
      });

      navigate("/bunkers");
    } catch (error) {
      console.error("Error updating bunker:", error);
    } finally {
      setLoading(false);
    }
  };

  if (bunkerNotFound) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">
          {t("bunkers.bunkerNotFound")}
        </h1>
        <p className="text-gray-600 mb-6">{t("bunkers.bunkerNotFoundDesc")}</p>
        <Button onClick={() => navigate("/bunkers")}>
          {t("bunkers.backToBunkers")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/bunkers")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t("common.back")}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("bunkers.editBunker")}
          </h1>
          <p className="text-gray-600 mt-2">{t("bunkers.editBunkerDesc")}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("bunkers.bunkerDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("bunkers.name")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("bunkers.namePlaceholder")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Work Center */}
              <div className="space-y-2">
                <Label htmlFor="work_center">{t("bunkers.workCenter")} *</Label>
                <Select
                  value={formData.work_center}
                  onValueChange={(value) =>
                    handleInputChange("work_center", value)
                  }
                >
                  <SelectTrigger
                    className={errors.work_center ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder={t("bunkers.selectWorkCenter")} />
                  </SelectTrigger>
                  <SelectContent>
                    {workcenters
                      .filter((workcenter: any) => workcenter.type === "EXTRUDER")
                      .map((workcenter: any) => (
                        <SelectItem key={workcenter.id} value={workcenter.id}>
                          {workcenter.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.work_center && (
                  <p className="text-sm text-red-600">{errors.work_center}</p>
                )}
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity_kg">{t("bunkers.capacity")} *</Label>
                <Input
                  id="capacity_kg"
                  type="number"
                  value={formData.capacity_kg}
                  onChange={(e) =>
                    handleInputChange("capacity_kg", e.target.value)
                  }
                  placeholder={t("bunkers.capacityPlaceholder")}
                  className={errors.capacity_kg ? "border-red-500" : ""}
                />
                {errors.capacity_kg && (
                  <p className="text-sm text-red-600">{errors.capacity_kg}</p>
                )}
              </div>

              {/* Is Filled */}
              <div className="space-y-2">
                <Label htmlFor="is_filled">{t("bunkers.isFilled")}</Label>
                <Select
                  value={formData.is_filled.toString()}
                  onValueChange={(value) =>
                    handleInputChange("is_filled", value === "true")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">
                      {t("bunkers.notFilled")}
                    </SelectItem>
                    <SelectItem value="true">{t("bunkers.filled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {loading ? t("bunkers.updating") : t("bunkers.updateBunker")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/bunkers")}
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBunkerPage;
