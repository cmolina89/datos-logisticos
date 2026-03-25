import { customRender } from '@/utils/testUtils'
import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import Sidebar from './Sidebar'

// Mock de los atoms de Jotai
const mockMenuItems = [
  {
    name: 'Dashboard',
    icon: 'dashboard',
    url: '/dashboard',
    children: [
      {
        title: 'Analytics',
        menu: [
          { name: 'Reports', url: '/reports' },
          { name: 'Charts', url: '/charts' },
        ],
      },
    ],
  },
]

const mockSelectedOptions = { 1: null, 2: null }
const mockSidebarOpen = false
const mockCloseSidebar = jest.fn()
const mockCloseSubmenu = jest.fn()
const mockSelectOption = jest.fn()
const mockSetMenuItems = jest.fn()

jest.mock('jotai', () => ({
  useAtom: () => [mockMenuItems, mockSetMenuItems],
  useAtomValue: (atom: any) => {
    if (atom.toString().includes('selectedOptions')) return mockSelectedOptions
    if (atom.toString().includes('sidebarOpen')) return mockSidebarOpen
    return null
  },
  useSetAtom: () => jest.fn(),
}))

// Mock del hook useBreakpoint
jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({
    isMdDown: false,
  }),
}))

// Mock del menuService
jest.mock('@/services/menuService', () => ({
  menuService: {
    fetchSidebarMenu: jest.fn().mockResolvedValue(mockMenuItems),
  },
}))

// Mock del router
jest.mock('@modern-js/runtime/router', () => ({
  Link: ({ children }: any) => children,
}))

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('debe renderizar correctamente', async () => {
    customRender(<Sidebar />)

    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  it('debe cargar datos del menú al montar', async () => {
    const { menuService } = require('@/services/menuService')
    customRender(<Sidebar />)

    await waitFor(() => {
      expect(menuService.fetchSidebarMenu).toHaveBeenCalled()
    })
  })

  it('debe tener estructura HTML correcta', () => {
    customRender(<Sidebar />)

    expect(document.querySelector('#clt-sidebar')).toBeInTheDocument()
    expect(document.querySelector('#sidenav')).toBeInTheDocument()
  })

  it('debe aplicar clases CSS correctas', () => {
    customRender(<Sidebar />)

    const sidebar = screen.getByRole('navigation')
    expect(sidebar).toHaveClass('sidebar-base', 'sidebar-visible')
  })

  it('debe manejar error al cargar datos del menú', async () => {
    const { menuService } = require('@/services/menuService')
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    menuService.fetchSidebarMenu.mockRejectedValue(new Error('Network error'))

    customRender(<Sidebar />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading menu data:', expect.any(Error))
    })
  })
})
