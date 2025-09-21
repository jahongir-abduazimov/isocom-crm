import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import type { JSX } from "react";
import RoleLoadingScreen from "@/components/ui/role-loading-screen";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, user, fetchCurrentUser, roleDetermining } = useAuthStore();

  useEffect(() => {
    // Agar token mavjud lekin user ma'lumotlari yo'q bo'lsa, foydalanuvchi ma'lumotlarini olish
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token, user, fetchCurrentUser]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role aniqlanayotgan vaqtda loading screen ko'rsatish
  if (roleDetermining) {
    return <RoleLoadingScreen />;
  }

  return children;
}
