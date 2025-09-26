import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
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

export default function AddUserPage() {
  const navigate = useNavigate();
  const { createUser, loading, error } = useUsersStore();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    password_confirm: "",
    role: "",
    employee_id: "",
    shift: "",
    is_active: true,
    is_staff: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push(t("users.validation.passwordMinLength"));
    }

    if (!/[0-9]/.test(password)) {
      errors.push(t("users.validation.passwordNumber"));
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(t("users.validation.passwordUppercase"));
    }

    if (!/[a-z]/.test(password)) {
      errors.push(t("users.validation.passwordLowercase"));
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push(t("users.validation.passwordSpecial"));
    }

    return errors;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    const checks = [
      password.length >= 8,
      /[0-9]/.test(password),
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    ];

    score = checks.filter(Boolean).length;

    if (score <= 2)
      return { strength: score, label: t("users.weak"), color: "bg-red-500" };
    if (score <= 3)
      return { strength: score, label: t("users.medium"), color: "bg-yellow-500" };
    if (score <= 4)
      return { strength: score, label: t("users.good"), color: "bg-blue-500" };
    return { strength: score, label: t("users.strong"), color: "bg-green-500" };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username - required
    if (!formData.username.trim()) {
      newErrors.username = t("users.validation.usernameRequired");
    } else if (formData.username.trim().length < 3) {
      newErrors.username = t("users.validation.usernameMinLength");
    }

    // First name - required
    if (!formData.first_name.trim()) {
      newErrors.first_name = t("users.validation.firstNameRequired");
    }

    // Last name - required
    if (!formData.last_name.trim()) {
      newErrors.last_name = t("users.validation.lastNameRequired");
    }

    // Email - optional, but validate format if provided
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = t("users.validation.emailInvalid");
    }

    // Phone number - optional, but validate format if provided
    if (
      formData.phone_number.trim() &&
      !/^[0-9+\-\s()]+$/.test(formData.phone_number)
    ) {
      newErrors.phone_number = t("users.validation.phoneInvalid");
    }

    // Password - required
    if (!formData.password.trim()) {
      newErrors.password = t("users.validation.passwordRequired");
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = `${t("users.password")} ${passwordErrors.join(
          ", "
        )} bo'lishi kerak`;
      }
    }

    // Password confirm - required
    if (!formData.password_confirm.trim()) {
      newErrors.password_confirm = t("users.validation.passwordConfirmRequired");
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = t("users.validation.passwordMismatch");
    }

    // Role - required
    if (!formData.role.trim()) {
      newErrors.role = t("users.validation.roleRequired");
    }

    // Shift - required
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

    if (!validateForm()) {
      return;
    }

    try {
      await createUser({
        username: formData.username.trim(),
        email: formData.email.trim() || undefined,
        first_name: formData.first_name.trim() || undefined,
        last_name: formData.last_name.trim() || undefined,
        phone_number: formData.phone_number.trim() || undefined,
        password: formData.password,
        password_confirm: formData.password_confirm,
        role: formData.role.trim() || undefined,
        employee_id: formData.employee_id.trim() || undefined,
        shift: formData.shift.trim() || undefined,
        is_active: formData.is_active,
        is_staff: formData.is_staff,
      });
      navigate("/users");
    } catch (e) {
      // Error handled by Zustand store
    }
  };

  const handleCancel = () => {
    navigate("/users");
  };

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
          {t("users.back")}
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {t("users.addUser")}
          </h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            {t("users.addUserDesc")}
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
            {/* Foydalanuvchi nomi */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                {t("users.username")} *
              </Label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder={t("users.usernamePlaceholder")}
                  className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs">{errors.username}</p>
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

            {/* Ism */}
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm font-medium">
                {t("users.firstName")} *
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
                {t("users.lastName")} *
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

            {/* Parol */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t("users.password")} *
              </Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder={t("users.passwordPlaceholder")}
                  className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{t("users.passwordStrength")}</span>
                    <span
                      className={`text-xs font-medium ${getPasswordStrength(formData.password).strength <= 2
                        ? "text-red-600"
                        : getPasswordStrength(formData.password).strength <= 3
                          ? "text-yellow-600"
                          : getPasswordStrength(formData.password).strength <= 4
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                    >
                      {getPasswordStrength(formData.password).label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${level <=
                          getPasswordStrength(formData.password).strength
                          ? getPasswordStrength(formData.password).color
                          : "bg-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            {/* Parolni tasdiqlash */}
            <div className="space-y-2">
              <Label htmlFor="password_confirm" className="text-sm font-medium">
                {t("users.passwordConfirm")} *
              </Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="password_confirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  value={formData.password_confirm}
                  onChange={(e) =>
                    handleInputChange("password_confirm", e.target.value)
                  }
                  placeholder={t("users.passwordConfirmPlaceholder")}
                  className={`pl-10 pr-10 ${errors.password_confirm ? "border-red-500" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswordConfirm ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {errors.password_confirm && (
                <p className="text-red-500 text-xs">
                  {errors.password_confirm}
                </p>
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

            {/* Employee ID */}
            {/* <div className="space-y-2">
              <Label htmlFor="employee_id" className="text-sm font-medium">
                Xodim ID
              </Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) =>
                  handleInputChange("employee_id", e.target.value)
                }
                placeholder="Masalan: EMP001"
                className={errors.employee_id ? "border-red-500" : ""}
              />
              {errors.employee_id && (
                <p className="text-red-500 text-xs">{errors.employee_id}</p>
              )}
            </div> */}

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                {t("users.role")} *
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
                {t("users.shift")} *
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
            </div>
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
              {loading ? t("users.saving") : t("users.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {t("users.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
