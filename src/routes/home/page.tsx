import SEOHead from '@/components/common/SEOHead/SEOHead'
import type { MetaData } from '@/types/globals'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Suspense } from 'react'

// Configura los metadatos para la página usando tu tipo global
export const meta = (): MetaData => ({
  title: 'Home - CoppelFramework',
  description: 'Home',
  keywords: 'home, CoppelFramework',
})

export default function Home() {
  return (
    <>
      <SEOHead
        title="Posts Recientes - CoppelFramework"
        description="Explora la lista de posts recientes en nuestra plataforma. Contenido actualizado y relevante para desarrolladores."
        keywords="posts, artículos, contenido, blog, CoppelFramework, desarrollo"
        url="https://coppelframework.com/posts"
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
            <ProgressSpinner aria-label="Cargando lista de posts" />
          </div>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
          }}
        >
          <div
            style={{
              maxWidth: '800px',
              textAlign: 'center',
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h1
              style={{
                fontSize: '3rem',
                marginBottom: '20px',
                color: '#2c3e50',
              }}
            >
              Bienvenido a CoppelFramework
            </h1>
            <p
              style={{
                fontSize: '1.2rem',
                marginBottom: '30px',
                color: '#7f8c8d',
              }}
            >
              Esta es la página de inicio pública. Para acceder al dashboard con Navbar y Sidebar,
              inicia sesión y ve a las rutas protegidas.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <a
                href="/login"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                }}
              >
                Iniciar Sesión
              </a>
              <a
                href="/protected"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                }}
              >
                Ir a Dashboard
              </a>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  )
}
