// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n
import Root from "./router/AppRouter.tsx"
import { pwaManager } from './lib/pwa' // Initialize PWA

// Initialize PWA manager
pwaManager.checkForUpdates();

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Root />
  // </StrictMode>,
)
