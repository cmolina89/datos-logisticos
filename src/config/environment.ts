// src/config/environment.ts

/**
 * Configuración de entorno que funciona tanto en servidor como en cliente.
 * Esta implementación evita el uso directo de process.env en código que se ejecuta en el navegador.
 */

/**
 * Detecta si el código se está ejecutando en el servidor (Node.js) o en el cliente (navegador)
 */
const isServer = typeof window === 'undefined'

/**
 * Configuración de la aplicación
 */
export const config = {
  /**
   * URL base para las llamadas a la API
   * En el servidor: usa la variable de entorno o el valor por defecto
   * En el cliente: usa directamente el valor por defecto (más seguro)
   */
  apiBaseUrl: isServer
    ? process.env.MODERN_APP_API_BASE_URL || 'https://jsonplaceholder.typicode.com'
    : 'https://jsonplaceholder.typicode.com',

  /**
   * Indica si la aplicación está en modo producción
   * En el servidor: usa NODE_ENV
   * En el cliente: detecta basándose en el hostname (localhost = desarrollo)
   */
  isProduction: isServer
    ? process.env.NODE_ENV === 'production'
    : typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      !window.location.hostname.includes('127.0.0.1'),

  /**
   * Indica si estamos en modo desarrollo
   */
  isDevelopment: isServer
    ? process.env.NODE_ENV !== 'production'
    : typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')),

  /**
   * Variable de entorno personalizada para demostración
   */
  environment: isServer ? process.env.MODERN_APP_ENVIRONMENT || 'development' : 'client-side',

  /**
   * Información del entorno para debugging
   */
  environmentInfo: {
    isServer,
    isClient: !isServer,
    userAgent: !isServer && typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
    timestamp: new Date().toISOString(),
    location: !isServer && typeof window !== 'undefined' ? window.location.href : 'server',
  },
} as const

/**
 * Función helper para obtener variables de entorno de forma segura
 * Solo funciona en el servidor, en el cliente retorna el valor por defecto
 */
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (isServer && typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  return defaultValue
}

/**
 * Función para logging seguro que funciona en ambos entornos
 */
export const safeLog = (message: string, data?: any) => {
  if (config.isDevelopment) {
    console.log(`[${config.environmentInfo.isServer ? 'SERVER' : 'CLIENT'}] ${message}`, data || '')
  }
}

export default config
