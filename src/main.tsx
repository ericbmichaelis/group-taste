import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AlienSsoProvider } from '@alien_org/sso-sdk-react'
import { AlienProvider } from '@alien_org/react'
import './index.css'
import App from './App.tsx'

const ssoConfig = {
  ssoBaseUrl: import.meta.env.VITE_SSO_BASE_URL || "https://sso.alien-api.com",
  providerAddress: import.meta.env.VITE_PROVIDER_ADDRESS || "demo-grouptaste",
  pollingInterval: 3000,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlienProvider>
      <AlienSsoProvider config={ssoConfig}>
        <App />
      </AlienSsoProvider>
    </AlienProvider>
  </StrictMode>,
)
