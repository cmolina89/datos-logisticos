/**
 * Cliente para PS_SAP_PSUM_SUPPLIERCONTRACTS
 *
 * Base: /ps/sourcing-procurement/supplier-management/supplier-contracts
 *
 * Endpoints usados en este front:
 *   GET /api/v2/suppliers/{supplierId}/schemas?schemaTypeCode=LOGISTIC  → catálogo del dropdown "Tipo de esquema"
 *   GET /api/v2/suppliers/{supplierId}/logistics-agreements?schemaId=   → matriz CEDIS (tabla HU 038/039)
 */

import type { FilaCedis } from '../types'
import { fetchWithRetry } from '@/lib/fetchWithRetry'
import { getRuntimeEnv } from '@/lib/api/runtimeEnv'
import { readSafeJson } from '@/lib/api/safeJsonResponse'

const DEFAULT_BASE = '/ps/sourcing-procurement/supplier-management/supplier-contracts/api/v2'

const BASE =
  getRuntimeEnv('MODERN_APP_PS_SAP_SUPM_SUPPLIER_CONTRACTS_BASE') ||
  getRuntimeEnv('MODERN_APP_SUPPLIER_CONTRACTS_BASE') ||
  DEFAULT_BASE

// ─── Tipos del OAS ────────────────────────────────────────────────────────────

export interface LogisticsSchema {
  id: string
  supplierId: string
  typeCode: string
  name: string
  createdAt?: string
  updatedAt?: string
}

interface LogisticsSchemaRaw {
  id?: string
  _id?: string
  schemaId?: string
  supplierId?: string
  supplier_id?: string
  typeCode?: string
  schemaTypeCode?: string
  name?: string
  schemaName?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

interface SupplierDeliveryRoute {
  destinationWarehouseNumber: number
  destinationWarehouseCode: string
  destinationWarehouseName: string
}

/**
 * OAS ps-sap-supm-SupplierContracts v1 — SupplierLogisticsAgreementData
 * Campo receptor: isRecievingWarehouse (typo oficial) → integer 1|0
 */
interface SupplierLogisticsAgreementItem {
  _id: string
  schemaId: string
  supplierId: string
  /** Número de bodega (ej. 30001) */
  warehouseNumber: number
  /** Código de bodega (ej. "CLCN") */
  warehouseCode: string
  /** Nombre de bodega (ej. "CULIACAN") */
  warehouseName: string
  /** Typo oficial en OAS: integer 1 = receptora, 0 = no */
  isRecievingWarehouse: number
  purchaseOrderLeadTime: number
  /** Días de frecuencia — float en SupplierContracts, integer en ProductDrafts */
  purchaseOrderFrequencyDayCount: number
  deliveryRoutes: SupplierDeliveryRoute[]
}

interface ApiResponse<T> {
  data?: T
  meta?: unknown
}

function normalizeListResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]

  if (payload && typeof payload === 'object') {
    const source = payload as {
      result?: unknown
      items?: unknown
      rows?: unknown
      data?: unknown
    }

    const candidates = [source.result, source.items, source.rows, source.data]
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[]
    }
  }

  return []
}

function mapRawSchema(raw: LogisticsSchemaRaw): LogisticsSchema | null {
  const id = raw.id || raw._id || raw.schemaId || ''
  const name = raw.name || raw.schemaName || raw.description || ''

  if (!id || !name) return null

  return {
    id,
    supplierId: raw.supplierId || raw.supplier_id || '',
    typeCode: raw.typeCode || raw.schemaTypeCode || 'LOGISTIC',
    name,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

// ─── Helper fetch ─────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  const json = await readSafeJson<ApiResponse<T>>(res, 'SupplierContracts', url)
  return (json.data ?? json) as T
}

// ─── Mapper SupplierLogisticsAgreementItem → FilaCedis ────────────────────────

/**
 * isRecievingWarehouse es integer (1|0) según OAS ps-sap-supm-SupplierContracts.
 * Se mantiene tolerancia a boolean por si otros endpoints del mismo API devuelven variante.
 */
function parseReceivingWarehouse(item: SupplierLogisticsAgreementItem): boolean {
  const rawValue: number | boolean | undefined = item.isRecievingWarehouse

  if (typeof rawValue === 'boolean') return rawValue
  if (typeof rawValue === 'number') return rawValue === 1
  return false
}

function mapAgreementToFilaCedis(item: SupplierLogisticsAgreementItem): FilaCedis {
  const cedisDestino = (item.deliveryRoutes ?? [])
    .map(r => r.destinationWarehouseCode)
    .filter(Boolean)
    .join(', ')

  return {
    id: item.warehouseCode || item._id,
    receptor: parseReceivingWarehouse(item),
    /** Usar solo warehouseName para coincidir con LogisticsWarehouse.name de ProductDrafts */
    cedis: item.warehouseName || item.warehouseCode,
    frecuencia: String(item.purchaseOrderFrequencyDayCount ?? ''),
    leadTime: String(item.purchaseOrderLeadTime ?? ''),
    cedisDestino,
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Obtiene los esquemas logísticos del proveedor.
 * Usado para poblar el dropdown "Tipo de esquema(s) de distribución".
 *
 * GET /api/v2/suppliers/{supplierId}/schemas?schemaTypeCode=LOGISTIC
 */
export async function getLogisticsSchemas(supplierId: string): Promise<LogisticsSchema[]> {
  const data = await fetchJson<LogisticsSchema[]>(
    `${BASE}/suppliers/${encodeURIComponent(supplierId)}/schemas?schemaTypeCode=LOGISTIC`
  )

  return normalizeListResponse<LogisticsSchemaRaw>(data)
    .map(mapRawSchema)
    .filter((item): item is LogisticsSchema => item !== null)
}

/**
 * Obtiene las filas de la tabla CEDIS para el esquema seleccionado.
 * Usado para rellenar la tabla de "Configuración logística".
 *
 * GET /api/v2/suppliers/{supplierId}/logistics-agreements?schemaId={schemaId}
 */
export async function getFilasCedisBySchema(
  supplierId: string,
  schemaId: string
): Promise<FilaCedis[]> {
  const url = `${BASE}/suppliers/${encodeURIComponent(supplierId)}/logistics-agreements?schemaId=${encodeURIComponent(schemaId)}`
  const data = await fetchJson<SupplierLogisticsAgreementItem[]>(url)
  const items = normalizeListResponse<SupplierLogisticsAgreementItem>(data)
  return items.map(mapAgreementToFilaCedis)
}
