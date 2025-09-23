import { useAuthStore } from "@/store/auth.store";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../ui/language-switcher";

export default function Header() {
  const { logout } = useAuthStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-between px-8 rounded-xl border border-gray-200 mt-2 mx-2">
      <h1 className="text-2xl font-bold text-primary tracking-wide drop-shadow-sm">
        {t('common.appName')}{" "}
        <span className="text-base font-normal text-gray-500 ml-2">
          {t('common.subtitle')}
        </span>
      </h1>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <Button onClick={handleLogout} variant="outline">
          {t('common.logout')} <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
