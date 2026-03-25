import SEOHead from '@/components/common/SEOHead/SEOHead'
import { ProgressSpinner } from 'primereact/progressspinner'
import React, { Suspense } from 'react'
// src/routes/public/login/page.tsx
import type { MetaData } from '@/types/globals' // Importa tu tipo global

const LoginPageContent = React.lazy(() => import('@/features/authFeature/pages/LoginPage'))

// Configuración de metadatos para SEO usando tu tipo global
export const meta = (): MetaData => ({
  title: 'Iniciar Sesión - CoppelFramework',
  description: 'Inicia sesión para acceder a las funcionalidades de la aplicación CoppelFramework.',
  keywords: 'login, iniciar sesión, autenticación, CoppelFramework',
})

export default function LoginPage() {
  return (
    <>
      <SEOHead
        title="Iniciar Sesión - CoppelFramework"
        description="Inicia sesión para acceder a las funcionalidades de la aplicación CoppelFramework. Autenticación segura y fácil."
        keywords="login, iniciar sesión, autenticación, CoppelFramework, acceso"
        url="https://coppelframework.com/login"
        noIndex={true}
      />
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <ProgressSpinner aria-label="Cargando página de inicio de sesión" />
          </div>
        }
      >
        <LoginPageContent />
      </Suspense>
    </>
  )
}
