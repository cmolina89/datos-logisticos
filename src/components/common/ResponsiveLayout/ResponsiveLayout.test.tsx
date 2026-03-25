import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ResponsiveLayout, {
  ResponsiveContent,
  ResponsiveGrid,
  ResponsiveVisibility,
} from './ResponsiveLayout'

// Mock del hook useBreakpoint
const mockBreakpoint = {
  current: 'md' as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl',
  isMdUp: true,
  isLgUp: false,
  isMdDown: false,
}

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => mockBreakpoint,
}))

describe('ResponsiveLayout', () => {
  beforeEach(() => {
    mockBreakpoint.current = 'md'
    mockBreakpoint.isMdUp = true
    mockBreakpoint.isLgUp = false
    mockBreakpoint.isMdDown = false
  })

  it('debe renderizar children correctamente', () => {
    render(
      <ResponsiveLayout>
        <div>Test content</div>
      </ResponsiveLayout>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('debe aplicar clases por defecto', () => {
    render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('responsive-layout')
    expect(container).toHaveClass('responsive-layout--container')
    expect(container).toHaveClass('responsive-layout--max-xl')
    expect(container).toHaveClass('responsive-layout--padded')
    expect(container).toHaveClass('responsive-layout--md')
  })

  it('debe aplicar className personalizada', () => {
    render(
      <ResponsiveLayout className="custom-class">
        <div>Content</div>
      </ResponsiveLayout>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('debe aplicar clase fluid cuando fluid=true', () => {
    render(
      <ResponsiveLayout fluid={true}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('responsive-layout--fluid')
    expect(container).not.toHaveClass('responsive-layout--container')
  })

  it('debe aplicar clase centered cuando centerContent=true', () => {
    render(
      <ResponsiveLayout centerContent={true}>
        <div>Content</div>
      </ResponsiveLayout>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('responsive-layout--centered')
  })
})

describe('ResponsiveGrid', () => {
  it('debe renderizar children correctamente', () => {
    render(
      <ResponsiveGrid>
        <div>Grid item</div>
      </ResponsiveGrid>
    )

    expect(screen.getByText('Grid item')).toBeInTheDocument()
  })

  it('debe aplicar estilos de grid por defecto', () => {
    render(
      <ResponsiveGrid>
        <div>Grid item</div>
      </ResponsiveGrid>
    )

    const container = screen.getByText('Grid item').parentElement
    expect(container).toHaveClass('responsive-grid')
    expect(container).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
      alignItems: 'stretch',
      justifyContent: 'start',
    })
  })
})

describe('ResponsiveVisibility', () => {
  it('debe mostrar children por defecto', () => {
    render(
      <ResponsiveVisibility>
        <div>Visible content</div>
      </ResponsiveVisibility>
    )

    expect(screen.getByText('Visible content')).toBeInTheDocument()
  })

  it('debe mostrar solo en breakpoints especificados con showOn', () => {
    mockBreakpoint.current = 'md'
    render(
      <ResponsiveVisibility showOn={['md', 'lg']}>
        <div>Visible on md/lg</div>
      </ResponsiveVisibility>
    )

    expect(screen.getByText('Visible on md/lg')).toBeInTheDocument()
  })

  it('debe ocultar en breakpoints no especificados con showOn', () => {
    mockBreakpoint.current = 'xs'
    render(
      <ResponsiveVisibility showOn={['md', 'lg']}>
        <div>Hidden on xs</div>
      </ResponsiveVisibility>
    )

    expect(screen.queryByText('Hidden on xs')).not.toBeInTheDocument()
  })
})

describe('ResponsiveContent', () => {
  it('debe mostrar contenido desktop en breakpoints grandes', () => {
    mockBreakpoint.isLgUp = true
    mockBreakpoint.isMdUp = true
    render(
      <ResponsiveContent
        mobile={<div>Mobile content</div>}
        tablet={<div>Tablet content</div>}
        desktop={<div>Desktop content</div>}
      />
    )

    expect(screen.getByText('Desktop content')).toBeInTheDocument()
    expect(screen.queryByText('Mobile content')).not.toBeInTheDocument()
    expect(screen.queryByText('Tablet content')).not.toBeInTheDocument()
  })

  it('debe mostrar contenido mobile en breakpoints pequeños', () => {
    mockBreakpoint.isLgUp = false
    mockBreakpoint.isMdUp = false
    render(
      <ResponsiveContent
        mobile={<div>Mobile content</div>}
        tablet={<div>Tablet content</div>}
        desktop={<div>Desktop content</div>}
      />
    )

    expect(screen.getByText('Mobile content')).toBeInTheDocument()
    expect(screen.queryByText('Tablet content')).not.toBeInTheDocument()
    expect(screen.queryByText('Desktop content')).not.toBeInTheDocument()
  })
})
