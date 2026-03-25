;(() => {
  // Configuración dinámica del publicPath para que coincida con el origen del script
  const ensureTrailingSlash = value => (value.endsWith('/') ? value : `${value}/`)

  const resolveFromCurrentScript = () => {
    if (typeof document === 'undefined') {
      return null
    }

    const { currentScript } = document
    if (currentScript && currentScript.src) {
      return currentScript.src.replace(/\/[^/]*$/, '/')
    }

    const scripts = document.getElementsByTagName('script')
    for (let index = scripts.length - 1; index >= 0; index -= 1) {
      const candidate = scripts[index]
      if (candidate?.src) {
        return candidate.src.replace(/\/[^/]*$/, '/')
      }
    }

    return null
  }

  const fallback = typeof window !== 'undefined' ? window.location.origin : '/'
  const resolvedPublicPath =
    (typeof window !== 'undefined' && window.__REMOTE_PUBLIC_PATH__) ||
    resolveFromCurrentScript() ||
    fallback

  // eslint-disable-next-line no-undef
  __webpack_public_path__ = ensureTrailingSlash(resolvedPublicPath)
})()
