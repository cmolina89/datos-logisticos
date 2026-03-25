/**
 * Estado global (Jotai) para el flujo Datos logísticos y de empaque
 * HUs 038-049
 */

import { atom } from 'jotai'
import type {
  DatosLogisticosEmpaqueState,
  GuardadoStatus,
  ValidationErrors,
  DatosLogisticos,
  FilaCedis,
  MedidasEmpaqueIndividual,
  EmpaquesProducto,
  EntregaManipulacion,
} from '../types'
import { initialState } from '../mocks/datosLogisticosEmpaqueMocks'

/** Estado inicial con filasCedis explícitamente tipado como FilaCedis[] */
const initialDatosLogisticos: DatosLogisticos = {
  ...initialState.datosLogisticos,
  filasCedis: [], // Se pobla desde getFilasCedis() al montar la página
}

/** Estado completo del formulario (4 tarjetas) - filasCedis se carga desde API */
export const datosLogisticosEmpaqueStateAtom = atom<DatosLogisticosEmpaqueState>({
  ...initialState,
  datosLogisticos: initialDatosLogisticos,
})

/** Setters por sección (actualizan solo su parte) */
export const setDatosLogisticosAtom = atom(
  null,
  (get, set, update: Partial<DatosLogisticos>) => {
    const state = get(datosLogisticosEmpaqueStateAtom)
    const merged: DatosLogisticos = { ...state.datosLogisticos, ...update }
    set(datosLogisticosEmpaqueStateAtom, {
      ...state,
      datosLogisticos: merged,
    })
  }
)
export const setMedidasEmpaqueIndividualAtom = atom(
  null,
  (get, set, update: Partial<MedidasEmpaqueIndividual>) => {
    const state = get(datosLogisticosEmpaqueStateAtom)
    set(datosLogisticosEmpaqueStateAtom, {
      ...state,
      medidasEmpaqueIndividual: { ...state.medidasEmpaqueIndividual, ...update },
    })
  }
)
export const setEmpaquesProductoAtom = atom(
  null,
  (get, set, update: Partial<EmpaquesProducto>) => {
    const state = get(datosLogisticosEmpaqueStateAtom)
    set(datosLogisticosEmpaqueStateAtom, {
      ...state,
      empaquesProducto: { ...state.empaquesProducto, ...update },
    })
  }
)
export const setEntregaManipulacionAtom = atom(
  null,
  (get, set, update: Partial<EntregaManipulacion>) => {
    const state = get(datosLogisticosEmpaqueStateAtom)
    set(datosLogisticosEmpaqueStateAtom, {
      ...state,
      entregaManipulacion: { ...state.entregaManipulacion, ...update },
    })
  }
)

/** Estado de guardado (mock: simula envío al backend) */
export const guardadoStatusAtom = atom<GuardadoStatus>('idle')
export const guardadoMensajeAtom = atom<string | null>(null)
/** Sección que está guardando (para mostrar loading en el botón correcto) */
export const guardadoSectionAtom = atom<'datos' | 'medidas' | 'empaques' | 'entrega' | null>(null)

/** Carga de filas CEDIS desde API (tabla Datos logísticos) */
export const filasCedisLoadingAtom = atom(false)
export const filasCedisErrorAtom = atom<string | null>(null)

/** Solicitud de colapso de tarjeta tras guardado exitoso (HU 040 CA2) */
export const collapseSectionAfterSaveAtom = atom<'datos' | 'medidas' | 'empaques' | 'entrega' | null>(null)

/** Indica si el proveedor completó su alta; si es false se muestra aviso en Datos logísticos (HU 038 CA3 Escenario 2) */
export const proveedorAltaCompletaAtom = atom<boolean>(true)

/** Secciones que han sido guardadas exitosamente (para mostrar paloma verde) */
export type SavedSectionName = 'datos' | 'medidas' | 'empaques' | 'entrega'
export const savedSectionsAtom = atom<Set<SavedSectionName>>(new Set<SavedSectionName>())

/** Errores de validación por tarjeta (para mostrar en pantalla) */
export const erroresDatosLogisticosAtom = atom<ValidationErrors>({})
export const erroresMedidasAtom = atom<ValidationErrors>({})
export const erroresEmpaquesAtom = atom<ValidationErrors>({})
export const erroresEntregaAtom = atom<ValidationErrors>({})
