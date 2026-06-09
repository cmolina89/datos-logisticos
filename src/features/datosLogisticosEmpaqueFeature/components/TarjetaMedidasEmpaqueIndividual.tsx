/**
 * Segmento Medidas con empaque individual - Tal cual imagen de referencia
 *
 * HU 041 (Vista): El usuario ve el título, texto explicativo y los campos de captura
 *   (nombre, unidad de peso, peso, número de piezas, unidad de medida, alto, frente, fondo, estiba máxima).
 *
 * HU 042 (Func.): Dropdowns para Unidad de peso y Unidad de medida; stepper para Número de piezas;
 *   validación numérica en Peso, Alto, Frente, Fondo, Estiba máxima; texto en Nombre.
 *
 * HU 043 (Guardado): Botón Guardar en el footer del segmento; validación de todos los campos requeridos.
 */

import { useTranslation } from '@/hooks/useTranslation';
import {
    datosLogisticosEmpaqueStateAtom,
    collapseSectionAfterSaveAtom,
    erroresMedidasAtom,
    setMedidasEmpaqueIndividualAtom
} from '../store/datosLogisticosEmpaqueAtoms';
import { useOpcionesUnidadMedidaDimensiones, useOpcionesUnidadPeso } from '../hooks/useOpcionesSelect';
import { useAtomValue, useSetAtom } from 'jotai';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './TarjetaMedidasEmpaqueIndividual.scss';

/** Teclas permitidas en un InputNumber (números, navegación, decimales, etc.) */
const TECLAS_PERMITIDAS = new Set([
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    '.',
    ',',
    '-',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9'
]);

/** Helpers de validación inline por campo */
function validarCampoNumericoPositivo(val: number | null | undefined): string | undefined {
    if (val === null || val === undefined) return undefined; // no mostrar error si está vacío (se valida al guardar)
    if (Number.isNaN(val)) return 'validation.positiveNumber';
    if (val <= 0) return 'validation.positiveNumber';
    return undefined;
}

function validarMaxDecimales(val: number | null | undefined, max = 2): string | undefined {
    if (val === null || val === undefined) return undefined;
    const str = String(val);
    const decimal = str.split('.')[1];
    if (decimal && decimal.length > max) return 'validation.maxDecimals';
    return undefined;
}

function validarAltoMax(val: number | null | undefined, maxVal = 500): string | undefined {
    if (val === null || val === undefined) return undefined;
    if (val > maxVal) return 'validation.altoMax';
    return undefined;
}

function validarFrenteMax(val: number | null | undefined, maxVal = 500): string | undefined {
    if (val === null || val === undefined) return undefined;
    if (val > maxVal) return 'validation.frenteMax';
    return undefined;
}

function validarFondoMax(val: number | null | undefined, maxVal = 500): string | undefined {
    if (val === null || val === undefined) return undefined;
    if (val > maxVal) return 'validation.fondoMax';
    return undefined;
}

function validarEntero(val: number | null | undefined): string | undefined {
    if (val === null || val === undefined) return undefined;
    if (!Number.isInteger(val)) return 'validation.integerOnly';
    return undefined;
}

function validarEstibaMaxima(val: number | null | undefined): string | undefined {
    if (val === null || val === undefined) return undefined;
    const errPositivo = validarCampoNumericoPositivo(val);
    if (errPositivo) return errPositivo;
    const errEntero = validarEntero(val);
    if (errEntero) return errEntero;
    if (val > 999) return 'validation.estibaMax';
    return undefined;
}

interface TarjetaMedidasEmpaqueIndividualProps {
    children?: React.ReactNode;
    saved?: boolean;
}

type CampoMedidas = 'unidadPeso' | 'peso' | 'unidadMedida' | 'alto' | 'frente' | 'fondo' | 'estibaMaxima';

type CampoNumericoMedidas = Exclude<CampoMedidas, 'unidadPeso' | 'unidadMedida'>;
type CampoTextoMedidas = Extract<CampoMedidas, 'unidadPeso' | 'unidadMedida'>;

type ErrorMap = Record<string, string | undefined>;
type AlertaMap = Record<string, boolean>;
type ValidadorCampo = (valor: number | string | null | undefined) => string | undefined;

const validarCampoRequeridoTexto: ValidadorCampo = (valor) => {
    if (!valor || (typeof valor === 'string' && !valor.trim())) {
        return 'validation.requiredField';
    }
    return undefined;
};

