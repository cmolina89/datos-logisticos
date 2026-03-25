import { customRender } from '@/utils/testUtils'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import SidebarOption from './SidebarOption'

// Mock del router
jest.mock('@modern-js/runtime/router', () => ({
  Link: ({ children, to }: any) => children,
}))

const mockItem = {
  name: 'Test Item',
  icon: 'test-icon',
  url: '/test',
}

const mockItemWithChildren = {
  name: 'Parent Item',
  icon: 'parent-icon',
  url: '/parent',
  children: [
    {
      title: 'Child Group',
      menu: [{ name: 'Child Item', url: '/child' }],
    },
  ],
}

describe('SidebarOption', () => {
  it('debe renderizar null cuando no hay item', () => {
    const { container } = render(<SidebarOption />)
    expect(container.firstChild).toBeNull()
  })

  it('debe renderizar como enlace cuando no tiene children', () => {
    customRender(<SidebarOption item={mockItem} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveAttribute('cl-option', '')
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('debe renderizar como botón cuando tiene children', () => {
    const onSelected = jest.fn()
    customRender(<SidebarOption item={mockItemWithChildren} onSelected={onSelected} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('cl-option', '')
    expect(screen.getByText('Parent Item')).toBeInTheDocument()
  })

  it('debe mostrar icono cuando se proporciona', () => {
    customRender(<SidebarOption item={mockItem} />)

    const icon = document.querySelector('.clt-test-icon')
    expect(icon).toBeInTheDocument()
  })

  it('debe mostrar chevron cuando tiene children', () => {
    customRender(<SidebarOption item={mockItemWithChildren} />)

    const chevron = document.querySelector('.clt-chevron-right')
    expect(chevron).toBeInTheDocument()
  })

  it('debe llamar onSelected cuando se hace clic en botón', () => {
    const onSelected = jest.fn()
    customRender(<SidebarOption item={mockItemWithChildren} onSelected={onSelected} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(onSelected).toHaveBeenCalledWith(mockItemWithChildren)
  })

  it('debe aplicar aria-selected correctamente en enlaces', () => {
    customRender(<SidebarOption item={mockItem} selectedItem={mockItem} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-selected', 'true')
  })

  it('debe aplicar aria-pressed correctamente en botones', () => {
    customRender(<SidebarOption item={mockItemWithChildren} selectedItem={mockItemWithChildren} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('debe aplicar data-size cuando se proporciona', () => {
    customRender(<SidebarOption item={mockItem} size="large" />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('data-size', 'large')
  })

  it('debe formatear icono correctamente', () => {
    customRender(<SidebarOption item={mockItem} />)

    const icon = document.querySelector('.clt.icon.clt-test-icon')
    expect(icon).toBeInTheDocument()
  })

  it('debe manejar item sin icono', () => {
    const itemWithoutIcon = { ...mockItem, icon: undefined }
    customRender(<SidebarOption item={itemWithoutIcon} />)

    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(document.querySelector('.clt')).not.toBeInTheDocument()
  })

  it('debe manejar item sin nombre', () => {
    const itemWithoutName = { ...mockItem, name: undefined }
    customRender(<SidebarOption item={itemWithoutName} />)

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link.querySelector('.label')).not.toBeInTheDocument()
  })

  it('debe usar # como href por defecto cuando no hay url', () => {
    const itemWithoutUrl = { ...mockItem, url: undefined }
    customRender(<SidebarOption item={itemWithoutUrl} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#')
  })

  it('debe no llamar onSelected cuando no se proporciona', () => {
    customRender(<SidebarOption item={mockItemWithChildren} />)

    const button = screen.getByRole('button')
    expect(() => fireEvent.click(button)).not.toThrow()
  })
})
