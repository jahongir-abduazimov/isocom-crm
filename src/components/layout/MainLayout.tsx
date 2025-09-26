import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import OperatorTopNav from "@/components/layout/OperatorTopNav";
import OperatorSelectionModal from "@/components/ui/operator-selection-modal";
import { useAuthStore } from "@/store/auth.store";
import QuickAccessMenu from "../ui/quick-access-menu";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";

export default function MainLayout() {
  const {
    user,
    selectedOperator,
    showOperatorModal,
    setShowOperatorModal
  } = useAuthStore();

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Operator rolini tekshirish
  const isOperator = user?.role === "WORKER" || user?.is_operator;

  // Operator rolida bo'lsa va operator tanlanmagan bo'lsa modalni ko'rsatish
  useEffect(() => {
    if (isOperator && !selectedOperator && !showOperatorModal) {
      setShowOperatorModal(true);
    }
  }, [isOperator, selectedOperator, showOperatorModal, setShowOperatorModal]);

  if (isOperator) {
    // Operator uchun layout - sidebar yo'q, faqat top navigation
    return (
      <>
        <div className="max-h-screen w-full">
          {/* Operator Top Navigation */}
          <OperatorTopNav />

          {/* Asosiy kontent - operator uchun to'liq kenglik, tablet uchun responsive */}
          <main className="flex-1 overflow-y-auto bg-white/90 p-3 sm:p-5 rounded-xl my-2 sm:my-3 mx-1 sm:mx-2 shadow-lg max-h-[calc(100vh-96px)] min-h-[calc(100vh-96px)]">
            <Outlet />
          </main>
        </div>
        <QuickAccessMenu />

        {/* Operator Selection Modal */}
        <OperatorSelectionModal
          isOpen={showOperatorModal}
          onClose={() => setShowOperatorModal(false)}
        />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </>
    );
  }

  // Superadmin rollari uchun oddiy layout
  return (
    <div className="max-h-screen w-full bg-gradient-to-br from-gray-200 via-blue-50 to-gray-300 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Asosiy kontent */}
        <main className="flex-1 overflow-y-auto bg-white/90 p-3 sm:p-5 rounded-xl my-2 sm:my-3 mx-1 sm:mx-2 shadow-lg max-h-[calc(100vh-84px)]">
          <Outlet />
        </main>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
