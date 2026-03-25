import { Outlet } from '@modern-js/runtime/router'
import { useAtomValue } from 'jotai'
import type React from 'react'
import { sidebarOpenAtom, submenuVisibleAtom } from '../../../app/store/sidebarAtoms'
import Navbar from '../../../components/common/Navbar/Navbar'
import Sidebar from '../../../components/common/Sidebar/Sidebar'
import { useBreakpoint } from '../../../hooks/useBreakpoint'

const PublicRouteLayout: React.FC = () => {
  const sidebarOpen = useAtomValue(sidebarOpenAtom)
  const submenuVisible = useAtomValue(submenuVisibleAtom)
  const { isMdDown } = useBreakpoint()

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
          marginTop: '112px', // Altura del navbar
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

export default PublicRouteLayout
