# ISOCOM CRM

A modern CRM system built with React, TypeScript, and Vite.

## Features

- **Dashboard** - Overview of key metrics and data
- **Materials Management** - Add, edit, and track materials
- **Products Management** - Manage finished and semi-finished products
- **Production Management** - Track production orders, steps, and outputs
- **Stock Management** - Inventory tracking and movement logs
- **Warehouse Management** - Locations and warehouse organization
- **User Management** - System users and access control
- **Workcenters** - Production equipment and capacity management
- **Progressive Web App (PWA)** - Install as native app with offline support

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **UI Components**: Radix UI primitives
- **PWA**: Vite PWA Plugin with Workbox

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

## Deployment

### Vercel

This project is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Configure build settings:

   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Framework**: Vite

3. Deploy automatically on push to main branch

### Manual Build

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Progressive Web App (PWA)

This application is configured as a Progressive Web App, allowing users to install it on their devices and use it offline.

### PWA Features

- **Installable**: Users can install the app on their desktop or mobile device
- **Offline Support**: Basic functionality works without internet connection
- **Auto Updates**: Service worker automatically updates the app in the background
- **Native-like Experience**: Runs in standalone mode without browser UI

### Installation

Users can install the PWA in several ways:

1. **Browser Prompt**: The app will show an install prompt when conditions are met
2. **Manual Install**:
   - **Chrome/Edge**: Click the install icon in the address bar
   - **Safari**: Use "Add to Home Screen" from the share menu
   - **Firefox**: Use "Install" from the menu

### PWA Files

The following files are generated during build:

- `sw.js` - Service worker for caching and offline functionality
- `manifest.webmanifest` - App manifest with metadata
- `offline.html` - Fallback page shown when offline

### Development

The PWA features are automatically enabled in production builds. For development, the service worker is registered but caching is minimal.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
