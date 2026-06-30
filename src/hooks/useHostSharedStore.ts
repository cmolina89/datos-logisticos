// Hook simplificado para acceder al store compartido del host desde el remote
import React from 'react'
import * as hostStoreStub from '@/stubs/hostSharedStore'
import * as hostHooksStub from '@/stubs/hostSharedHooks'

// ============================================================================
// TIPOS LOCALES
// ============================================================================

interface UserContext {
  id: string | null
  name: string | null
  email: string | null
  roles: string[]
  permissions: string[]
}

interface AppContext {
  theme: 'light' | 'dark'
  language: 'es' | 'en' | 'fr'
  environment: 'development' | 'production'
  version: string
}

interface MFEMessage {
  id: string
  source: 'host' | 'remote'
  target: 'host' | 'remote' | 'all'
  type: string
  payload: unknown
  timestamp: number
}

// ============================================================================
// HOOK PRINCIPAL PARA COMUNICACIÓN CON EL HOST
// Usa stubs locales para que el remote compile standalone sin depender del host.
// Cuando se carga dentro del host, el host puede inyectar el store real vía contexto si lo requiere.
// ============================================================================

export const useHostSharedStore = () => {
  const hostStoreRef = React.useRef({ store: hostStoreStub, hooks: hostHooksStub })
  const useSharedStore = hostHooksStub.useSharedStore
  const sharedState = useSharedStore()

  return {
    isLoading: false,
    error: null,
    userContext: sharedState.userContext,
    appContext: sharedState.appContext,
    messages: [] as MFEMessage[],
    hostStore: hostStoreRef.current.store,
    hostHooks: hostStoreRef.current.hooks,
    sendMessage: (type: string, payload: unknown) => {
      sharedState.sendMessage({ source: 'remote', target: 'host', type, payload })
      console.log('[Remote] Sending message to host:', { type, payload })
    },
    loginUser: sharedState.loginUser,
    logoutUser: sharedState.logoutUser,
    changeTheme: sharedState.changeTheme,
    changeLanguage: sharedState.changeLanguage,
  }
}

// ============================================================================
// HOOKS ESPECÍFICOS PARA CASOS DE USO COMUNES
// ============================================================================

export const useRemoteCommunication = () => {
  const store = useHostSharedStore()

  const sendToHost = React.useCallback(
    (type: string, payload: unknown) => {
      store.sendMessage(type, payload)
    },
    [store]
  )

  const broadcast = React.useCallback(
    (type: string, payload: unknown) => {
      store.sendMessage(type, payload)
    },
    [store]
  )

  return {
    sendToHost,
    broadcast,
    isConnected: !store.error,
    isFallback: 'isFallback' in store ? store.isFallback : false,
  }
}

export const useRemoteAuth = () => {
  const store = useHostSharedStore()

  return {
    user: store.userContext,
    isAuthenticated: store.userContext?.id !== null,
    login: store.loginUser,
    logout: store.logoutUser,
    isConnected: !store.error,
  }
}

export const useRemoteTheme = () => {
  const store = useHostSharedStore()

  return {
    theme: store.appContext?.theme || 'light',
    language: store.appContext?.language || 'es',
    changeTheme: store.changeTheme,
    changeLanguage: store.changeLanguage,
    isConnected: !store.error,
  }
}

// ============================================================================
// HOOK PARA ESCUCHAR MENSAJES
// ============================================================================

export const useHostMessages = (messageType?: string) => {
  const store = useHostSharedStore()
  const [messages, setMessages] = React.useState<MFEMessage[]>([])

  React.useEffect(() => {
    if ('messages' in store && store.messages) {
      const filteredMessages = messageType
        ? store.messages.filter((msg: MFEMessage) => msg.type === messageType)
        : store.messages
      setMessages(filteredMessages)
    }
  }, [store, messageType])

  return {
    messages,
    lastMessage: messages[messages.length - 1] || null,
    messageCount: messages.length,
    isConnected: !store.error,
  }
}
