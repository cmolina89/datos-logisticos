/**
 * Tipos para el flujo "Datos logísticos y de empaque" - Alta SKU
 * HUs 038-049: Vista, Funcionalidad y Guardado por tarjeta
 */

/** Fila de la tabla CEDIS (configuración logística) - HU 038 Vista */
export interface FilaCedis {
  id: string
  receptor: boolean
  cedis: string
  frecuencia: string
  leadTime: string
  cedisDestino: string
}

/** Tarjeta 1: Datos logísticos (HU 038 Vista, HU 039 Func., HU 040 Guardado) */
export interface DatosLogisticos {
  tipoEsquemaDistribucion: string
  filasCedis: FilaCedis[]
}

/** Tarjeta 2: Medidas con empaque individual (HU 041 Vista, HU 042 Func., HU 043 Guardado) */
export interface MedidasEmpaqueIndividual {
  /** ¿Mi producto tiene empaque individual? */
  tieneEmpaqueIndividual: boolean
  nombreMedidaEmpaque: string
  unidadPeso: string
  peso: number | null
  unidadMedida: string
  alto: number | null
  frente: number | null
  fondo: number | null
  estibaMaxima: number | null
}

/** Opción "¿Cuál aplica para mi producto?" (Empaques del producto) */
export type CualAplicaEmpaque = 'carton_master' | 'bulto' | 'ninguno'

/** Tarjeta 3: Empaques del producto (HU 044 Vista, HU 045 Func., HU 046 Guardado) */
export interface EmpaquesProducto {
  /** ¿Cuál aplica para mi producto? - Cartón master | Bulto | Ninguno de los anteriores */
  cualAplica: CualAplicaEmpaque
  cantidadUdsCartonMaster: number | null
  multiploCartonMaster: number | null
  unidadPeso: string
  peso: number | null
  unidadMedida: string
  alto: number | null
  frente: number | null
  fondo: number | null
}

/** Tarjeta 4: Entrega y manipulación (HU 047 Vista, HU 048 Func., HU 049 Guardado) */
export interface EntregaManipulacion {
  /** Pallet: ¿La entrega podría ser paletizable? (null = sin selección) */
  entregaPaletizable: boolean | null
  /** Pallet - Unidad de medida */
  unidadMedidaPallet: string
  /** Pallet - Layout largo */
  layoutLargo: number | null
  /** Pallet - Layout ancho */
  layoutAncho: number | null
  /** Acomodo: puede acomodarse de distintas formas (null = sin selección) */
  puedeAcomodarseDistintasFormas: boolean | null
}

/** Estado completo del flujo */
export interface DatosLogisticosEmpaqueState {
  datosLogisticos: DatosLogisticos
  medidasEmpaqueIndividual: MedidasEmpaqueIndividual
  empaquesProducto: EmpaquesProducto
  entregaManipulacion: EntregaManipulacion
}

/** Errores de validación por campo */
export interface ValidationErrors {
  [key: string]: string | undefined
}

/** Estado de guardado */
export type GuardadoStatus = 'idle' | 'loading' | 'success' | 'error'
