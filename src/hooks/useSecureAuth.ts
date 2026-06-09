import { authTokenAtom } from '@/features/authFeature/store/authAtoms';
import { authStorage, csrfStorage } from '@/utils/secureStorage';
import {
    generateSecureToken,
    hashPassword,
    loginRateLimiter,
    sanitizeForLogging,
    validateFormInput
} from '@/utils/security';
import { applySecurityHeaders, secureJson, validateSecurityHeaders } from '@/utils/securityHeaders';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

interface LoginCredentials {
    email: string;
    // SECURITY: La contraseña se procesa inmediatamente y no se almacena
    password: string;
    rememberMe?: boolean;
}

interface AuthState {
    isAuthenticated: boolean;
    user: any | null;
    loading: boolean;
    error: string | null;
    csrfToken: string | null;
}

// ── Funciones auxiliares para reducir Cognitive Complexity (S3776) ──

/** Valida headers de seguridad en la respuesta (HSTS + security headers) */
const validateResponseSecurity = (response: Response, assertHstsHeader: (response: Response) => void): void => {
    validateSecurityHeaders(response);
    assertHstsHeader(response);
};

/** Determina si un error es de tipo HSTS */
const isHstsError = (error: unknown): boolean => {
    return error instanceof Error && error.message.includes('HSTS');
};

/** Maneja errores de autenticación y retorna el mensaje de error apropiado */
const getAuthErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (isHstsError(error)) {
        console.error('HSTS validation error:', sanitizeForLogging(error));
        return 'Conexión segura requerida. Por favor, accede desde HTTPS.';
    }
    console.error(defaultMessage, sanitizeForLogging(error));
    return 'Error de conexión. Intenta de nuevo.';
};

/** Valida las credenciales de email y contraseña del formulario de login */
const validateCredentials = (credentials: LoginCredentials): { isValid: boolean; errorMessage?: string } => {
    const emailValidation = validateFormInput(credentials.email, {
        required: true,
        type: 'email',
        sanitize: true
    });

    if (!emailValidation.isValid) {
        return { isValid: false, errorMessage: emailValidation.errors.join(', ') };
    }

    const passwordValidation = validateFormInput(credentials.password, {
        required: true,
        minLength: 8,
        maxLength: 128
    });

    if (!passwordValidation.isValid) {
        return { isValid: false, errorMessage: passwordValidation.errors.join(', ') };
    }

    return { isValid: true };
};

/** Construye los datos de autenticación seguros para el login */
const buildSecureAuthData = async (
    credentials: LoginCredentials,
    csrfToken: string | null
): Promise<{ authData: Record<string, unknown>; sessionId: string }> => {
    const emailValidation = validateFormInput(credentials.email, {
        required: true,
        type: 'email',
        sanitize: true
    });

    // SECURITY: Procesar y hashear la contraseña inmediatamente
    const passwordHash = await hashPassword(credentials.password);

    // SECURITY: Limpiar la contraseña de memoria inmediatamente después del hash
    // @ts-ignore - Necesario para limpiar la referencia de memoria
    credentials.password = undefined as any;

    const sessionId = generateSecureToken(16);

    const authData = {
        email: emailValidation.value,
        sessionId,
        rememberMe: credentials.rememberMe || false,
        csrfToken,
        authHash: await hashPassword(passwordHash + csrfToken)
    };

    return { authData, sessionId };
};

/** Procesa la respuesta exitosa del login */
const processLoginSuccess = (
    data: { token: string; refreshToken?: string },
    credentials: LoginCredentials,
    userIdentifier: string,
    setAuthToken: (token: string) => void
): void => {
    const { token, refreshToken } = data;
    authStorage.setAuthToken(token);
    if (credentials.rememberMe && refreshToken) {
        authStorage.setRefreshToken(refreshToken);
    }
    setAuthToken(token);
    loginRateLimiter.reset(userIdentifier);
};

// ── Hook principal ──

