import { Download, Check } from "lucide-react";
import { Button } from "./button";
import { usePWA } from "@/lib/pwa";
import { useTranslation } from "react-i18next";

interface PWAInstallButtonProps {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
    className?: string;
}

export default function PWAInstallButton({
    variant = "outline",
    size = "sm",
    className = ""
}: PWAInstallButtonProps) {
    const { canInstall, isInstalled, install } = usePWA();
    const { t } = useTranslation();

    const handleInstall = async () => {
        try {
            await install();
        } catch (error) {
            console.error('Installation failed:', error);
        }
    };

    if (isInstalled) {
        return (
            <Button
                variant="ghost"
                size={size}
                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600 hover:text-green-700 ${className}`}
                disabled
            >
                <Check size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('pwa.installed')}</span>
                <span className="sm:hidden">{t('pwa.installedShort')}</span>
            </Button>
        );
    }

    if (!canInstall) {
        return null;
    }

    return (
        <Button
            onClick={handleInstall}
            variant={variant}
            size={size}
            className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${className}`}
        >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('pwa.install')}</span>
            <span className="sm:hidden">{t('pwa.installShort')}</span>
        </Button>
    );
}
