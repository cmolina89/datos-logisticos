import SEOHead from '@/components/common/SEOHead/SEOHead'
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher/ThemeSwitcher'
import Icon from '@/components/Icon'
import { isAuthenticatedAtom, loginAtom, logoutAtom } from '@/features/authFeature/store/authAtoms'
import { Link } from '@modern-js/runtime/router'
import { useAtomValue, useSetAtom } from 'jotai'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Chip } from 'primereact/chip'
import { Divider } from 'primereact/divider'
import { TabPanel, TabView } from 'primereact/tabview'
import type React from 'react'
import { useCookies } from 'react-cookie'

const techStack = [
  {
    name: 'Modern.js',
    purpose: 'Framework base para la aplicación, gestiona build, enrutamiento, SSR/CSR, y más.',
  },
  {
    name: 'React',
    purpose: 'Librería para construir interfaces de usuario declarativas y basadas en componentes.',
  },
  {
    name: 'TypeScript',
    purpose:
      'Superset de JavaScript que añade tipado estático para mejorar la robustez y mantenibilidad del código.',
  },
  {
    name: 'Jotai',
    purpose: 'Librería minimalista para el manejo de estado global de forma atómica.',
  },
  {
    name: 'PrimeReact',
    purpose: 'Completa suite de componentes UI listos para usar, personalizables y accesibles.',
  },
  {
    name: 'PrimeFlex',
    purpose: 'Sistema de rejilla y utilidades CSS responsivas para PrimeReact.',
  },
  {
    name: 'SASS/SCSS',
    purpose: 'Preprocesador CSS que añade características como variables, anidamiento y mixins.',
  },
  {
    name: 'Axios',
    purpose: 'Cliente HTTP basado en promesas para realizar peticiones a APIs.',
  },
  {
    name: 'Jest & React Testing Library',
    purpose:
      'Frameworks para pruebas unitarias y de integración enfocadas en el comportamiento del usuario.',
  },
  {
    name: 'Playwright',
    purpose: 'Framework para pruebas End-to-End (E2E) robustas en múltiples navegadores.',
  },
]

