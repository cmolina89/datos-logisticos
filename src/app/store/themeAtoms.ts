// src/app/store/themeAtoms.ts
import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import type { SyncStorage } from 'jotai/vanilla/utils/atomWithStorage'
import { isServer } from '@/utils/environment'

export type Theme = 'light' | 'dark'

const initialTheme: Theme = 'light'

// --- Almacenamiento Nulo Síncrono para el Servidor ---
const disabledStorage: SyncStorage<Theme> = {
  getItem: (_key, initialValue) => {
    // En el servidor, siempre devuelve el valor inicial.
    return initialValue
  },
  setItem: (_key, _value) => {
    // No hace nada en el servidor.
  },
  removeItem: _key => {
    // No hace nada en el servidor.
  },
  // subscribe es opcional pero bueno tenerlo para cumplir la interfaz
  subscribe: (_key, _callback, _initialValue) => {
    // No hay suscripciones en el servidor, así que devuelve una función vacía.
    return () => {}
  },
}

// Almacenamiento real para el cliente (ya es SyncStorage)
const localStorageForClient = createJSONStorage<Theme>(() => localStorage)

// Ahora ambos objetos son de tipo SyncStorage
const storage: SyncStorage<Theme> = isServer ? disabledStorage : localStorageForClient

// --- DEFINICIÓN DE LOS ÁTOMOS ---
export const themeAtom = atomWithStorage<Theme>('app-theme', initialTheme, storage, {
  getOnInit: true,
})

export const isDarkAtom = atom<boolean>(get => get(themeAtom) === 'dark')
