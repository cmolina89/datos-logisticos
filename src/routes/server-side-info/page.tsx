import SEOHead from '@/components/common/SEOHead/SEOHead'
import type { MetaData } from '@/types/globals'
import { Link, useLoaderData } from '@modern-js/runtime/router'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Chip } from 'primereact/chip'
import { Message } from 'primereact/message'
import type React from 'react'
import type { ServerInfoLoaderData } from './page.data'

export const meta = (): MetaData => ({
  title: 'Guía de Renderizado (SSR/CSR) - CoppelFramework',
  description:
    'Explicación detallada de cómo funcionan el SSR y el CSR en el estándar de desarrollo. Guía técnica completa.',
  keywords: 'SSR, CSR, renderizado, servidor, cliente, Modern.js, React',
})

// Componente para explicar SSR
const SsrDocumentation: React.FC<{ data: ServerInfoLoaderData }> = ({ data }) => (
  <>
    <Message
      severity="success"
      className="p-mb-4"
      content={
        <div className="p-d-flex p-ai-center">
          <i className="pi pi-check-circle p-mr-2" style={{ fontSize: '1.5rem' }} />
          <div>
            <div className="p-text-bold">Renderizado del Lado del Servidor (SSR) está ACTIVO</div>
            <div>Esta página fue pre-renderizada en el servidor para una carga inicial óptima.</div>
          </div>
        </div>
      }
    />

    <Card title="Beneficios Clave del SSR para Nuestro Negocio">
      <p>
        La decisión de usar SSR como el modo por defecto en este estándar es estratégica y se centra
        en tres puntos clave:
      </p>
      <ul className="p-list-none p-pl-0">
        <li className="p-d-flex p-ai-start p-mb-3">
          <i
            className="pi pi-users p-mr-3"
            style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}
          />
          <div>
            <strong>Mejor Experiencia para el Cliente Externo:</strong> El contenido se muestra casi
            instantáneamente, eliminando pantallas en blanco y reduciendo la percepción de espera.
            Esto es crucial para la retención y satisfacción de nuestros clientes.
          </div>
        </li>
        <li className="p-d-flex p-ai-start p-mb-3">
          <i
            className="pi pi-search p-mr-3"
            style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}
          />
          <div>
            <strong>Optimización para Motores de Búsqueda (SEO):</strong> Los crawlers de Google
            reciben una página HTML completa y rica en contenido, lo que facilita su indexación y
            mejora nuestro posicionamiento en los resultados de búsqueda, atrayendo a más clientes.
          </div>
        </li>
        <li className="p-d-flex p-ai-start">
          <i
            className="pi pi-sitemap p-mr-3"
            style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}
          />
          <div>
            <strong>Preparación para Microfrontends:</strong> La arquitectura SSR y el uso de
            Modern.js con Module Federation nos permite escalar. Proyectos grandes pueden
            descomponerse en micro-servicios, donde esta misma plantilla sirve como base, asegurando
            consistencia y agilidad.
          </div>
        </li>
      </ul>
    </Card>

    <Card title="¿Cómo Funcionó el Renderizado de esta Página?" className="p-mt-4">
      <p>
        Los datos que ves a continuación fueron generados en el servidor y enviados como parte del
        HTML inicial:
      </p>
      <div className="p-d-flex p-jc-center p-my-3">
        <div
          style={{
            background: 'var(--surface-a)',
            padding: '1rem',
            borderRadius: 'var(--border-radius)',
            display: 'inline-block',
            border: '1px solid var(--surface-d)',
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Renderizado en:</strong> <Chip label={data.renderedOn} className="p-ml-2" />
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Fecha del Servidor (UTC):</strong>{' '}
            <Chip label={data.timestamp} className="p-ml-2" />
          </p>
          <p style={{ margin: 0 }}>
            <strong>Versión de Node.js:</strong>{' '}
            <Chip label={data.nodeVersion} className="p-ml-2" />
          </p>
        </div>
      </div>
      <p>
        Este proceso se logró gracias al archivo{' '}
        <strong>
          <code>page.data.tsx</code>
        </strong>
        , que contiene una función <code>loader</code>. Modern.js ejecuta esta función en el
        servidor antes de renderizar el componente, y los datos devueltos se hacen disponibles a
        través del hook <code>useLoaderData()</code>.
      </p>
    </Card>
  </>
)

// Componente para explicar CSR
const CsrDocumentation: React.FC = () => (
  <>
    <Message
      severity="warn"
      className="p-mb-4"
      content={
        <div className="p-d-flex p-ai-center">
          <i className="pi pi-info-circle p-mr-2" style={{ fontSize: '1.5rem' }} />
          <div>
            <div className="p-text-bold">Renderizado del Lado del Cliente (CSR) está ACTIVO</div>
            <div>La aplicación está funcionando como una Single Page Application (SPA).</div>
          </div>
        </div>
      }
    />

    <Card title="Entendiendo el Modo CSR">
      <p>
        Cuando el SSR está desactivado, la aplicación se comporta como una SPA tradicional. Esto
        significa:
      </p>
      <ol>
        <li>El servidor envía un archivo HTML mínimo, prácticamente vacío.</li>
        <li>El navegador descarga los archivos JavaScript.</li>
        <li>
          React se ejecuta en el navegador para construir la interfaz y obtener los datos
          necesarios.
        </li>
      </ol>
      <p>
        Este modo es ideal para aplicaciones internas o dashboards donde el SEO no es una prioridad
        y el usuario interactuará con la aplicación por largos periodos después de la carga inicial.
      </p>
    </Card>

    <Card title="Cómo Activar el SSR" className="p-mt-4">
      <p>
        Para aprovechar los beneficios de rendimiento y SEO para aplicaciones de cliente externo,
        puedes activar el SSR fácilmente.
      </p>
      <p>
        En el archivo <code>modern.config.ts</code>, simplemente cambia la configuración del
        servidor:
      </p>
      <pre
        style={{
          background: 'var(--surface-b)',
          padding: '1rem',
          borderRadius: 'var(--border-radius)',
        }}
      >
        <code>
          {`export default defineConfig({
  // ...
  server: {
    ssr: true, // Cambia de 'false' a 'true'
  },
  // ...
});`}
        </code>
      </pre>
      <p className="p-mt-3">
        Después de hacer este cambio, recuerda **detener y reiniciar tu servidor de desarrollo**
        (`npm run dev`) para que la nueva configuración tome efecto.
      </p>
    </Card>
  </>
)

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function SsrInfoRoute() {
  const data = useLoaderData() as ServerInfoLoaderData | undefined

  // No usamos `isServer` aquí directamente, porque la presencia de `data`
  // es la forma canónica de saber si el loader de SSR se ejecutó.
  // `data` tendrá valor en el render del servidor y en la hidratación del cliente.
  // `data` será undefined solo en un flujo puramente CSR.

  return (
    <>
      <SEOHead
        title="Guía de Renderizado (SSR/CSR) - CoppelFramework"
        description="Explicación detallada de cómo funcionan el SSR y el CSR en el estándar de desarrollo. Guía técnica completa para desarrolladores."
        keywords="SSR, CSR, renderizado, servidor, cliente, Modern.js, React, desarrollo web"
        url="https://coppelframework.com/server-side-info"
      />
      <div
        className="container"
        style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          minHeight: '100%',
        }}
      >
        <nav aria-label="Navegación de regreso">
          <Link to="/" className="">
            <Button
              label="Regresar a Home"
              icon="pi pi-list"
              aria-label="Regresar a la página principal"
            />
          </Link>
        </nav>
        <main>
          {data?.renderedOn === 'server' ? <SsrDocumentation data={data} /> : <CsrDocumentation />}
        </main>
      </div>
    </>
  )
}
