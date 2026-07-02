interface ServiceErrorDetails {
  status?: number
  contentType?: string
  responseText?: string
}

export class ServiceApiError extends Error {
  details: ServiceErrorDetails

  constructor(message: string, details: ServiceErrorDetails = {}) {
    super(message)
    this.name = 'ServiceApiError'
    this.details = details
  }
}

export async function readSafeJson<T>(
  response: Response,
  serviceName: string,
  url: string
): Promise<T> {
  const contentType = response.headers.get('content-type') || ''
  const raw = await response.text()

  if (!response.ok) {
    throw new ServiceApiError(`${serviceName} ${response.status}: ${url}`, {
      status: response.status,
      contentType,
      responseText: raw,
    })
  }

  const trimmed = raw.trim()
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    throw new ServiceApiError(`${serviceName} invalid JSON response (HTML): ${url}`, {
      status: response.status,
      contentType,
      responseText: trimmed,
    })
  }

  if (!contentType.includes('application/json')) {
    throw new ServiceApiError(
      `${serviceName} unexpected content-type (${contentType || 'unknown'}): ${url}`,
      {
        status: response.status,
        contentType,
        responseText: trimmed,
      }
    )
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    throw new ServiceApiError(`${serviceName} invalid JSON payload: ${url}`, {
      status: response.status,
      contentType,
      responseText: trimmed,
    })
  }
}
