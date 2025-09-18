import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "axios";
import { API_CONFIG } from "@/config/api.config";

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: string | null;
  role_display: string | null;
  role_display_uz: string | null;
  employee_id: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  shift: string | null;
  is_operator: boolean;
  is_supervisor: boolean;
  is_specialist: boolean;
  role_level: number;
  profile_picture: string | null;
  date_joined: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  // Global operator state
  selectedOperator: User | null;
  showOperatorModal: boolean;
  login: (username: string, password: string) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  logout: () => void;
  clearToken: () => void;
  setSelectedOperator: (operator: User | null) => void;
  setShowOperatorModal: (show: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      // Global operator state
      selectedOperator: null,
      showOperatorModal: false,

      // Login funksiyasi
      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post<{ access: string }>(
            `${API_CONFIG.BASE_URL}/auth/login/`,
            {
              username,
              password,
            }
          );

          const { access } = res.data;
          set({ token: access, loading: false });

          // Login muvaffaqiyatli bo'lgandan keyin foydalanuvchi ma'lumotlarini olish
          // Token'ni header'ga qo'shish uchun axios instance yaratamiz
          const authAxios = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            headers: {
              Authorization: `Bearer ${access}`,
            },
          });

          try {
            const userRes = await authAxios.get<User>("/users/me/");
            set({ user: userRes.data });
          } catch (userErr) {
            console.warn("Foydalanuvchi ma'lumotlarini olishda xatolik:", userErr);
            // Foydalanuvchi ma'lumotlarini olishda xatolik bo'lsa ham login muvaffaqiyatli
          }
        } catch (err) {
          const error = err as AxiosError<{ message?: string }>;
          set({
            error:
              error.response?.data?.message ||
              "Kirishda xatolik. Login yoki parol noto'g'ri.",
            loading: false,
          });
        }
      },

      // Joriy foydalanuvchi ma'lumotlarini olish
      fetchCurrentUser: async () => {
        const { token } = useAuthStore.getState();
        if (!token) return;

        set({ loading: true, error: null });
        try {
          const authAxios = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const userRes = await authAxios.get<User>("/users/me/");
          set({ user: userRes.data, loading: false });
        } catch (err) {
          const error = err as AxiosError<{ message?: string }>;
          set({
            error: error.response?.data?.message || "Foydalanuvchi ma'lumotlarini olishda xatolik",
            loading: false,
          });
        }
      },

      // Logout funksiyasi
      logout: () => {
        set({ user: null, token: null, error: null });
        // LocalStorage'dan ham o'chirish
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      },

      // Token'ni o'chirish funksiyasi (401 xatoligi uchun)
      clearToken: () => {
        set({ token: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      },

      // Global operator funksiyalari
      setSelectedOperator: (operator) => {
        set({ selectedOperator: operator });
      },

      setShowOperatorModal: (show) => {
        set({ showOperatorModal: show });
      },
    }),
    {
      name: "auth-storage", // LocalStorage'da saqlanadi
    }
  )
);
