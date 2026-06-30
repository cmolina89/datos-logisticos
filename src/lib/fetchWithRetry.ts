const DEFAULT_TIMEOUT_MS = 15000
const DEFAULT_MAX_RETRIES = 2
const DEFAULT_BACKOFF_MS = 300

const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504])

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

interface FetchWithRetryOptions {
  timeoutMs?: number
  maxRetries?: number
  backoffMs?: number
}

const isAbortError = (error: unknown): boolean => {
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (error && typeof error === 'object' && 'name' in error) {
    return (error as { name?: string }).name === 'AbortError'
  }
  return false
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const backoffMs = options.backoffMs ?? DEFAULT_BACKOFF_MS

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      })

      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < maxRetries) {
        await wait(backoffMs * 2 ** attempt)
        continue
      }

      return response
    } catch (error) {
      lastError = error

      if (attempt < maxRetries) {
        await wait(backoffMs * 2 ** attempt)
        continue
      }

      if (isAbortError(error)) {
        throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`)
      }

      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Request failed for ${url}`)
}
