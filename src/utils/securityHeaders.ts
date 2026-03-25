// Middleware para headers de seguridad
export const securityHeaders = {
  // HSTS - HTTP Strict Transport Security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Prevenir ataques XSS
  'X-XSS-Protection': '1; mode=block',
  // Prevenir MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Prevenir clickjacking
  'X-Frame-Options': 'DENY',
  // Política de referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  // Permissions Policy (anteriormente Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
  ].join(', '),
}

// Función para aplicar headers de seguridad
export const applySecurityHeaders = (headers: Record<string, string>) => {
  return { ...securityHeaders, ...headers }
}

// Función para verificar headers de seguridad en respuestas
export const validateSecurityHeaders = (response: Response): void => {
  const hstsHeader = response.headers.get('Strict-Transport-Security')
  const xssHeader = response.headers.get('X-XSS-Protection')
  const contentTypeHeader = response.headers.get('X-Content-Type-Options')

  if (!hstsHeader) {
    console.warn('SECURITY WARNING: Missing HSTS header in response')
  }

  if (!xssHeader) {
    console.warn('SECURITY WARNING: Missing X-XSS-Protection header in response')
  }

  if (!contentTypeHeader) {
    console.warn('SECURITY WARNING: Missing X-Content-Type-Options header in response')
  }
}

// Función para asegurar headers HSTS en el cliente
export const enforceHSTSHeaders = (): void => {
  if (typeof window === 'undefined') return

  // Verificar si estamos en HTTPS
  if (window.location.protocol !== 'https:') {
    console.warn('SECURITY WARNING: HSTS requires HTTPS protocol')
    return
  }

  // Aplicar meta tag para HSTS si no está presente
  const existingHSTS = document.querySelector('meta[http-equiv="Strict-Transport-Security"]')
  if (!existingHSTS) {
    const hstsMeta = document.createElement('meta')
    hstsMeta.setAttribute('http-equiv', 'Strict-Transport-Security')
    hstsMeta.setAttribute('content', securityHeaders['Strict-Transport-Security'])
    document.head.appendChild(hstsMeta)
  }
}

// Hook para aplicar headers en el cliente (meta tags)
export const applyClientSecurityHeaders = () => {
  if (typeof window === 'undefined') return

  // Aplicar CSP via meta tag si no está presente
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
  if (!existingCSP) {
    const cspMeta = document.createElement('meta')
    cspMeta.setAttribute('http-equiv', 'Content-Security-Policy')
    cspMeta.setAttribute('content', securityHeaders['Content-Security-Policy'])
    document.head.appendChild(cspMeta)
  }

  // Aplicar Referrer Policy via meta tag
  const existingReferrer = document.querySelector('meta[name="referrer"]')
  if (!existingReferrer) {
    const referrerMeta = document.createElement('meta')
    referrerMeta.setAttribute('name', 'referrer')
    referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin')
    document.head.appendChild(referrerMeta)
  }
}
