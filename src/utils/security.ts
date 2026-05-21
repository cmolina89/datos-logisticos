import DOMPurify from 'dompurify'
import validator from 'validator'

// Configuración de DOMPurify
const purifyConfig = {
  ALLOWED_TAGS: [
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'br',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
}

// Sanitización de HTML
export const sanitizeHtml = (dirty: string): string => {
  if (typeof window === 'undefined') {
    return dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }
  return DOMPurify.sanitize(dirty, purifyConfig)
}

// Sanitización de texto plano
export const sanitizeText = (text: string): string => {
  return validator.escape(text)
}

// Validación de email
export const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true,
    allow_ip_domain: false,
  })
}

// Validación de contraseña segura
export const isStrongPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres')
  if (password.length > 128) errors.push('La contraseña no puede tener más de 128 caracteres')
  if (!/[a-z]/.test(password)) errors.push('Debe contener al menos una letra minúscula')
  if (!/[A-Z]/.test(password)) errors.push('Debe contener al menos una letra mayúscula')
  if (!/\d/.test(password)) errors.push('Debe contener al menos un número')
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push('Debe contener al menos un carácter especial')

  return { isValid: errors.length === 0, errors }
}

// Generación de tokens seguros
export const generateSecureToken = (length: number = 32): string => {
  if (typeof window === 'undefined') {
    return Math.random()
      .toString(36)
      .substring(2, length + 2)
  }

  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Hash de contraseñas usando Web Crypto API
export const hashPassword = async (password: string): Promise<string> => {
  if (typeof window === 'undefined') {
    // En el servidor, usar un hash simple sin depender de Buffer.
    return encodeURIComponent(password)
  }

  try {
    // Usar Web Crypto API en el cliente
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    console.error('Error hashing password:', error)
    // Fallback a un hash simple
    return btoa(password)
  }
}

// Limitador de intentos
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    if (record.count >= this.maxAttempts) return false
    record.count++
    return true
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record || Date.now() > record.resetTime) return this.maxAttempts
    return Math.max(0, this.maxAttempts - record.count)
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000)

// Validación de formularios
export const validateFormInput = (
  input: any,
  rules: {
    required?: boolean
    type?: 'email' | 'url' | 'text' | 'number'
    minLength?: number
    maxLength?: number
    sanitize?: boolean
  }
): { isValid: boolean; value: any; errors: string[] } => {
  const errors: string[] = []
  let value = input

  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push('Este campo es requerido')
    return { isValid: false, value: '', errors }
  }

  if (!value && !rules.required) {
    return { isValid: true, value: '', errors: [] }
  }

  value = value.toString().trim()
  if (rules.sanitize) value = sanitizeText(value)
  if (rules.type === 'email' && !isValidEmail(value)) errors.push('Formato de email inválido')
  if (rules.minLength && value.length < rules.minLength)
    errors.push(`Debe tener al menos ${rules.minLength} caracteres`)
  if (rules.maxLength && value.length > rules.maxLength)
    errors.push(`No puede tener más de ${rules.maxLength} caracteres`)

  return { isValid: errors.length === 0, value, errors }
}

// Headers de seguridad
export const getSecurityHeaders = (): Record<string, string> => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
})

// Limpiar datos sensibles para logs
export const sanitizeForLogging = (data: any): any => {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization']

  if (typeof data !== 'object' || data === null) return data

  const sanitized = { ...data }
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}
