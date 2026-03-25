// src/utils/environment.ts

/**
 * Una constante booleana que es `true` si el código se está ejecutando en un entorno de servidor (Node.js)
 * y `false` si se está ejecutando en un entorno de cliente (navegador).
 *
 * Esta es la forma más segura y universal de detectar el entorno en aplicaciones isomórficas/universales.
 */
export const isServer = typeof window === 'undefined'

/**
 * Una constante booleana que es `true` si el código se está ejecutando en un entorno de cliente (navegador).
 * Es simplemente la negación de `isServer`.
 */
export const isBrowser = !isServer
