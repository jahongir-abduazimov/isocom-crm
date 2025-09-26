import { useAuthStore } from "@/store/auth.store";
import { LogOut, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../ui/language-switcher";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { logout } = useAuthStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-between px-4 sm:px-6 lg:px-8 rounded-xl border border-gray-200 mt-2 mx-1 sm:mx-2">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="lg:hidden text-gray-600 hover:bg-gray-100 p-2"
        >
          <Menu size={20} />
        </Button>

        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary tracking-wide drop-shadow-sm truncate">
          {t('common.appName')}{" "}
          <span className="text-sm sm:text-base font-normal text-gray-500 ml-1 sm:ml-2 hidden sm:inline">
            {t('common.subtitle')}
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <div className="sm:hidden">
          <LanguageSwitcher />
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          <span className="hidden sm:inline">{t('common.logout')}</span>
          <LogOut size={14} className="sm:ml-1" />
        </Button>
      </div>
    </header>
  );
}
