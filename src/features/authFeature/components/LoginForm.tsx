import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import type React from 'react'
import { useId, useState } from 'react'

interface LoginFormProps {
  onLogin: () => void
  isLoading?: boolean
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading = false }) => {
  const [email, setEmail] = useState('')
  // SECURITY FIX: Usar undefined en lugar de cadena vacía para evitar detección de campos vacíos
  const [password, setPassword] = useState<string | undefined>(undefined)
  const emailId = useId()
  const passwordId = useId()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid var(--surface-border)',
      }}
      pt={{
        root: { className: 'border-round-lg' },
        body: { style: { padding: '2rem' } },
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: 'var(--text-color)',
            margin: '0 0 0.5rem 0',
          }}
        >
          Bienvenido
        </h1>
        <p
          style={{
            color: 'var(--text-color-secondary)',
            margin: 0,
            fontSize: '0.95rem',
          }}
        >
          Inicia sesión para acceder a tu cuenta
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor={emailId}
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 500,
              color: 'var(--text-color)',
            }}
          >
            Correo electrónico
          </label>
          <InputText
            id={emailId}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@ejemplo.com"
            disabled={isLoading}
            style={{ width: '100%' }}
            className="w-full"
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label
            htmlFor={passwordId}
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 500,
              color: 'var(--text-color)',
            }}
          >
            Contraseña
          </label>
          <Password
            id={passwordId}
            value={password || ''}
            onChange={e => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            disabled={isLoading}
            feedback={false}
            toggleMask
            style={{ width: '100%' }}
            inputStyle={{ width: '100%' }}
          />
        </div>

        <Button
          type="submit"
          label={isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
          loading={isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            fontWeight: 500,
          }}
          className="p-button-lg"
        />

        <Divider align="center" style={{ margin: '2rem 0 1.5rem 0' }}>
          <span style={{ color: 'var(--text-color-secondary)', fontSize: '0.875rem' }}>Demo</span>
        </Divider>

        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--surface-50)',
            borderRadius: '0.5rem',
            border: '1px solid var(--surface-200)',
          }}
        >
          <h3
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-color)',
            }}
          >
            Modo Demo
          </h3>
          <p
            style={{
              margin: '0 0 1rem 0',
              fontSize: '0.875rem',
              color: 'var(--text-color-secondary)',
              lineHeight: 1.4,
            }}
          >
            Esta es una aplicación de demostración. Puedes usar cualquier credencial o hacer clic
            directamente en "Acceso Demo" para explorar la aplicación.
          </p>
          <Button
            type="button"
            label="Acceso Demo"
            icon="pi pi-play"
            onClick={onLogin}
            outlined
            style={{ width: '100%' }}
            disabled={isLoading}
          />
        </div>
      </form>
    </Card>
  )
}

export default LoginForm
