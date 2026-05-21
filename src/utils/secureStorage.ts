// Interfaz para el almacenamiento seguro
interface SecureStorageOptions {
  encrypt?: boolean
  maxAge?: number // en segundos
}

// Función simple de encriptación usando XOR
const simpleEncrypt = (text: string, key: string): string => {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    result += String.fromCharCode(charCode)
  }
  return btoa(result)
}

// Función simple de desencriptación
const simpleDecrypt = (encryptedText: string, key: string): string => {
  try {
    const decoded = atob(encryptedText)
    let result = ''
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      result += String.fromCharCode(charCode)
    }
    return result
  } catch {
    return ''
  }
}

// Clase para manejo seguro de almacenamiento
export class SecureStorage {
  private static instance: SecureStorage
  private memoryStorage: Map<string, string> = new Map()
  private readonly encryptionKey = 'coppel_secure_key_v1'

  // Método público para obtener la clave de encriptación (solo para uso interno)
  getEncryptionKey(): string {
    return this.encryptionKey
  }

  // Método público para almacenar en memoria interna (para casos especiales de seguridad)
  setMemoryItem(key: string, value: string): void {
    this.memoryStorage.set(key, value)
  }

  // Método público para obtener de memoria interna (para casos especiales de seguridad)
  getMemoryItem(key: string): string | undefined {
    return this.memoryStorage.get(key)
  }

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage()
    }
    return SecureStorage.instance
  }

  // Establecer un valor de forma segura
  setItem(key: string, value: string, options: SecureStorageOptions = {}): boolean {
    try {
      const { encrypt = true, maxAge = 3600 } = options

      let finalValue = value
      if (encrypt) {
        finalValue = simpleEncrypt(value, this.encryptionKey)
      }

      // SECURITY FIX: Almacenar TODOS los datos solo en memoria interna
      // Nunca usar sessionStorage o localStorage para datos sensibles
      this.memoryStorage.set(key, finalValue)

      // Establecer tiempo de expiración si se especifica
      if (maxAge > 0) {
        const expiryTime = Date.now() + maxAge * 1000
        // Validar que expiryTime sea un número válido
        const validatedExpiryTime =
          typeof expiryTime === 'number' && !isNaN(expiryTime)
            ? expiryTime
            : Date.now() + 3600 * 1000 // 1 hora por defecto

        // SECURITY FIX: Solo almacenar datos de expiración en memoria interna
        // para evitar almacenar datos sensibles en web storage
        this.memoryStorage.set(`${key}_expiry_time`, String(validatedExpiryTime))

        // SECURITY FIX: No usar sessionStorage para ningún dato relacionado con tokens
        // Los datos de expiración también van solo en memoria interna
      }

      return true
    } catch (error) {
      console.error('Error setting secure item:', error)
      return false
    }
  }

  // Obtener un valor de forma segura
  getItem(key: string, options: { encrypted?: boolean } = {}): string | null {
    try {
      const { encrypted = true } = options
      let value: string | null = null

      // Verificar expiración primero
      if (this.isExpired(key)) {
        this.removeItem(key)
        return null
      }

      // SECURITY FIX: Leer TODOS los datos solo desde memoria interna.
      value = this.memoryStorage.get(key) || null

      if (!value) return null

      // Desencriptar si es necesario
      if (encrypted) {
        const decrypted = simpleDecrypt(value, this.encryptionKey)
        return decrypted || null
      }

      return value
    } catch (error) {
      console.error('Error getting secure item:', error)
      return null
    }
  }

  // Remover un valor
  removeItem(key: string): boolean {
    try {
      // SECURITY FIX: No usar sessionStorage para ningún dato relacionado con tokens
      // Todos los datos están en memoria interna solamente

      // Remover de memoria (incluir campos de expiración)
      this.memoryStorage.delete(key)
      this.memoryStorage.delete(`${key}_expiry_time`)

      // Para tokens sensibles, también limpiar tiempos de expiración específicos
      if (key === 'auth_token') {
        this.memoryStorage.delete('auth_token_expiry_time')
      }
      if (key === 'refresh_token') {
        this.memoryStorage.delete('refresh_token_expiry_time')
      }

      return true
    } catch (error) {
      console.error('Error removing secure item:', error)
      return false
    }
  }

  // Verificar si un item ha expirado
  private isExpired(key: string): boolean {
    try {
      // SECURITY FIX: Solo verificar desde memoria interna para evitar acceso a sessionStorage
      const realExpiryTime = this.getMemoryItem(`${key}_expiry_time`)
      if (!realExpiryTime) return false

      // Validar que expiryTime sea una cadena válida antes de parsear
      const sanitizedExpiryTime = typeof realExpiryTime === 'string' ? realExpiryTime.trim() : ''
      if (!sanitizedExpiryTime || !/^\d+$/.test(sanitizedExpiryTime)) return false

      const expiry = parseInt(sanitizedExpiryTime, 10)
      if (isNaN(expiry)) return false

      return Date.now() > expiry
    } catch {
      return false
    }
  }

  // Limpiar todo el almacenamiento
  clear(): boolean {
    try {
      // SECURITY FIX: Solo limpiar memoria interna, no usar sessionStorage
      this.memoryStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing secure storage:', error)
      return false
    }
  }
}

// Instancia singleton
export const secureStorage = SecureStorage.getInstance()

