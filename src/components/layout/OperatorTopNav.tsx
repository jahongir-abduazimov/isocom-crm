import { NavLink } from "react-router-dom";
import { Wrench, FileText, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

export default function OperatorTopNav() {
  const { selectedOperator, setShowOperatorModal } = useAuthStore();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-between px-2 sm:px-4 rounded-xl border border-gray-200 mt-2 mx-2">
      <div className="flex items-center gap-2 sm:gap-4">
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/worker"
            className={({ isActive }) =>
              `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${isActive
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
              `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${isActive
                ? "bg-primary text-white shadow font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
              }`
            }
          >
            <FileText size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Inventar loglari</span>
            <span className="sm:hidden">Loglar</span>
          </NavLink>
          <NavLink
            to="/worker/reprocessing"
            className={({ isActive }) =>
              `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${isActive
                ? "bg-primary text-white shadow font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
              }`
            }
          >
            <Shield size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Braklar</span>
            <span className="sm:hidden">Braklar</span>
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Operator Selection Button */}
        <Button
          onClick={() => setShowOperatorModal(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <Users size={14} className="sm:w-4 sm:h-4" />
          <span>
            {selectedOperator
              ? `${selectedOperator.first_name || ''} ${selectedOperator.last_name || ''}`.trim() || selectedOperator.username
              : 'Operator tanlash'
            } | {selectedOperator?.role_display_uz}
          </span>
        </Button>
        {/* <Button onClick={handleLogout} variant="outline">
          Chiqish <LogOut size={16} />
        </Button> */}
      </div>
    </header>
  );
}
