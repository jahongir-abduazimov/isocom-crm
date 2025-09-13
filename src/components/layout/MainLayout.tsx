import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function MainLayout() {
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
