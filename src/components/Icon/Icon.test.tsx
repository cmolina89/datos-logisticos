// src/components/Icon/Icon.test.tsx
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import Icon from './index'

describe('Icon component', () => {
  it('debe renderizar con la clase de icono proporcionada', () => {
    render(<Icon icon="test-icon" />)
    const iconElement = screen.getByTestId('icon-element')
    expect(iconElement).toHaveClass('clt-test-icon') // CORREGIDO
  })

  it('debe renderizar con clases adicionales si se proporcionan', () => {
    render(<Icon icon="test-icon" className="extra-class" />)
    const iconElement = screen.getByTestId('icon-element')
    expect(iconElement).toHaveClass('clt-test-icon') // CORREGIDO
    expect(iconElement).toHaveClass('extra-class')
  })

  it('debe llamar a la función onClick cuando se hace clic', () => {
    const handleClick = jest.fn()
    render(<Icon icon="test-icon" onClick={handleClick} />)
    const iconElement = screen.getByTestId('icon-element')
    fireEvent.click(iconElement)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('debe no fallar si no se proporciona onClick y se hace clic', () => {
    render(<Icon icon="test-icon" />)
    const iconElement = screen.getByTestId('icon-element')
    // Se espera que el clic no cause un error
    expect(() => fireEvent.click(iconElement)).not.toThrow()
  })

  it('debe renderizar los hijos correctamente', () => {
    render(
      <Icon icon="test-icon">
        <span>Child Element</span>
      </Icon>
    )
    expect(screen.getByText('Child Element')).toBeInTheDocument()
  })

  // Pruebas de accesibilidad (basadas en la lógica del componente)
  it('debe renderizar como button si onClick está presente', () => {
    const handleClick = jest.fn()
    render(<Icon icon="test-icon" onClick={handleClick} />)
    const iconElement = screen.getByTestId('icon-element')
    expect(iconElement.tagName).toBe('BUTTON')
    expect(iconElement).toHaveAttribute('type', 'button')
  })

  it('debe renderizar como span si onClick no está presente', () => {
    render(<Icon icon="test-icon" />)
    const iconElement = screen.getByTestId('icon-element')
    expect(iconElement.tagName).toBe('SPAN')
    expect(iconElement).not.toHaveAttribute('type')
  })

  it('debe llamar a onClick con la tecla Enter si es clickeable', () => {
    const handleClick = jest.fn()
    render(<Icon icon="test-icon" onClick={handleClick} ariaLabel="Test Action" />)
    const iconElement = screen.getByLabelText('Test Action') // Usar aria-label para encontrarlo si es un "botón"
    fireEvent.keyDown(iconElement, { key: 'Enter', code: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('debe llamar a onClick con la tecla Espacio si es clickeable', () => {
    const handleClick = jest.fn()
    render(<Icon icon="test-icon" onClick={handleClick} ariaLabel="Test Action" />)
    const iconElement = screen.getByLabelText('Test Action')
    fireEvent.keyDown(iconElement, { key: ' ', code: 'Space' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('debe usar el nombre del icono como aria-label por defecto si no hay hijos textuales ni ariaLabel prop', () => {
    render(<Icon icon="my-special-icon" onClick={jest.fn()} />)
    // Usamos getByRole porque ahora tiene role="button"
    const iconElement = screen.getByRole('button', { name: 'my-special-icon' })
    expect(iconElement).toBeInTheDocument()
  })

  it('debe usar el ariaLabel proporcionado', () => {
    render(<Icon icon="test-icon" onClick={jest.fn()} ariaLabel="Custom Label" />)
    const iconElement = screen.getByRole('button', { name: 'Custom Label' })
    expect(iconElement).toBeInTheDocument()
  })

  it('debe usar aria-label cuando se proporciona, incluso con children texto', () => {
    render(
      <Icon icon="test" onClick={jest.fn()} ariaLabel="Custom Label">
        Texto Visible
      </Icon>
    )
    // Debería usar el aria-label proporcionado
    const iconElement = screen.getByRole('button', { name: 'Custom Label' })
    expect(iconElement).toBeInTheDocument()
    expect(iconElement).toHaveAttribute('aria-label', 'Custom Label')
  })
})
