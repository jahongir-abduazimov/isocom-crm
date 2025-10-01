// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n
import Root from "./router/AppRouter.tsx"
import { registerSW } from './lib/pwa'

// Register service worker for PWA functionality
registerSW()

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Root />
  // </StrictMode>,
)
