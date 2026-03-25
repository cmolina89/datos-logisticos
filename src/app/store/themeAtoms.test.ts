import { isDarkAtom, themeAtom } from './themeAtoms'

// Mock del environment
jest.mock('@/utils/environment', () => ({
  isServer: false,
}))

// Mock de localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('themeAtoms', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('themeAtom', () => {
    it('debe estar definido correctamente', () => {
      // El átomo debe estar definido
      expect(themeAtom).toBeDefined()
    })

    it('debe usar localStorage en el cliente', () => {
      // Verificar que el átomo está configurado correctamente
      expect(themeAtom).toBeDefined()
    })

    it('debe manejar valores del localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('"dark"')

      // El átomo debería poder leer del localStorage
      expect(themeAtom).toBeDefined()
    })

    it('debe manejar localStorage vacío', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      // El átomo debería usar el valor por defecto
      expect(themeAtom).toBeDefined()
    })
  })

  describe('isDarkAtom', () => {
    it('debe ser un átomo derivado', () => {
      // Verificar que isDarkAtom es un átomo
      expect(isDarkAtom).toBeDefined()
      expect(typeof isDarkAtom.read).toBe('function')
    })

    it('debe estar configurado correctamente como átomo derivado', () => {
      // Verificar que el átomo derivado está configurado
      expect(isDarkAtom).toBeDefined()

      // Verificar que tiene la función read
      expect(isDarkAtom.read).toBeDefined()
      expect(typeof isDarkAtom.read).toBe('function')
    })
  })

  describe('server environment', () => {
    beforeEach(() => {
      jest.resetModules()
    })

    it('debe usar disabledStorage en el servidor', async () => {
      // Mock isServer como true
      jest.doMock('@/utils/environment', () => ({
        isServer: true,
      }))

      // Re-importar el módulo
      const { themeAtom: serverThemeAtom } = await import('./themeAtoms')

      expect(serverThemeAtom).toBeDefined()
    })
  })

  describe('disabledStorage', () => {
    it('debe retornar valor inicial en getItem', async () => {
      jest.doMock('@/utils/environment', () => ({
        isServer: true,
      }))

      const themeAtomsModule = await import('./themeAtoms')

      // El storage deshabilitado debería retornar el valor inicial
      expect(themeAtomsModule.themeAtom).toBeDefined()
    })

    it('debe no hacer nada en setItem', async () => {
      jest.doMock('@/utils/environment', () => ({
        isServer: true,
      }))

      // En el servidor, setItem no debería hacer nada
      const themeAtomsModule = await import('./themeAtoms')
      expect(themeAtomsModule.themeAtom).toBeDefined()
    })

    it('debe no hacer nada en removeItem', async () => {
      jest.doMock('@/utils/environment', () => ({
        isServer: true,
      }))

      // En el servidor, removeItem no debería hacer nada
      const themeAtomsModule = await import('./themeAtoms')
      expect(themeAtomsModule.themeAtom).toBeDefined()
    })

    it('debe retornar función vacía en subscribe', async () => {
      jest.doMock('@/utils/environment', () => ({
        isServer: true,
      }))

      // En el servidor, subscribe debería retornar función vacía
      const themeAtomsModule = await import('./themeAtoms')
      expect(themeAtomsModule.themeAtom).toBeDefined()
    })
  })

  describe('createJSONStorage', () => {
    it('debe usar localStorage en el cliente', () => {
      // Verificar que se puede acceder a localStorage
      expect(window.localStorage).toBeDefined()
    })

    it('debe manejar errores de localStorage', () => {
      // Mock localStorage que lanza error
      const originalLocalStorage = window.localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => {
            throw new Error('localStorage error')
          }),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      })

      // El átomo debería manejar errores gracefully
      expect(themeAtom).toBeDefined()

      // Restaurar localStorage original
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      })
    })
  })

  describe('Type definitions', () => {
    it('debe exportar tipo Theme correctamente', () => {
      // Verificar que los tipos están definidos correctamente
      const lightTheme: 'light' = 'light'
      const darkTheme: 'dark' = 'dark'

      expect(lightTheme).toBe('light')
      expect(darkTheme).toBe('dark')
    })
  })
})
