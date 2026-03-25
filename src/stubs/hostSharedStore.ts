/**
 * Stub del módulo host/SharedStore para builds standalone.
 * Cuando el remote se carga en el host, Module Federation proporciona el módulo real.
 * Este stub permite compilar sin que el host esté disponible.
 */
import { atom } from 'jotai'

export interface MFEMessage {
  id: string
  source: 'host' | 'remote'
  target: 'host' | 'remote' | 'all'
  type: string
  payload: unknown
  timestamp: number
}

export interface UserContext {
  id: string | null
  name: string | null
  email: string | null
  roles: string[]
  permissions: string[]
}

export interface AppContext {
  theme: 'light' | 'dark'
  language: 'es' | 'en' | 'fr'
  environment: 'development' | 'production'
  version: string
}

const defaultUser: UserContext = {
  id: null,
  name: null,
  email: null,
  roles: [],
  permissions: [],
}

const defaultApp: AppContext = {
  theme: 'light',
  language: 'es',
  environment: 'development',
  version: '1.0.0',
}

export const sharedUserContextAtom = atom<UserContext>(defaultUser)
export const sharedAppContextAtom = atom<AppContext>(defaultApp)
export const mfeMessagesAtom = atom<MFEMessage[]>([])
export const globalLoadingAtom = atom(false)
export const globalErrorAtom = atom<string | null>(null)
export const sharedSidebarOpenAtom = atom(true)
export const sendMFEMessageAtom = atom(null, (_get, _set, _msg: unknown) => {})
export const cleanupMessagesAtom = atom(null, () => {})
export const loginUserAtom = atom(null, () => {})
export const logoutUserAtom = atom(null, () => {})
export const changeThemeAtom = atom(null, () => {})
export const changeLanguageAtom = atom(null, () => {})
export const toggleSidebarAtom = atom(null, () => {})
export const openSidebarAtom = atom(null, () => {})
export const closeSidebarAtom = atom(null, () => {})