const VALIDADORES_INLINE: Record<CampoMedidas, ValidadorCampo> = {
    unidadPeso: validarCampoRequeridoTexto,
    unidadMedida: validarCampoRequeridoTexto,
    peso: (valor) =>
        validarCampoNumericoPositivo(valor as number | null) || validarMaxDecimales(valor as number | null),
    alto: (valor) =>
        validarCampoNumericoPositivo(valor as number | null) ||
        validarAltoMax(valor as number | null) ||
        validarMaxDecimales(valor as number | null),
    frente: (valor) =>
        validarCampoNumericoPositivo(valor as number | null) ||
        validarFrenteMax(valor as number | null) ||
        validarMaxDecimales(valor as number | null),
    fondo: (valor) =>
        validarCampoNumericoPositivo(valor as number | null) ||
        validarFondoMax(valor as number | null) ||
        validarMaxDecimales(valor as number | null),
    estibaMaxima: (valor) => {
        if (valor === null || valor === undefined || valor === '') {
            return 'validation.requiredField';
        }
        return validarEstibaMaxima(valor as number | null);
    }
};

const obtenerErrorCampoInline = (campo: CampoMedidas, valor: number | string | null | undefined): string | undefined =>
    VALIDADORES_INLINE[campo](valor);

const obtenerClaseCampo = (warning: boolean, error: boolean): string => {
    if (warning) return 'campo-warning-input w-full';
    if (error) return 'p-invalid w-full';
    return 'w-full';
};

interface CampoDropdownProps {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    onChange: (value: string) => void;
    t: (key: string) => string;
}

const CampoDropdown: React.FC<CampoDropdownProps> = ({
    id,
    label,
    placeholder,
    value,
    options,
    error,
    required = true,
    disabled = false,
    onChange,
    t
}) => (
    <div className="segmento-medidas-campo">
        <label htmlFor={id} className="p-block segmento-label">
            {label} {required && <span className="campo-requerido">*</span>}
        </label>
        <Dropdown
            id={id}
            value={value}
            options={options}
            onChange={(ev) => onChange(ev.value ?? '')}
            placeholder={placeholder}
            className={error ? 'p-invalid w-full' : 'w-full'}
            disabled={disabled}
        />
        {error && (
            <div className="campo-error-inline">
                <span>{t(error)}</span>
            </div>
        )}
    </div>
);

interface CampoNumericoProps {
    id: string;
    label: string;
    placeholder: string;
    value: number | null;
    error?: string;
    warning?: boolean;
    required?: boolean;
    min?: number;
    max?: number;
    maxFractionDigits?: number;
    useGrouping?: boolean;
    disabled?: boolean;
    onChange: (value: number | null) => void;
    onKeyDown: (ev: React.KeyboardEvent) => void;
    t: (key: string) => string;
}

const CampoNumerico: React.FC<CampoNumericoProps> = ({
    id,
    label,
    placeholder,
    value,
    error,
    warning = false,
    required = true,
    min,
    max,
    maxFractionDigits,
    useGrouping,
    disabled = false,
    onChange,
    onKeyDown,
    t
}) => (
    <div className="segmento-medidas-campo">
        <label htmlFor={id} className="p-block segmento-label">
            {label} {required && <span className="campo-requerido">*</span>}
        </label>
        <div className="input-con-icono-error">
            <InputNumber
                id={id}
                value={value}
                onValueChange={(ev) => onChange(ev.value ?? null)}
                onKeyDown={onKeyDown}
                min={min}
                max={max}
                minFractionDigits={0}
                maxFractionDigits={maxFractionDigits}
                useGrouping={useGrouping}
                placeholder={placeholder}
                className={obtenerClaseCampo(warning, Boolean(error))}
                disabled={disabled}
            />
            {(error || warning) && (
                <span className={`icono-error-input${warning ? ' icono-error-input-warning' : ''}`} aria-hidden="true">
                    !
                </span>
            )}
        </div>
        {warning && (
            <div className="campo-warning-inline">
                <span>{t('validation.numericOnly')}</span>
            </div>
        )}
        {error && !warning && (
            <div className="campo-error-inline">
                <span>{t(error)}</span>
            </div>
        )}
    </div>
);

