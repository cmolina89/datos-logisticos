/**
 * Servicio de opciones para selects/dropdowns (Datos logísticos y empaque).
 *
 * Origen de datos por tipo:
 *   - Tipo de esquema de distribución  → PS_SAP_PSUM_SUPPLIERCONTRACTS (dinámico por proveedor)
 *   - Unidad de peso / medida / etc.   → Application Configs con fallback local
 */

import { getLogisticsSchemas } from './supplierContractsApi'
import { getApplicationConfigValue } from '@/services/applicationConfigService'

export interface OpcionSelect {
  value: string
  /** Clave i18n, o label directo cuando viene del backend */
  labelKey?: string
  label?: string
}

const CODIGO_CFG_UNIDAD_PESO =
  (typeof process !== 'undefined' && process.env && process.env.MODERN_APP_CFG_UNIDAD_PESO_CODE) ||
  'LOGISTICS_WEIGHT_UNITS'

const CODIGO_CFG_UNIDAD_MEDIDA =
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.MODERN_APP_CFG_UNIDAD_MEDIDA_CODE) ||
  'LOGISTICS_SIZE_UNITS'

const CODIGO_CFG_ORIENTACION =
  (typeof process !== 'undefined' && process.env && process.env.MODERN_APP_CFG_ORIENTACION_CODE) ||
  'LOGISTICS_ORIENTATION_OPTIONS'

const CODIGO_CFG_CUAL_APLICA =
  (typeof process !== 'undefined' && process.env && process.env.MODERN_APP_CFG_CUAL_APLICA_CODE) ||
  'LOGISTICS_PACKAGE_TYPE_OPTIONS'

const FALLBACK_OPTIONS: Record<string, OpcionSelect[]> = {
  [CODIGO_CFG_UNIDAD_PESO]: [
    { value: 'KG', label: 'Kilogramo' },
    { value: 'LB', label: 'Libra' },
    { value: 'G', label: 'Gramo' },
  ],
  [CODIGO_CFG_UNIDAD_MEDIDA]: [
    { value: 'CM', label: 'Centimetro' },
    { value: 'M', label: 'Metro' },
    { value: 'IN', label: 'Pulgada' },
  ],
  [CODIGO_CFG_ORIENTACION]: [
    { value: 'VERTICAL', label: 'Vertical' },
    { value: 'HORIZONTAL', label: 'Horizontal' },
    { value: 'INDISTINTA', label: 'Indistinta' },
  ],
  [CODIGO_CFG_CUAL_APLICA]: [
    { value: 'CARTON_MASTER', label: 'Carton master' },
    { value: 'BULTO', label: 'Bulto' },
    { value: 'NINGUNO', label: 'Ninguno' },
  ],
}

function mapOptionItem(raw: unknown): OpcionSelect | null {
  if (!raw || typeof raw !== 'object') return null

  const item = raw as {
    value?: unknown
    code?: unknown
    id?: unknown
    label?: unknown
    name?: unknown
    labelKey?: unknown
  }

  const valueCandidate = item.value ?? item.code ?? item.id
  const labelCandidate = item.label ?? item.name

  if (typeof valueCandidate !== 'string') return null

  const opcion: OpcionSelect = { value: valueCandidate }
  if (typeof labelCandidate === 'string') opcion.label = labelCandidate
  if (typeof item.labelKey === 'string') opcion.labelKey = item.labelKey

  return opcion
}

function mapOptions(rawOptions: unknown): OpcionSelect[] {
  if (!Array.isArray(rawOptions)) return []

  return rawOptions.map(mapOptionItem).filter((item): item is OpcionSelect => item !== null)
}

function extractOptionsFromConfig(rawConfig: unknown): OpcionSelect[] {
  const mapArrayCandidate = (candidate: unknown): OpcionSelect[] => {
    if (!Array.isArray(candidate)) return []

    if (candidate.every(item => typeof item === 'string')) {
      return (candidate as string[]).map(value => ({ value, label: value }))
    }

    return mapOptions(candidate)
  }

  if (Array.isArray(rawConfig)) {
    return mapArrayCandidate(rawConfig)
  }

  if (rawConfig && typeof rawConfig === 'object') {
    const config = rawConfig as {
      options?: unknown
      result?: unknown
      data?: unknown
      value?: unknown
    }

    const candidates = [config.options, config.result, config.data, config.value]
    for (const candidate of candidates) {
      const mapped = mapArrayCandidate(candidate)
      if (mapped.length > 0) return mapped
    }

    return []
  }

  return []
}

async function getOpcionesFromConfig(code: string): Promise<OpcionSelect[]> {
  try {
    const rawConfig = await getApplicationConfigValue(code)
    const options = extractOptionsFromConfig(rawConfig)

    if (options.length > 0) return options

    return FALLBACK_OPTIONS[code] ?? []
  } catch (error) {
    return FALLBACK_OPTIONS[code] ?? []
  }
}

// ─── Opciones dinámicas ───────────────────────────────────────────────────────

/**
 * Obtiene los esquemas logísticos del proveedor desde SupplierContracts.
 * Requiere el supplierId del proveedor activo.
 *
 * GET /ps/sourcing-procurement/supplier-management/supplier-contracts/api/v2/suppliers/{supplierId}/schemas?schemaTypeCode=LOGISTIC
 */
export async function getOpcionesEsquemaDistribucion(supplierId: string): Promise<OpcionSelect[]> {
  const schemas = await getLogisticsSchemas(supplierId)
  return schemas.map(s => ({ value: s.id, label: s.name }))
}

// ─── Catálogos estáticos exportados ──────────────────────────────────────────

/**
 * Opciones para unidad de peso (KG, LB, G).
 */
export function getOpcionesUnidadPeso(): Promise<OpcionSelect[]> {
  return getOpcionesFromConfig(CODIGO_CFG_UNIDAD_PESO)
}

/**
 * Opciones para unidad de medida - dimensiones (cm, m, in).
 */
export function getOpcionesUnidadMedidaDimensiones(): Promise<OpcionSelect[]> {
  return getOpcionesFromConfig(CODIGO_CFG_UNIDAD_MEDIDA)
}

/**
 * Opciones para orientación del producto (Vertical, Horizontal, Indistinta).
 */
export function getOpcionesOrientacion(): Promise<OpcionSelect[]> {
  return getOpcionesFromConfig(CODIGO_CFG_ORIENTACION)
}

/**
 * Opciones "¿Cuál aplica?" empaques (Cartón master, Bulto, Ninguno).
 */
export function getOpcionesCualAplicaEmpaque(): Promise<OpcionSelect[]> {
  return getOpcionesFromConfig(CODIGO_CFG_CUAL_APLICA)
}
