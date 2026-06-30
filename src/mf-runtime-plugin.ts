// Runtime plugin para manejar errores de carga de chunks en Module Federation

const DEBUG_MF_RUNTIME =
  typeof process !== 'undefined' && process.env?.MODERN_APP_DEBUG_MF_RUNTIME === 'true'

const debugLog = (...args: unknown[]) => {
  if (DEBUG_MF_RUNTIME) {
    console.log(...args)
  }
}

const runtimePlugin = () => ({
  name: 'chunk-retry-plugin',
  beforeInit(args: any) {
    debugLog('MF Runtime Plugin: beforeInit', args)
    return args
  },
  beforeRequest(args: any) {
    debugLog('MF Runtime Plugin: beforeRequest', args)
    return args
  },
  afterResolve(args: any) {
    debugLog('MF Runtime Plugin: afterResolve', args)
    return args
  },
  onLoad(args: any) {
    debugLog('MF Runtime Plugin: onLoad', args)
    return args
  },
  async loadShare(args: any) {
    debugLog('MF Runtime Plugin: loadShare', args)
    try {
      return await args.default(args)
    } catch (error) {
      console.error('Error loading shared dependency:', error)
      throw error
    }
  },
  async beforeLoadShare(args: any) {
    debugLog('MF Runtime Plugin: beforeLoadShare', args)
    return args
  },
})

export default runtimePlugin