const TarjetaMedidasEmpaqueIndividual: React.FC<TarjetaMedidasEmpaqueIndividualProps> = ({ children, saved }) => {
    const { t } = useTranslation();
    const state = useAtomValue(datosLogisticosEmpaqueStateAtom);
    const setMedidas = useSetAtom(setMedidasEmpaqueIndividualAtom);
    const collapseSectionAfterSave = useAtomValue(collapseSectionAfterSaveAtom);
    const setCollapseSectionAfterSave = useSetAtom(collapseSectionAfterSaveAtom);
    const errors = useAtomValue(erroresMedidasAtom);
    const setErrors = useSetAtom(erroresMedidasAtom);
    const [collapsed, setCollapsed] = useState(false);
    /** Mapa de campo → true cuando se debe mostrar alerta "solo numéricos" */
    const [alertaNoNumerico, setAlertaNoNumerico] = useState<AlertaMap>({});
    const timersRef = useRef<Record<CampoNumericoMedidas, ReturnType<typeof setTimeout> | undefined>>({
        peso: undefined,
        alto: undefined,
        frente: undefined,
        fondo: undefined,
        estibaMaxima: undefined
    });

    /** Handler onKeyDown para campos numéricos: detecta letras y muestra alerta temporal */
    const handleKeyDownNumerico = useCallback((campo: CampoNumericoMedidas, e: React.KeyboardEvent) => {
        // Permitir combinaciones con Ctrl/Cmd (copiar, pegar, seleccionar todo)
        if (e.ctrlKey || e.metaKey) return;
        if (!TECLAS_PERMITIDAS.has(e.key) && e.key.length === 1) {
            // Es un carácter no numérico (letra u otro símbolo no permitido)
            setAlertaNoNumerico((prev) => ({ ...prev, [campo]: true }));
            // Limpiar timer previo si existe
            if (timersRef.current[campo]) {
                clearTimeout(timersRef.current[campo]);
            }
            // Auto-ocultar la alerta después de 3 segundos
            timersRef.current[campo] = setTimeout(() => {
                setAlertaNoNumerico((prev) => {
                    const next = { ...prev };
                    delete next[campo];
                    return next;
                });
            }, 3000);
        }
    }, []);

    // Limpiar timers al desmontar
    useEffect(() => {
        const currentTimers = timersRef.current;
        return () => {
            for (const t of Object.values(currentTimers)) {
                clearTimeout(t);
            }
        };
    }, []);

    const m = state.medidasEmpaqueIndividual;

    useEffect(() => {
        if (collapseSectionAfterSave === 'medidas') {
            setCollapsed(true);
            setCollapseSectionAfterSave(null);
        }
    }, [collapseSectionAfterSave, setCollapseSectionAfterSave]);

    /** Al cambiar el radio "¿Tiene empaque individual?", limpiar errores */
    const handleTieneEmpaqueChange = useCallback(
        (value: boolean) => {
            setMedidas({ tieneEmpaqueIndividual: value });
            setErrors({});
        },
        [setMedidas, setErrors]
    );

    /** Validación inline: valida un campo individual y actualiza errores en tiempo real */
    const validarCampoInline = useCallback(
        (campo: CampoMedidas, valor: number | string | null | undefined) => {
            const error = obtenerErrorCampoInline(campo, valor);
            setErrors((prev: ErrorMap) => {
                const next = { ...prev };
                if (error) {
                    next[campo] = error;
                } else {
                    delete next[campo];
                }
                return next;
            });
        },
        [setErrors]
    );

    const actualizarCampo = useCallback(
        (campo: CampoMedidas, valor: number | string | null) => {
            setMedidas({ [campo]: valor });
            validarCampoInline(campo, valor);
        },
        [setMedidas, validarCampoInline]
    );

    const handleNumeroChange = useCallback(
        (campo: CampoNumericoMedidas) => (valor: number | null) => {
            actualizarCampo(campo, valor);
        },
        [actualizarCampo]
    );

    const handleTextoChange = useCallback(
        (campo: CampoTextoMedidas) => (valor: string) => {
            actualizarCampo(campo, valor);
        },
        [actualizarCampo]
    );

    const handleNumeroKeyDown = useCallback(
        (campo: CampoNumericoMedidas) => (ev: React.KeyboardEvent) => {
            handleKeyDownNumerico(campo, ev);
        },
        [handleKeyDownNumerico]
    );

    const deshabilitado = !m.tieneEmpaqueIndividual;

    const opcionesUnidadPeso = useOpcionesUnidadPeso();
    const opcionesUnidadMedidaDimensiones = useOpcionesUnidadMedidaDimensiones();

    // Mensajes de error generales (ejemplo, puedes adaptar la lógica según tu validación global)
    const mensajesErrorGenerales = [
        errors._global1 && t(errors._global1),
        errors._global2 && t(errors._global2)
    ].filter(Boolean);

    return (
        <div className="segmento-medidas-empaque-individual">
            <div className="segmento-medidas-header">
                <div className="segmento-medidas-titulo">
                    <h3 className="segmento-titulo-texto">{t('datosLogisticos.segmento2.title')}</h3>
                    {saved && (
                        <span
                            className="sclt clt-check-mark text-3xl"
                            aria-hidden="true"
                            title={t('datosLogisticos.segmento1.completed')}
                            style={{ color: '#2e8a41' }}
                        />
                    )}
                </div>
                <button
                    type="button"
                    className="segmento-collapse"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-expanded={!collapsed}
                    aria-label={
                        collapsed ? t('datosLogisticos.aria.expandSection') : t('datosLogisticos.aria.collapseSection')
                    }
                >
                    <i className={collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'} />
                </button>
            </div>

            {!collapsed && (
                <>
                    <p className="segmento-medidas-intro">{t('datosLogisticos.segmento2.intro')}</p>

                    <div className="segmento-medidas-pregunta p-mb-3">
                        <label className="p-block segmento-label">
                            {t('datosLogisticos.segmento2.hasIndividualPackaging')}
                        </label>
                        <div className="segmento-medidas-radios-fila my-3">
                            <div className="segmento-medidas-radio-opcion">
                                <RadioButton
                                    inputId="tiene-empaque-si"
                                    name="tieneEmpaqueIndividual"
                                    value={true}
                                    checked={m.tieneEmpaqueIndividual}
                                    onChange={() => handleTieneEmpaqueChange(true)}
                                />
                                <label htmlFor="tiene-empaque-si">{t('datosLogisticos.segmento2.yes')}</label>
                            </div>
                            <div className="segmento-medidas-radio-opcion">
                                <RadioButton
                                    inputId="tiene-empaque-no"
                                    name="tieneEmpaqueIndividual"
                                    value={false}
                                    checked={!m.tieneEmpaqueIndividual}
                                    onChange={() => handleTieneEmpaqueChange(false)}
                                />
                                <label htmlFor="tiene-empaque-no">{t('datosLogisticos.segmento2.no')}</label>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`segmento-medidas-form p-fluid ${
                            deshabilitado ? 'segmento-medidas-form-disabled' : ''
                        }`}
                    >
                        <div className="row pb-2">
                            <div className="col-md-4">
                                {' '}
                                <CampoDropdown
                                    id="unidadPeso"
                                    value={m.unidadPeso}
                                    label={t('datosLogisticos.segmento2.unidadPeso')}
                                    placeholder={t('datosLogisticos.segmento2.placeholderUnidadPeso')}
                                    options={opcionesUnidadPeso as Array<{ value: string; label: string }>}
                                    error={errors.unidadPeso}
                                    disabled={deshabilitado}
                                    onChange={handleTextoChange('unidadPeso')}
                                    t={t}
                                />
                            </div>
                            <div className="col-md-4">
                                <CampoNumerico
                                    id="peso"
                                    value={m.peso}
                                    label={t('datosLogisticos.segmento2.peso')}
                                    min={0.01}
                                    maxFractionDigits={2}
                                    placeholder={t('datosLogisticos.segmento2.placeholderPeso')}
                                    error={errors.peso}
                                    warning={Boolean(alertaNoNumerico.peso)}
                                    disabled={deshabilitado}
                                    onChange={handleNumeroChange('peso')}
                                    onKeyDown={handleNumeroKeyDown('peso')}
                                    t={t}
                                />
                            </div>
                            <div className="col-md-4">
                                <div className="segmento-medidas-campo">
                                    <label htmlFor="empaques-numeroPiezas" className="p-block segmento-label">
                                        <span className="flex">
                                            {t('datosLogisticos.segmento3.numeroPiezas')}
                                            <span className="campo-requerido">*</span>
                                        </span>
                                    </label>
                                    <InputNumber
                                        inputId="empaques-numeroPiezas"
                                        value={1}
                                        showButtons
                                        buttonLayout="horizontal"
                                        step={1}
                                        min={1}
                                        max={99999}
                                        useGrouping={false}
                                        incrementButtonClassName="segmento-stepper-btn"
                                        decrementButtonClassName="segmento-stepper-btn"
                                        incrementButtonIcon="pi pi-plus"
                                        decrementButtonIcon="pi pi-minus"
                                        placeholder={t('datosLogisticos.segmento3.placeholderNumeroPiezas')}
                                        className="w-full segmento-stepper-piezas-empaques"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="segmento-medidas-fila segmento-medidas-fila-3 p-mb-2">
                            <CampoDropdown
                                id="unidadMedida"
                                value={m.unidadMedida}
                                label={t('datosLogisticos.segmento2.unidadMedida')}
                                placeholder={t('datosLogisticos.segmento2.placeholderUnidadMedida')}
                                options={opcionesUnidadMedidaDimensiones as Array<{ value: string; label: string }>}
                                error={errors.unidadMedida}
                                disabled={deshabilitado}
                                onChange={handleTextoChange('unidadMedida')}
                                t={t}
                            />
                            <CampoNumerico
                                id="alto"
                                value={m.alto}
                                label={t('datosLogisticos.segmento2.alto')}
                                min={0.01}
                                max={500}
                                maxFractionDigits={2}
                                placeholder={t('datosLogisticos.segmento2.placeholderAlto')}
                                error={errors.alto}
                                warning={Boolean(alertaNoNumerico.alto)}
                                disabled={deshabilitado}
                                onChange={handleNumeroChange('alto')}
                                onKeyDown={handleNumeroKeyDown('alto')}
                                t={t}
                            />
                            <CampoNumerico
                                id="frente"
                                value={m.frente}
                                label={t('datosLogisticos.segmento2.frente')}
                                min={0.01}
                                max={500}
                                maxFractionDigits={2}
                                placeholder={t('datosLogisticos.segmento2.placeholderFrente')}
                                error={errors.frente}
                                warning={Boolean(alertaNoNumerico.frente)}
                                disabled={deshabilitado}
                                onChange={handleNumeroChange('frente')}
                                onKeyDown={handleNumeroKeyDown('frente')}
                                t={t}
                            />
                        </div>

                        <div className="segmento-medidas-fila segmento-medidas-fila-3 p-mb-2">
                            <CampoNumerico
                                id="fondo"
                                value={m.fondo}
                                label={t('datosLogisticos.segmento2.fondo')}
                                min={0.01}
                                max={500}
                                maxFractionDigits={2}
                                placeholder={t('datosLogisticos.segmento2.placeholderFondo')}
                                error={errors.fondo}
                                warning={Boolean(alertaNoNumerico.fondo)}
                                disabled={deshabilitado}
                                onChange={handleNumeroChange('fondo')}
                                onKeyDown={handleNumeroKeyDown('fondo')}
                                t={t}
                            />
                            <CampoNumerico
                                id="estibaMaxima"
                                value={m.estibaMaxima}
                                label={t('datosLogisticos.segmento2.estibaMaxima')}
                                required={false}
                                min={1}
                                max={999}
                                useGrouping={false}
                                placeholder={t('datosLogisticos.segmento2.placeholderEstibaMaxima')}
                                error={errors.estibaMaxima}
                                warning={Boolean(alertaNoNumerico.estibaMaxima)}
                                disabled={deshabilitado}
                                onChange={handleNumeroChange('estibaMaxima')}
                                onKeyDown={handleNumeroKeyDown('estibaMaxima')}
                                t={t}
                            />
                            <div className="segmento-medidas-campo segmento-medidas-campo-vacio" />
                        </div>
                    </div>

                    {/* Mensajes de error generales al inicio del formulario */}
                    {mensajesErrorGenerales.length > 0 && (
                        <div className="alerta-formulario-error">
                            {mensajesErrorGenerales.map((msg, idx) => (
                                <div className="alerta-formulario-error-item" key={idx}>
                                    <span>{msg}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer: botón Guardar (HU 043) */}
                    <div className="segmento-medidas-footer">{children}</div>
                </>
            )}
        </div>
    );
};

export default TarjetaMedidasEmpaqueIndividual;
