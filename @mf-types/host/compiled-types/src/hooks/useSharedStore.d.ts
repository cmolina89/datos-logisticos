import { type MFEMessage, type UserContext, type AppContext } from '@/app/store/sharedStore'
export declare const useSharedStore: () => {
  userContext: UserContext
  appContext: AppContext
  globalLoading: boolean
  globalError: string | null
  isAuthenticated: boolean
  storeStats: {
    totalMessages: number
    messageTypes: string[]
    isUserLoggedIn: boolean
    currentTheme: 'light' | 'dark'
    currentLanguage: 'es' | 'en' | 'fr'
    sidebarOpen: boolean
    lastMessage: MFEMessage
  }
  setUserContext: (args_0: UserContext | ((prev: UserContext) => UserContext)) => void
  setAppContext: (args_0: AppContext | ((prev: AppContext) => AppContext)) => void
  setGlobalLoading: (args_0: boolean | ((prev: boolean) => boolean)) => void
  setGlobalError: (args_0: string | ((prev: string | null) => string | null) | null) => void
  sendMessage: (message: Omit<MFEMessage, 'id' | 'timestamp'>) => string
  loginUser: (userData: Partial<UserContext>) => void
  logoutUser: () => void
  changeTheme: (theme: 'light' | 'dark') => void
  changeLanguage: (language: 'es' | 'en' | 'fr') => void
  hasPermission: (permission: string) => boolean
}
export declare const useMFEMessages: (
  messageType?: string,
  onMessage?: (message: MFEMessage) => void
) => {
  messages: MFEMessage[]
  lastMessage: MFEMessage
  messageCount: number
}
export declare const useSharedAuth: () => {
  user: UserContext
  isAuthenticated: boolean
  login: (userData: Partial<UserContext>) => void
  logout: () => void
  checkPermission: (permission: string) => boolean
  checkRole: (role: string) => boolean
}
export declare const useSharedTheme: () => {
  theme: 'light' | 'dark'
  language: 'es' | 'en' | 'fr'
  environment: 'development' | 'production'
  version: string
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'es' | 'en' | 'fr') => void
}
export declare const useMFECommunication: (mfeName: 'host' | 'remote') => {
  sendToHost: (type: string, payload: any) => string
  sendToRemote: (type: string, payload: any) => string
  broadcast: (type: string, payload: any) => string
}
export declare const useGlobalState: () => {
  isLoading: boolean
  error: string | null
  startLoading: () => void
  stopLoading: () => void
  setError: (error: string | null) => void
  clearError: () => void
}
export declare const useSidebarControl: () => {
  sidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}
export declare const useSidebarMessageListener: () => {
  sidebarMessages: MFEMessage[]
}
