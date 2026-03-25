// src/services/menuService.ts
import type { MenuOptionModel } from '@/types/menu'

// Simulación de datos del menú - en producción esto vendría de una API
const mockMenuData: MenuOptionModel[] = [
  {
    url: '/dashboard',
    name: 'Dashboard',
    icon: 'dashboard',
  },
  {
    url: '/users',
    name: 'Usuarios',
    icon: 'users',
    children: [
      {
        title: 'Gestión de Usuarios',
        menu: [
          {
            url: '/users/list',
            name: 'Lista de usuarios',
            icon: 'list',
          },
          {
            url: '/users/create',
            name: 'Crear usuario',
            icon: 'plus',
          },
          {
            url: '/users/roles',
            name: 'Roles y Permisos',
            icon: 'shield',
            children: [
              {
                title: 'Administración',
                menu: [
                  { url: '/users/roles/admin', name: 'Administradores' },
                  { url: '/users/roles/editor', name: 'Editores' },
                  { url: '/users/roles/viewer', name: 'Visualizadores' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    url: '/products',
    name: 'Productos',
    icon: 'package',
    children: [
      {
        title: 'Catálogo',
        menu: [
          { url: '/products/list', name: 'Lista de productos' },
          { url: '/products/categories', name: 'Categorías' },
        ],
      },
      {
        title: 'Inventario',
        menu: [
          { url: '/products/stock', name: 'Control de stock' },
          { url: '/products/movements', name: 'Movimientos' },
        ],
      },
    ],
  },
  {
    url: '/reports',
    name: 'Reportes',
    icon: 'chart-bar',
  },
  {
    url: '/settings',
    name: 'Configuración',
    icon: 'settings',
    children: [
      {
        title: 'Sistema',
        menu: [
          { url: '/settings/general', name: 'General' },
          { url: '/settings/security', name: 'Seguridad' },
        ],
      },
    ],
  },
]

export class MenuService {
  /**
   * Obtiene los elementos del menú del sidebar
   * En producción, esto haría una llamada HTTP a la API
   */
  async fetchSidebarMenu(): Promise<MenuOptionModel[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100))

    return mockMenuData
  }

  /**
   * Busca un elemento del menú por URL
   */
  findMenuItemByUrl(
    url: string,
    menuItems: MenuOptionModel[] = mockMenuData
  ): MenuOptionModel | null {
    for (const item of menuItems) {
      if (item.url === url) {
        return item
      }

      if (item.children) {
        for (const group of item.children) {
          const found = this.findMenuItemByUrl(url, group.menu)
          if (found) return found
        }
      }
    }

    return null
  }

  /**
   * Obtiene la ruta de navegación (breadcrumb) para una URL específica
   */
  getBreadcrumbPath(url: string): MenuOptionModel[] {
    const path: MenuOptionModel[] = []

    const findPath = (
      items: MenuOptionModel[],
      targetUrl: string,
      currentPath: MenuOptionModel[]
    ): boolean => {
      for (const item of items) {
        const newPath = [...currentPath, item]

        if (item.url === targetUrl) {
          path.push(...newPath)
          return true
        }

        if (item.children) {
          for (const group of item.children) {
            if (findPath(group.menu, targetUrl, newPath)) {
              return true
            }
          }
        }
      }

      return false
    }

    findPath(mockMenuData, url, [])
    return path
  }
}

// Instancia singleton del servicio
export const menuService = new MenuService()

// Hook personalizado para usar el servicio de menú
export const useMenuService = () => {
  return menuService
}
