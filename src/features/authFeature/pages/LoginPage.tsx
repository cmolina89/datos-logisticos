import { useLocation, useNavigate } from '@modern-js/runtime/router'
import { useSetAtom } from 'jotai'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
// src/features/authFeature/pages/LoginPage.tsx
import type React from 'react'
import { useCookies } from 'react-cookie' // <-- 1. Importa useCookies
import { loginAtom } from '../store/authAtoms'

const LoginPage: React.FC = () => {
  const performLogin = useSetAtom(loginAtom)
  const navigate = useNavigate()
  const location = useLocation()
  const [, setCookie] = useCookies(['accessToken']) // <-- 2. Obtén la función setCookie

  const handleLogin = () => {
    const fakeToken = 'fake-user-token-from-login-page'

    // 3. Establece la cookie de autenticación
    setCookie('accessToken', fakeToken, {
      path: '/', // La cookie estará disponible en todo el sitio
      // secure: true,    // En producción, esto es crucial (solo se envía sobre HTTPS)
      // httpOnly: false, // httpOnly: true es más seguro si el servidor la setea, pero aquí necesitamos acceso JS
      sameSite: 'strict', // Buena protección contra CSRF
      // maxAge: 3600,    // Opcional: la cookie expirará en 1 hora (3600 segundos)
    })

    // Actualiza el estado de Jotai
    performLogin(fakeToken)

    // Redirige al usuario
    const params = new URLSearchParams(location.search)
    const redirectPath = params.get('redirect') || '/' // Redirige a la ruta guardada o al inicio
    navigate(redirectPath)
  }

  return (
    <div
      className="container p-d-flex p-jc-center p-ai-center"
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>
        <Card
          title="Iniciar Sesión"
          style={{ width: '350px' }}
          pt={{
            title: {
              'aria-level': 1,
              role: 'heading',
            },
          }}
        >
          <form
            onSubmit={e => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <p>Esta es una página de inicio de sesión simulada.</p>
            <p>Haz clic en el botón para "autenticarte".</p>
            <div className="p-mt-4">
              <Button
                type="submit"
                label="Iniciar Sesión (Simulado)"
                icon="pi pi-sign-in"
                onClick={handleLogin}
                className="p-button-success"
                aria-describedby="login-description"
              />
            </div>
            <div id="login-description" className="sr-only">
              Este es un botón de demostración que simula el proceso de autenticación
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
