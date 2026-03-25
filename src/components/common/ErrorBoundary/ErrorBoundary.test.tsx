import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

// Componente que lanza error para testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock console.error para evitar logs en tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debe renderizar children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('debe mostrar UI de error por defecto cuando hay un error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument()
    expect(
      screen.getByText('Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /recargar página/i })).toBeInTheDocument()
  })

  it('debe mostrar fallback personalizado cuando se proporciona', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('¡Oops! Algo salió mal')).not.toBeInTheDocument()
  })

  it('debe llamar onError callback cuando ocurre un error', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('debe resetear el error cuando se hace clic en Reintentar', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('debe recargar la página cuando se hace clic en Recargar Página', () => {
    // Mock window.location.reload
    const mockReload = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByRole('button', { name: /recargar página/i }))

    expect(mockReload).toHaveBeenCalled()
  })

  it('debe resetear cuando resetKeys cambian', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={['key1']}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument()

    rerender(
      <ErrorBoundary resetKeys={['key2']}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('debe resetear cuando resetOnPropsChange es true y children cambian', () => {
    const { rerender } = render(
      <ErrorBoundary resetOnPropsChange={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument()

    rerender(
      <ErrorBoundary resetOnPropsChange={true}>
        <div>New content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('New content')).toBeInTheDocument()
  })

  it('debe mostrar detalles del error en desarrollo', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('no debe mostrar detalles del error en producción', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('debe tener las clases CSS correctas', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('¡Oops! Algo salió mal').closest('.error-boundary')).toBeInTheDocument()
    expect(screen.getByText('¡Oops! Algo salió mal').closest('.error-card')).toBeInTheDocument()
  })

  it('debe tener iconos y elementos de UI correctos', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(document.querySelector('.pi-exclamation-triangle')).toBeInTheDocument()
    expect(document.querySelector('.pi-refresh')).toBeInTheDocument()
    expect(document.querySelector('.pi-replay')).toBeInTheDocument()
  })
})
