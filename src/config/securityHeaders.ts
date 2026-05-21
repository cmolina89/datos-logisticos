export const HSTS_HEADER_VALUE = 'max-age=31536000; includeSubDomains; preload'

export const RESPONSE_SECURITY_HEADERS = {
  'Strict-Transport-Security': HSTS_HEADER_VALUE,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
  ].join(', '),
} as const

export const CLIENT_META_SECURITY_HEADERS = {
  'Content-Security-Policy': RESPONSE_SECURITY_HEADERS['Content-Security-Policy'],
  'Referrer-Policy': RESPONSE_SECURITY_HEADERS['Referrer-Policy'],
} as const
