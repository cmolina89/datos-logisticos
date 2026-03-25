/**
 * Servicio de opciones para selects/dropdowns (Datos logísticos y empaque).
 *
 * Origen actual: JSON mock estático.
 * Para usar base de datos o REST, reemplazar las implementaciones por:
 *   - fetch('/api/opciones/esquema-distribucion').then(r => r.json())
 *   - o el cliente HTTP que use el proyecto (axios, etc.)
 *
 * Formato: cada opción tiene value y labelKey (clave i18n).
 * El componente resuelve el label con t(labelKey). Si el backend devuelve "label"
 * en lugar de "labelKey", el componente puede usar label directamente.
 */

export interface OpcionSelect {
  value: string
  /** Clave i18n para el label; si viene de REST puede ser "label" con texto ya traducido */
  labelKey?: string
  label?: string
}

// Mocks estáticos (sustituibles por fetch)
import opcionesEsquemaDistribucionJson from './mocks/opcionesEsquemaDistribucion.json'
import opcionesUnidadPesoJson from './mocks/opcionesUnidadPeso.json'
import opcionesUnidadMedidaJson from './mocks/opcionesUnidadMedidaDimensiones.json'
import opcionesOrientacionJson from './mocks/opcionesOrientacion.json'
import opcionesCualAplicaJson from './mocks/opcionesCualAplicaEmpaque.json'

const asOpciones = (data: unknown): OpcionSelect[] =>
  Array.isArray(data) ? (data as OpcionSelect[]) : []

/**
 * Opciones para el dropdown "Tipo de esquema(s) de distribución".
 * REST: GET /api/opciones/esquema-distribucion (o similar)
 */
export function getOpcionesEsquemaDistribucion(): Promise<OpcionSelect[]> {
  return Promise.resolve(asOpciones(opcionesEsquemaDistribucionJson))
}

/**
 * Opciones para unidad de peso (KG, LB, G).
 * REST: GET /api/opciones/unidad-peso
 */
export function getOpcionesUnidadPeso(): Promise<OpcionSelect[]> {
  return Promise.resolve(asOpciones(opcionesUnidadPesoJson))
}

/**
 * Opciones para unidad de medida - dimensiones (cm, m, in).
 * REST: GET /api/opciones/unidad-medida-dimensiones
 */
export function getOpcionesUnidadMedidaDimensiones(): Promise<OpcionSelect[]> {
  return Promise.resolve(asOpciones(opcionesUnidadMedidaJson))
}

/**
 * Opciones para orientación del producto (Vertical, Horizontal, Indistinta).
 * REST: GET /api/opciones/orientacion
 */
export function getOpcionesOrientacion(): Promise<OpcionSelect[]> {
  return Promise.resolve(asOpciones(opcionesOrientacionJson))
}

/**
 * Opciones "¿Cuál aplica?" empaques (Cartón master, Bulto, Ninguno).
 * REST: GET /api/opciones/cual-aplica-empaque
 */
export function getOpcionesCualAplicaEmpaque(): Promise<OpcionSelect[]> {
  return Promise.resolve(asOpciones(opcionesCualAplicaJson))
}
