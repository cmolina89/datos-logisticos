import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import LazyImage from './LazyImage'

// Mock del hook useLazyImage
const mockUseLazyImage = {
  src: 'placeholder-src',
  isLoading: true,
  isError: false,
  imageRef: { current: null },
}

jest.mock('@/hooks/useLazyImage', () => ({
  useLazyImage: jest.fn(() => mockUseLazyImage),
}))

describe('LazyImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLazyImage.src = 'placeholder-src'
    mockUseLazyImage.isLoading = true
    mockUseLazyImage.isError = false
  })

  it('debe renderizar correctamente con props básicas', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    expect(screen.getByAltText('Test image')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'placeholder-src')
  })

  it('debe mostrar placeholder mientras carga', () => {
    mockUseLazyImage.isLoading = true
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    expect(document.querySelector('.lazy-image-container.loading')).toBeInTheDocument()
    expect(document.querySelector('.lazy-image-placeholder')).toBeInTheDocument()
    expect(document.querySelector('.lazy-image-spinner')).toBeInTheDocument()
  })

  it('debe mostrar la imagen cuando termina de cargar', () => {
    mockUseLazyImage.src = 'test-image.jpg'
    mockUseLazyImage.isLoading = false
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    expect(screen.getByRole('img')).toHaveAttribute('src', 'test-image.jpg')
    expect(document.querySelector('.lazy-image-container')).not.toHaveClass('loading')
    expect(document.querySelector('.lazy-image-placeholder')).not.toBeInTheDocument()
  })

  it('debe mostrar mensaje de error cuando falla la carga', () => {
    mockUseLazyImage.isError = true
    mockUseLazyImage.isLoading = false
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    expect(document.querySelector('.lazy-image-container.error')).toBeInTheDocument()
    expect(screen.getByText('Error al cargar imagen')).toBeInTheDocument()
  })

  it('debe aplicar className personalizada', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" className="custom-class" />)

    expect(document.querySelector('.lazy-image-container.custom-class')).toBeInTheDocument()
  })

  it('debe aplicar dimensiones cuando se proporcionan', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" width={300} height={200} />)

    const container = document.querySelector('.lazy-image-container')
    expect(container).toHaveStyle({ width: '300px', height: '200px' })
  })

  it('debe aplicar dimensiones como string', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" width="100%" height="auto" />)

    const container = document.querySelector('.lazy-image-container')
    expect(container).toHaveStyle({ width: '100%', height: 'auto' })
  })

  it('debe llamar onLoad cuando la imagen se carga', () => {
    const onLoad = jest.fn()
    mockUseLazyImage.isLoading = false
    render(<LazyImage src="test-image.jpg" alt="Test image" onLoad={onLoad} />)

    const img = screen.getByRole('img')
    fireEvent.load(img)

    expect(onLoad).toHaveBeenCalled()
  })

  it('debe llamar onError cuando falla la carga', () => {
    const onError = jest.fn()
    render(<LazyImage src="test-image.jpg" alt="Test image" onError={onError} />)

    const img = screen.getByRole('img')
    fireEvent.error(img)

    expect(onError).toHaveBeenCalled()
  })

  it('debe usar placeholder personalizado', () => {
    const customPlaceholder = 'custom-placeholder.jpg'
    render(<LazyImage src="test-image.jpg" alt="Test image" placeholder={customPlaceholder} />)

    // Verificar que se pasa el placeholder al hook
    const { useLazyImage } = require('@/hooks/useLazyImage')
    expect(useLazyImage).toHaveBeenCalledWith(
      'test-image.jpg',
      customPlaceholder,
      expect.objectContaining({
        threshold: 0.1,
        rootMargin: '50px',
        triggerOnce: true,
      })
    )
  })

  it('debe configurar loading attribute correctamente', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" loading="eager" />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'eager')
  })

  it('debe usar loading lazy por defecto', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('debe pasar threshold y rootMargin al hook', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" threshold={0.5} rootMargin="100px" />)

    const { useLazyImage } = require('@/hooks/useLazyImage')
    expect(useLazyImage).toHaveBeenCalledWith(
      'test-image.jpg',
      expect.any(String),
      expect.objectContaining({
        threshold: 0.5,
        rootMargin: '100px',
        triggerOnce: true,
      })
    )
  })

  it('debe tener displayName correcto', () => {
    expect(LazyImage.displayName).toBe('LazyImage')
  })

  it('debe aplicar estilos correctos a la imagen', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    const img = screen.getByRole('img')
    expect(img).toHaveStyle({ width: '100%', height: '100%' })
  })

  it('debe mostrar clase loading en la imagen cuando está cargando', () => {
    mockUseLazyImage.isLoading = true
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    const img = screen.getByRole('img')
    expect(img).toHaveClass('lazy-image--loading')
  })

  it('debe no mostrar clase loading cuando no está cargando', () => {
    mockUseLazyImage.isLoading = false
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    const img = screen.getByRole('img')
    expect(img).not.toHaveClass('lazy-image--loading')
  })

  it('debe manejar estados combinados correctamente', () => {
    mockUseLazyImage.isLoading = false
    mockUseLazyImage.isError = true
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    const container = document.querySelector('.lazy-image-container')
    expect(container).toHaveClass('error')
    expect(container).not.toHaveClass('loading')
    expect(screen.getByText('Error al cargar imagen')).toBeInTheDocument()
    expect(document.querySelector('.lazy-image-placeholder')).not.toBeInTheDocument()
  })

  it('debe usar placeholder por defecto cuando no se proporciona', () => {
    render(<LazyImage src="test-image.jpg" alt="Test image" />)

    const { useLazyImage } = require('@/hooks/useLazyImage')
    expect(useLazyImage).toHaveBeenCalledWith(
      'test-image.jpg',
      expect.stringContaining('data:image/svg+xml'),
      expect.any(Object)
    )
  })
})
