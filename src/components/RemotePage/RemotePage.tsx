import React from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Chip } from 'primereact/chip'
import { Divider } from 'primereact/divider'
import { useHostSharedStore } from '../../hooks/useHostSharedStore'

export interface RemotePageProps {
  title?: string
}

/**
 * Página principal del microfrontend remoto
 * Este componente se renderiza cuando se accede a /remote en el host
 */
export default function RemotePage({ title = 'Microfrontend Remoto' }: RemotePageProps) {
  const { sendMessage } = useHostSharedStore()

  const handleNotifyHost = () => {
    sendMessage('REMOTE_INTERACTION', {
      message: 'Usuario interactuó con el microfrontend remoto',
      timestamp: new Date().toISOString(),
    })
  }

  const remoteFeatures = [
    {
      name: 'Módulo Desacoplado',
      description: 'Desarrollado independientemente sin navbar ni sidebar propios',
    },
    {
      name: 'Comunicación con Host',
      description: 'Puede comunicarse con el host a través del store compartido',
    },
    {
      name: 'Componentes Compartidos',
      description: 'Utiliza los mismos componentes UI (PrimeReact) que el host',
    },
    {
      name: 'Estado Compartido',
      description: 'Accede al estado global del host mediante Jotai',
    },
    {
      name: 'Desarrollo Eficiente',
      description: 'Los desarrolladores se enfocan solo en la funcionalidad específica',
    },
  ]

  return (
    <div className="p-fluid" style={{ padding: '1.5rem', minHeight: '100vh' }}>
      {/* Header del Remote */}
      <div
        className="p-grid p-align-center p-mb-3"
        style={{
          borderBottom: '2px solid var(--primary-color)',
          paddingBottom: '1rem',
        }}
      >
        <div className="p-col-12">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <i
              className="pi pi-sitemap"
              style={{
                fontSize: '2rem',
                color: 'var(--primary-color)',
              }}
            />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '2rem',
                  color: 'var(--primary-color)',
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  margin: 0,
                  color: 'var(--text-color-secondary)',
                  fontSize: '1.1rem',
                }}
              >
                Módulo independiente • Integrado vía Module Federation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del proyecto */}
      <div className="p-grid">
        <div className="p-col-12 p-lg-8">
          <Card title="🎯 Información del Proyecto Remote" style={{ marginBottom: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <Chip
                label="MICROFRONTEND REMOTO"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                }}
              />
            </div>
            <p>
              Este es un <strong>módulo remoto</strong> completamente independiente. Se desarrolla
              de forma aislada y se integra en el host sin incluir navegación propia, manteniendo:
            </p>
            <ul>
              <li>✅ Funcionalidad específica y desacoplada</li>
              <li>✅ Estilos y temas compartidos con el host</li>
              <li>✅ Comunicación bidireccional con el host</li>
              <li>✅ Acceso al estado global compartido</li>
              <li>✅ Desarrollo independiente sin navbar/sidebar</li>
            </ul>
            <Divider />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                label="Notificar al Host"
                icon="pi pi-send"
                onClick={handleNotifyHost}
                className="p-button-outlined"
                size="small"
              />
              <Button
                label="Desarrollo Standalone"
                icon="pi pi-external-link"
                onClick={() => window.open('http://localhost:8001', '_blank')}
                className="p-button-help"
                size="small"
                tooltip="Ver este módulo en desarrollo independiente"
              />
            </div>
          </Card>

          <Card title="🔧 Características del Remote">
            <div className="p-grid">
              {remoteFeatures.map((feature, index) => (
                <div key={index} className="p-col-12 p-md-6" style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '8px',
                      height: '100%',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 0.5rem 0',
                        color: 'var(--primary-color)',
                      }}
                    >
                      {feature.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="p-col-12 p-lg-4">
          <Card title="📊 Estado del Microfrontend">
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  padding: '2rem',
                  backgroundColor: 'var(--green-50)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <i
                  className="pi pi-check-circle"
                  style={{
                    fontSize: '3rem',
                    color: 'var(--green-500)',
                    marginBottom: '1rem',
                  }}
                />
                <h3 style={{ margin: 0, color: 'var(--green-700)' }}>Activo y Funcionando</h3>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--green-600)' }}>
                  Microfrontend cargado correctamente
                </p>
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-color-secondary)',
                }}
              >
                <p>
                  <strong>Tipo:</strong> Módulo Remoto
                </p>
                <p>
                  <strong>Integración:</strong> Module Federation
                </p>
                <p>
                  <strong>Estado:</strong> Activo
                </p>
              </div>
            </div>
          </Card>

          <Card title="💡 Para Desarrolladores">
            <div style={{ fontSize: '0.9rem' }}>
              <p>
                <strong>Desarrollo desacoplado:</strong>
              </p>
              <ul style={{ paddingLeft: '1rem', margin: '0.5rem 0' }}>
                <li>
                  Ejecuta <code>npm run dev</code> en el proyecto remote
                </li>
                <li>Desarrolla funcionalidad específica sin navegación</li>
                <li>El host proporciona navbar y sidebar</li>
                <li>Prueba la integración en el host</li>
              </ul>
              <p>
                <strong>Comunicación:</strong>
              </p>
              <ul style={{ paddingLeft: '1rem', margin: '0.5rem 0' }}>
                <li>
                  Usa el hook <code>useHostSharedStore</code>
                </li>
                <li>
                  Envía mensajes al host con <code>sendMessage</code>
                </li>
                <li>Accede al estado compartido del host</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
