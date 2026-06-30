import { fetchWithRetry } from '@/lib/fetchWithRetry'

interface ApplicationConfigEntry {
  _id?: string
  code?: string
  description?: string
  value?: unknown
  createdAt?: string
  updatedAt?: string
}

interface ApplicationConfigResponse {
  data?: ApplicationConfigEntry[] | ApplicationConfigEntry | null
  meta?: unknown
}

const DEFAULT_BASE = '/ps/sgc/application-configs'

const BASE =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.MODERN_APP_PS_SGC_APPLICATIONCONFIGS ||
      process.env.MODERN_APP_APPLICATION_CONFIGS_BASE)) ||
  DEFAULT_BASE

export async function getApplicationConfigValue(code: string): Promise<unknown> {
  const url = `${BASE}/v1/application-configs/${encodeURIComponent(code)}`
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`ApplicationConfigs ${response.status}: ${code}`)
  }

  const json = (await response.json()) as ApplicationConfigResponse
  const data = json.data

  if (Array.isArray(data)) {
    return data[0]?.value
  }

  if (data && typeof data === 'object' && 'value' in data) {
    return (data as ApplicationConfigEntry).value
  }

  return undefined
}
