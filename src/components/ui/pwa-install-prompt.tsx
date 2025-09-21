import React, { useState, useEffect } from 'react';
import { PWAInstallManager, PWAUpdateManager, isOnline } from '@/lib/pwa';

interface PWAInstallPromptProps {
    className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnlineStatus, setIsOnlineStatus] = useState(isOnline());

    useEffect(() => {
        const installManager = new PWAInstallManager();

        // Check if app is already installed
        setIsInstalled(installManager.isInstalled());

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setShowInstallPrompt(true);
        };

        // Listen for network status
        const handleOnline = () => setIsOnlineStatus(true);
        const handleOffline = () => setIsOnlineStatus(false);

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', () => {
            setShowInstallPrompt(false);
            setIsInstalled(true);
        });

        // Network status listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', () => { });
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleInstall = async () => {
        const installManager = new PWAInstallManager();
        await installManager.promptInstall();
        setShowInstallPrompt(false);
    };

    const handleUpdate = () => {
        const updateManager = new PWAUpdateManager();
        updateManager.skipWaiting();
        setShowUpdatePrompt(false);
    };

    if (isInstalled) return null;

    return (
        <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
            {/* Install Prompt */}
            {showInstallPrompt && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-2 max-w-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18l9-5-9-5-9 5 9 5z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-gray-900">Install IsoCom CRM</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Install this app on your device for quick access and offline functionality.
                            </p>
                            <div className="mt-3 flex space-x-2">
                                <button
                                    onClick={handleInstall}
                                    className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Install
                                </button>
                                <button
                                    onClick={() => setShowInstallPrompt(false)}
                                    className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Prompt */}
            {showUpdatePrompt && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-2 max-w-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-gray-900">Update Available</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                A new version of the app is available with improvements and bug fixes.
                            </p>
                            <div className="mt-3 flex space-x-2">
                                <button
                                    onClick={handleUpdate}
                                    className="bg-green-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-600 transition-colors"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => setShowUpdatePrompt(false)}
                                    className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Offline Indicator */}
            {!isOnlineStatus && (
                <div className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                        </svg>
                        <span className="text-sm font-medium">You're offline</span>
                    </div>
                </div>
            )}
        </div>
    );
};
