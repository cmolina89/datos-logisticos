import { getApplicationConfigValue } from '@/services/applicationConfigService'
import type { CualAplicaEmpaque } from '../types'
import { getRuntimeEnv } from '@/lib/api/runtimeEnv'

export type EmpaquesFieldKey =
  | 'cantidadUdsCartonMaster'
  | 'multiploCartonMaster'
  | 'numeroPiezas'
  | 'unidadPeso'
  | 'peso'
  | 'unidadMedida'
  | 'alto'
  | 'frente'
  | 'fondo'

export interface EmpaquesFieldConfig {
  field: EmpaquesFieldKey
  visible?: boolean
  required?: boolean
  editable?: boolean
  label?: string
  placeholder?: string
  infoText?: string
  appliesTo?: CualAplicaEmpaque | 'all'
}

export interface EmpaquesModalCardConfig {
  title?: string
  usesTitle?: string
  bullets?: string[]
  exampleTitle?: string
  example?: string
  actionLabel?: string
}

export interface EmpaquesModalConfig {
  title?: string
  subtitle?: string
  usesTitle?: string
  exampleTitle?: string
  cartonMaster?: EmpaquesModalCardConfig
  bulto?: EmpaquesModalCardConfig
}

export interface EmpaquesDynamicConfig {
  fields: EmpaquesFieldConfig[]
  modal: EmpaquesModalConfig | null
}

const CAMPOS_CONFIG_CODE = getRuntimeEnv(
  'MODERN_APP_CFG_EMPAQUES_FIELDS_CODE',
  'SKUS_COMPLEMENTO_CAMPOS'
)

const MODAL_CONFIG_CODE = getRuntimeEnv(
  'MODERN_APP_CFG_EMPAQUES_MODAL_CODE',
  'LOGISTICS_PACKAGE_MODAL_CONTENT'
)

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['true', '1', 'si', 'yes', 'y'].includes(normalized)) return true
    if (['false', '0', 'no', 'n'].includes(normalized)) return false
  }
  return undefined
}

function toString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function normalizeToken(value: string): string {
  return value.replace(/[_\-\s]/g, '').toLowerCase()
}

function normalizeAppliesTo(value: unknown): CualAplicaEmpaque | 'all' | undefined {
  const token = typeof value === 'string' ? normalizeToken(value) : ''
  if (!token) return undefined
  if (token === 'all' || token === 'todos' || token === 'ambos') return 'all'
  if (token === 'cartonmaster') return 'carton_master'
  if (token === 'bulto') return 'bulto'
  if (token === 'ninguno') return 'ninguno'
  return undefined
}

function normalizeFieldKey(value: unknown): EmpaquesFieldKey | undefined {
  if (typeof value !== 'string') return undefined
  const token = normalizeToken(value)

  if (['cantidadudscartonmaster', 'cantidaduds', 'cantidad', 'uds'].includes(token)) {
    return 'cantidadUdsCartonMaster'
  }
  if (['multiplocartonmaster', 'multiplo', 'multiple'].includes(token)) {
    return 'multiploCartonMaster'
  }
  if (['numeropiezas', 'piezas'].includes(token)) {
    return 'numeroPiezas'
  }
  if (['unidadpeso', 'uompeso'].includes(token)) {
    return 'unidadPeso'
  }
  if (token === 'peso') {
    return 'peso'
  }
  if (['unidadmedida', 'uommedida', 'uomdimension'].includes(token)) {
    return 'unidadMedida'
  }
  if (token === 'alto') {
    return 'alto'
  }
  if (token === 'frente' || token === 'ancho') {
    return 'frente'
  }
  if (token === 'fondo' || token === 'largo' || token === 'profundidad') {
    return 'fondo'
  }

  return undefined
}

function pickArrayCandidate(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== 'object') return []

  const candidate = raw as {
    fields?: unknown
    campos?: unknown
    data?: unknown
    result?: unknown
    options?: unknown
    value?: unknown
  }

  const sources = [
    candidate.fields,
    candidate.campos,
    candidate.data,
    candidate.result,
    candidate.options,
    candidate.value,
  ]
  for (const source of sources) {
    if (Array.isArray(source)) return source
  }

  return []
}

