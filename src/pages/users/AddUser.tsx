import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Loader2,
    User,
    Mail,
    Lock,
    Shield,
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

export default function AddUserPage() {
    const navigate = useNavigate();
    const { createUser, loading, error } = useUsersStore();
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
            errors.push("kamida 8 ta belgi");
        }

        if (!/[0-9]/.test(password)) {
            errors.push("kamida bitta raqam");
        }

        if (!/[A-Z]/.test(password)) {
            errors.push("kamida bitta katta harf");
        }

        if (!/[a-z]/.test(password)) {
            errors.push("kamida bitta kichik harf");
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push("kamida bitta maxsus belgi");
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
            return { strength: score, label: "Zaif", color: "bg-red-500" };
        if (score <= 3)
            return { strength: score, label: "O'rtacha", color: "bg-yellow-500" };
        if (score <= 4)
            return { strength: score, label: "Yaxshi", color: "bg-blue-500" };
        return { strength: score, label: "Kuchli", color: "bg-green-500" };
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = "Foydalanuvchi nomi majburiy";
        } else if (formData.username.trim().length < 3) {
            newErrors.username =
                "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak";
        }

        if (
            formData.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "To'g'ri email manzilini kiriting";
        }

        if (
            formData.phone_number.trim() &&
            !/^[0-9+\-\s()]+$/.test(formData.phone_number)
        ) {
            newErrors.phone_number = "To'g'ri telefon raqamini kiriting";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Parol majburiy";
        } else {
            const passwordErrors = validatePassword(formData.password);
            if (passwordErrors.length > 0) {
                newErrors.password = `Parol ${passwordErrors.join(
                    ", "
                )} bo'lishi kerak`;
            }
        }

        if (!formData.password_confirm.trim()) {
            newErrors.password_confirm = "Parolni tasdiqlash majburiy";
        } else if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = "Parollar mos kelmaydi";
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
                        Yangi foydalanuvchi qo'shish
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm lg:text-base">
                        Yangi foydalanuvchi yaratish
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
                        {/* Foydalanuvchi nomi */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">
                                Foydalanuvchi nomi *
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
                                    placeholder="Masalan: admin"
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
                                Email
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
                                    placeholder="Masalan: admin@example.com"
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
                                Ism
                            </Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={(e) =>
                                    handleInputChange("first_name", e.target.value)
                                }
                                placeholder="Masalan: Ahmad"
                                className={errors.first_name ? "border-red-500" : ""}
                            />
                            {errors.first_name && (
                                <p className="text-red-500 text-xs">{errors.first_name}</p>
                            )}
                        </div>

                        {/* Familiya */}
                        <div className="space-y-2">
                            <Label htmlFor="last_name" className="text-sm font-medium">
                                Familiya
                            </Label>
                            <Input
                                id="last_name"
                                value={formData.last_name}
                                onChange={(e) => handleInputChange("last_name", e.target.value)}
                                placeholder="Masalan: Karimov"
                                className={errors.last_name ? "border-red-500" : ""}
                            />
                            {errors.last_name && (
                                <p className="text-red-500 text-xs">{errors.last_name}</p>
                            )}
                        </div>

                        {/* Parol */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Parol *
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
                                    placeholder="Kuchli parol kiriting (8+ belgi, raqam, harflar)"
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
                                        <span className="text-xs text-gray-600">Parol kuchi:</span>
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
                                Parolni tasdiqlash *
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
                                    placeholder="Parolni qayta kiriting"
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
                                Telefon raqami
                            </Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                value={formData.phone_number}
                                onChange={(e) =>
                                    handleInputChange("phone_number", e.target.value)
                                }
                                placeholder="Masalan: +998901234567"
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
                                Rol
                            </Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => handleInputChange("role", value)}
                            >
                                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Rolni tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="DIRECTOR">Director</SelectItem>
                                    <SelectItem value="HISOBCHI">Hisobchi</SelectItem>
                                    <SelectItem value="TEXNOLOG">Texnolog</SelectItem>
                                    <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                                    <SelectItem value="SMENA_BOSHLIGI">
                                        Smena Boshlig'i
                                    </SelectItem>
                                    <SelectItem value="KATTA_MUTAXASSIS">
                                        Katta Mutaxassis
                                    </SelectItem>
                                    <SelectItem value="KICHIK_MUTAXASSIS">
                                        Kichik Mutaxassis
                                    </SelectItem>
                                    <SelectItem value="STAJER">Stajer</SelectItem>
                                    <SelectItem value="WORKER">Worker</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-red-500 text-xs">{errors.role}</p>
                            )}
                        </div>

                        {/* Shift */}
                        <div className="space-y-2">
                            <Label htmlFor="shift" className="text-sm font-medium">
                                Smena
                            </Label>
                            <Select
                                value={formData.shift}
                                onValueChange={(value) => handleInputChange("shift", value)}
                            >
                                <SelectTrigger className={errors.shift ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Smenani tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAY">Kunduzgi smena</SelectItem>
                                    <SelectItem value="NIGHT">Kechki smena</SelectItem>
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
                            Ruxsatlar
                        </h3>

                        <div className="space-y-4">
                            {/* Faol holat */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="is_active" className="text-sm font-medium">
                                        Faol holatda
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                        Foydalanuvchi tizimga kirishi mumkin
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
                                        Admin ruxsati
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                        Admin paneliga kirish ruxsati
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
