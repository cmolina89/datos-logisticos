import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import React from 'react'
import SEOHead from './SEOHead'

// Mock de react-helmet
jest.mock('react-helmet', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => children,
}))

describe('SEOHead', () => {
  beforeEach(() => {
    // Limpiar el head antes de cada test
    document.head.innerHTML = ''
  })

  it('debe renderizar con props por defecto', () => {
    const { container } = render(<SEOHead />)

    // Verificar que el componente se renderiza sin errores
    expect(container).toBeInTheDocument()
  })

  it('debe usar título por defecto', () => {
    render(<SEOHead />)

    const titleElement = document.querySelector('title')
    expect(titleElement?.textContent).toBe('CoppelFramework - WebClient React')
  })

  it('debe agregar sufijo al título personalizado', () => {
    render(<SEOHead title="Custom Page" />)

    const titleElement = document.querySelector('title')
    expect(titleElement?.textContent).toBe('Custom Page | CoppelFramework')
  })

  it('debe no agregar sufijo si el título ya incluye CoppelFramework', () => {
    render(<SEOHead title="CoppelFramework - Custom Page" />)

    const titleElement = document.querySelector('title')
    expect(titleElement?.textContent).toBe('CoppelFramework - Custom Page')
  })

  it('debe configurar meta tags básicos', () => {
    render(
      <SEOHead description="Test description" keywords="test, keywords" author="Test Author" />
    )

    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Test description'
    )
    expect(document.querySelector('meta[name="keywords"]')).toHaveAttribute(
      'content',
      'test, keywords'
    )
    expect(document.querySelector('meta[name="author"]')).toHaveAttribute('content', 'Test Author')
  })

  it('debe configurar Open Graph tags', () => {
    render(
      <SEOHead
        title="OG Test"
        description="OG Description"
        image="/test-image.jpg"
        url="https://test.com"
        type="article"
      />
    )

    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'article')
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'OG Test | CoppelFramework'
    )
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute(
      'content',
      'OG Description'
    )
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      '/test-image.jpg'
    )
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://test.com'
    )
  })

  it('debe configurar Twitter tags', () => {
    render(
      <SEOHead
        title="Twitter Test"
        description="Twitter Description"
        image="/twitter-image.jpg"
        twitterCard="summary_large_image"
      />
    )

    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image'
    )
    expect(document.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      'Twitter Test | CoppelFramework'
    )
    expect(document.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
      'content',
      'Twitter Description'
    )
    expect(document.querySelector('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      '/twitter-image.jpg'
    )
  })

  it('debe configurar canonical URL cuando se proporciona', () => {
    render(<SEOHead canonical="https://canonical.com/page" />)

    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://canonical.com/page'
    )
  })

  it('debe configurar robots meta cuando noIndex es true', () => {
    render(<SEOHead noIndex={true} />)

    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    )
  })

  it('debe usar valores por defecto cuando no se proporcionan props', () => {
    render(<SEOHead />)

    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Framework moderno para desarrollo de aplicaciones web con React, TypeScript y Modern.js. Optimizado para SEO y accesibilidad.'
    )
    expect(document.querySelector('meta[name="keywords"]')).toHaveAttribute(
      'content',
      'React, TypeScript, Modern.js, Framework, SEO, Accesibilidad, Coppel'
    )
  })
})
