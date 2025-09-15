import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import type { JSX } from "react";

interface OperatorProtectedRouteProps {
    children: JSX.Element;
}

export default function OperatorProtectedRoute({ children }: OperatorProtectedRouteProps) {
    const { user } = useAuthStore();

    // Operator rolini tekshirish
    const isOperator = user?.role === "WORKER" || user?.is_operator;

    // Agar operator bo'lsa, faqat ruxsat berilgan sahifalarga kirish mumkin
    if (isOperator) {
        // Ruxsat berilgan sahifalar
        const allowedPaths = [
            "/worker",
            "/worker/operator-selection",
            "/worker/orders",
            "/worker/orders/:id",
            "/worker/orders/:id/steps/:stepId",
            "/worker/orders/:id/steps/:stepId/confirm",
            "/stock/inventory-movement-logs",
            "/stock/stock-levels"
        ];

        // Joriy path'ni olish
        const currentPath = window.location.pathname;

        // Path'ni tekshirish (dynamic route'lar uchun)
        const isAllowed = allowedPaths.some(allowedPath => {
            // Dynamic route'lar uchun pattern matching
            if (allowedPath.includes(":id") || allowedPath.includes(":stepId")) {
                const pattern = allowedPath
                    .replace(/\/:id/g, "/[^/]+")
                    .replace(/\/:stepId/g, "/[^/]+");
                const regex = new RegExp(`^${pattern}$`);
                return regex.test(currentPath);
            }
            return currentPath === allowedPath || currentPath.startsWith(allowedPath);
        });

        if (!isAllowed) {
            // Ruxsat berilmagan sahifaga kirishga harakat qilganda, operator paneliga yo'naltirish
            return <Navigate to="/worker" replace />;
        }
    }

    // Agar operator emas bo'lsa yoki ruxsat berilgan sahifada bo'lsa, children'ni render qilish
    return children;
}
