import { Link } from '@modern-js/runtime/router'
import { useState, useEffect } from 'react'
import './Navbar.scss'

export interface NavbarProps {
  navbarStyle?: string
  appLogo?: string
  companyName?: string
}

export default function Navbar({
  navbarStyle = 'primary',
  appLogo = '/grupo-coppel-regular.svg',
  companyName = 'Coppel',
}: NavbarProps) {
  const [expandedSearch, setExpandedSearch] = useState(false)
  const [expandedNotifications, setExpandedNotifications] = useState(false)
  const [expandedProfile, setExpandedProfile] = useState(false)

  const openMenu = (): void => {
    console.log('Navbar: openMenu clicked - sending message to host')

    // Usar window.postMessage para comunicarse con el host
    window.postMessage(
      {
        type: 'MFE_SIDEBAR_TOGGLE',
        source: 'remote-navbar',
        timestamp: Date.now(),
      },
      '*'
    )

    console.log('[Remote] Sent sidebar toggle message to host')
  }

  // Funciones para controlar los menús expandidos (listas para usar cuando se agreguen los elementos del menú)
  const toggleSearch = (): void => {
    reset()
    setExpandedSearch(!expandedSearch)
  }

  const toggleNotifications = (): void => {
    reset()
    setExpandedNotifications(!expandedNotifications)
  }

  const toggleProfile = (): void => {
    reset()
    setExpandedProfile(!expandedProfile)
  }

  const reset = (): void => {
    setExpandedSearch(false)
    setExpandedNotifications(false)
    setExpandedProfile(false)
  }

  const formatIcon = (icon: string): string => 'clt icon clt-' + icon

  // Evitar warnings de variables no utilizadas - estas funciones están listas para usar
  void toggleSearch
  void toggleNotifications
  void toggleProfile
  void formatIcon

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
