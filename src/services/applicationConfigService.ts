import { configHttpClient } from '@/lib/httpClient'
import axios from 'axios'

interface ApplicationConfigEntry {
  _id?: string
  code?: string
  name?: string | null
  description?: string
  value?: unknown
  createdAt?: string
  updatedAt?: string
}

interface ApplicationConfigResponse {
  data?: ApplicationConfigEntry[] | ApplicationConfigEntry | null
  meta?: unknown
}

function parseMaybeJsonString(value: unknown): unknown {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (!trimmed) return value

  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
    return value
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    return value
  }
}

function extractConfigData(json: ApplicationConfigResponse): unknown {
  const data = json.data

  if (Array.isArray(data)) {
    const first = data[0]
    if (first && typeof first === 'object' && 'value' in first) {
      return parseMaybeJsonString((first as ApplicationConfigEntry).value)
    }
    return data
  }

  if (data && typeof data === 'object' && 'value' in data) {
    return parseMaybeJsonString((data as ApplicationConfigEntry).value)
  }

  return data ?? undefined
}

export async function getApplicationConfigValue(code: string): Promise<unknown> {
  try {
    const response = await configHttpClient.get<ApplicationConfigResponse>(
      `/v1/application-configs/${encodeURIComponent(code)}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )

    return extractConfigData(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return undefined
    }

    throw error
  }
}