// Funciones de conveniencia para tokens de autenticación
export const authStorage = {
  setAuthToken: (token: string): boolean => {
    return secureStorage.setItem('auth_token', token, {
      encrypt: true,
      maxAge: 3600, // 1 hora
    })
  },

  getAuthToken: (): string | null => {
    return secureStorage.getItem('auth_token')
  },

  setRefreshToken: (token: string): boolean => {
    return secureStorage.setItem('refresh_token', token, {
      encrypt: true,
      maxAge: 7 * 24 * 3600, // 7 días
    })
  },

  getRefreshToken: (): string | null => {
    return secureStorage.getItem('refresh_token')
  },

  removeAuthToken: (): boolean => {
    return secureStorage.removeItem('auth_token')
  },

  removeRefreshToken: (): boolean => {
    return secureStorage.removeItem('refresh_token')
  },

  clearAllTokens: (): boolean => {
    const authRemoved = secureStorage.removeItem('auth_token')
    const refreshRemoved = secureStorage.removeItem('refresh_token')
    return authRemoved && refreshRemoved
  },

  // Verificar si el token de autenticación está próximo a expirar
  isAuthTokenExpiringSoon: (bufferMinutes: number = 5): boolean => {
    if (typeof window === 'undefined') return false

    try {
      // SECURITY FIX: Solo verificar desde memoria interna
      const realExpiryTime = secureStorage.getMemoryItem('auth_token_expiry_time')
      if (!realExpiryTime) return true

      const expiry = parseInt(realExpiryTime, 10)
      const now = Date.now()
      const bufferMs = bufferMinutes * 60 * 1000

      return expiry - now <= bufferMs
    } catch {
      return true
    }
  },

  // Verificar si el refresh token está próximo a expirar
  isRefreshTokenExpiringSoon: (bufferMinutes: number = 60): boolean => {
    if (typeof window === 'undefined') return false

    try {
      // SECURITY FIX: Solo verificar desde memoria interna
      const realExpiryTime = secureStorage.getMemoryItem('refresh_token_expiry_time')
      if (!realExpiryTime) return true

      const expiry = parseInt(realExpiryTime, 10)
      const now = Date.now()
      const bufferMs = bufferMinutes * 60 * 1000

      return expiry - now <= bufferMs
    } catch {
      return true
    }
  },

  // Rotar token de autenticación
  rotateAuthToken: (newToken: string, expiryTime?: number): boolean => {
    const success = secureStorage.setItem('auth_token', newToken, {
      encrypt: true,
      maxAge: 3600, // 1 hora
    })

    if (success && expiryTime && typeof window !== 'undefined') {
      try {
        // Validar que expiryTime sea un número válido antes de convertir
        const validatedExpiryTime =
          typeof expiryTime === 'number' && !isNaN(expiryTime)
            ? expiryTime
            : Date.now() + 3600 * 1000 // 1 hora por defecto

        // SECURITY FIX: Solo almacenar en memoria interna, nunca en sessionStorage
        secureStorage.setMemoryItem('auth_token_expiry_time', String(validatedExpiryTime))
      } catch {
        // Ignorar errores de sessionStorage
      }
    }

    return success
  },

  // Rotar refresh token
  rotateRefreshToken: (newToken: string, expiryTime?: number): boolean => {
    const success = secureStorage.setItem('refresh_token', newToken, {
      encrypt: true,
      maxAge: 7 * 24 * 3600, // 7 días
    })

    if (success && expiryTime && typeof window !== 'undefined') {
      try {
        // Validar que expiryTime sea un número válido antes de convertir
        const validatedExpiryTime =
          typeof expiryTime === 'number' && !isNaN(expiryTime)
            ? expiryTime
            : Date.now() + 7 * 24 * 3600 * 1000 // 7 días por defecto

        // SECURITY FIX: Solo almacenar en memoria interna, nunca en sessionStorage
        secureStorage.setMemoryItem('refresh_token_expiry_time', String(validatedExpiryTime))
      } catch {
        // Ignorar errores de sessionStorage
      }
    }

    return success
  },

  // Limpiar tokens expirados automáticamente
  cleanupExpiredTokens: (): void => {
    if (authStorage.isAuthTokenExpiringSoon(0)) {
      authStorage.removeAuthToken()
    }

    if (authStorage.isRefreshTokenExpiringSoon(0)) {
      authStorage.removeRefreshToken()
    }
  },

  // Validar integridad de tokens
  validateTokenIntegrity: (): boolean => {
    const authToken = authStorage.getAuthToken()
    const refreshToken = authStorage.getRefreshToken()

    // Verificar que los tokens no estén corruptos
    if (authToken && authToken.length < 10) {
      authStorage.removeAuthToken()
      return false
    }

    if (refreshToken && refreshToken.length < 10) {
      authStorage.removeRefreshToken()
      return false
    }

    return true
  },
}

// Funciones de conveniencia para CSRF tokens
export const csrfStorage = {
  setCsrfToken: (token: string): boolean => {
    return secureStorage.setItem('csrf_token', token, {
      encrypt: false, // CSRF tokens no necesitan encriptación
      maxAge: 3600, // 1 hora
    })
  },

  getCsrfToken: (): string | null => {
    return secureStorage.getItem('csrf_token', { encrypted: false })
  },

  removeCsrfToken: (): boolean => {
    return secureStorage.removeItem('csrf_token')
  },
}
