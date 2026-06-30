/**
 * Cliente ligero para ps-sap-supm-SupplierItemMasterData.
 *
 * Se usa como catálogo auxiliar para empaque y manejo.
 */

import { fetchWithRetry } from '@/lib/fetchWithRetry'

export interface ContainerType {
  id: string
  code: string
  name: string
  description?: string
  usageType?: string
  createdAt?: string
  updatedAt?: string
}

export interface SupplierItemSummary {
  id: string
  supplierItemId?: string
  supplierId?: number
  itemNumber?: string
  glnNumber?: number
  originTypeCode?: string
  countryCode?: string
  isImportedBySupplier?: boolean
  factoryId?: string
  buyerId?: number
  createdAt?: string
  updatedAt?: string
}

export interface SupplierItemReceivingUnit {
  id: string
  itemNumber?: string
  supplierItemId?: string
  supplierId?: number
  containerTypeCode?: string
  description?: string
  unitsCount?: number
  multiple?: number
  sizeUnitOfMeasureCode?: string
  weightUnitOfMeasureCode?: string
  weight?: number
  depth?: number
  height?: number
  width?: number
  createdAt?: string
  updatedAt?: string
}

export interface LeadTimesData {
  sku?: number
  transitTime?: number
  productionLeadTime?: number
  supplyLeadTime?: number
}

export interface ItemPackSize {
  sku?: string
  cartonPack?: number
  itemSizes?: {
    sizeCode?: string
    packSizes?: {
      internalSizeCode?: string
      borderSizeCode?: string
    }
  }
}

interface ApiResponse<T> {
  meta?: unknown
  data?: T
}

const DEFAULT_BASE = '/ds/supplier-item-master-data/api'

const BASE =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.MODERN_APP_SUPPLIER_ITEM_MASTER_DATA_BASE ||
      process.env.MODERN_APP_URL_SUPPLIERITEMMASTERDATA_PS ||
      process.env.MODERN_APP_PS_SAP_SUPM_SUPPLIER_ITEM_MASTER_DATA_BASE ||
      process.env.MODERN_APP_DS_SAP_SUPM_SUPPLIER_ITEM_MASTER_DATA_BASE)) ||
  DEFAULT_BASE

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`SupplierItemMasterData ${response.status}: ${url}`)
  }

  const contentType = response.headers.get('content-type') || ''
  const raw = await response.text()

  if (raw.trim().startsWith('<!DOCTYPE') || raw.trim().startsWith('<html')) {
    throw new Error(`SupplierItemMasterData invalid JSON response (HTML): ${url}`)
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `SupplierItemMasterData unexpected content-type (${contentType || 'unknown'}): ${url}`
    )
  }

  let json: ApiResponse<T>
  try {
    json = JSON.parse(raw) as ApiResponse<T>
  } catch {
    throw new Error(`SupplierItemMasterData invalid JSON payload: ${url}`)
  }

  return (json.data ?? json) as T
}

export async function getContainerTypes(usageType?: string): Promise<ContainerType[]> {
  const query = usageType ? `?usageType=${encodeURIComponent(usageType)}` : ''
  const data = await fetchJson<ContainerType[]>(`${BASE}/v1/container-types${query}`)
  return Array.isArray(data) ? data : []
}

function normalizeListResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]

  if (payload && typeof payload === 'object' && 'result' in payload) {
    const result = (payload as { result?: unknown }).result
    return Array.isArray(result) ? (result as T[]) : []
  }

  return []
}

function normalizeObjectResponse<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== 'object') return null

  if ('result' in payload) {
    const result = (payload as { result?: unknown }).result
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      return result as T
    }
    return null
  }

  return payload as T
}

export async function getSupplierItemById(
  supplierItemId: string
): Promise<SupplierItemSummary | null> {
  const item = await fetchJson<SupplierItemSummary>(
    `${BASE}/v1/supplier-items/${encodeURIComponent(supplierItemId)}`
  )
  return item ?? null
}

export async function findSupplierItems(params: {
  supplierId?: string
  itemNumber?: string
  limit?: number
}): Promise<SupplierItemSummary[]> {
  const search = new URLSearchParams()
  if (params.limit) search.set('limit', String(params.limit))
  if (params.supplierId) search.set('supplierId', params.supplierId)
  if (params.itemNumber) search.set('itemNumber', params.itemNumber)

  const query = search.toString()
  const payload = await fetchJson<{ result?: SupplierItemSummary[] } | SupplierItemSummary[]>(
    `${BASE}/v1/supplier-items${query ? `?${query}` : ''}`
  )

  return normalizeListResponse<SupplierItemSummary>(payload)
}

export async function getReceivingUnitsBySupplierItemId(
  supplierItemId: string
): Promise<SupplierItemReceivingUnit[]> {
  const payload = await fetchJson<
    { result?: SupplierItemReceivingUnit[] } | SupplierItemReceivingUnit[]
  >(`${BASE}/v1/supplier-items/${encodeURIComponent(supplierItemId)}/receiving-units`)

  return normalizeListResponse<SupplierItemReceivingUnit>(payload)
}

export async function getItemPackSizes(
  supplierId: string,
  itemSku: string,
  areaTypeCode: string
): Promise<ItemPackSize[]> {
  const url = `${BASE}/v1/${encodeURIComponent(supplierId)}/items/${encodeURIComponent(itemSku)}/pack-sizes?areaTypeCode=${encodeURIComponent(areaTypeCode)}`
  const payload = await fetchJson<{ result?: ItemPackSize[] } | ItemPackSize[]>(url)
  return normalizeListResponse<ItemPackSize>(payload)
}

export async function getLeadTimes(
  supplierId: string,
  itemSku: string,
  areaTypeCode: string
): Promise<LeadTimesData | null> {
  const url = `${BASE}/v1/supplier/${encodeURIComponent(supplierId)}/items/${encodeURIComponent(itemSku)}/lead-times?areaTypeCode=${encodeURIComponent(areaTypeCode)}`
  const payload = await fetchJson<{ result?: LeadTimesData } | LeadTimesData>(url)
  return normalizeObjectResponse<LeadTimesData>(payload)
}
