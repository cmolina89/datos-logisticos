// Runtime plugin para manejar errores de carga de chunks en Module Federation

const runtimePlugin = () => ({
  name: 'chunk-retry-plugin',
  beforeInit(args: any) {
    console.log('MF Runtime Plugin: beforeInit', args)
    return args
  },
  beforeRequest(args: any) {
    console.log('MF Runtime Plugin: beforeRequest', args)
    return args
  },
  afterResolve(args: any) {
    console.log('MF Runtime Plugin: afterResolve', args)
    return args
  },
  onLoad(args: any) {
    console.log('MF Runtime Plugin: onLoad', args)
    return args
  },
  async loadShare(args: any) {
    console.log('MF Runtime Plugin: loadShare', args)
    try {
      return await args.default(args)
    } catch (error) {
      console.error('Error loading shared dependency:', error)
      throw error
    }
  },
  async beforeLoadShare(args: any) {
    console.log('MF Runtime Plugin: beforeLoadShare', args)
    return args
  },
})

export default runtimePlugin
