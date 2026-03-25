import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import LazyLoader from './LazyLoader'

// Componente que simula carga asíncrona
const AsyncComponent = () => {
  return <div>Async content loaded</div>
}

// Componente que lanza una promesa para simular carga
const LazyComponent = () => {
  throw new Promise(resolve => {
    setTimeout(() => resolve(<AsyncComponent />), 100)
  })
}

describe('LazyLoader', () => {
  it('debe renderizar children cuando están cargados', () => {
    render(
      <LazyLoader>
        <div>Test content</div>
      </LazyLoader>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('debe mostrar fallback por defecto mientras carga', () => {
    render(
      <LazyLoader>
        <LazyComponent />
      </LazyLoader>
    )

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    expect(document.querySelector('.lazy-loader-fallback')).toBeInTheDocument()
  })

  it('debe mostrar ProgressSpinner en fallback por defecto', () => {
    render(
      <LazyLoader>
        <LazyComponent />
      </LazyLoader>
    )

    // Verificar que el ProgressSpinner está presente
    const spinner = document.querySelector('.p-progress-spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('debe usar fallback personalizado cuando se proporciona', () => {
    const customFallback = <div>Custom loading message</div>

    render(
      <LazyLoader fallback={customFallback}>
        <LazyComponent />
      </LazyLoader>
    )

    expect(screen.getByText('Custom loading message')).toBeInTheDocument()
    expect(screen.queryByText('Cargando...')).not.toBeInTheDocument()
  })

  it('debe renderizar DefaultFallback correctamente', () => {
    render(
      <LazyLoader>
        <LazyComponent />
      </LazyLoader>
    )

    const fallbackContainer = document.querySelector('.lazy-loader-fallback')
    expect(fallbackContainer).toBeInTheDocument()

    // Verificar estructura del fallback por defecto
    expect(screen.getByText('Cargando...')).toBeInTheDocument()

    // Verificar que el spinner tiene los estilos correctos
    const spinner = document.querySelector('.p-progress-spinner')
    expect(spinner).toHaveStyle({
      width: '50px',
      height: '50px',
    })
  })

  it('debe funcionar como wrapper de Suspense', () => {
    // Verificar que LazyLoader es esencialmente un wrapper de Suspense
    render(
      <LazyLoader>
        <div>Content</div>
      </LazyLoader>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('debe manejar múltiples children', () => {
    render(
      <LazyLoader>
        <div>First child</div>
        <div>Second child</div>
      </LazyLoader>
    )

    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
  })

  it('debe exportar LazyLoader como named export', () => {
    const { LazyLoader: NamedLazyLoader } = require('./LazyLoader')
    expect(NamedLazyLoader).toBeDefined()
    expect(typeof NamedLazyLoader).toBe('function')
  })

  it('debe exportar LazyLoader como default export', () => {
    expect(LazyLoader).toBeDefined()
    expect(typeof LazyLoader).toBe('function')
  })

  it('debe tener la estructura correcta del DefaultFallback', () => {
    render(
      <LazyLoader>
        <LazyComponent />
      </LazyLoader>
    )

    const fallback = document.querySelector('.lazy-loader-fallback')
    expect(fallback).toBeInTheDocument()

    // Verificar que contiene tanto el spinner como el texto
    expect(fallback?.querySelector('.p-progress-spinner')).toBeInTheDocument()
    expect(fallback?.querySelector('p')).toBeInTheDocument()
  })

  it('debe pasar props correctas al ProgressSpinner', () => {
    render(
      <LazyLoader>
        <LazyComponent />
      </LazyLoader>
    )

    const spinner = document.querySelector('.p-progress-spinner')
    expect(spinner).toHaveAttribute('stroke-width', '4')
    expect(spinner).toHaveAttribute('data-pc-name', 'progressspinner')
  })

  it('debe manejar fallback null', () => {
    render(
      <LazyLoader fallback={null}>
        <div>Content</div>
      </LazyLoader>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('debe manejar fallback con componente React', () => {
    const CustomFallback = () => <div>Custom React Component Fallback</div>

    render(
      <LazyLoader fallback={<CustomFallback />}>
        <LazyComponent />
      </LazyLoader>
    )

    expect(screen.getByText('Custom React Component Fallback')).toBeInTheDocument()
  })

  it('debe mantener la funcionalidad de Suspense', () => {
    // Verificar que LazyLoader mantiene la funcionalidad básica de Suspense
    render(
      <LazyLoader>
        <div>Immediate content</div>
      </LazyLoader>
    )

    expect(screen.getByText('Immediate content')).toBeInTheDocument()
  })
})
