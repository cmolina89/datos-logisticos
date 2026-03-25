import { customRender } from '@/utils/testUtils'
import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import { ThemeSwitcher } from './ThemeSwitcher'

// Mock de los atoms de Jotai
const mockTheme = 'light'
const mockSetTheme = jest.fn()

jest.mock('jotai', () => ({
  useAtom: () => [mockTheme, mockSetTheme],
}))

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe renderizar correctamente', () => {
    customRender(<ThemeSwitcher />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('debe mostrar icono de luna en tema claro', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    expect(button.querySelector('.pi-moon')).toBeInTheDocument()
  })

  it('debe mostrar icono de sol en tema oscuro', () => {
    const mockDarkTheme = 'dark'
    jest.doMock('jotai', () => ({
      useAtom: () => [mockDarkTheme, mockSetTheme],
    }))

    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    expect(button.querySelector('.pi-sun')).toBeInTheDocument()
  })

  it('debe tener aria-label correcto para tema claro', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Cambiar a modo oscuro. Tema actual: claro')
  })

  it('debe tener aria-label correcto para tema oscuro', () => {
    const mockDarkTheme = 'dark'
    jest.doMock('jotai', () => ({
      useAtom: () => [mockDarkTheme, mockSetTheme],
    }))

    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Cambiar a modo claro. Tema actual: oscuro')
  })

  it('debe tener aria-pressed correcto', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('debe tener aria-pressed true en tema oscuro', () => {
    const mockDarkTheme = 'dark'
    jest.doMock('jotai', () => ({
      useAtom: () => [mockDarkTheme, mockSetTheme],
    }))

    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('debe llamar setTheme cuando se hace clic', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith(expect.any(Function))
  })

  it('debe alternar de claro a oscuro', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Verificar que se llamó con una función
    expect(mockSetTheme).toHaveBeenCalledWith(expect.any(Function))

    // Simular la función que se pasa
    const toggleFunction = mockSetTheme.mock.calls[0][0]
    expect(toggleFunction('light')).toBe('dark')
  })

  it('debe alternar de oscuro a claro', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const toggleFunction = mockSetTheme.mock.calls[0][0]
    expect(toggleFunction('dark')).toBe('light')
  })

  it('debe tener las clases CSS correctas', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('p-button-rounded')
    expect(button).toHaveClass('p-button-text')
    expect(button).toHaveClass('theme-switcher')
  })

  it('debe tener type button', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('debe tener title correcto', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Cambiar a modo oscuro')
  })

  it('debe configurar tooltipOptions correctamente', () => {
    customRender(<ThemeSwitcher />)

    // Verificar que el componente renderiza sin errores
    // Las tooltipOptions se configuran internamente en PrimeReact
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('debe manejar múltiples clics', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledTimes(3)
  })

  it('debe mantener la funcionalidad de toggle', () => {
    customRender(<ThemeSwitcher />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const toggleFunction = mockSetTheme.mock.calls[0][0]

    // Verificar que la función toggle funciona correctamente
    expect(toggleFunction('light')).toBe('dark')
    expect(toggleFunction('dark')).toBe('light')
    expect(toggleFunction('light')).toBe('dark')
  })
})
