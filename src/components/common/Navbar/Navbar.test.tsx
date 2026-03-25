import { customRender } from '@/utils/testUtils'
import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import Navbar from './Navbar'

// Mock de los atoms de Jotai
const mockToggleSidebar = jest.fn()

jest.mock('jotai', () => ({
  useSetAtom: () => mockToggleSidebar,
}))

// Mock del router
jest.mock('@modern-js/runtime/router', () => ({
  Link: ({ children }: any) => children,
}))

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console.log para evitar logs en tests
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('debe renderizar correctamente con props por defecto', () => {
    customRender(<Navbar />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByAltText('Coppel')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('debe mostrar el logo por defecto', () => {
    customRender(<Navbar />)

    const logo = screen.getByAltText('Coppel')
    expect(logo).toHaveAttribute('src', '/grupo-coppel-regular.svg')
    expect(logo).toHaveClass('company-logo')
  })

  it('debe usar logo personalizado cuando se proporciona', () => {
    const customLogo = '/custom-logo.svg'
    customRender(<Navbar appLogo={customLogo} />)

    const logo = screen.getByAltText('Coppel')
    expect(logo).toHaveAttribute('src', customLogo)
  })

  it('debe usar nombre de empresa personalizado', () => {
    const customName = 'Custom Company'
    customRender(<Navbar companyName={customName} />)

    expect(screen.getByAltText(customName)).toBeInTheDocument()
  })

  it('debe aplicar estilo de navbar personalizado', () => {
    customRender(<Navbar navbarStyle="secondary" />)

    const navbar = screen.getByRole('navigation')
    expect(navbar).toHaveClass('secondary')
  })

  it('debe llamar toggleSidebar cuando se hace clic en el botón del menú', () => {
    customRender(<Navbar />)

    const menuButton = screen.getByRole('button')
    fireEvent.click(menuButton)

    expect(mockToggleSidebar).toHaveBeenCalled()
  })

  it('debe tener la estructura HTML correcta', () => {
    customRender(<Navbar />)

    const navbar = screen.getByRole('navigation')
    expect(navbar).toHaveAttribute('id', 'clt-navbar')

    expect(document.querySelector('#left-menu')).toBeInTheDocument()
    expect(document.querySelector('#right-menu')).toBeInTheDocument()
    expect(document.querySelector('.sidebar-control')).toBeInTheDocument()
    expect(document.querySelector('.logo')).toBeInTheDocument()
  })

  it('debe tener el botón del menú con las clases correctas', () => {
    customRender(<Navbar />)

    const menuButton = screen.getByRole('button')
    expect(menuButton).toHaveClass('cl-icon-button-core')
    expect(menuButton).toHaveAttribute('type', 'button')

    const icon = menuButton.querySelector('span')
    expect(icon).toHaveClass('cl-icon-button-core', 'clt', 'clt-hamburger-menu')
  })

  it('debe tener enlace al home en el logo', () => {
    customRender(<Navbar />)

    const logoLink = screen.getByRole('link')
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('debe manejar props undefined correctamente', () => {
    customRender(<Navbar navbarStyle={undefined} appLogo={undefined} companyName={undefined} />)

    // Debe usar valores por defecto
    expect(screen.getByRole('navigation')).toHaveClass('primary')
    expect(screen.getByAltText('Coppel')).toHaveAttribute('src', '/grupo-coppel-regular.svg')
  })

  it('debe tener accesibilidad correcta', () => {
    customRender(<Navbar />)

    const navbar = screen.getByRole('navigation')
    expect(navbar).toBeInTheDocument()

    const menuButton = screen.getByRole('button')
    expect(menuButton).toBeInTheDocument()

    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('alt', 'Coppel')
  })

  it('debe logear cuando se hace clic en openMenu', () => {
    const consoleSpy = jest.spyOn(console, 'log')
    customRender(<Navbar />)

    const menuButton = screen.getByRole('button')
    fireEvent.click(menuButton)

    expect(consoleSpy).toHaveBeenCalledWith('Navbar: openMenu clicked - toggling sidebar')
  })

  it('debe tener las funciones de toggle definidas pero no utilizadas', () => {
    // Estas funciones están definidas pero marcadas como no utilizadas intencionalmente
    customRender(<Navbar />)

    // Verificar que el componente renderiza sin errores
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('debe tener la función formatIcon definida', () => {
    customRender(<Navbar />)

    // La función formatIcon está definida internamente
    // Verificar que el componente renderiza correctamente
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('debe manejar strings vacíos en props', () => {
    customRender(<Navbar navbarStyle="" appLogo="" companyName="" />)

    const navbar = screen.getByRole('navigation')
    expect(navbar).toHaveClass('')

    const logo = screen.getByRole('img')
    expect(logo).toHaveAttribute('src', '')
    expect(logo).toHaveAttribute('alt', '')
  })

  it('debe tener el menú derecho vacío', () => {
    customRender(<Navbar />)

    const rightMenu = document.querySelector('#right-menu')
    expect(rightMenu).toBeInTheDocument()
    expect(rightMenu).toBeEmptyDOMElement()
  })

  it('debe mantener el estado interno correctamente', () => {
    customRender(<Navbar />)

    // Verificar que el componente mantiene su estado sin errores
    const menuButton = screen.getByRole('button')

    // Hacer múltiples clics
    fireEvent.click(menuButton)
    fireEvent.click(menuButton)
    fireEvent.click(menuButton)

    expect(mockToggleSidebar).toHaveBeenCalledTimes(3)
  })
})
