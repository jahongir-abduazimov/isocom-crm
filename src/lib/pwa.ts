import { Workbox } from 'workbox-window';

let wb: Workbox | null = null;

export const registerSW = async () => {
    if ('serviceWorker' in navigator) {
        wb = new Workbox('/sw.js');

        wb.addEventListener('controlling', () => {
            // New service worker is controlling the page
            console.log('New service worker is controlling the page');
            // You can show a notification to the user here
        });

        wb.addEventListener('waiting', () => {
            // New service worker is waiting
            console.log('New service worker is waiting');
            // You can show an update notification here
            if (confirm('New version available! Reload to update?')) {
                wb?.messageSkipWaiting();
            }
        });

        wb.addEventListener('activated', (event) => {
            // Service worker is activated
            console.log('Service worker activated');
            if (event.isUpdate) {
                window.location.reload();
            }
        });

        try {
            await wb.register();
            console.log('Service worker registered successfully');
        } catch (error) {
            console.error('Service worker registration failed:', error);
        }
    }
};

export const unregisterSW = async () => {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
    }
};

export const checkForUpdates = () => {
    if (wb) {
        wb.update();
    }
};

export const isOnline = () => navigator.onLine;

export const addOnlineListener = (callback: () => void) => {
    window.addEventListener('online', callback);
};

export const addOfflineListener = (callback: () => void) => {
    window.addEventListener('offline', callback);
};

export const removeOnlineListener = (callback: () => void) => {
    window.removeEventListener('online', callback);
};

export const removeOfflineListener = (callback: () => void) => {
    window.removeEventListener('offline', callback);
};
