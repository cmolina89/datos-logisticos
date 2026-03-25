import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import React from 'react'
import { ThemeProvider } from './ThemeProvider'

// Mock de jotai
const mockTheme = 'light'
jest.mock('jotai', () => ({
  useAtomValue: jest.fn(() => mockTheme),
}))

// Mock de PrimeReact
const mockChangeTheme = jest.fn()

jest.mock('primereact/api', () => ({
  PrimeReactContext: {
    Consumer: ({ children }: any) => children({ changeTheme: mockChangeTheme }),
  },
}))

// Mock de useContext
jest.spyOn(React, 'useContext').mockImplementation(() => ({
  changeTheme: mockChangeTheme,
}))

describe('ThemeProvider', () => {
  let mockLinkElement: HTMLLinkElement

  beforeEach(() => {
    // Limpiar el DOM
    document.head.innerHTML = ''
    document.body.className = ''

    // Crear mock del elemento link
    mockLinkElement = document.createElement('link')
    mockLinkElement.id = 'primereact-theme-link'
    mockLinkElement.rel = 'stylesheet'

    jest.clearAllMocks()
  })

  afterEach(() => {
    // Limpiar el DOM después de cada test
    document.head.innerHTML = ''
    document.body.className = ''
  })

  it('debe renderizar children correctamente', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Child</div>
      </ThemeProvider>
    )

    expect(document.querySelector('[data-testid="child"]')).toBeInTheDocument()
  })

  it('debe crear elemento link para tema si no existe', () => {
    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    // Verificar que se creó el elemento link
    const linkElement = document.getElementById('primereact-theme-link')
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('rel', 'stylesheet')
  })

  it('debe usar elemento link existente si ya existe', () => {
    // Agregar elemento link existente
    document.head.appendChild(mockLinkElement)

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    // Verificar que usa el elemento existente
    const linkElements = document.querySelectorAll('#primereact-theme-link')
    expect(linkElements).toHaveLength(1)
    expect(linkElements[0]).toBe(mockLinkElement)
  })

  it('debe aplicar tema claro por defecto', () => {
    const { useAtomValue } = require('jotai')
    useAtomValue.mockReturnValue('light')

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    // Verificar que se aplicó la clase light-theme al body
    expect(document.body).toHaveClass('light-theme')
    expect(document.body).not.toHaveClass('dark-theme')
  })

  it('debe aplicar tema oscuro cuando se selecciona', () => {
    const { useAtomValue } = require('jotai')
    useAtomValue.mockReturnValue('dark')

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    // Verificar que se aplicó la clase dark-theme al body
    expect(document.body).toHaveClass('dark-theme')
    expect(document.body).not.toHaveClass('light-theme')
  })

  it('debe cambiar href del link element para tema claro', () => {
    const { useAtomValue } = require('jotai')
    useAtomValue.mockReturnValue('light')

    document.head.appendChild(mockLinkElement)

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    // Verificar que se estableció el href correcto
    expect(mockLinkElement.href).toContain('/themes/lara-light-indigo/theme.css')
  })

  it('debe cambiar href del link element para tema oscuro', () => {
    const { useAtomValue } = require('jotai')
    useAtomValue.mockReturnValue('dark')

    document.head.appendChild(mockLinkElement)

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    // Verificar que se estableció el href correcto
    expect(mockLinkElement.href).toContain('/themes/lara-dark-indigo/theme.css')
  })

  it('debe llamar changeTheme de PrimeReact cuando cambia el tema', () => {
    const { useAtomValue } = require('jotai')
    useAtomValue.mockReturnValue('dark')

    document.head.appendChild(mockLinkElement)

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    // Verificar que se llamó changeTheme
    expect(mockChangeTheme).toHaveBeenCalledWith(
      'lara-light-indigo',
      'lara-dark-indigo',
      'primereact-theme-link',
      expect.any(Function)
    )
  })

  it('debe remover clases de tema anteriores antes de aplicar nuevas', () => {
    const { useAtomValue } = require('jotai')
    useAtomValue.mockReturnValue('light')

    // Agregar clases existentes
    document.body.classList.add('dark-theme', 'some-other-class')

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    )

    // Verificar que se removieron las clases de tema pero no otras clases
    expect(document.body).not.toHaveClass('dark-theme')
    expect(document.body).toHaveClass('light-theme')
    expect(document.body).toHaveClass('some-other-class')
  })

  it('debe manejar cuando no hay PrimeReactContext.changeTheme', () => {
    const { useAtomValue } = require('jotai')
    useAtomValue.mockReturnValue('light')

    // Mock context sin changeTheme
    React.useContext = jest.fn().mockReturnValue({})

    document.head.appendChild(mockLinkElement)

    expect(() => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )
    }).not.toThrow()

    // Verificar que aún se aplicó el href
    expect(mockLinkElement.href).toContain('/themes/lara-light-indigo/theme.css')
  })

  it('debe manejar cuando no hay themeLinkElement', () => {
    const { useAtomValue } = require('jotai')
    useAtomValue.mockReturnValue('light')

    // Mock context sin changeTheme
    React.useContext = jest.fn().mockReturnValue({ changeTheme: null })

    expect(() => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )
    }).not.toThrow()
  })
})
