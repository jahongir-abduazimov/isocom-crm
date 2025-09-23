import { NavLink } from "react-router-dom";
import { Wrench, FileText, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/ui/language-switcher";

export default function OperatorTopNav() {
  const { selectedOperator, setShowOperatorModal } = useAuthStore();
  const { t } = useTranslation();

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
            <span className="hidden sm:inline">{t('operator.panel')}</span>
            <span className="sm:hidden">{t('operator.panelShort')}</span>
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
            <span className="hidden sm:inline">{t('operator.inventoryLogs')}</span>
            <span className="sm:hidden">{t('operator.logsShort')}</span>
          </NavLink>
          <NavLink
            to="/reprocessing"
            className={({ isActive }) =>
              `flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${isActive
                ? "bg-primary text-white shadow font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
              }`
            }
          >
            <Shield size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('operator.scrap')}</span>
            <span className="sm:hidden">{t('operator.scrap')}</span>
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Switcher */}
        <LanguageSwitcher />

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
              : t('operator.selectOperator')
            }
          </span>
        </Button>
        {/* <Button onClick={handleLogout} variant="outline">
          Chiqish <LogOut size={16} />
        </Button> */}
      </div>
    </header>
  );
}
