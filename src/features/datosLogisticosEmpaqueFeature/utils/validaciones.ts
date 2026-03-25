/**
 * Validaciones de pantalla para el flujo Datos logísticos y de empaque
 * Criterios de aceptación según HUs 038-049
 */

import type {
  DatosLogisticos,
  MedidasEmpaqueIndividual,
  EmpaquesProducto,
  EntregaManipulacion,
  ValidationErrors,
} from '../types'

// Claves de traducción para i18n (validation.xxx)
const KEY_REQUERIDO = 'validation.requiredField'
const KEY_NUMERO_POSITIVO = 'validation.positiveNumber'
const KEY_MAX_DECIMALES = 'validation.maxDecimals'
const KEY_ENTERO_MAYOR_CERO = 'validation.integerGreaterThanZero'
const KEY_ENTERO = 'validation.integerOnly'
const KEY_ALTO_MAX = 'validation.altoMax'
const KEY_FRENTE_MAX = 'validation.frenteMax'
const KEY_FONDO_MAX = 'validation.fondoMax'
const KEY_ESTIBA_MAX = 'validation.estibaMax'

function esNumeroPositivo(val: number | null | undefined): boolean {
  if (val === null || val === undefined) return false
  return typeof val === 'number' && !Number.isNaN(val) && val > 0
}

function maxDecimales(val: number, max = 2): boolean {
  const str = String(val)
  const decimal = str.split('.')[1]
  return !decimal || decimal.length <= max
}

/** Validar Tarjeta 1: Datos logísticos - HU 040 (Guardado): tipo de esquema requerido */
export function validarDatosLogisticos(data: DatosLogisticos): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!data.tipoEsquemaDistribucion?.trim()) {
    errors.tipoEsquemaDistribucion = KEY_REQUERIDO
  }
  return errors
}

/** Validar Tarjeta 2: Medidas con empaque individual (HU 042 Func., HU 043 Guardado). Si "No" aplica empaque individual, no se exigen los campos de medidas. */
export function validarMedidasEmpaqueIndividual(
  data: MedidasEmpaqueIndividual
): ValidationErrors {
  const errors: ValidationErrors = {}
  if (data.tieneEmpaqueIndividual === false) return errors
  if (!data.unidadPeso?.trim()) errors.unidadPeso = KEY_REQUERIDO
  if (!esNumeroPositivo(data.peso)) errors.peso = KEY_NUMERO_POSITIVO
  else if (data.peso && !maxDecimales(data.peso)) errors.peso = KEY_MAX_DECIMALES
  if (!data.unidadMedida?.trim()) errors.unidadMedida = KEY_REQUERIDO
  if (!esNumeroPositivo(data.alto)) errors.alto = KEY_NUMERO_POSITIVO
  else if (data.alto != null && data.alto > 500) errors.alto = KEY_ALTO_MAX
  else if (data.alto != null && !maxDecimales(data.alto)) errors.alto = KEY_MAX_DECIMALES
  if (!esNumeroPositivo(data.frente)) errors.frente = KEY_NUMERO_POSITIVO
  else if (data.frente != null && data.frente > 500) errors.frente = KEY_FRENTE_MAX
  else if (data.frente != null && !maxDecimales(data.frente)) errors.frente = KEY_MAX_DECIMALES
  if (!esNumeroPositivo(data.fondo)) errors.fondo = KEY_NUMERO_POSITIVO
  else if (data.fondo != null && data.fondo > 500) errors.fondo = KEY_FONDO_MAX
  else if (data.fondo != null && !maxDecimales(data.fondo)) errors.fondo = KEY_MAX_DECIMALES
  if (data.estibaMaxima != null) {
    if (!esNumeroPositivo(data.estibaMaxima)) errors.estibaMaxima = KEY_NUMERO_POSITIVO
    else if (!Number.isInteger(data.estibaMaxima)) errors.estibaMaxima = KEY_ENTERO
    else if (data.estibaMaxima > 999) errors.estibaMaxima = KEY_ESTIBA_MAX
  }
  return errors
}

