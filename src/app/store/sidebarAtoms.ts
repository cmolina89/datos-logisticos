// src/app/store/sidebarAtoms.ts

import type { MenuOptionModel, SelectedOptions } from '@/types/menu'
import { atom } from 'jotai'

// Átomo para controlar si el sidebar está abierto o cerrado
export const sidebarOpenAtom = atom<boolean>(false)

// Átomo para las opciones seleccionadas en el sidebar (por nivel de profundidad)
export const selectedOptionsAtom = atom<SelectedOptions>({})

// Átomo para los elementos del menú
export const menuItemsAtom = atom<MenuOptionModel[] | undefined>(undefined)

// Átomo derivado para verificar si hay un submenú visible
export const submenuVisibleAtom = atom<boolean>(get => {
  const selectedOptions = get(selectedOptionsAtom)
  return Boolean(selectedOptions[1])
})

// Acciones para el sidebar
export const toggleSidebarAtom = atom(null, (get, set) => {
  const currentState = get(sidebarOpenAtom)
  const newState = !currentState
  console.log('toggleSidebarAtom: changing from', currentState, 'to', newState)
  set(sidebarOpenAtom, newState)
})

export const openSidebarAtom = atom(null, (get, set) => {
  set(sidebarOpenAtom, true)
})

export const closeSidebarAtom = atom(null, (get, set) => {
  set(sidebarOpenAtom, false)
  // También limpiar las selecciones cuando se cierra
  set(selectedOptionsAtom, {})
})

// Átomo para cerrar solo el submenu pero mantener el sidebar abierto
export const closeSubmenuAtom = atom(null, (get, set) => {
  set(selectedOptionsAtom, {})
})

export const clearSidebarSelectionAtom = atom(null, (get, set) => {
  set(selectedOptionsAtom, {})
})

export const selectOptionAtom = atom(
  null,
  (get, set, { option, deep }: { option: MenuOptionModel; deep: number }) => {
    const currentSelections = get(selectedOptionsAtom)
    set(selectedOptionsAtom, {
      ...currentSelections,
      [deep]: option,
    })
  }
)
