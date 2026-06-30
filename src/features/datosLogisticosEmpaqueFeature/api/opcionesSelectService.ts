/**
 * Servicio de opciones para selects/dropdowns (Datos logísticos y empaque).
 *
 * Origen de datos por tipo:
 *   - Tipo de esquema de distribución  → PS_SAP_PSUM_SUPPLIERCONTRACTS (dinámico por proveedor)
 *   - Unidad de peso / medida / etc.   → datos estáticos (ApplicationConfigs no expone catálogos simples)
 */

import { getLogisticsSchemas } from './supplierContractsApi'

export interface OpcionSelect {
  value: string
  /** Clave i18n, o label directo cuando viene del backend */
  labelKey?: string
  label?: string
}

// ─── Catálogos estáticos ──────────────────────────────────────────────────────
// ApplicationConfigs no expone endpoints para estos catálogos simples.
// Si en el futuro se agrega un endpoint, reemplazar Promise.resolve() por fetch().

const OPCIONES_UNIDAD_PESO: OpcionSelect[] = [
  { value: 'KG', labelKey: 'datosLogisticos.options.kg' },
  { value: 'LB', labelKey: 'datosLogisticos.options.lb' },
  { value: 'GR', label: 'GR' },
  { value: 'OZ', label: 'OZ' },
]

const OPCIONES_UNIDAD_MEDIDA: OpcionSelect[] = [
  { value: 'cm', label: 'CM' },
  { value: 'mm', label: 'MM' },
  { value: 'm',  label: 'M' },
  { value: 'ft', label: 'FT' },
  { value: 'in', label: 'IN' },
]

const OPCIONES_ORIENTACION: OpcionSelect[] = [
  { value: 'VERTICAL',   label: 'Vertical' },
  { value: 'HORIZONTAL', label: 'Horizontal' },
  { value: 'FLEXIBLE',   label: 'Flexible' },
]

const OPCIONES_CUAL_APLICA: OpcionSelect[] = [
  { value: 'carton_master', labelKey: 'datosLogisticos.options.cartonMaster' },
  { value: 'bulto',         labelKey: 'datosLogisticos.options.bulto' },
  { value: 'ninguno',       labelKey: 'datosLogisticos.options.ninguno' },
]

// ─── Opciones dinámicas ───────────────────────────────────────────────────────

/**
 * Obtiene los esquemas logísticos del proveedor desde SupplierContracts.
 * Requiere el supplierId del proveedor activo.
 *
 * GET /ps/sourcing-procurement/supplier-management/supplier-contracts/api/v2/suppliers/{supplierId}/schemas?schemaTypeCode=LOGISTIC
 */
export async function getOpcionesEsquemaDistribucion(
  supplierId: string,
): Promise<OpcionSelect[]> {
  const schemas = await getLogisticsSchemas(supplierId)
  return schemas.map((s) => ({ value: s.id, label: s.name }))
}

// ─── Catálogos estáticos exportados ──────────────────────────────────────────

/**
 * Opciones para unidad de peso (KG, LB, G).
 */
export function getOpcionesUnidadPeso(): Promise<OpcionSelect[]> {
  return Promise.resolve(OPCIONES_UNIDAD_PESO)
}

/**
 * Opciones para unidad de medida - dimensiones (cm, m, in).
 */
export function getOpcionesUnidadMedidaDimensiones(): Promise<OpcionSelect[]> {
  return Promise.resolve(OPCIONES_UNIDAD_MEDIDA)
}

/**
 * Opciones para orientación del producto (Vertical, Horizontal, Indistinta).
 */
export function getOpcionesOrientacion(): Promise<OpcionSelect[]> {
  return Promise.resolve(OPCIONES_ORIENTACION)
}

/**
 * Opciones "¿Cuál aplica?" empaques (Cartón master, Bulto, Ninguno).
 */
export function getOpcionesCualAplicaEmpaque(): Promise<OpcionSelect[]> {
  return Promise.resolve(OPCIONES_CUAL_APLICA)
}
