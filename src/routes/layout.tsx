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

  // El contenido principal siempre ocupa todo el espacio disponible
  // El sidebar se superpone sin mover el contenido
  const getMainContentMarginLeft = (): string => {
    return '0' // Nunca empuja el contenido
  }

  const getMainContentWidth = (): string => {
    return '100%' // Siempre ocupa todo el ancho
  }

  const handleSkipLinkFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.target.style.top = '6px'
  }

  const handleSkipLinkBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.target.style.top = '-40px'
  }

  return (
    <div
      id="remote-app"
      className="sgc-mfe-attributes"
      role="application"
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background-body, #f8f9fa)',
      }}
    >
      <SEOHead />

      {/* Selector de idioma fijo arriba a la derecha */}
      <div
        style={{
          position: 'fixed',
          top: '0.75rem',
          right: '1rem',
          zIndex: 1001,
        }}
      >
        <LanguageSwitcher />
      </div>

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: '#007bff',
          color: 'white',
          padding: '8px',
          textDecoration: 'none',
          borderRadius: '4px',
          zIndex: 1000,
          transition: 'top 0.3s',
        }}
        onFocus={handleSkipLinkFocus}
        onBlur={handleSkipLinkBlur}
      >
        {t('accessibility.skipToContent')}
      </a>

      {/* Contenido principal sin márgenes para navbar/sidebar */}
      <main
        id="main-content"
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: 'var(--color-background-body, #f8f9fa)',
          position: 'relative',
        }}
      >
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
