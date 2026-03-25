import { customRender } from '@/utils/testUtils'
import '@testing-library/jest-dom'
import { fireEvent, screen } from '@testing-library/react'
import LanguageSwitcher from './LanguageSwitcher'

// Mock del hook useTranslation
const mockChangeLanguage = jest.fn()
const mockI18n = {
  language: 'es',
  changeLanguage: mockChangeLanguage,
}

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockI18n.language = 'es'
  })

  it('debe renderizar correctamente', () => {
    customRender(<LanguageSwitcher />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByLabelText('Select language')).toBeInTheDocument()
  })

  it('debe mostrar el idioma seleccionado por defecto (español)', () => {
    customRender(<LanguageSwitcher />)

    expect(screen.getByText('🇲🇽')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
  })

  it('debe mostrar inglés cuando está seleccionado', () => {
    mockI18n.language = 'en'
    customRender(<LanguageSwitcher />)

    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('debe llamar changeLanguage cuando se selecciona un idioma', () => {
    customRender(<LanguageSwitcher />)

    const dropdown = screen.getByRole('combobox')
    fireEvent.click(dropdown)

    // Simular selección de inglés
    const englishOption = screen.getByText('English')
    fireEvent.click(englishOption)

    expect(mockChangeLanguage).toHaveBeenCalledWith('en')
  })

  it('debe tener las clases CSS correctas', () => {
    customRender(<LanguageSwitcher />)

    expect(document.querySelector('.language-switcher')).toBeInTheDocument()
    expect(document.querySelector('.language-dropdown')).toBeInTheDocument()
  })

  it('debe tener tooltip configurado', () => {
    customRender(<LanguageSwitcher />)

    const dropdown = screen.getByRole('combobox')
    expect(dropdown).toHaveAttribute('title', 'Change language')
  })

  it('debe mostrar el idioma por defecto si el idioma actual no está en la lista', () => {
    mockI18n.language = 'fr' // Idioma no soportado
    customRender(<LanguageSwitcher />)

    // Debe mostrar español por defecto
    expect(screen.getByText('🇲🇽')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
  })

  it('debe tener accesibilidad correcta', () => {
    customRender(<LanguageSwitcher />)

    const dropdown = screen.getByRole('combobox')
    expect(dropdown).toHaveAttribute('aria-label', 'Select language')
  })

  it('debe renderizar las opciones de idioma con banderas', () => {
    customRender(<LanguageSwitcher />)

    const dropdown = screen.getByRole('combobox')
    fireEvent.click(dropdown)

    // Verificar que las opciones tienen banderas y etiquetas
    expect(screen.getByText('🇲🇽')).toBeInTheDocument()
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('debe tener displayName correcto', () => {
    expect(LanguageSwitcher.displayName).toBe('LanguageSwitcher')
  })

  it('debe manejar cambios de idioma correctamente', () => {
    customRender(<LanguageSwitcher />)

    const dropdown = screen.getByRole('combobox')

    // Simular evento de cambio
    fireEvent.change(dropdown, { target: { value: 'en' } })

    expect(mockChangeLanguage).toHaveBeenCalledWith('en')
  })

  it('debe mantener la estructura de datos de idiomas correcta', () => {
    // Verificar que los idiomas están definidos correctamente
    const expectedLanguages = [
      { label: 'Español', value: 'es', flag: '🇲🇽' },
      { label: 'English', value: 'en', flag: '🇺🇸' },
    ]

    customRender(<LanguageSwitcher />)

    const dropdown = screen.getByRole('combobox')
    fireEvent.click(dropdown)

    expectedLanguages.forEach(lang => {
      expect(screen.getByText(lang.label)).toBeInTheDocument()
      expect(screen.getByText(lang.flag)).toBeInTheDocument()
    })
  })
})
