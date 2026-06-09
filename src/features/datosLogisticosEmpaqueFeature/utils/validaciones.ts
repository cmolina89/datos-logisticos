/**
 * Validaciones de pantalla para el flujo Datos logísticos y de empaque
 * Criterios de aceptación según HUs 038-049
 */

import type {
    DatosLogisticos,
    MedidasEmpaqueIndividual,
    EmpaquesProducto,
    EntregaManipulacion,
    ValidationErrors
} from '../types';

// Claves de traducción para i18n (validation.xxx)
const KEY_REQUERIDO = 'validation.requiredField';
const KEY_NUMERO_POSITIVO = 'validation.positiveNumber';
const KEY_MAX_DECIMALES = 'validation.maxDecimals';
const KEY_ENTERO_MAYOR_CERO = 'validation.integerGreaterThanZero';
const KEY_ENTERO = 'validation.integerOnly';
const KEY_ALTO_MAX = 'validation.altoMax';
const KEY_FRENTE_MAX = 'validation.frenteMax';
const KEY_FONDO_MAX = 'validation.fondoMax';
const KEY_ESTIBA_MAX = 'validation.estibaMax';

function esNumeroPositivo(val: number | null | undefined): boolean {
    if (val === null || val === undefined) return false;
    return typeof val === 'number' && !Number.isNaN(val) && val > 0;
}

function maxDecimales(val: number, max = 2): boolean {
    const str = String(val);
    const decimal = str.split('.')[1];
    return !decimal || decimal.length <= max;
}

// ── Funciones auxiliares para reducir Cognitive Complexity (S3776) ──

/** Valida un número positivo con máximo de decimales y retorna la clave de error o null */
function validarNumeroPositivoConDecimales(val: number | null | undefined): string | null {
    if (!esNumeroPositivo(val)) return KEY_NUMERO_POSITIVO;
    if (val != null && !maxDecimales(val)) return KEY_MAX_DECIMALES;
    return null;
}

/** Valida una dimensión (alto, frente, fondo) con límite máximo */
function validarDimensionConLimite(val: number | null | undefined, maxVal: number, keyMax: string): string | null {
    if (!esNumeroPositivo(val)) return KEY_NUMERO_POSITIVO;
    if (val != null && val > maxVal) return keyMax;
    if (val != null && !maxDecimales(val)) return KEY_MAX_DECIMALES;
    return null;
}

/** Valida que sea un entero positivo mayor a cero */
function validarEnteroPositivo(val: number | null | undefined): string | null {
    if (val === null || val === undefined || val <= 0 || !Number.isInteger(val)) {
        return KEY_ENTERO_MAYOR_CERO;
    }
    return null;
}

/** Asigna el error al campo solo si existe */
function asignarError(errors: ValidationErrors, campo: string, error: string | null): void {
    if (error) {
        errors[campo] = error;
    }
}

// ── Funciones de validación principales ──

/** Validar Tarjeta 1: Datos logísticos - HU 040 (Guardado): tipo de esquema requerido */
export function validarDatosLogisticos(data: DatosLogisticos): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!data.tipoEsquemaDistribucion?.trim()) {
        errors.tipoEsquemaDistribucion = KEY_REQUERIDO;
    }
    return errors;
}

/** Validar Tarjeta 2: Medidas con empaque individual (HU 042 Func., HU 043 Guardado).
 *  Si "No" aplica empaque individual, no se exigen los campos de medidas. */
export function validarMedidasEmpaqueIndividual(data: MedidasEmpaqueIndividual): ValidationErrors {
    const errors: ValidationErrors = {};
    if (data.tieneEmpaqueIndividual === false) return errors;

    if (!data.unidadPeso?.trim()) errors.unidadPeso = KEY_REQUERIDO;
    asignarError(errors, 'peso', validarNumeroPositivoConDecimales(data.peso));

    if (!data.unidadMedida?.trim()) errors.unidadMedida = KEY_REQUERIDO;
    asignarError(errors, 'alto', validarDimensionConLimite(data.alto, 500, KEY_ALTO_MAX));
    asignarError(errors, 'frente', validarDimensionConLimite(data.frente, 500, KEY_FRENTE_MAX));
    asignarError(errors, 'fondo', validarDimensionConLimite(data.fondo, 500, KEY_FONDO_MAX));

    // Validación de estibaMaxima
    if (data.estibaMaxima == null) {
        errors.estibaMaxima = KEY_REQUERIDO;
    } else if (!esNumeroPositivo(data.estibaMaxima)) {
        errors.estibaMaxima = KEY_NUMERO_POSITIVO;
    } else if (!Number.isInteger(data.estibaMaxima)) {
        errors.estibaMaxima = KEY_ENTERO;
    } else if (data.estibaMaxima > 999) {
        errors.estibaMaxima = KEY_ESTIBA_MAX;
    }

    return errors;
}

/** Validar Tarjeta 3: Empaques del producto (HU 045 Func., HU 046 Guardado).
 *  Si "Ninguno" no se exigen campos. */
export function validarEmpaquesProducto(data: EmpaquesProducto): ValidationErrors {
    const errors: ValidationErrors = {};
    if (data.cualAplica === 'ninguno') return errors;

    asignarError(errors, 'cantidadUdsCartonMaster', validarEnteroPositivo(data.cantidadUdsCartonMaster));
    asignarError(errors, 'multiploCartonMaster', validarEnteroPositivo(data.multiploCartonMaster));

    if (!data.unidadPeso?.trim()) errors.unidadPeso = KEY_REQUERIDO;
    asignarError(errors, 'peso', validarNumeroPositivoConDecimales(data.peso));

    if (!data.unidadMedida?.trim()) errors.unidadMedida = KEY_REQUERIDO;
    asignarError(errors, 'alto', validarDimensionConLimite(data.alto, 500, KEY_ALTO_MAX));
    asignarError(errors, 'frente', validarDimensionConLimite(data.frente, 500, KEY_FRENTE_MAX));
    asignarError(errors, 'fondo', validarDimensionConLimite(data.fondo, 500, KEY_FONDO_MAX));

    return errors;
}

/** Validar Tarjeta 4: Entrega y manipulación (HU 048 Func., HU 049 Guardado) */
export function validarEntregaManipulacion(data: EntregaManipulacion): ValidationErrors {
    const errors: ValidationErrors = {};
    if (data.entregaPaletizable == null) {
        errors.entregaPaletizable = KEY_REQUERIDO;
    }
    // Si es paletizable, validar campos de pallet
    if (data.entregaPaletizable === true) {
        if (!data.unidadMedidaPallet?.trim()) errors.unidadMedidaPallet = KEY_REQUERIDO;
        asignarError(errors, 'layoutLargo', validarNumeroPositivoConDecimales(data.layoutLargo));
        asignarError(errors, 'layoutAncho', validarNumeroPositivoConDecimales(data.layoutAncho));
    }
    if (data.puedeAcomodarseDistintasFormas == null) {
        errors.puedeAcomodarseDistintasFormas = KEY_REQUERIDO;
    }
    return errors;
}

/** Indica si un objeto de errores tiene al menos un error */
export function tieneErrores(errors: ValidationErrors): boolean {
    return Object.values(errors).some(Boolean);
}
