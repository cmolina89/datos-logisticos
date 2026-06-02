import { ThemeProvider } from '@/app/providers/ThemeProvider'
import SEOHead from '@/components/common/SEOHead/SEOHead'
import LanguageSwitcher from '@/components/common/LanguageSwitcher/LanguageSwitcher'
import { applyClientSecurityHeaders } from '@/utils/securityHeaders'
import { useTranslation } from '@/hooks/useTranslation'
import { Outlet } from '@modern-js/runtime/router'
import { Provider as JotaiProvider } from 'jotai'
import { PrimeReactProvider } from 'primereact/api'
import { useEffect } from 'react'
import { CookiesProvider } from 'react-cookie'

// Estilos base de PrimeReact y tus estilos globales
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/primereact.min.css'

import 'coltrane-css/coltrane.min.css'
import 'coltrane-icon-font/coltrane-icons.css'

import '@/styles/global.scss'

// Componente interno
function LayoutContent() {
  const { t } = useTranslation()

  useEffect(() => {
    applyClientSecurityHeaders()
  }, [])

  const handleSkipLinkFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.target.style.top = '6px'
  }

  const handleSkipLinkBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.target.style.top = '-40px'
  }

  return (
    <div id="remote-app" className="sgc-mfe-attributes" role="application">
      <SEOHead />
      <main id="main-content" className="cv-main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default function Layout() {
  return (
    <CookiesProvider>
      <JotaiProvider>
        <PrimeReactProvider>
          <ThemeProvider>
            <LayoutContent />
          </ThemeProvider>
        </PrimeReactProvider>
      </JotaiProvider>
    </CookiesProvider>
  )
}
