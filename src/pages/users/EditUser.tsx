import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Mail, Shield } from "lucide-react";
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
import { useUsersStore } from "../../store/users.store";
import { useTranslation } from "@/hooks/useTranslation";

export default function EditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchUser, updateUser, loading, error } = useUsersStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "",
    shift: "",
    is_active: true,
    is_staff: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    if (!id) return;

    const user = await fetchUser(id);
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        role: user.role || "",
        shift: user.shift || "",
        is_active: user.is_active,
        is_staff: user.is_staff,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = t("users.validation.emailInvalid");
    }

    if (
      formData.phone_number.trim() &&
      !/^[0-9+\-\s()]+$/.test(formData.phone_number)
    ) {
      newErrors.phone_number = t("users.validation.phoneInvalid");
    }

    if (!formData.role.trim()) {
      newErrors.role = t("users.validation.roleRequired");
    }

    if (!formData.shift.trim()) {
      newErrors.shift = t("users.validation.shiftRequired");
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
    console.log("Form submitted", formData);

    const isValid = validateForm();
    console.log("Form validation result:", isValid);
    console.log("Current errors:", errors);

    if (!isValid || !id) {
      console.log("Form validation failed or no ID");
      return;
    }

    try {
      console.log("Sending data to updateUser:", {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        role: formData.role.trim(),
        shift: formData.shift.trim(),
        is_active: formData.is_active,
        is_staff: formData.is_staff,
      });

      await updateUser(id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        role: formData.role.trim(),
        shift: formData.shift.trim(),
        is_active: formData.is_active,
        is_staff: formData.is_staff,
      });
      console.log("User updated successfully");
      navigate("/users");
    } catch (e) {
      console.error("Error updating user:", e);
      // Error handled by Zustand store
    }
  };

  const handleCancel = () => {
    navigate("/users");
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
          {t("users.back")}
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t("users.editUser")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("users.editUserDesc")}
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
            {/* Ism */}
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm font-medium">
                {t("users.firstName")}
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                placeholder={t("users.firstNamePlaceholder")}
                className={errors.first_name ? "border-red-500" : ""}
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs">{errors.first_name}</p>
              )}
            </div>

            {/* Familiya */}
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm font-medium">
                {t("users.lastName")}
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder={t("users.lastNamePlaceholder")}
                className={errors.last_name ? "border-red-500" : ""}
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs">{errors.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t("users.email")}
              </Label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("users.emailPlaceholder")}
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Telefon raqami */}
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-sm font-medium">
                {t("users.phoneNumber")}
              </Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  handleInputChange("phone_number", e.target.value)
                }
                placeholder={t("users.phoneNumberPlaceholder")}
                className={errors.phone_number ? "border-red-500" : ""}
              />
              {errors.phone_number && (
                <p className="text-red-500 text-xs">{errors.phone_number}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                {t("users.role")}
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("users.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t("users.admin")}</SelectItem>
                  <SelectItem value="DIRECTOR">{t("users.director")}</SelectItem>
                  <SelectItem value="HISOBCHI">{t("users.accountant")}</SelectItem>
                  <SelectItem value="TEXNOLOG">{t("users.technologist")}</SelectItem>
                  <SelectItem value="WAREHOUSE">{t("users.warehouse")}</SelectItem>
                  <SelectItem value="SMENA_BOSHLIGI">
                    {t("users.shiftSupervisor")}
                  </SelectItem>
                  <SelectItem value="KATTA_MUTAXASSIS">
                    {t("users.seniorSpecialist")}
                  </SelectItem>
                  <SelectItem value="KICHIK_MUTAXASSIS">
                    {t("users.juniorSpecialist")}
                  </SelectItem>
                  <SelectItem value="STAJER">{t("users.intern")}</SelectItem>
                  <SelectItem value="WORKER">{t("users.worker")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-xs">{errors.role}</p>
              )}
            </div>

            {/* Shift */}
            <div className="space-y-2">
              <Label htmlFor="shift" className="text-sm font-medium">
                {t("users.shift")}
              </Label>
              <Select
                value={formData.shift}
                onValueChange={(value) => handleInputChange("shift", value)}
              >
                <SelectTrigger className={errors.shift ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("users.selectShift")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAY">{t("users.dayShift")}</SelectItem>
                  <SelectItem value="NIGHT">{t("users.nightShift")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.shift && (
                <p className="text-red-500 text-xs">{errors.shift}</p>
              )}
            </div>
          </div>

          {/* Ruxsatlar */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Shield size={20} />
              {t("users.permissions")}
            </h3>

            <div className="space-y-4">
              {/* Faol holat */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active" className="text-sm font-medium">
                    {t("users.activeStatus")}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {t("users.activeStatusDesc")}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_active", checked)
                  }
                />
              </div>

              {/* Admin ruxsati */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_staff" className="text-sm font-medium">
                    {t("users.adminPermission")}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {t("users.adminPermissionDesc")}
                  </p>
                </div>
                <Switch
                  id="is_staff"
                  checked={formData.is_staff}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_staff", checked)
                  }
                />
              </div>
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
              {loading ? t("users.saving") : t("users.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {t("users.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
