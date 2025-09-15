import { NavLink } from "react-router-dom";
import { Wrench, Package, FileText } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function OperatorTopNav() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-between px-2 sm:px-4 rounded-xl border border-gray-200 mt-2 mx-2">
      <div className="flex items-center gap-2 sm:gap-4">
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/worker"
            className={({ isActive }) =>
              `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                isActive
                  ? "bg-primary text-white shadow font-semibold"
                  : "hover:bg-primary/10 hover:text-primary"
              }`
            }
          >
            <Wrench size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Operator paneli</span>
            <span className="sm:hidden">Panel</span>
          </NavLink>
          <NavLink
            to="/stock/inventory-movement-logs"
            className={({ isActive }) =>
              `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                isActive
                  ? "bg-primary text-white shadow font-semibold"
                  : "hover:bg-primary/10 hover:text-primary"
              }`
            }
          >
            <FileText size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Inventory logs</span>
            <span className="sm:hidden">Logs</span>
          </NavLink>
          <NavLink
            to="/stock/stock-levels"
            className={({ isActive }) =>
              `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                isActive
                  ? "bg-primary text-white shadow font-semibold"
                  : "hover:bg-primary/10 hover:text-primary"
              }`
            }
          >
            <Package size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Stock levels</span>
            <span className="sm:hidden">Stock</span>
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
          {user?.full_name || user?.username}
        </span>
        <span className="text-xs text-gray-600 sm:hidden">
          {user?.username}
        </span>
        {/* <Button onClick={handleLogout} variant="outline">
          Chiqish <LogOut size={16} />
        </Button> */}
      </div>
    </header>
  );
}
