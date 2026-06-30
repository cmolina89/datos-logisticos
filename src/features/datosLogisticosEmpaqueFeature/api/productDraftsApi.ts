/**
 * Cliente para PS_SGC_PRODUCTDRAFTS
 *
 * Base: /ps/v1/product-drafts
 *
 * Endpoints usados en este front:
 *   GET   /v1/product-drafts/?prospectiveFolio={folio}&cards={...}  → leer tarjetas
 *   PATCH /v1/product-drafts/?prospectiveFolio={folio}              → guardar parcial
 *
 * Nodos manejados:
 *   logistics_data          → Tarjeta 1 Datos logísticos
 *   individual_package      → Tarjeta 2 Medidas con empaque individual
 *   product_package         → Tarjeta 3 Empaques del producto
 *   delivery_and_manipulation → Tarjeta 4 Entrega y manipulación
 */

import type {
  DatosLogisticos,
  FilaCedis,
  MedidasEmpaqueIndividual,
  EmpaquesProducto,
  EntregaManipulacion,
  CualAplicaEmpaque,
} from '../types'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

const DEFAULT_BASE = '/ps/product-drafts/api'

const BASE =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.MODERN_APP_PS_SGC_PRODUCTDRAFTS || process.env.MODERN_APP_PRODUCT_DRAFTS_BASE)) ||
  DEFAULT_BASE

// ─── Tipos OAS (nodos del draft) ──────────────────────────────────────────────

interface DraftDeliveryRoute {
  destination_warehouse_number?: number
  destination_warehouse_code: string
  destination_warehouse_name: string
}

interface DraftWarehouse {
  number?: number
  code: string
  name: string
  is_receiving: boolean
  purchase_order_lead_time: number
  purchase_order_frequence_day_count: number
  delivery_routes: DraftDeliveryRoute[]
}

interface DraftLogisticsData {
  schema_id?: string
  warehouses?: DraftWarehouse[]
}

interface DraftIndividualPackage {
  apply_individual_package?: boolean
  weight_unit_of_measure_code?: string
  weight?: number | null
  size_unit_of_measure_code?: string
  height?: number | null
  width?: number | null
  depth?: number | null
  stacking_limit?: number | null
}

interface DraftProductPackage {
  type_code?: string
  units_count?: number | null
  master_carton_multiple?: number | null
  weight_unit_of_measure_code?: string
  weight?: number | null
  size_unit_of_measure_code?: string
  height?: number | null
  width?: number | null
  depth?: number | null
}

interface DraftDeliveryAndManipulation {
  is_pallet_delivered?: boolean | null
  size_unit_of_measure_code?: string
  pallet_height?: number | null
  pallet_width?: number | null
  is_orientation_flexible?: boolean | null
  orientation_code?: string
}

/**
 * OAS ps-sgc-ProductDrafts — ProductDraftHeaderInfo.
 * Permite obtener supplier_id del borrador sin depender de query params del host.
 */
interface DraftHeaderInfo {
  supplier_id?: string
  supplier_legal_name?: string
  is_consignment?: string
}

interface DraftDataNode {
  header_info?: DraftHeaderInfo
  logistics_data?: DraftLogisticsData
  individual_package?: DraftIndividualPackage
  product_package?: DraftProductPackage
  delivery_and_manipulation?: DraftDeliveryAndManipulation
}

interface DraftResponse {
  data?: DraftDataNode
  meta?: unknown
}

const draftLogisticsCache = new Map<string, DraftLogisticsData>()

// ─── Helpers HTTP ──────────────────────────────────────────────────────────────

async function fetchDraftNode(prospectiveFolio: string, cards: string): Promise<DraftDataNode> {
  const url = `${BASE}/v1/product-drafts/?prospectiveFolio=${encodeURIComponent(prospectiveFolio)}&cards=${encodeURIComponent(cards)}`
  const res = await fetchWithRetry(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`ProductDrafts GET ${res.status}`)
  }

  const json = (await res.json()) as DraftResponse
  return json.data ?? {}
}

