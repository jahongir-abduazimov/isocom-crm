import { Workbox } from 'workbox-window';

// PWA Update Manager
export class PWAUpdateManager {
    private wb: Workbox | null = null;

    constructor() {
        if ('serviceWorker' in navigator) {
            this.wb = new Workbox('/sw.js');
            this.setupEventListeners();
        }
    }

    private setupEventListeners() {
        if (!this.wb) return;

        // Listen for the controlling service worker changing
        this.wb.addEventListener('controlling', () => {
            // At this point, reloading will ensure that the current
            // tab is loaded under the control of the new service worker.
            // Depending on your web app, you may want to prompt the user
            // to reload, or you may want to reload automatically.
            window.location.reload();
        });

        // Listen for the waiting service worker
        this.wb.addEventListener('waiting', () => {
            // A new service worker is waiting to become the active service worker.
            // You may want to prompt the user to refresh the page to get the
            // latest version of the app, or you may want to reload automatically.
            this.showUpdateAvailable();
        });

        // Register the service worker
        this.wb.register().catch((error) => {
            console.error('Service worker registration failed:', error);
        });
    }

    private showUpdateAvailable() {
        // You can customize this notification based on your UI framework
        if (confirm('A new version of the app is available. Would you like to update?')) {
            this.wb?.messageSkipWaiting();
        }
    }

    // Method to manually check for updates
    public async checkForUpdates() {
        if (this.wb) {
            await this.wb.update();
        }
    }

    // Method to skip waiting and activate the new service worker
    public skipWaiting() {
        this.wb?.messageSkipWaiting();
    }
}

// PWA Installation Manager
export class PWAInstallManager {
    private deferredPrompt: any = null;

    constructor() {
        this.setupInstallPrompt();
    }

    private setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Show install button or notification
            this.showInstallPrompt();
        });

        // Listen for the app being installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.deferredPrompt = null;
        });
    }

    private showInstallPrompt() {
        // You can customize this based on your UI
        // For now, we'll just log that the install prompt is available
        console.log('PWA install prompt is available');
    }

    // Method to trigger the install prompt
    public async promptInstall() {
        if (this.deferredPrompt) {
            // Show the install prompt
            this.deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // Clear the deferredPrompt
            this.deferredPrompt = null;
        }
    }

    // Check if the app is already installed
    public isInstalled(): boolean {
        return window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
    }
}

// Utility functions
export const isOnline = (): boolean => navigator.onLine;

export const isOffline = (): boolean => !navigator.onLine;

// Network status listener
export const setupNetworkStatusListener = (onOnline: () => void, onOffline: () => void) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
};

// Initialize PWA managers
export const initializePWA = () => {
    const updateManager = new PWAUpdateManager();
    const installManager = new PWAInstallManager();

    return {
        updateManager,
        installManager
    };
};
