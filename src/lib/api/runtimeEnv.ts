export function getRuntimeEnv(key: string, defaultValue = ''): string {
  if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string') {
    return process.env[key] as string
  }

  return defaultValue
}
