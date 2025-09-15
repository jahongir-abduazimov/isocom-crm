import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import OperatorTopNav from "@/components/layout/OperatorTopNav";
import { useAuthStore } from "@/store/auth.store";

export default function MainLayout() {
  const { user } = useAuthStore();

  // Operator rolini tekshirish
  const isOperator = user?.role === "WORKER" || user?.is_operator;

  if (isOperator) {
    // Operator uchun layout - sidebar yo'q, faqat top navigation
    return (
      <div className="max-h-screen w-full bg-gradient-to-br from-gray-200 via-blue-50 to-gray-300">
        {/* Operator Top Navigation */}
        <OperatorTopNav />

        {/* Asosiy kontent - operator uchun to'liq kenglik, tablet uchun responsive */}
        <main className="flex-1 overflow-y-auto bg-white/90 p-3 sm:p-5 rounded-xl my-2 sm:my-3 mx-1 sm:mx-2 shadow-lg max-h-[calc(100vh-84px)]">
          <Outlet />
        </main>
      </div>
    );
  }

  // Superadmin rollari uchun oddiy layout
  return (
    <div className="max-h-screen w-full bg-gradient-to-br from-gray-200 via-blue-50 to-gray-300 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Asosiy kontent */}
        <main className="flex-1 overflow-y-auto bg-white/90 p-5 rounded-xl my-3 mx-2 shadow-lg max-h-[calc(100vh-84px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
