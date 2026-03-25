// src/features/authFeature/store/authAtoms.ts
import { authStorage } from '@/utils/secureStorage'
import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

// Almacenamiento seguro personalizado que usa nuestro sistema de almacenamiento seguro
const getSecureStorage = () => {
  return {
    getItem: (key: string) => {
      const value = authStorage.getAuthToken()
      return value ? JSON.stringify(value) : null
    },
    setItem: (key: string, value: string) => {
      try {
        const parsedValue = JSON.parse(value)
        if (parsedValue) {
          authStorage.setAuthToken(parsedValue)
        } else {
          authStorage.removeAuthToken()
        }
      } catch {
        authStorage.removeAuthToken()
      }
    },
    removeItem: (key: string) => {
      authStorage.removeAuthToken()
    },
  }
}

const secureStorage = createJSONStorage<string | null>(getSecureStorage)
export const authTokenAtom = atomWithStorage<string | null>('auth-token', null, secureStorage, {
  getOnInit: true,
})

export const isAuthenticatedAtom = atom<boolean>(get => !!get(authTokenAtom))

// Átomo para simular el login
export const loginAtom = atom(null, (_get, set, pseudoToken: string) => {
  set(authTokenAtom, pseudoToken)
})

// Átomo para simular el logout
export const logoutAtom = atom(null, (_get, set) => {
  set(authTokenAtom, null)
  // Aquí podrías añadir lógica para limpiar otros estados o redirigir
})
