import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import type { JSX } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, user, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    // Agar token mavjud lekin user ma'lumotlari yo'q bo'lsa, foydalanuvchi ma'lumotlarini olish
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token, user, fetchCurrentUser]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
