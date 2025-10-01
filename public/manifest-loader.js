// Dynamic manifest loader based on user locale
(function () {
    const userLocale = localStorage.getItem('i18nextLng') ||
        navigator.language.split('-')[0] ||
        'en';

    const manifestMap = {
        'uz': '/manifest.uz.webmanifest',
        'ru': '/manifest.ru.webmanifest',
        'cyrl': '/manifest.uz.webmanifest', // Cyrillic uses Uzbek manifest
        'default': '/manifest.webmanifest'
    };

    const manifestUrl = manifestMap[userLocale] || manifestMap['default'];

    // Update manifest link
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
        manifestLink.href = manifestUrl;
    } else {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = manifestUrl;
        document.head.appendChild(link);
    }

    // Listen for locale changes
    window.addEventListener('localeChanged', (event) => {
        const newLocale = event.detail.locale;
        const newManifestUrl = manifestMap[newLocale] || manifestMap['default'];
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            manifestLink.href = newManifestUrl;
        }
    });
})();

