import type { LoaderFunction } from '@modern-js/runtime/router'
import { isServer } from '@/utils/environment'

// --- TIPO DE DATOS DEL LOADER ---
// Este tipo define la estructura de los datos que el loader devolverá al componente.
export interface ServerInfoLoaderData {
  renderedOn: 'server' | 'client'
  timestamp: string
  nodeVersion: string
}

// --- LOADER DEL LADO DEL SERVIDOR ---
export const loader: LoaderFunction = async () => {
  // Aquí puedes realizar cualquier lógica del lado del servidor que necesites.
  // Por ejemplo, podrías consultar una base de datos, llamar a una API, etc
  // En este caso, simplemente estamos devolviendo información del entorno del servidor.
  // Esto es útil para depuración o para mostrar información del servidor en la UI.

  const loaderData: ServerInfoLoaderData = {
    renderedOn: isServer ? 'server' : 'client',
    timestamp: new Date().toUTCString(),
    nodeVersion: isServer ? process.version : 'N/A (SSR deshabilitado)',
  }

  return loaderData
}
