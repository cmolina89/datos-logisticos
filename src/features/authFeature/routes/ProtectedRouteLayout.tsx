import { Outlet, useLocation, useNavigate } from '@modern-js/runtime/router'
import { useAtomValue } from 'jotai'
// src/features/authFeature/routes/ProtectedRouteLayout.tsx
import type React from 'react'
import { useEffect } from 'react'
import { sidebarOpenAtom, submenuVisibleAtom } from '../../../app/store/sidebarAtoms'
import Navbar from '../../../components/common/Navbar/Navbar'
import Sidebar from '../../../components/common/Sidebar/Sidebar'
import { useBreakpoint } from '../../../hooks/useBreakpoint'
import { isAuthenticatedAtom } from '../store/authAtoms'

const ProtectedRouteLayout: React.FC = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const sidebarOpen = useAtomValue(sidebarOpenAtom)
  const submenuVisible = useAtomValue(submenuVisibleAtom)
  const navigate = useNavigate()
  const location = useLocation()
  const { isMdDown } = useBreakpoint()

  useEffect(() => {
    // Este efecto se ejecutará en el cliente.
    // Para SSR, necesitarías una verificación en el servidor si quieres evitar el renderizado inicial de la ruta protegida.
    // Por ahora, esta protección es principalmente del lado del cliente y post-hidratación.
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo a login desde:', location.pathname)
      // Guarda la ruta a la que se intentó acceder para redirigir después del login (opcional)
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, {
        replace: true,
      })
    }
  }, [isAuthenticated, navigate, location])

  // Si no está autenticado, podrías renderizar un loader o null para evitar un flash de contenido.
  // Sin embargo, la redirección en useEffect es común para CSR.
  if (!isAuthenticated) {
    // Esto ayuda a prevenir el renderizado del Outlet si la redirección no es instantánea
    // o si el efecto aún no se ha ejecutado (por ejemplo, en el primer render SSR donde isAuthenticated podría ser false).
    // En SSR, si isAuthenticated es false, esto mostraría "Cargando..." o nada.
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: 'var(--color-background-body, #f8f9fa)',
        }}
      >
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  // El contenido principal siempre ocupa todo el espacio disponible
  // El sidebar se superpone sin mover el contenido
  const getMainContentMarginLeft = (): string => {
    return '0' // Nunca empuja el contenido
  }

  const getMainContentWidth = (): string => {
    return '100%' // Siempre ocupa todo el ancho
  }

  return (
    <div
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
      {/* Navbar fijo en la parte superior */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          height: '112px',
        }}
      >
        <Navbar />
      </div>

      {/* Sidebar - solo se renderiza cuando está abierto o hay submenu visible */}
      {(sidebarOpen || submenuVisible) && (
        <div
          style={{
            position: 'fixed',
            top: '112px', // Debajo del navbar
            left: 0,
            zIndex: 1000, // Z-index alto para superponerse a todo
            height: 'calc(100vh - 112px)',
          }}
        >
          <Sidebar />
        </div>
      )}

      {/* Contenido principal responsive */}
      <main
        style={{
          marginLeft: getMainContentMarginLeft(),
          height: 'calc(100vh - 112px)',
          width: getMainContentWidth(),
          overflow: 'auto',
          transition: 'margin-left 0.25s ease-in-out, width 0.25s ease-in-out',
          backgroundColor: 'var(--color-background-body, #f8f9fa)',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: isMdDown ? '16px' : '24px',
            minHeight: '100%',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default ProtectedRouteLayout
