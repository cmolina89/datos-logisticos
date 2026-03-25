/**
 * API de Datos Logísticos
 *
 * Origen de datos de la tabla CEDIS.
 * Para integrar el servicio REST real, reemplazar la implementación de getFilasCedis
 * por una llamada fetch/axios al endpoint correspondiente.
 */

import type { FilaCedis } from '../types'

// Mock: simula respuesta REST - cambiar por fetch real al integrar
import filasCedisMock from './mocks/filasCedisMock.json'

/** Simula latencia de red (ms) */
const MOCK_DELAY_MS = 400

/**
 * Obtiene las filas CEDIS (tabla de configuración logística).
 *
 * MOCK: simula petición REST con JSON estático.
 * REAL: reemplazar por:
 *   return fetch('/api/datos-logisticos/cedis').then(r => r.json())
 *   o axios.get('/api/datos-logisticos/cedis').then(r => r.data)
 */
export async function getFilasCedis(): Promise<FilaCedis[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS))
  return filasCedisMock as FilaCedis[]
}
