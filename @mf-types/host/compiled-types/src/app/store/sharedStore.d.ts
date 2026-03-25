export interface MFEMessage {
  id: string
  source: 'host' | 'remote'
  target: 'host' | 'remote' | 'all'
  type: string
  payload: any
  timestamp: number
}
export interface MFEState {
  isLoading: boolean
  error: string | null
  data: any
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
export declare const sharedUserContextAtom: import('jotai').PrimitiveAtom<UserContext> & {
  init: UserContext
}
export declare const sharedAppContextAtom: import('jotai').PrimitiveAtom<AppContext> & {
  init: AppContext
}
export declare const mfeMessagesAtom: import('jotai').PrimitiveAtom<MFEMessage[]> & {
  init: MFEMessage[]
}
export declare const globalLoadingAtom: import('jotai').PrimitiveAtom<boolean> & {
  init: boolean
}
export declare const globalErrorAtom: import('jotai').PrimitiveAtom<string | null> & {
  init: string | null
}
export declare const sendMFEMessageAtom: import('jotai').WritableAtom<
  null,
  [message: Omit<MFEMessage, 'id' | 'timestamp'>],
  string
> & {
  init: null
}
export declare const cleanupMessagesAtom: import('jotai').WritableAtom<null, [], void> & {
  init: null
}
export declare const getMessagesByTypeAtom: import('jotai').Atom<(type: string) => MFEMessage[]>
export declare const isUserAuthenticatedAtom: import('jotai').Atom<boolean>
export declare const hasPermissionAtom: import('jotai').Atom<(permission: string) => boolean>
export declare const loginUserAtom: import('jotai').WritableAtom<
  null,
  [userData: Partial<UserContext>],
  void
> & {
  init: null
}
export declare const logoutUserAtom: import('jotai').WritableAtom<null, [], void> & {
  init: null
}
export declare const changeThemeAtom: import('jotai').WritableAtom<
  null,
  [theme: 'light' | 'dark'],
  void
> & {
  init: null
}
export declare const changeLanguageAtom: import('jotai').WritableAtom<
  null,
  [language: 'es' | 'en' | 'fr'],
  void
> & {
  init: null
}
export declare const sharedSidebarOpenAtom: import('jotai').PrimitiveAtom<boolean> & {
  init: boolean
}
export declare const toggleSidebarAtom: import('jotai').WritableAtom<null, [], void> & {
  init: null
}
export declare const openSidebarAtom: import('jotai').WritableAtom<null, [], void> & {
  init: null
}
export declare const closeSidebarAtom: import('jotai').WritableAtom<null, [], void> & {
  init: null
}
export declare const storeStatsAtom: import('jotai').Atom<{
  totalMessages: number
  messageTypes: string[]
  isUserLoggedIn: boolean
  currentTheme: 'light' | 'dark'
  currentLanguage: 'es' | 'en' | 'fr'
  sidebarOpen: boolean
  lastMessage: MFEMessage
}>