const HomePage: React.FC = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const performLogin = useSetAtom(loginAtom)
  const performLogout = useSetAtom(logoutAtom)
  const [, setCookie, removeCookie] = useCookies(['accessToken']) // <-- Obtén los manejadores de cookies

  const handleSimulatedLogin = () => {
    const fakeToken = 'fake-user-token-from-home'

    // Establece la cookie
    setCookie('accessToken', fakeToken, {
      path: '/',
      sameSite: 'strict',
    })

    // Actualiza el estado de Jotai
    performLogin(fakeToken)

    alert('¡Has iniciado sesión (simulado)! Ahora puedes acceder a las rutas protegidas.')
  }

  const handleSimulatedLogout = () => {
    // Elimina la cookie
    removeCookie('accessToken', { path: '/' })

    // Actualiza el estado de Jotai
    performLogout()

    alert('Has cerrado sesión.')
  }

  return (
    <>
      <SEOHead
        title="Inicio - CoppelFramework"
        description="Framework moderno para desarrollo de aplicaciones web con React, TypeScript y Modern.js. Plantilla optimizada para SEO, accesibilidad y mejores prácticas de desarrollo."
        keywords="React, TypeScript, Modern.js, Framework, Plantilla, Desarrollo Web, SEO, Accesibilidad, Coppel"
        url="https://coppelframework.com/"
      />
      <div className="p-fluid page-header-optimized" style={{ padding: '0.5rem 1rem' }}>
        {/* Header optimizado y compacto */}
        <div
          className="p-grid p-align-center p-mb-2"
          style={{
            borderBottom: '1px solid var(--surface-border)',
            paddingBottom: '0.75rem',
            minHeight: '60px',
          }}
        >
          <div className="p-col-12 p-xl-4">
            <h1
              className="p-m-0 p-text-truncate"
              style={{
                fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)',
                lineHeight: '1.2',
              }}
            >
              <Icon icon="coppel-logo" ariaLabel="Logo de Coppel" />
              CoppelFramework - WebClient React
            </h1>
          </div>
          <div className="p-col-12 p-xl-8">
            <div className="header-controls-group p-jc-end">
              {/* Todos los botones en la misma línea (solo desktop) */}
              <div className="main-navigation-buttons">
                <Link to="/protected">
                  <Button
                    label="Protegida"
                    icon="pi pi-shield"
                    className="p-button-outlined p-button-sm"
                    size="small"
                    style={{ minWidth: '90px' }}
                  />
                </Link>
                <Link to="/posts">
                  <Button
                    label="Posts"
                    icon="pi pi-list"
                    className="p-button-sm"
                    size="small"
                    style={{ minWidth: '90px' }}
                  />
                </Link>
                <Link to="/datos-logisticos-empaque">
                  <Button
                    label="Datos logísticos y empaque"
                    icon="pi pi-box"
                    className="p-button-outlined p-button-sm"
                    size="small"
                    style={{ minWidth: '90px' }}
                  />
                </Link>
                <Link to="/server-side-info">
                  <Button
                    label="Servidor"
                    icon="pi pi-server"
                    className="p-button-help p-button-sm"
                    size="small"
                    style={{ minWidth: '90px' }}
                  />
                </Link>

                {/* Controles de usuario y tema en la misma línea */}
                {isAuthenticated ? (
                  <Button
                    label="Cerrar Sesión"
                    icon="clt-user-profile"
                    onClick={handleSimulatedLogout}
                    className="p-button-text p-button-danger p-button-sm"
                    size="small"
                    aria-label="Cerrar sesión de usuario"
                    style={{ minWidth: '110px' }}
                  />
                ) : (
                  <Button
                    label="Iniciar Sesión"
                    icon="clt-user-profile"
                    onClick={handleSimulatedLogin}
                    className="p-button-text p-button-sm"
                    size="small"
                    aria-label="Iniciar sesión de usuario"
                    style={{ minWidth: '110px' }}
                  />
                )}
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* Navegación secundaria para móviles y tablets */}
        <div className="p-grid p-mb-2 mobile-navigation">
          <div className="p-col-4">
            <Link to="/protected" className="p-d-block">
              <Button
                label="Protegida"
                icon="pi pi-shield"
                className="p-button-outlined p-w-full p-button-sm"
                size="small"
              />
            </Link>
          </div>
          <div className="p-col-4">
            <Link to="/posts" className="p-d-block">
              <Button
                label="Posts"
                icon="pi pi-list"
                className="p-w-full p-button-sm"
                size="small"
              />
            </Link>
          </div>
          <div className="p-col-4">
            <Link to="/datos-logisticos-empaque" className="p-d-block">
              <Button
                label="Datos log. y empaque"
                icon="pi pi-box"
                className="p-button-outlined p-w-full p-button-sm"
                size="small"
              />
            </Link>
          </div>
          <div className="p-col-4">
            <Link to="/server-side-info" className="p-d-block">
              <Button
                label="Servidor"
                icon="pi pi-server"
                className="p-button-help p-w-full p-button-sm"
                size="small"
              />
            </Link>
          </div>
          {!isAuthenticated && (
            <div className="p-col-12 p-mt-2">
              <Link to="/login" className="p-d-block">
                <Button
                  label="Ir a Login"
                  icon="pi pi-user"
                  className="p-button-outlined p-button-secondary p-w-full p-button-sm"
                  size="small"
                />
              </Link>
            </div>
          )}
        </div>

        <TabView activeIndex={0}>
          {/* Aseguramos la primera tab activa */}
          <TabPanel header="Bienvenida">
            <Card title="Bienvenido a la Plantilla de Desarrollo">
              <p>
                Esta plantilla está diseñada para proporcionar una base sólida y bien estructurada
                para el desarrollo de aplicaciones web modernas con React. Su objetivo es acelerar
                el inicio de nuevos proyectos y promover buenas prácticas entre los equipos de
                desarrollo.
              </p>
              <p>
                Navega por las pestañas para conocer más sobre el enfoque, las tecnologías
                integradas y la estructura del proyecto.
              </p>
            </Card>
          </TabPanel>
          <TabPanel header="Enfoque y Objetivos">
            <Card title="Filosofía de la Plantilla">
              <ul className="p-list-none p-pl-0">
                <li className="mb-2">
                  <Icon icon="checkmark" className="mr-2" />
                  <strong>Desarrollo Eficiente: </strong> Integrar herramientas y una estructura que
                  permitan a los desarrolladores ser productivos rápidamente.
                </li>
                <li className="mb-2">
                  <Icon icon="checkmark" className="mr-2" />
                  <strong>Calidad y Robustez:</strong> Fomentar el uso de TypeScript, pruebas
                  automatizadas y un manejo de estado predecible.
                </li>
                <li className="mb-2">
                  <Icon icon="checkmark" className="mr-2" />
                  <strong>Escalabilidad:</strong> Una arquitectura por features que facilita el
                  crecimiento de la aplicación y la colaboración en equipo.
                </li>
                <li className="mb-2">
                  <Icon icon="checkmark" className="mr-2" />
                  <strong>Experiencia de Usuario (Mobile-First):</strong> Pensar en dispositivos
                  móviles desde el inicio, asegurando una buena adaptabilidad.
                </li>
                <li className="mb-2">
                  <Icon icon="checkmark" className="mr-2" />
                  <strong>Preparada para el Futuro:</strong> Construida sobre Modern.js, facilitando
                  la posible evolución hacia arquitecturas como Microfrontends.
                </li>
              </ul>
            </Card>
          </TabPanel>
          <TabPanel header="Tecnologías Integradas">
            <Card title="Stack Tecnológico">
              <p>La plantilla integra un conjunto de tecnologías modernas y eficientes:</p>
              <ul className="p-list-none p-pl-0">
                {techStack.map(tech => (
                  <li key={tech.name} className="mb-3">
                    <Chip
                      label={`${tech.name}:`}
                      className="mr-2 mb-1"
                      style={{
                        background: 'var(--primary-color)',
                        color: 'var(--primary-color-text)',
                        fontWeight: 600,
                      }}
                    />
                    <span>{tech.purpose}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabPanel>
          <TabPanel header="Primeros Pasos y Consejos">
            <Card title="Empezando a Desarrollar">
              <p>Para comenzar a trabajar con esta plantilla:</p>
              <ol>
                <li className="mb-2">
                  <strong>Explora la estructura:</strong> Familiarízate con la organización de
                  carpetas en <code>src/</code> y la configuración en <code>modern.config.ts</code>.
                </li>
                <li className="mb-2">
                  <strong>Desarrollo de Features:</strong>
                  <ul className="p-mt-1 p-list-none p-pl-2">
                    <li>
                      - Crea nuevas carpetas dentro de <code>src/features/</code> para cada módulo
                      principal de tu aplicación.
                    </li>
                    <li>
                      - Dentro de cada feature, organiza tus componentes, hooks, átomos de Jotai,
                      servicios (llamadas a API con Axios), y estilos SCSS específicos.
                    </li>
                    <li>
                      - Exporta los componentes de página de tu feature y defínelos como rutas en{' '}
                      <code>src/routes/</code>. Modern.js utiliza un sistema de enrutamiento basado
                      en convenciones de archivos. Por ejemplo, un archivo{' '}
                      <code>src/routes/mi-feature/page.tsx</code> se mapeará a la ruta{' '}
                      <code>/mi-feature</code>.
                    </li>
                  </ul>
                </li>
                <li className="mb-2">
                  <strong>Manejo de Estado con Jotai:</strong>
                  <ul className="p-mt-1 p-list-none p-pl-2">
                    <li>- Define átomos para piezas de estado pequeñas y granulares.</li>
                    <li>
                      - Usa <code>atomWithStorage</code> de <code>jotai/utils</code> para persistir
                      estado en localStorage o sessionStorage.
                    </li>
                    <li>
                      - Los átomos pueden ser globales (en <code>src/app/store</code>) o locales a
                      una feature (en <code>src/features/nombreFeature/store</code>).
                    </li>
                  </ul>
                </li>
                <li className="mb-2">
                  <strong>Estilos con SASS y PrimeReact:</strong>
                  <ul className="p-mt-1 p-list-none p-pl-2">
                    <li>- Define tus variables de diseño globales y tokens de marca</li>
                    <li>
                      - Usa <code>src/styles/global.scss</code> para importar tus parciales de SASS
                      y definir estilos globales.
                    </li>
                    <li>
                      - Los temas de PrimeReact se gestionan dinámicamente mediante{' '}
                      <code>ThemeProvider</code>. Tus estilos de marca pueden coexistir y
                      personalizar la apariencia sobre los temas de PrimeReact.
                    </li>
                  </ul>
                </li>
                <li className="mb-2">
                  <strong>Pruebas Automatizadas:</strong>
                  <ul className="p-mt-1 p-list-none p-pl-2">
                    <li>
                      - Escribe pruebas unitarias y de integración para tus componentes y lógica
                      utilizando Jest y React Testing Library. Coloca los archivos de prueba (ej.' '
                      <code>MiComponente.test.tsx</code>) cerca del código que prueban.
                    </li>
                    <li>
                      - Desarrolla pruebas End-to-End (E2E) con Playwright para simular flujos de
                      usuario completos. Los archivos de prueba (<code>.spec.ts</code>) se ubican en{' '}
                      <code>tests/e2e/</code>' ' en la raíz del proyecto.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Consulta la documentación:</strong> Las tecnologías usadas (Modern.js,
                  React, PrimeReact, Jotai, etc.) tienen documentación extensa que te será de gran
                  utilidad.
                </li>
              </ol>
              <Divider />
              <div className="d-flex jc-start ai-center flex-wrap mt-2">
                ' '
                <Button
                  label="Documentación de Modern.js"
                  icon="pi pi-external-link mr-2"
                  className="button-text mr-2 mb-2"
                  onClick={() => window.open('https://modernjs.dev/en/', '_blank')}
                />
                <Button
                  label="Documentación de PrimeReact"
                  icon="pi pi-external-link mr-2"
                  className="button-text mr-2 mb-2"
                  onClick={() => window.open('https://primereact.org/', '_blank')}
                />
                <Button
                  label="Documentación de Jotai"
                  icon="pi pi-external-link mr-2"
                  className="button-text mr-2 mb-2"
                  onClick={() => window.open('https://jotai.org/docs/introduction', '_blank')}
                />
              </div>
            </Card>
          </TabPanel>
          <TabPanel header="Estructura (Scaffolding)">
            <Card title="Organización del Proyecto">
              <p>
                La estructura de directorios está pensada para promover la modularidad y la
                claridad. Los archivos de configuración principales (<code>modern.config.ts</code>,{' '}
                <code>package.json</code>, etc.) se encuentran en la raíz. El código fuente de la
                aplicación reside en la carpeta <code>src/</code>:
              </p>
              <pre
                style={{
                  background: 'var(--surface-b)',
                  padding: '1rem',
                  borderRadius: 'var(--border-radius)',
                  overflowX: 'auto',
                }}
              >
                <code>
                  {`src/
                ├── app/             # Lógica central (providers, store global)
                ├── assets/          # Archivos estáticos (imágenes, fuentes) - considerar 'public/' también
                ├── components/      # Componentes UI globales y reutilizables
                │   └── common/      # Componentes muy genéricos (ej. ThemeSwitcher)
                ├── config/          # Configuraciones específicas de la app (ej. cliente Axios)
                ├── features/        # Módulos principales de la aplicación
                │   └── exampleFeature/ # Estructura interna de una feature (api, components, hooks, store, etc.)
                ├── hooks/           # Hooks de React globales y reutilizables
                ├── lib/             # Clientes configurados (ej. instancia de Axios), adaptadores
                ├── routes/          # Vistas/Páginas y su enrutamiento (convención de Modern.js)
                │   ├── layout.tsx   # Layout global de la aplicación
                │   └── page.tsx     # Página de ejemplo (esta misma)
                ├── services/        # Lógica de negocio global (puede ir en 'lib/' o dentro de features)
                ├── styles/          # Archivos SCSS globales
                │   ├── base/        # Resets, variables base, tipografía
                │   ├── themes/      # Directorio para los CSS de temas de PrimeReact (copiados a public/themes en build)
                │   └── global.scss    # Archivo SCSS principal que importa los demás
                ├── types/           # Definiciones de TypeScript globales
                └── utils/           # Funciones de utilidad globales
                `}
                </code>
              </pre>
              <p className="p-mt-3">
                Se recomienda organizar la lógica de negocio y la interfaz de usuario en
                **features**. Cada feature debe ser lo más autocontenida posible, facilitando su
                desarrollo, prueba y mantenimiento independiente.
              </p>
            </Card>
          </TabPanel>
          <TabPanel header="Rutas Protegidas">
            <Card title="Ejemplo de Ruta Protegida">
              <p>
                Esta plantilla incluye un ejemplo básico de cómo proteger rutas basado en un estado
                de autenticación simulado.
              </p>
              <h5>Flujo:</h5>
              <ol>
                <li>
                  Se utiliza un átomo de Jotai (<code>authTokenAtom</code> en{' '}
                  <code>src/features/authFeature/store/authAtoms.ts</code>) para simular la
                  presencia de un token de autenticación en <code>localStorage</code>.
                </li>
                <li>
                  Un átomo derivado <code>isAuthenticatedAtom</code> determina si el usuario está
                  "autenticado".
                </li>
                <li>
                  Las rutas que requieren autenticación (ej. <code>/protected</code>) están anidadas
                  bajo un layout de ruta protegida (<code>src/routes/protegida/layout.tsx</code> que
                  usa <code>src/features/authFeature/routes/ProtectedRouteLayout.tsx</code>
                  ).
                </li>
                <li>
                  <code>ProtectedRouteLayout</code> verifica el estado de{' '}
                  <code>isAuthenticatedAtom</code>.
                </li>
                <li>
                  Si el usuario no está autenticado, es redirigido a la página <code>/login</code> (
                  <code>src/routes/login/page.tsx</code>).
                </li>
                <li>
                  La página de login permite simular un inicio de sesión, que actualiza el átomo de
                  Jotai y redirige de nuevo a la ruta protegida (o a la que intentó acceder).
                </li>
                <li>
                  En la página de inicio (esta página), puedes usar los botones "Iniciar Sesión
                  (Simulado)" y "Cerrar Sesión (Simulado)" para probar el flujo.
                </li>
              </ol>
              <h5>Consideraciones SSR:</h5>
              <p>
                La protección implementada en este ejemplo se basa principalmente en la lógica del
                lado del cliente que se ejecuta después de la hidratación. En un escenario SSR:
              </p>
              <ul>
                <li>
                  Si un usuario no autenticado accede directamente a una ruta protegida, el servidor
                  (al no tener acceso a <code>localStorage</code>) podría inicialmente renderizar un
                  estado de "cargando" o "acceso denegado" basado en el valor inicial del átomo de
                  Jotai.
                </li>
                <li>
                  La redirección al login ocurrirá en el cliente una vez que JavaScript se cargue y
                  el <code>useEffect</code> en <code>ProtectedRouteLayout</code> se ejecute.
                </li>
                <li>
                  Para una redirección completa en el servidor antes de enviar cualquier HTML al
                  cliente, se requeriría integrar la lógica de autenticación con las capacidades de
                  data loading o middleware del servidor de Modern.js, lo cual es un paso más
                  avanzado.
                </li>
              </ul>
            </Card>
          </TabPanel>
          <TabPanel header="Renderizado (CSR/SSR)">
            <Card title="Estrategias de Renderizado en Modern.js">
              <p>
                Modern.js es flexible y soporta tanto el Renderizado del Lado del Cliente (CSR) como
                el Renderizado del Lado del Servidor (SSR). La elección depende de las necesidades
                de tu proyecto, especialmente en términos de SEO, rendimiento percibido en la carga
                inicial y complejidad.
              </p>

              <h5>Renderizado del Lado del Cliente (CSR - Client-Side Rendering)</h5>
              <p>
                En CSR, el navegador descarga un archivo HTML mínimo junto con los archivos
                JavaScript. React se encarga de renderizar la página directamente en el navegador
                del usuario.
              </p>
              <ul>
                <li>
                  <strong>Pros:</strong> Más simple de configurar inicialmente, ideal para
                  aplicaciones web interactivas (dashboards, herramientas internas) donde el SEO no
                  es la principal preocupación. Buena experiencia de usuario después de la carga
                  inicial.
                </li>
                <li>
                  <strong>Contras:</strong> Puede tener un tiempo de "First Contentful Paint" (FCP)
                  más lento, ya que el contenido no es visible hasta que el JavaScript se carga y
                  ejecuta. Puede ser menos amigable para el SEO si los crawlers no ejecutan
                  JavaScript eficientemente (aunque muchos crawlers modernos lo hacen).
                </li>
                <li>
                  <strong>Configuración en Modern.js:</strong> CSR es a menudo el comportamiento por
                  defecto o se puede forzar deshabilitando SSR. Para una SPA pura (comportamiento
                  CSR):
                  <pre
                    style={{
                      background: 'var(--surface-b)',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--border-radius)',
                      marginTop: '0.5rem',
                    }}
                  >
                    <code>
                      {`// modern.config.ts
                      export default defineConfig({
                        // ...
                        server: {
                          ssr: false, // Deshabilita SSR explícitamente para modo SPA/CSR
                          // o ssr: { mode: 'string' } // para un SSR que solo genera el string HTML
                          // o ssrByEntries: { 'entryName': false } // para deshabilitar por entrada
                        },
                        // ...
                      });`}
                    </code>
                  </pre>
                  Consulta la
                  <a
                    href="https://modernjs.dev/en/guides/basic-features/ssr.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    documentación oficial de SSR en Modern.js
                  </a>
                  para las opciones más actualizadas.
                </li>
              </ul>

              <Divider />

              <h5>Renderizado del Lado del Servidor (SSR - Server-Side Rendering)</h5>
              <p>
                En SSR, el servidor genera el HTML completo de la página solicitada y lo envía al
                navegador. El navegador puede mostrar el contenido rápidamente. Luego, React
                "hidrata" la página, añadiendo la interactividad.
              </p>
              <ul>
                <li>
                  <strong>Pros:</strong> Mejor rendimiento en la carga inicial percibida (FCP más
                  rápido). Significativamente mejor para el SEO, ya que los crawlers reciben
                  contenido HTML completo.
                </li>
                <li>
                  <strong>Contras:</strong> Puede ser más complejo de configurar y mantener.
                  Requiere un entorno Node.js en el servidor para renderizar las páginas. El "Time
                  to Interactive" (TTI) puede ser similar o incluso un poco mayor que en CSR si la
                  hidratación es pesada.
                </li>
                <li>
                  <strong>Configuración en Modern.js:</strong> Modern.js (especialmente con la
                  solución "MWA - Universal App") está bien preparado para SSR.
                  <pre
                    style={{
                      background: 'var(--surface-b)',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--border-radius)',
                      marginTop: '0.5rem',
                    }}
                  >
                    <code>
                      {`// modern.config.ts
                    export default defineConfig({
                      // ...
                      server: {
                        ssr: true, // Habilita SSR (a menudo es el valor por defecto en MWA)
                        // o ssr: { mode: 'stream' } // Para SSR con streaming, mejora el TTFB
                      },
                      // ...
                    });`}
                    </code>
                  </pre>
                  <p className="p-mt-2">
                    Cuando SSR está habilitado, puedes necesitar manejar código que solo se ejecuta
                    en el cliente (ej. acceso a <code>window</code>) con verificaciones como{' '}
                    <code>if (typeof window !== 'undefined')</code> o usando hooks como{' '}
                    <code>useEffect</code>. Modern.js también provee utilidades para el data
                    fetching en el servidor.
                  </p>
                </li>
              </ul>
              <p className="p-mt-3">
                <strong>Nota:</strong> Esta plantilla, al ser generada con la opción MWA (Universal
                App) de Modern.js, probablemente tenga SSR habilitado por defecto. Si buscas un
                comportamiento puramente SPA (CSR), deberás configurarlo como se indica arriba.
              </p>
            </Card>
          </TabPanel>
          <TabPanel header="Ejemplo: Switch de Tema">
            <Card title="Demostración del Switch de Tema Dinámico">
              <p>
                Esta plantilla incluye un ejemplo funcional de cómo cambiar el tema de la aplicación
                (Claro/Oscuro) utilizando PrimeReact para los componentes y Jotai para el manejo del
                estado del tema.
              </p>
              <ol className="p-list-none p-pl-0">
                <li className="mb-2">
                  <strong>Estado del Tema (Jotai):</strong> Se utiliza un átomo de Jotai (
                  <code>src/app/store/themeAtoms.ts</code>) para almacenar la preferencia del tema
                  ('light' o 'dark'). Este estado se persiste en <code>localStorage</code>
                  gracias a la utilidad <code>atomWithStorage</code> de Jotai.
                </li>
                <li className="mb-2">
                  <strong>Proveedor de Tema (ThemeProvider):</strong> El componente{' '}
                  <code>src/app/providers/ThemeProvider.tsx</code> se suscribe a los cambios en el
                  átomo de Jotai. Cuando el tema cambia:
                  <ul className="p-list-none p-ml-3 p-mt-1">
                    <li>
                      - Actualiza dinámicamente el archivo CSS del tema de PrimeReact (ej.,{' '}
                      <code>lara-light-indigo.css</code> o <code>lara-dark-indigo.css</code>)
                      cambiando el atributo <code>href</code> de una etiqueta en el{' '}
                      <code>document.head</code>. Estos archivos CSS de temas deben estar ubicados
                      en la carpeta <code>public/themes/</code>.
                    </li>
                    <li>
                      - Aplica una clase (<code>light-theme</code> o <code>dark-theme</code>) al
                      tag. Esto permite que los estilos SCSS personalizados en{' '}
                      <code>src/styles/global.scss</code> (y tus variables CSS de marca) se adapten
                      al tema seleccionado.
                    </li>
                  </ul>
                </li>
                <li className="mb-2">
                  <strong>Componente Switcher (ThemeSwitcher):</strong> El componente{' '}
                  <code>src/components/common/ThemeSwitcher/ThemeSwitcher.tsx</code>
                  proporciona la interfaz de usuario (un botón) para que el usuario cambie el tema,
                  actualizando el átomo de Jotai.
                </li>
                <li className="mb-2">
                  <strong>Integración:</strong>
                  <ul className="list-none ml-3 mt-1">
                    <li>
                      - El <code>JotaiProvider</code> (de Jotai) y nuestro{' '}
                      <code>ThemeProvider</code> envuelven la aplicación en el layout global (
                      <code>src/routes/layout.tsx</code>) para que el estado y la lógica del tema
                      estén disponibles globalmente.
                    </li>
                    <li>
                      - El <code>ThemeSwitcher</code> se ha colocado en la cabecera de esta página
                      como demostración.
                    </li>
                  </ul>
                </li>
              </ol>
              <p className="p-mt-3">
                ¡Prueba el botón <ThemeSwitcher /> en la esquina superior derecha para ver cómo
                funciona!
              </p>
            </Card>
          </TabPanel>
        </TabView>
      </div>
    </>
  )
}

export default HomePage
