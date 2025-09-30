import { Workbox } from 'workbox-window';

declare global {
    interface Window {
        deferredPrompt: any;
        workbox: Workbox;
    }
}

class PWAManager {
    private deferredPrompt: any = null;
    private isInstalled = false;
    private isInstallable = false;

    constructor() {
        this.init();
    }

    private init() {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }

        // Listen for beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.isInstallable = true;
            this.dispatchInstallableEvent();
        });

        // Listen for appinstalled
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.isInstallable = false;
            this.deferredPrompt = null;
            this.dispatchInstalledEvent();
        });

        // Register service worker
        this.registerServiceWorker();
    }

    private async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const workbox = new Workbox('/sw.js');

                workbox.addEventListener('controlling', () => {
                    window.location.reload();
                });

                await workbox.register();
                window.workbox = workbox;
            } catch (error) {
                console.log('Service worker registration failed:', error);
            }
        }
    }

    public async install(): Promise<boolean> {
        if (!this.deferredPrompt || this.isInstalled) {
            return false;
        }

        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                this.isInstalled = true;
                this.isInstallable = false;
                this.deferredPrompt = null;
                this.dispatchInstalledEvent();
                return true;
            }
        } catch (error) {
            console.error('Installation failed:', error);
        }

        return false;
    }

    public canInstall(): boolean {
        return this.isInstallable && !this.isInstalled;
    }

    public isAppInstalled(): boolean {
        return this.isInstalled;
    }

    private dispatchInstallableEvent() {
        window.dispatchEvent(new CustomEvent('pwa-installable'));
    }

    private dispatchInstalledEvent() {
        window.dispatchEvent(new CustomEvent('pwa-installed'));
    }

    public async checkForUpdates() {
        if (window.workbox) {
            window.workbox.addEventListener('waiting', () => {
                if (confirm('New version available! Reload to update?')) {
                    window.workbox.messageSkipWaiting();
                }
            });
        }
    }
}

// Export singleton instance
export const pwaManager = new PWAManager();

// Hook for React components
export function usePWA() {
    const [canInstall, setCanInstall] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        setCanInstall(pwaManager.canInstall());
        setIsInstalled(pwaManager.isAppInstalled());

        const handleInstallable = () => setCanInstall(true);
        const handleInstalled = () => {
            setCanInstall(false);
            setIsInstalled(true);
        };

        window.addEventListener('pwa-installable', handleInstallable);
        window.addEventListener('pwa-installed', handleInstalled);

        return () => {
            window.removeEventListener('pwa-installable', handleInstallable);
            window.removeEventListener('pwa-installed', handleInstalled);
        };
    }, []);

    const install = async () => {
        return await pwaManager.install();
    };

    return {
        canInstall,
        isInstalled,
        install,
    };
}

// Import React hooks
import { useState, useEffect } from 'react';
