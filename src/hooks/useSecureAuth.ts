import { authTokenAtom } from '@/features/authFeature/store/authAtoms'
import { authStorage, csrfStorage } from '@/utils/secureStorage'
import {
  generateSecureToken,
  hashPassword,
  loginRateLimiter,
  sanitizeForLogging,
  validateFormInput,
} from '@/utils/security'
import {
  applySecurityHeaders,
  enforceHSTSHeaders,
  validateSecurityHeaders,
} from '@/utils/securityHeaders'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

interface LoginCredentials {
  email: string
  // SECURITY: La contraseña se procesa inmediatamente y no se almacena
  password: string
  rememberMe?: boolean
}

interface AuthState {
  isAuthenticated: boolean
  user: any | null
  loading: boolean
  error: string | null
  csrfToken: string | null
}

export const useSecureAuth = () => {
  const [authToken, setAuthToken] = useAtom(authTokenAtom)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = generateSecureToken(32)
    setCsrfToken(token)
    csrfStorage.setCsrfToken(token)

    // Limpiar tokens expirados al inicializar
    authStorage.cleanupExpiredTokens()

    // Validar integridad de tokens
    authStorage.validateTokenIntegrity()

    // SECURITY: Aplicar headers HSTS en el cliente
    enforceHSTSHeaders()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const getRemainingLoginAttempts = useCallback(() => {
    const userIdentifier =
      typeof window !== 'undefined'
        ? window.location.hostname + '_' + (navigator.userAgent || 'unknown')
        : 'unknown'
    return loginRateLimiter.getRemainingAttempts(userIdentifier)
  }, [])

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true)

      // Limpiar tokens expirados antes de validar
      authStorage.cleanupExpiredTokens()

      const token = authStorage.getAuthToken()
      if (!token) {
        setAuthToken(null)
        return false
      }

      // Verificar si el token está próximo a expirar
      if (authStorage.isAuthTokenExpiringSoon(10)) {
        // Intentar refrescar el token automáticamente
        const refreshSuccess = await refreshToken()
        if (!refreshSuccess) {
          authStorage.removeAuthToken()
          setAuthToken(null)
          return false
        }
      }

      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: applySecurityHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || '',
        }),
        credentials: 'same-origin',
      })

      if (response.ok) {
        // SECURITY: Validar headers de seguridad en la respuesta
        validateSecurityHeaders(response)

        await response.json()
        setAuthToken(token)
        return true
      } else {
        authStorage.removeAuthToken()
        setAuthToken(null)
        return false
      }
    } catch (error) {
      console.error('Error validating session:', sanitizeForLogging(error))
      setAuthToken(null)
      return false
    } finally {
      setLoading(false)
    }
  }, [csrfToken, setAuthToken])

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)

        const userIdentifier =
          typeof window !== 'undefined'
            ? window.location.hostname + '_' + (navigator.userAgent || 'unknown')
            : 'unknown'

        if (!loginRateLimiter.isAllowed(userIdentifier)) {
          const remaining = loginRateLimiter.getRemainingAttempts(userIdentifier)
          setError(`Demasiados intentos. Intentos restantes: ${remaining}`)
          return false
        }

        const emailValidation = validateFormInput(credentials.email, {
          required: true,
          type: 'email',
          sanitize: true,
        })

        const passwordValidation = validateFormInput(credentials.password, {
          required: true,
          minLength: 8,
          maxLength: 128,
        })

        if (!emailValidation.isValid) {
          setError(emailValidation.errors.join(', '))
          return false
        }

        if (!passwordValidation.isValid) {
          setError(passwordValidation.errors.join(', '))
          return false
        }

        // SECURITY: Procesar y hashear la contraseña inmediatamente
        const passwordHash = await hashPassword(credentials.password)

        // SECURITY: Limpiar la contraseña de memoria inmediatamente después del hash
        // Usar undefined en lugar de cadena vacía para evitar detección de campos vacíos
        // @ts-ignore - Necesario para limpiar la referencia de memoria
        credentials.password = undefined as any

        // SECURITY: Crear datos de autenticación sin exponer información sensible directamente
        const authData = {
          email: emailValidation.value,
          // SECURITY: Usar un identificador de sesión en lugar de hash directo para reducir exposición
          sessionId: generateSecureToken(16),
          rememberMe: credentials.rememberMe || false,
          csrfToken,
          // SECURITY: Hash adicional para verificación del lado del servidor
          authHash: await hashPassword(passwordHash + csrfToken), // Double hashing con CSRF
        }

        // SECURITY: Almacenar temporalmente el hash para verificación local
        const tempSessionKey = `auth_temp_${authData.sessionId}`
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(tempSessionKey, passwordHash)
        }

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: applySecurityHeaders({
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || '',
            'X-Session-Id': authData.sessionId,
          }),
          credentials: 'same-origin',
          body: JSON.stringify(authData),
        })

        // SECURITY: Limpiar el hash temporal después del envío
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(tempSessionKey)
        }

        // SECURITY: Validar headers de seguridad en la respuesta
        validateSecurityHeaders(response)

        const data = await response.json()

        if (response.ok) {
          const { token, refreshToken } = data
          authStorage.setAuthToken(token)
          if (credentials.rememberMe && refreshToken) {
            authStorage.setRefreshToken(refreshToken)
          }
          setAuthToken(token)
          loginRateLimiter.reset(userIdentifier)
          return true
        } else {
          setError(data.message || 'Error de autenticación')
          return false
        }
      } catch (error) {
        console.error('Login error:', sanitizeForLogging(error))
        setError('Error de conexión. Intenta de nuevo.')
        return false
      } finally {
        setLoading(false)
      }
    },
    [csrfToken, setAuthToken]
  )

  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      const token = authStorage.getAuthToken()

      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: applySecurityHeaders({
            Authorization: `Bearer ${token}`,
            'X-CSRF-Token': csrfToken || '',
          }),
          credentials: 'same-origin',
        }).catch(() => {})
      }

      authStorage.clearAllTokens()
      setAuthToken(null)
      setError(null)

      const newToken = generateSecureToken(32)
      setCsrfToken(newToken)
      csrfStorage.setCsrfToken(newToken)
    } catch (error) {
      console.error('Logout error:', sanitizeForLogging(error))
    } finally {
      setLoading(false)
    }
  }, [csrfToken, setAuthToken])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshTokenValue = authStorage.getRefreshToken()
      if (!refreshTokenValue) return false

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: applySecurityHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        }),
        credentials: 'same-origin',
        body: JSON.stringify({
          refreshToken: refreshTokenValue,
          csrfToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Calcular tiempo de expiración (asumiendo que el servidor envía expiresIn en segundos)
        const expiryTime = data.expiresIn
          ? Date.now() + data.expiresIn * 1000
          : Date.now() + 3600 * 1000

        // Usar rotación de tokens para mayor seguridad
        authStorage.rotateAuthToken(data.token, expiryTime)

        if (data.refreshToken) {
          const refreshExpiryTime = data.refreshExpiresIn
            ? Date.now() + data.refreshExpiresIn * 1000
            : Date.now() + 7 * 24 * 3600 * 1000
          authStorage.rotateRefreshToken(data.refreshToken, refreshExpiryTime)
        }

        setAuthToken(data.token)
        return true
      } else {
        authStorage.removeRefreshToken()
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', sanitizeForLogging(error))
      return false
    }
  }, [csrfToken, setAuthToken])

  useEffect(() => {
    validateSession()
  }, [validateSession])

  const authState: AuthState = {
    isAuthenticated: !!authToken,
    user: null, // Simplificado para este ejemplo
    loading,
    error,
    csrfToken,
  }

  return {
    authState,
    login,
    logout,
    refreshToken,
    validateSession,
    getRemainingLoginAttempts,
    clearError,
  }
}
