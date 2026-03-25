/**
 * Mocks para el flujo "Datos logísticos y de empaque"
 * Criterios de aceptación y datos de prueba según HUs 038-049
 */

import type {
  DatosLogisticos,
  DatosLogisticosEmpaqueState,
  FilaCedis,
  EntregaManipulacion,
  MedidasEmpaqueIndividual,
  EmpaquesProducto,
} from '../types'

/** Filas CEDIS mock (solo visualización - HU 038) */
export const mockFilasCedis: FilaCedis[] = [
  { id: '1', receptor: true, cedis: 'CEDIS Coppel Monterrey (MTRY)', frecuencia: 'xxxxxxxxxxx', leadTime: 'xxxxxxxxxxx', cedisDestino: 'MTRY, CLNC, HILLO, LEON, GPLC' },
  { id: '2', receptor: true, cedis: 'CEDIS Coppel Culiacán (CLCN)', frecuencia: 'xxxxxxxxxxx', leadTime: 'xxxxxxxxxxx', cedisDestino: 'MTRY, CLNC, HILLO, LEON, GPLC' },
  { id: '3', receptor: true, cedis: 'CEDIS Coppel Hermosillo (HLLO)', frecuencia: 'xxxxxxxxxxx', leadTime: 'xxxxxxxxxxx', cedisDestino: 'MTRY, CLNC, HILLO, LEON, GPLC' },
  { id: '4', receptor: true, cedis: 'CEDIS Coppel León (LEON)', frecuencia: 'xxxxxxxxxxx', leadTime: 'xxxxxxxxxxx', cedisDestino: 'MTRY, CLNC, HILLO, LEON, GPLC' },
  { id: '5', receptor: true, cedis: 'CEDIS Coppel Guadalajara (GPLC)', frecuencia: 'xxxxxxxxxxx', leadTime: 'xxxxxxxxxxx', cedisDestino: 'MTRY, CLNC, HILLO, LEON, GPLC' },
]

/** Opciones de selects: ver api/mocks/opciones*.json y opcionesSelectService.ts */

/** Valores iniciales para Datos logísticos */
export const initialDatosLogisticos: DatosLogisticos = {
  tipoEsquemaDistribucion: 'Logística_códigos excepción',
  filasCedis: [...mockFilasCedis],
}

export const initialMedidasEmpaqueIndividual: MedidasEmpaqueIndividual = {
  tieneEmpaqueIndividual: true,
  nombreMedidaEmpaque: '',
  unidadPeso: '',
  peso: null,
  unidadMedida: '',
  alto: null,
  frente: null,
  fondo: null,
  estibaMaxima: null,
}

export const initialEmpaquesProducto: EmpaquesProducto = {
  cualAplica: 'carton_master',
  cantidadUdsCartonMaster: null,
  multiploCartonMaster: null,
  unidadPeso: '',
  peso: null,
  unidadMedida: '',
  alto: null,
  frente: null,
  fondo: null,
}

export const initialEntregaManipulacion: EntregaManipulacion = {
  entregaPaletizable: true,
  unidadMedidaPallet: '',
  layoutLargo: null,
  layoutAncho: null,
  puedeAcomodarseDistintasFormas: null,
}

/** Estado inicial completo del flujo */
export const initialState: DatosLogisticosEmpaqueState = {
  datosLogisticos: { ...initialDatosLogisticos },
  medidasEmpaqueIndividual: { ...initialMedidasEmpaqueIndividual },
  empaquesProducto: { ...initialEmpaquesProducto },
  entregaManipulacion: { ...initialEntregaManipulacion },
}

/** Mock: datos precargados para vista (HU 038) */
export const mockDatosLogisticosPrecargados: DatosLogisticos = {
  tipoEsquemaDistribucion: 'Logística_códigos excepción',
  filasCedis: [...mockFilasCedis],
}

export const mockMedidasPrecargadas: MedidasEmpaqueIndividual = {
  tieneEmpaqueIndividual: true,
  nombreMedidaEmpaque: 'Caja unitaria',
  unidadPeso: 'KG',
  peso: 0.45,
  unidadMedida: 'cm',
  alto: 15,
  frente: 10,
  fondo: 25,
  estibaMaxima: 5,
}

export const mockEmpaquesPrecargados: EmpaquesProducto = {
  cualAplica: 'carton_master',
  cantidadUdsCartonMaster: 12,
  multiploCartonMaster: 6,
  unidadPeso: 'KG',
  peso: 8.5,
  unidadMedida: 'cm',
  alto: 30,
  frente: 20,
  fondo: 40,
}

export const mockEntregaPrecargada: EntregaManipulacion = {
  entregaPaletizable: true,
  unidadMedidaPallet: 'Centimetros',
  layoutLargo: 120,
  layoutAncho: 100,
  puedeAcomodarseDistintasFormas: true,
}
