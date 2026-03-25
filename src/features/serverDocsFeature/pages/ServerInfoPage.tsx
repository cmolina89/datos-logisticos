import { Card } from 'primereact/card'
import { Divider } from 'primereact/divider'
import { Message } from 'primereact/message'
import type React from 'react'
import './ServerInfoPage.scss'

// El componente ahora espera recibir los datos del loader como props.
export interface ServerInfoPageProps {
  loaderData?: {
    isSsrEnabled: boolean
    serverTimestamp: string
    nodeVersion: string
  }
}

const ServerInfoPage: React.FC<ServerInfoPageProps> = ({ loaderData }) => {
  // La lógica se basa completamente en las props recibidas.
  // Si no hay loaderData o isSsrEnabled es false, significa que estamos en modo CSR.
  if (!loaderData?.isSsrEnabled) {
    return (
      <div className="server-info-page container">
        <Card title="Renderizado del Lado del Servidor (SSR) Desactivado">
          <Message
            severity="warn"
            text="Esta página está diseñada para demostrar las capacidades de SSR."
          />
          <p className="p-mt-3">
            Actualmente, la aplicación está funcionando en modo de Renderizado del Lado del Cliente
            (CSR). En este modo, el `loader` de datos del servidor no se ejecuta.
          </p>
          <p>
            Para ver el contenido generado por el servidor, habilita SSR en el archivo{' '}
            <code>modern.config.ts</code> y reinicia el servidor de desarrollo:
          </p>
          <pre>
            <code>
              {`// modern.config.ts
export default defineConfig({
  // ...
  server: {
    ssr: true,
  },
  // ...
});`}
            </code>
          </pre>
        </Card>
      </div>
    )
  }

  // Si llegamos aquí, es porque SSR está activado y el loader pasó los datos.
  return (
    <div className="server-info-page container">
      <header>
        <h1>
          <i className="pi pi-server p-mr-2" />
          Información Renderizada en el Servidor
        </h1>
        <p>
          Esta página fue generada completamente en el servidor Node.js antes de ser enviada a tu
          navegador.
        </p>
        <div className="server-data-chip">
          <span>Renderizado el: {loaderData.serverTimestamp}</span>
          <span>Versión de Node.js: {loaderData.nodeVersion}</span>
        </div>
      </header>

      <Divider />

      <Card title="¿Cómo Funciona el SSR en esta Plantilla?">
        <p>
          Cuando solicitaste esta URL, ocurrió lo siguiente antes de que vieras nada en pantalla:
        </p>
        <ol>
          <li>
            El servidor de Node.js (gestionado por Modern.js) recibió la petición para{' '}
            <code>/server-side-info</code>.
          </li>
          <li>
            Modern.js identificó que esta ruta tiene una función{' '}
            <strong>
              <code>loader</code>
            </strong>{' '}
            exportada.
          </li>
          <li>
            El servidor ejecutó la función <code>loader</code>, obteniendo la fecha/hora actual del
            servidor y la versión de Node.js.
          </li>
          <li>
            El servidor renderizó el componente de la ruta (<code>ServerSideInfoRoute</code>), que
            llamó a <code>useLoaderData()</code> para obtener los datos.
          </li>
          <li>
            Los datos se pasaron como <strong>props</strong> al componente de presentación que estás
            viendo ahora (<code>ServerInfoPage</code>).
          </li>
          <li>
            El servidor también ejecutó la función <code>meta</code> para generar las etiquetas de
            SEO en el{' '}
            <code>
              <head />
            </code>
            .
          </li>
          <li>
            Finalmente, el servidor envió el documento HTML completo y pre-renderizado a tu
            navegador.
          </li>
        </ol>
      </Card>

      <Card title="Ventajas del SSR" className="p-mt-4">
        <ul>
          <li>
            <strong>Mejor SEO:</strong> Los motores de búsqueda reciben contenido HTML completo,
            facilitando la indexación.
          </li>
          <li>
            <strong>Rendimiento Percibido:</strong> Los usuarios ven el contenido significativo más
            rápido (mejor First Contentful Paint - FCP).
          </li>
          <li>
            <strong>Data Fetching Centralizado:</strong> La lógica para obtener los datos iniciales
            de una página vive en el servidor, dentro del `loader`, manteniendo los componentes de
            UI más limpios.
          </li>
        </ul>
      </Card>
    </div>
  )
}

export default ServerInfoPage