async function patchDraft(prospectiveFolio: string, body: Partial<DraftDataNode>): Promise<void> {
  const res = await fetchWithRetry(
    `${BASE}/v1/product-drafts/?prospectiveFolio=${encodeURIComponent(prospectiveFolio)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    throw new Error(`ProductDrafts PATCH ${res.status}`)
  }
}

// ─── Mappers Draft → Vista ─────────────────────────────────────────────────────

function mapDraftWarehouseToFilaCedis(w: DraftWarehouse): FilaCedis {
  return {
    id: w.code || String(w.number ?? ''),
    receptor: w.is_receiving ?? false,
    cedis: w.name,
    frecuencia: String(w.purchase_order_frequence_day_count ?? ''),
    leadTime: String(w.purchase_order_lead_time ?? ''),
    cedisDestino: (w.delivery_routes ?? [])
      .map(r => r.destination_warehouse_code)
      .filter(Boolean)
      .join(', '),
  }
}

function mapDraftLogisticsToDatosLogisticos(d: DraftLogisticsData): DatosLogisticos {
  return {
    tipoEsquemaDistribucion: d.schema_id ?? '',
    filasCedis: (d.warehouses ?? []).map(mapDraftWarehouseToFilaCedis),
  }
}

function mapDraftIndividualPackageToMedidas(d: DraftIndividualPackage): MedidasEmpaqueIndividual {
  return {
    tieneEmpaqueIndividual: d.apply_individual_package ?? true,
    nombreMedidaEmpaque: '',
    unidadPeso: d.weight_unit_of_measure_code ?? '',
    peso: d.weight ?? null,
    unidadMedida: d.size_unit_of_measure_code ?? '',
    alto: d.height ?? null,
    frente: d.width ?? null,
    fondo: d.depth ?? null,
    estibaMaxima: d.stacking_limit ?? null,
  }
}

function mapDraftProductPackageToEmpaques(d: DraftProductPackage): EmpaquesProducto {
  const typeCode = d.type_code ?? ''
  const cualAplica: CualAplicaEmpaque =
    typeCode === 'bulto' ? 'bulto' : typeCode === 'ninguno' ? 'ninguno' : 'carton_master'

  return {
    cualAplica,
    cantidadUdsCartonMaster: d.units_count ?? null,
    multiploCartonMaster: d.master_carton_multiple ?? null,
    unidadPeso: d.weight_unit_of_measure_code ?? '',
    peso: d.weight ?? null,
    unidadMedida: d.size_unit_of_measure_code ?? '',
    alto: d.height ?? null,
    frente: d.width ?? null,
    fondo: d.depth ?? null,
  }
}

function mapDraftDeliveryToEntregaManipulacion(
  d: DraftDeliveryAndManipulation
): EntregaManipulacion {
  return {
    entregaPaletizable: d.is_pallet_delivered ?? null,
    unidadMedidaPallet: d.size_unit_of_measure_code ?? '',
    layoutLargo: d.pallet_height ?? null,
    layoutAncho: d.pallet_width ?? null,
    puedeAcomodarseDistintasFormas: d.is_orientation_flexible ?? null,
  }
}

// ─── Mappers Vista → Draft ─────────────────────────────────────────────────────

function mapCedisDestinoToDeliveryRoutes(
  cedisDestino: string,
  previousRoutes: DraftDeliveryRoute[] = []
): DraftDeliveryRoute[] {
  const parsedCodes = cedisDestino
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)

  if (parsedCodes.length === 0) {
    return previousRoutes
  }

  const previousByCode = new Map(
    previousRoutes.map(route => [route.destination_warehouse_code, route])
  )

  return parsedCodes.map(code => {
    const previous = previousByCode.get(code)
    return {
      destination_warehouse_number: previous?.destination_warehouse_number,
      destination_warehouse_code: code,
      destination_warehouse_name: previous?.destination_warehouse_name || code,
    }
  })
}

function mapDatosLogisticosToDraft(
  d: DatosLogisticos,
  previous?: DraftLogisticsData
): DraftLogisticsData {
  const previousWarehouses = previous?.warehouses ?? []
  const previousByCode = new Map(previousWarehouses.map(warehouse => [warehouse.code, warehouse]))

  return {
    schema_id: d.tipoEsquemaDistribucion || undefined,
    warehouses: d.filasCedis.map(f => {
      const previousWarehouse = previousByCode.get(f.id)
      const code = (f.id || previousWarehouse?.code || f.cedis || '').trim()

      return {
        number: previousWarehouse?.number,
        code,
        name: (f.cedis || previousWarehouse?.name || code).trim(),
        is_receiving: f.receptor,
        purchase_order_lead_time: Number(f.leadTime) || 0,
        purchase_order_frequence_day_count: Number(f.frecuencia) || 0,
        delivery_routes: mapCedisDestinoToDeliveryRoutes(
          f.cedisDestino,
          previousWarehouse?.delivery_routes
        ),
      }
    }),
  }
}

function mapMedidasToDraftIndividualPackage(d: MedidasEmpaqueIndividual): DraftIndividualPackage {
  return {
    apply_individual_package: d.tieneEmpaqueIndividual,
    weight_unit_of_measure_code: d.unidadPeso || undefined,
    weight: d.peso,
    size_unit_of_measure_code: d.unidadMedida || undefined,
    height: d.alto,
    width: d.frente,
    depth: d.fondo,
    stacking_limit: d.estibaMaxima,
  }
}

function mapEmpaquesToDraftProductPackage(d: EmpaquesProducto): DraftProductPackage {
  return {
    type_code: d.cualAplica,
    units_count: d.cantidadUdsCartonMaster,
    master_carton_multiple: d.multiploCartonMaster,
    weight_unit_of_measure_code: d.unidadPeso || undefined,
    weight: d.peso,
    size_unit_of_measure_code: d.unidadMedida || undefined,
    height: d.alto,
    width: d.frente,
    depth: d.fondo,
  }
}

function mapEntregaToDraftDelivery(d: EntregaManipulacion): DraftDeliveryAndManipulation {
  return {
    is_pallet_delivered: d.entregaPaletizable,
    size_unit_of_measure_code: d.unidadMedidaPallet || undefined,
    pallet_height: d.layoutLargo,
    pallet_width: d.layoutAncho,
    is_orientation_flexible: d.puedeAcomodarseDistintasFormas,
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Lee las 4 tarjetas del flujo "Datos logísticos y de empaque" del borrador.
 * Incluye header_info para obtener supplier_id sin depender de query params.
 * Usa proyección de nodos para no traer todo el documento.
 */
export async function getLogisticsSectionsDraft(prospectiveFolio: string): Promise<{
  datosLogisticos: DatosLogisticos
  medidasEmpaqueIndividual: MedidasEmpaqueIndividual
  empaquesProducto: EmpaquesProducto
  entregaManipulacion: EntregaManipulacion
  /** supplier_id leído de header_info del borrador (string vacío si no existe) */
  supplierId: string
}> {
  const cards =
    'header_info,logistics_data,individual_package,product_package,delivery_and_manipulation'
  const draft = await fetchDraftNode(prospectiveFolio, cards)

  draftLogisticsCache.set(prospectiveFolio, draft.logistics_data ?? {})

  return {
    supplierId: draft.header_info?.supplier_id ?? '',
    datosLogisticos: mapDraftLogisticsToDatosLogisticos(draft.logistics_data ?? {}),
    medidasEmpaqueIndividual: mapDraftIndividualPackageToMedidas(draft.individual_package ?? {}),
    empaquesProducto: mapDraftProductPackageToEmpaques(draft.product_package ?? {}),
    entregaManipulacion: mapDraftDeliveryToEntregaManipulacion(
      draft.delivery_and_manipulation ?? {}
    ),
  }
}

/** Guarda la tarjeta "Datos logísticos" en el borrador. */
export async function saveDatosLogisticos(
  prospectiveFolio: string,
  data: DatosLogisticos
): Promise<void> {
  const previousLogistics = draftLogisticsCache.get(prospectiveFolio)
  const nextLogistics = mapDatosLogisticosToDraft(data, previousLogistics)

  await patchDraft(prospectiveFolio, {
    logistics_data: nextLogistics,
  })

  draftLogisticsCache.set(prospectiveFolio, nextLogistics)
}

/** Guarda la tarjeta "Medidas con empaque individual" en el borrador. */
export async function saveMedidasEmpaqueIndividual(
  prospectiveFolio: string,
  data: MedidasEmpaqueIndividual
): Promise<void> {
  await patchDraft(prospectiveFolio, {
    individual_package: mapMedidasToDraftIndividualPackage(data),
  })
}

/** Guarda la tarjeta "Empaques del producto" en el borrador. */
export async function saveEmpaquesProducto(
  prospectiveFolio: string,
  data: EmpaquesProducto
): Promise<void> {
  await patchDraft(prospectiveFolio, {
    product_package: mapEmpaquesToDraftProductPackage(data),
  })
}

/** Guarda la tarjeta "Entrega y manipulación" en el borrador. */
export async function saveEntregaManipulacion(
  prospectiveFolio: string,
  data: EntregaManipulacion
): Promise<void> {
  await patchDraft(prospectiveFolio, {
    delivery_and_manipulation: mapEntregaToDraftDelivery(data),
  })
}
