import ColtraneIconsCatalog from '@/components/ColtraneIconsCatalog/ColtraneIconsCatalog'
import Icon from '@/components/Icon'
import { useNavigate } from '@modern-js/runtime/router'
import { useSetAtom } from 'jotai'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { TabPanel, TabView } from 'primereact/tabview'
import { Tag } from 'primereact/tag'
import type React from 'react'
import { logoutAtom } from '../store/authAtoms'

// import 'ProtectedPage.scss'

const ProtectedPage: React.FC = () => {
  const performLogout = useSetAtom(logoutAtom)
  const navigate = useNavigate()

  const handleLogout = () => {
    performLogout()
    navigate('/') // Redirigir a la página de inicio después del logout
  }

  const handleHomeButton = () => {
    navigate('/')
  }

  return (
    <div className="protected-page">
      {/* Header Section */}
      <div className="protected-page__header">
        <Card className="mb-2">
          <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-4">
            <div className="welcome-text">
              <h1 className="welcome-title">
                <Icon icon="lock" decorative className="mr-2" />
                Área Protegida
              </h1>
              <p className="welcome-description">
                ¡Bienvenido a la sección segura! Has accedido exitosamente a una ruta protegida.
              </p>
              <Tag
                value="Autenticado"
                severity="success"
                icon="clt-check-mark"
                className="auth-status"
              />
            </div>
            <div className="action-buttons">
              <Button
                label="Regresar a Home"
                icon="clt-home"
                onClick={handleHomeButton}
                className="p-button-outlined"
                size="large"
              />
              <Button
                label="Cerrar Sesión"
                icon="clt-logout"
                onClick={handleLogout}
                severity="danger"
                size="large"
              />
            </div>
          </div>
        </Card>
      </div>
      {/* Content Tabs Section */}
      <div className="protected-page__content">
        <Card className="tabs-container">
          <TabView className="custom-tabview">
            {/* Documentación Tab */}
            <TabPanel header="Documentación" leftIcon="pi pi-book mr-2">
              <div className="tab-content documentation-tab">
                <div className="doc-header">
                  <h2 className="section-title">
                    <Icon icon="info" decorative className="mr-2" />
                    ¿Cómo funcionan las Rutas Protegidas?
                  </h2>
                  <p className="section-description">
                    Comprende el sistema de autenticación y seguridad implementado en esta
                    aplicación.
                  </p>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-content">
                      <h3>
                        <Icon icon="privacy-security" decorative />
                        Autenticación
                      </h3>
                      <p>
                        Las rutas protegidas verifican que el usuario esté autenticado antes de
                        permitir el acceso. Utilizamos tokens seguros y validación de sesión para
                        garantizar la seguridad.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Tag value="JWT Tokens" severity="success" />
                        <Tag value="Validación Segura" severity="info" />
                      </div>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <h3>
                        <Icon icon="arrow-insert" decorative className="mr-2" />
                        Redirección Automática
                      </h3>
                      <p>
                        Si no estás autenticado, serás redirigido automáticamente a la página de
                        login. Después del login exitoso, regresarás a la página que solicitaste
                        originalmente.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Tag value="Redirección Inteligente" severity="warning" />
                        <Tag value="Preserva Estado" severity="success" />
                      </div>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <h3>
                        <Icon icon="escudo" decorative className="mr-2" />
                        Múltiples Capas de Seguridad
                      </h3>
                      <p>
                        Implementamos validación de tokens, control de sesiones, protección CSRF, y
                        medidas contra ataques comunes como XSS e inyección de código.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Tag value="CSRF Protection" severity="danger" />
                        <Tag value="XSS Prevention" severity="danger" />
                        <Tag value="Secure Headers" severity="info" />
                      </div>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-content">
                      <h3>
                        <Icon icon="sync" decorative className="mr-2" />
                        Estado Global con Jotai
                      </h3>
                      <p>
                        El estado de autenticación se mantiene usando Jotai, permitiendo
                        sincronización en tiempo real entre todos los componentes de la aplicación.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Tag value="Tiempo Real" severity="success" />
                        <Tag value="Reactivo" severity="info" />
                        <Tag value="Performante" severity="warning" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            {/* Iconos Tab */}
            <TabPanel header="Iconos Coltrane" leftIcon="pi pi-palette mr-2 ">
              <div className="tab-content icons-tab">
                <div className="icons-section-header">
                  <h2 className="section-title">
                    <Icon icon="customize" decorative className="mr-2" />
                    Catálogo de Iconos Coltrane
                  </h2>
                  <p className="section-description">
                    Explora todos los iconos disponibles en el sistema de diseño Coltrane. Estos
                    iconos están optimizados para accesibilidad y responsive design.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Tag value="289+ Iconos" severity="info" />
                    <Tag value="Responsive" severity="success" />
                    <Tag value="Accesible" severity="warning" />
                  </div>
                </div>
                <ColtraneIconsCatalog />
              </div>
            </TabPanel>
          </TabView>
        </Card>
      </div>
    </div>
  )
}

export default ProtectedPage
