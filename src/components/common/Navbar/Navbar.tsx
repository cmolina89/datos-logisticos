import { Link } from '@modern-js/runtime/router'
import './Navbar.scss'

export interface NavbarProps {
  navbarStyle?: string
  appLogo?: string
  companyName?: string
}

// Obtiene un origin explícito para postMessage, priorizando el host que embebe el MFE.
const resolvePostMessageOrigin = (): string => {
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      return new URL(document.referrer).origin
    } catch {
      // Si el referrer no es una URL válida, se usa el origin actual como fallback seguro.
    }
  }

  return window.location.origin
}

export default function Navbar({
  navbarStyle = 'primary',
  appLogo = '/grupo-coppel-regular.svg',
  companyName = 'Coppel',
}: NavbarProps) {
  const openMenu = () => {
    console.log('Navbar: openMenu clicked - sending message to host')

    const targetOrigin = resolvePostMessageOrigin()
    const targetWindow = window.parent !== window ? window.parent : window

    // Comunica el toggle del sidebar al host usando un target origin explícito.
    targetWindow.postMessage(
      {
        type: 'MFE_SIDEBAR_TOGGLE',
        source: 'remote-navbar',
        timestamp: Date.now(),
      },
      targetOrigin
    )

    console.log('[Remote] Sent sidebar toggle message to host')
  }


  return (
    <nav id="clt-navbar" className={navbarStyle}>
      <div id="left-menu">
        <div className="sidebar-control">
          <button type="button" className="cl-icon-button-core" onClick={openMenu}>
            <span className="cl-icon-button-core clt clt-hamburger-menu"></span>
          </button>
        </div>
        <div className="logo">
          <Link to="/">
            <img className="company-logo" src={appLogo} alt={companyName} />
          </Link>
        </div>
      </div>

      <div id="right-menu"></div>
    </nav>
  )
}