function parseFieldConfigItem(raw: unknown): EmpaquesFieldConfig | null {
  if (!raw || typeof raw !== 'object') return null

  const item = raw as {
    field?: unknown
    key?: unknown
    name?: unknown
    code?: unknown
    visible?: unknown
    required?: unknown
    editable?: unknown
    label?: unknown
    title?: unknown
    placeholder?: unknown
    infoText?: unknown
    info?: unknown
    aplica?: unknown
    appliesTo?: unknown
    packageType?: unknown
  }

  const key =
    normalizeFieldKey(item.field) ||
    normalizeFieldKey(item.key) ||
    normalizeFieldKey(item.name) ||
    normalizeFieldKey(item.code)

  if (!key) return null

  return {
    field: key,
    visible: toBoolean(item.visible),
    required: toBoolean(item.required),
    editable: toBoolean(item.editable),
    label: toString(item.label) || toString(item.title),
    placeholder: toString(item.placeholder),
    infoText: toString(item.infoText) || toString(item.info),
    appliesTo:
      normalizeAppliesTo(item.appliesTo) ||
      normalizeAppliesTo(item.aplica) ||
      normalizeAppliesTo(item.packageType),
  }
}

function parseFieldsConfig(raw: unknown): EmpaquesFieldConfig[] {
  const source = pickArrayCandidate(raw)
  return source
    .map(parseFieldConfigItem)
    .filter((item): item is EmpaquesFieldConfig => item !== null)
}

function parseModalCard(raw: unknown): EmpaquesModalCardConfig {
  if (!raw || typeof raw !== 'object') return {}

  const card = raw as {
    title?: unknown
    usesTitle?: unknown
    bullets?: unknown
    exampleTitle?: unknown
    example?: unknown
    actionLabel?: unknown
  }

  return {
    title: toString(card.title),
    usesTitle: toString(card.usesTitle),
    bullets: toStringArray(card.bullets),
    exampleTitle: toString(card.exampleTitle),
    example: toString(card.example),
    actionLabel: toString(card.actionLabel),
  }
}

function parseModalConfig(raw: unknown): EmpaquesModalConfig | null {
  const sourceFromArray = Array.isArray(raw)
    ? raw.find(item => item && typeof item === 'object')
    : raw
  if (!sourceFromArray || typeof sourceFromArray !== 'object') return null

  const cfg = sourceFromArray as {
    title?: unknown
    modalCualAplicaTitle?: unknown
    subtitle?: unknown
    modalCualAplicaSubtitle?: unknown
    usesTitle?: unknown
    modalCualAplicaUsesTitle?: unknown
    exampleTitle?: unknown
    modalCualAplicaExampleTitle?: unknown
    cartonMaster?: unknown
    bulto?: unknown
    segmento3?: unknown
    data?: unknown
    value?: unknown
    result?: unknown
  }

  const nested = [cfg.segmento3, cfg.data, cfg.value, cfg.result].find(
    item => item && typeof item === 'object'
  )
  const source = nested && typeof nested === 'object' ? { ...(nested as object), ...cfg } : cfg
  const normalized = source as {
    title?: unknown
    modalCualAplicaTitle?: unknown
    subtitle?: unknown
    modalCualAplicaSubtitle?: unknown
    usesTitle?: unknown
    modalCualAplicaUsesTitle?: unknown
    exampleTitle?: unknown
    modalCualAplicaExampleTitle?: unknown
    cartonMaster?: unknown
    bulto?: unknown
  }

  const modal: EmpaquesModalConfig = {
    title: toString(normalized.title) || toString(normalized.modalCualAplicaTitle),
    subtitle: toString(normalized.subtitle) || toString(normalized.modalCualAplicaSubtitle),
    usesTitle: toString(normalized.usesTitle) || toString(normalized.modalCualAplicaUsesTitle),
    exampleTitle:
      toString(normalized.exampleTitle) || toString(normalized.modalCualAplicaExampleTitle),
    cartonMaster: parseModalCard(normalized.cartonMaster),
    bulto: parseModalCard(normalized.bulto),
  }

  const hasContent =
    Boolean(modal.title || modal.subtitle || modal.usesTitle || modal.exampleTitle) ||
    Boolean(modal.cartonMaster?.title || modal.bulto?.title)

  return hasContent ? modal : null
}

export async function getEmpaquesDynamicConfig(): Promise<EmpaquesDynamicConfig> {
  const [fieldsResult, modalResult] = await Promise.allSettled([
    getApplicationConfigValue(CAMPOS_CONFIG_CODE),
    getApplicationConfigValue(MODAL_CONFIG_CODE),
  ])

  const fields = fieldsResult.status === 'fulfilled' ? parseFieldsConfig(fieldsResult.value) : []
  const modal = modalResult.status === 'fulfilled' ? parseModalConfig(modalResult.value) : null

  return { fields, modal }
}
