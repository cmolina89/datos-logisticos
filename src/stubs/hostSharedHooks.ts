/**
 * Stub del módulo host/SharedHooks para builds standalone.
 * Cuando el remote se carga en el host, Module Federation proporciona el módulo real.
 */
import type { MFEMessage, UserContext, AppContext } from './hostSharedStore'

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

export const useSharedStore = () => ({
  userContext: defaultUser,
  appContext: defaultApp,
  globalLoading: false,
  globalError: null,
  isAuthenticated: false,
  storeStats: {
    totalMessages: 0,
    messageTypes: [],
    isUserLoggedIn: false,
    currentTheme: 'light' as const,
    currentLanguage: 'es' as const,
    sidebarOpen: true,
    lastMessage: null as unknown as MFEMessage,
  },
  setUserContext: () => {},
  setAppContext: () => {},
  setGlobalLoading: () => {},
  setGlobalError: () => {},
  sendMessage: (_msg: { source: string; target: string; type: string; payload?: unknown }) => '',
  loginUser: () => {},
  logoutUser: () => {},
  changeTheme: () => {},
  changeLanguage: () => {},
  hasPermission: () => false,
})

export const useMFEMessages = (_type?: string, _onMessage?: (m: MFEMessage) => void) => ({
  messages: [] as MFEMessage[],
  lastMessage: null as unknown as MFEMessage,
  messageCount: 0,
})

export const useSharedAuth = () => ({
  user: defaultUser,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  checkPermission: () => false,
  checkRole: () => false,
})

export const useSharedTheme = () => ({
  theme: 'light' as const,
  language: 'es' as const,
  environment: 'development' as const,
  version: '1.0.0',
  toggleTheme: () => {},
  setTheme: () => {},
  setLanguage: () => {},
})

export const useMFECommunication = (_mfeName: 'host' | 'remote') => ({
  sendToHost: () => '',
  sendToRemote: () => '',
  broadcast: () => '',
})

export const useGlobalState = () => ({
  isLoading: false,
  error: null,
  startLoading: () => {},
  stopLoading: () => {},
  setError: () => {},
  clearError: () => {},
})

export const useSidebarControl = () => ({
  sidebarOpen: true,
  toggleSidebar: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
})

export const useSidebarMessageListener = () => ({
  sidebarMessages: [] as MFEMessage[],
})
