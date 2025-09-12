import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notifySuccess, notifyError } from "@/lib/notification";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMaterialsStore } from "@/store/materials.store";

const MATERIAL_TYPES = [
  { value: "GRANULA", label: "Granula" },
  { value: "ZAR", label: "Zar" },
  { value: "OTHER", label: "Boshqa" },
];

const UNITS = [
  { value: "KG", label: "Kilogramm" },
  { value: "METER", label: "Metr" },
  { value: "METER_SQUARE", label: "m²" },
  { value: "METER_CUBIC", label: "m³" },
  { value: "PIECE", label: "Bo'lak" },
  { value: "LITER", label: "Litr" },
];

export default function AddMaterialPage() {
  const navigate = useNavigate();
  const { addMaterial } = useMaterialsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    code: "",
    type: "GRANULA",
    unit: "KG",
    description: "",
    price: "",
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Material nomi majburiy";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Material nomi kamida 2 ta belgidan iborat bo'lishi kerak";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug majburiy";
    } else if (formData.slug.trim().length < 2) {
      newErrors.slug = "Slug kamida 2 ta belgidan iborat bo'lishi kerak";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Kod majburiy";
    } else if (formData.code.trim().length < 2) {
      newErrors.code = "Kod kamida 2 ta belgidan iborat bo'lishi kerak";
    }

    if (!formData.type) {
      newErrors.type = "Material turi majburiy";
    }

    if (!formData.unit) {
      newErrors.unit = "O'lchov birligi majburiy";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Tavsif majburiy";
    } else if (formData.description.trim().length < 5) {
      newErrors.description = "Tavsif kamida 5 ta belgidan iborat bo'lishi kerak";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Narx majburiy";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Narx 0 dan katta bo'lishi kerak";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
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
        slug: formData.slug.trim(),
        code: formData.code.trim(),
        unit_of_measure: formData.unit,
        type: formData.type,
        description: formData.description.trim(),
        price: formData.price,
        is_active: formData.active,
      };

      const success = await addMaterial(apiData);
      if (success) {
        notifySuccess("Material muvaffaqiyatli qo'shildi!");
        navigate("/materials");
      } else {
        notifyError("Material qo'shilmadi yoki xatolik yuz berdi");
      }
    } catch (e) {
      setError("Xatolik yuz berdi");
      notifyError("Material qo'shilmadi yoki xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/materials");
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
            Yangi material qo'shish
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Yangi material yaratish
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
            {/* Material nomi */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Material nomi *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Masalan: Sement 500"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                Slug *
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="Masalan: sement-500"
                className={errors.slug ? "border-red-500" : ""}
              />
              {errors.slug && (
                <p className="text-red-500 text-xs">{errors.slug}</p>
              )}
            </div>

            {/* Kod */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Kod *
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="Masalan: SMT-500"
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-red-500 text-xs">{errors.code}</p>
              )}
            </div>

            {/* Material turi */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Material turi *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Turi tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map((type) => (
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

            {/* O'lchov birligi */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium">
                O'lchov birligi *
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange("unit", value)}
              >
                <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                  <SelectValue placeholder="Birlik tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-red-500 text-xs">{errors.unit}</p>
              )}
            </div>

            {/* Narx */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Narx *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Masalan: 120000"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-red-500 text-xs">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Tavsif */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Tavsif *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Material haqida batafsil ma'lumot"
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
          </div>

          {/* Faollik */}
          <div className="flex items-center space-x-3">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange("active", checked)}
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
