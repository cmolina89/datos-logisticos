import { useNavigate } from '@modern-js/runtime/router'
import { ProgressSpinner } from 'primereact/progressspinner'
// src/features/authFeature/components/withAuthentication.tsx
import { type ComponentType, useEffect } from 'react'
import { useCookies } from 'react-cookie'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const userIsAuthenticated = (cookies: { [key: string]: any }): boolean => {
  // En un proyecto real, aquí verificarías la validez del token,
  // posiblemente llamando a un endpoint del backend.
  // Para este ejemplo, solo verificamos su existencia.
  return !!cookies.accessToken
}

// Define un tipo para las props que el HOC podría añadir o esperar
// biome-ignore lint/complexity/noBannedTypes: <explanation>
type WithAuthenticationProps = {}

const withAuthentication = <P extends object>(
  WrappedComponent: ComponentType<P>
): React.FC<P & WithAuthenticationProps> => {
  const WithAuthComponent: React.FC<P & WithAuthenticationProps> = props => {
    const [cookies] = useCookies(['accessToken'])
    const navigate = useNavigate()
    const isAuthenticated = userIsAuthenticated(cookies)

    useEffect(() => {
      if (!isAuthenticated) {
        // Redirigir si no está autenticado
        navigate('/login', { replace: true })
      }
    }, [isAuthenticated, navigate])

    // Muestra un loader mientras se verifica o redirige para evitar un flash de contenido
    if (!isAuthenticated) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
          }}
        >
          <ProgressSpinner />
        </div>
      )
    }

    // Renderiza el componente envuelto si está autenticado
    return <WrappedComponent {...props} />
  }

  // Asigna un nombre de display para una mejor depuración en React DevTools
  WithAuthComponent.displayName = `WithAuthentication(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return WithAuthComponent
}

export default withAuthentication