/** Validar Tarjeta 3: Empaques del producto (HU 045 Func., HU 046 Guardado). Si "Ninguno" no se exigen campos. */
export function validarEmpaquesProducto(data: EmpaquesProducto): ValidationErrors {
  const errors: ValidationErrors = {}
  if (data.cualAplica === 'ninguno') return errors
  if (
    data.cantidadUdsCartonMaster === null ||
    data.cantidadUdsCartonMaster === undefined ||
    data.cantidadUdsCartonMaster <= 0 ||
    !Number.isInteger(data.cantidadUdsCartonMaster)
  ) {
    errors.cantidadUdsCartonMaster = KEY_ENTERO_MAYOR_CERO
  }
  if (
    data.multiploCartonMaster === null ||
    data.multiploCartonMaster === undefined ||
    data.multiploCartonMaster <= 0 ||
    !Number.isInteger(data.multiploCartonMaster)
  ) {
    errors.multiploCartonMaster = KEY_ENTERO_MAYOR_CERO
  }
  if (!data.unidadPeso?.trim()) errors.unidadPeso = KEY_REQUERIDO
  if (!esNumeroPositivo(data.peso)) errors.peso = KEY_NUMERO_POSITIVO
  else if (data.peso && !maxDecimales(data.peso)) errors.peso = KEY_MAX_DECIMALES
  if (!data.unidadMedida?.trim()) errors.unidadMedida = KEY_REQUERIDO
  if (!esNumeroPositivo(data.alto)) errors.alto = KEY_NUMERO_POSITIVO
  else if (data.alto != null && data.alto > 500) errors.alto = KEY_ALTO_MAX
  else if (data.alto != null && !maxDecimales(data.alto)) errors.alto = KEY_MAX_DECIMALES
  if (!esNumeroPositivo(data.frente)) errors.frente = KEY_NUMERO_POSITIVO
  else if (data.frente != null && data.frente > 500) errors.frente = KEY_FRENTE_MAX
  else if (data.frente != null && !maxDecimales(data.frente)) errors.frente = KEY_MAX_DECIMALES
  if (!esNumeroPositivo(data.fondo)) errors.fondo = KEY_NUMERO_POSITIVO
  else if (data.fondo != null && data.fondo > 500) errors.fondo = KEY_FONDO_MAX
  else if (data.fondo != null && !maxDecimales(data.fondo)) errors.fondo = KEY_MAX_DECIMALES
  return errors
}

/** Validar Tarjeta 4: Entrega y manipulación (HU 048 Func., HU 049 Guardado) */
export function validarEntregaManipulacion(data: EntregaManipulacion): ValidationErrors {
  const errors: ValidationErrors = {}
  if (data.entregaPaletizable == null) {
    errors.entregaPaletizable = KEY_REQUERIDO
  }
  // Si es paletizable, validar campos de pallet
  if (data.entregaPaletizable === true) {
    if (!data.unidadMedidaPallet?.trim()) errors.unidadMedidaPallet = KEY_REQUERIDO
    if (!esNumeroPositivo(data.layoutLargo)) errors.layoutLargo = KEY_NUMERO_POSITIVO
    else if (data.layoutLargo != null && !maxDecimales(data.layoutLargo)) errors.layoutLargo = KEY_MAX_DECIMALES
    if (!esNumeroPositivo(data.layoutAncho)) errors.layoutAncho = KEY_NUMERO_POSITIVO
    else if (data.layoutAncho != null && !maxDecimales(data.layoutAncho)) errors.layoutAncho = KEY_MAX_DECIMALES
  }
  if (data.puedeAcomodarseDistintasFormas == null) {
    errors.puedeAcomodarseDistintasFormas = KEY_REQUERIDO
  }
  return errors
}

/** Indica si un objeto de errores tiene al menos un error */
export function tieneErrores(errors: ValidationErrors): boolean {
  return Object.values(errors).some(Boolean)
}
