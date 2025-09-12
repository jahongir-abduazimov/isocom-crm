import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "axios";
import { API_CONFIG } from "@/config/api.config";

interface User {
  id: number;
  name: string;
  role: "admin" | "qc" | "packaging" | "warehouse" | "user";
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // Login funksiyasi
      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post<{ access: string }>(
            `${API_CONFIG.BASE_URL}/auth/token/`,
            {
              username,
              password,
            }
          );

          const { access } = res.data;
          set({ token: access, loading: false });
        } catch (err) {
          const error = err as AxiosError<{ message?: string }>;
          set({
            error:
              error.response?.data?.message ||
              "Kirishda xatolik. Login yoki parol noto‘g‘ri.",
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
    }),
    {
      name: "auth-storage", // LocalStorage'da saqlanadi
    }
  )
);
