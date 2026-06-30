// src/services/menuService.ts
import { getApplicationConfigValue } from '@/services/applicationConfigService'
import type { MenuOptionModel } from '@/types/menu'

const DEFAULT_MENU_CONFIG_CODE = 'SIDEBAR_MENU'

const SIDEBAR_MENU_CONFIG_CODE =
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.MODERN_APP_SIDEBAR_MENU_CONFIG_CODE) ||
  DEFAULT_MENU_CONFIG_CODE

function isMenuOption(value: unknown): value is MenuOptionModel {
  return Boolean(value) && typeof value === 'object'
}

function parseMenuConfigValue(rawConfig: unknown): MenuOptionModel[] {
  if (Array.isArray(rawConfig)) {
    return rawConfig.filter(isMenuOption)
  }

  if (rawConfig && typeof rawConfig === 'object') {
    const candidate = rawConfig as { menu?: unknown; options?: unknown; result?: unknown }
    if (Array.isArray(candidate.menu)) return candidate.menu.filter(isMenuOption)
    if (Array.isArray(candidate.options)) return candidate.options.filter(isMenuOption)
    if (Array.isArray(candidate.result)) return candidate.result.filter(isMenuOption)
  }

  return []
}

export class MenuService {
  private currentMenuData: MenuOptionModel[] = []

  /**
   * Obtiene los elementos del menú del sidebar
   */
  async fetchSidebarMenu(): Promise<MenuOptionModel[]> {
    const rawConfig = await getApplicationConfigValue(SIDEBAR_MENU_CONFIG_CODE)
    const menu = parseMenuConfigValue(rawConfig)
    this.currentMenuData = menu
    return menu
  }

  /**
   * Busca un elemento del menú por URL
   */
  findMenuItemByUrl(
    url: string,
    menuItems: MenuOptionModel[] = this.currentMenuData
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

    findPath(this.currentMenuData, url, [])
    return path
  }
}

// Instancia singleton del servicio
export const menuService = new MenuService()

// Hook personalizado para usar el servicio de menú
export const useMenuService = () => {
  return menuService
}