export const useSecureAuth = () => {
    const [authToken, setAuthToken] = useAtom(authTokenAtom);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = generateSecureToken(32);
        setCsrfToken(token);
        csrfStorage.setCsrfToken(token);

        // Limpiar tokens expirados al inicializar
        authStorage.cleanupExpiredTokens();

        // Validar integridad de tokens
        authStorage.validateTokenIntegrity();
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const getRemainingLoginAttempts = useCallback(() => {
        const userIdentifier =
            typeof window !== 'undefined'
                ? window.location.hostname + '_' + (navigator.userAgent || 'unknown')
                : 'unknown';
        return loginRateLimiter.getRemainingAttempts(userIdentifier);
    }, []);

    const assertHstsHeader = useCallback((response: Response): void => {
        if (typeof window === 'undefined') return;

        // En HTTPS, siempre verificar HSTS
        if (window.location.protocol === 'https:') {
            const hstsHeader = response.headers.get('Strict-Transport-Security');
            if (!hstsHeader) {
                console.error('CRITICAL SECURITY ISSUE: Missing Strict-Transport-Security header', {
                    url: response.url,
                    status: response.status,
                    statusText: response.statusText
                });
                throw new Error(
                    'Missing Strict-Transport-Security (HSTS) header in HTTPS response. ' +
                        'The server must send the HSTS header for security compliance.'
                );
            }
        }

        // En HTTP (desarrollo), solo advertir
        if (window.location.protocol === 'http:') {
            console.warn(
                'WARNING: Running on HTTP. HSTS headers are not enforced in development. ' +
                    'Ensure HSTS is configured on production servers.'
            );
        }
    }, []);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        try {
            const refreshTokenValue = authStorage.getRefreshToken();
            if (!refreshTokenValue) return false;

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: applySecurityHeaders({
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                }),
                credentials: 'same-origin',
                body: JSON.stringify({
                    refreshToken: refreshTokenValue,
                    csrfToken
                })
            });

            if (response.ok) {
                try {
                    validateResponseSecurity(response, assertHstsHeader);
                } catch (headerError) {
                    console.error('Security header validation failed:', headerError);
                    throw headerError;
                }

                const data = await secureJson<{
                    token: string;
                    refreshToken?: string;
                    expiresIn?: number;
                    refreshExpiresIn?: number;
                }>(response);

                const expiryTime = data.expiresIn ? Date.now() + data.expiresIn * 1000 : Date.now() + 3600 * 1000;

                authStorage.rotateAuthToken(data.token, expiryTime);

                if (data.refreshToken) {
                    const refreshExpiryTime = data.refreshExpiresIn
                        ? Date.now() + data.refreshExpiresIn * 1000
                        : Date.now() + 7 * 24 * 3600 * 1000;
                    authStorage.rotateRefreshToken(data.refreshToken, refreshExpiryTime);
                }

                setAuthToken(data.token);
                return true;
            } else {
                authStorage.removeRefreshToken();
                return false;
            }
        } catch (error) {
            if (isHstsError(error)) {
                console.error('HSTS validation error during token refresh:', sanitizeForLogging(error));
            } else {
                console.error('Token refresh error:', sanitizeForLogging(error));
            }
            return false;
        }
    }, [assertHstsHeader, csrfToken, setAuthToken]);

    // S3776 fix: Cognitive Complexity reducida extrayendo validación de seguridad y manejo de errores
    const validateSession = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);
            authStorage.cleanupExpiredTokens();

            const token = authStorage.getAuthToken();
            if (!token) {
                setAuthToken(null);
                return false;
            }

            // Verificar si el token está próximo a expirar
            if (authStorage.isAuthTokenExpiringSoon(10)) {
                const refreshSuccess = await refreshToken();
                if (!refreshSuccess) {
                    authStorage.removeAuthToken();
                    setAuthToken(null);
                    return false;
                }
            }

            const response = await fetch('/api/auth/validate', {
                method: 'POST',
                headers: applySecurityHeaders({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'X-CSRF-Token': csrfToken || ''
                }),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                authStorage.removeAuthToken();
                setAuthToken(null);
                return false;
            }

            try {
                validateResponseSecurity(response, assertHstsHeader);
            } catch (headerError) {
                console.error('Security header validation failed:', headerError);
                throw headerError;
            }

            await secureJson(response);
            setAuthToken(token);
            return true;
        } catch (err) {
            const errorMsg = getAuthErrorMessage(err, 'Error validating session:');
            if (isHstsError(err)) {
                setError(errorMsg);
            }
            setAuthToken(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, [assertHstsHeader, csrfToken, setAuthToken]);

    // S3776 fix: Cognitive Complexity reducida extrayendo validación de credenciales y construcción de datos
    const login = useCallback(
        async (credentials: LoginCredentials): Promise<boolean> => {
            try {
                setLoading(true);
                setError(null);

                const userIdentifier =
                    typeof window !== 'undefined'
                        ? window.location.hostname + '_' + (navigator.userAgent || 'unknown')
                        : 'unknown';

                if (!loginRateLimiter.isAllowed(userIdentifier)) {
                    const remaining = loginRateLimiter.getRemainingAttempts(userIdentifier);
                    setError(`Demasiados intentos. Intentos restantes: ${remaining}`);
                    return false;
                }

                // Validar credenciales usando función auxiliar
                const validation = validateCredentials(credentials);
                if (!validation.isValid) {
                    setError(validation.errorMessage || 'Credenciales inválidas');
                    return false;
                }

                // Construir datos de autenticación seguros
                const { authData, sessionId } = await buildSecureAuthData(credentials, csrfToken);

                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: applySecurityHeaders({
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken || '',
                        'X-Session-Id': sessionId
                    }),
                    credentials: 'same-origin',
                    body: JSON.stringify(authData)
                });

                try {
                    validateResponseSecurity(response, assertHstsHeader);
                } catch (headerError) {
                    console.error('Security header validation failed:', headerError);
                    throw headerError;
                }

                const data = await secureJson<{ token: string; refreshToken?: string; message?: string }>(response);

                if (response.ok) {
                    processLoginSuccess(data, credentials, userIdentifier, setAuthToken);
                    return true;
                } else {
                    setError(data.message || 'Error de autenticación');
                    return false;
                }
            } catch (err) {
                setError(getAuthErrorMessage(err, 'Login error:'));
                return false;
            } finally {
                setLoading(false);
            }
        },
        [assertHstsHeader, csrfToken, setAuthToken]
    );

    const logout = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const token = authStorage.getAuthToken();

            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: applySecurityHeaders({
                        Authorization: `Bearer ${token}`,
                        'X-CSRF-Token': csrfToken || ''
                    }),
                    credentials: 'same-origin'
                }).catch(() => {});
            }

            authStorage.clearAllTokens();
            setAuthToken(null);
            setError(null);

            const newToken = generateSecureToken(32);
            setCsrfToken(newToken);
            csrfStorage.setCsrfToken(newToken);
        } catch (error) {
            console.error('Logout error:', sanitizeForLogging(error));
        } finally {
            setLoading(false);
        }
    }, [csrfToken, setAuthToken]);

    useEffect(() => {
        validateSession();
    }, [validateSession]);

    const authState: AuthState = {
        isAuthenticated: !!authToken,
        user: null, // Simplificado para este ejemplo
        loading,
        error,
        csrfToken
    };

    return {
        authState,
        login,
        logout,
        refreshToken,
        validateSession,
        getRemainingLoginAttempts,
        clearError
    };
};
