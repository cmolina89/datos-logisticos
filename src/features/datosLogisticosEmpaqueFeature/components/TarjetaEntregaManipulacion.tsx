/**
 * Segmento Entrega y manipulación - Tal cual imagen de referencia
 *
 * HU 047 (Vista): El usuario ve el título, subsección Pallet y subsección Acomodo.
 *
 * HU 048 (Func.): Dropdown para Unidad de medida; InputNumber para Layout largo/ancho;
 *   radios para paletizable y acomodo.
 *
 * HU 049 (Guardado): Botón Guardar en el footer; validación de campos requeridos.
 */

import { useTranslation } from '@/hooks/useTranslation';
import {
    datosLogisticosEmpaqueStateAtom,
    collapseSectionAfterSaveAtom,
    erroresEntregaAtom,
    setEntregaManipulacionAtom
} from '../store/datosLogisticosEmpaqueAtoms';
import { useOpcionesUnidadMedidaDimensiones } from '../hooks/useOpcionesSelect';
import { useAtomValue, useSetAtom } from 'jotai';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './TarjetaEntregaManipulacion.scss';

/** Teclas permitidas en un InputNumber */
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

/** Helpers de validación inline */
function validarCampoNumericoPositivo(val: number | null | undefined): string | undefined {
    if (val === null || val === undefined) return undefined;
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

interface TarjetaEntregaManipulacionProps {
    children?: React.ReactNode;
    saved?: boolean;
}

const TarjetaEntregaManipulacion: React.FC<TarjetaEntregaManipulacionProps> = ({ children, saved }) => {
    const { t } = useTranslation();
    const state = useAtomValue(datosLogisticosEmpaqueStateAtom);
    const setEntrega = useSetAtom(setEntregaManipulacionAtom);
    const collapseSectionAfterSave = useAtomValue(collapseSectionAfterSaveAtom);
    const setCollapseSectionAfterSave = useSetAtom(collapseSectionAfterSaveAtom);
    const errors = useAtomValue(erroresEntregaAtom);
    const setErrors = useSetAtom(erroresEntregaAtom);
    const [collapsed, setCollapsed] = useState(false);
    const [alertaNoNumerico, setAlertaNoNumerico] = useState<Record<string, boolean>>({});
    const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const en = state.entregaManipulacion;
    const opcionesUnidadMedida = useOpcionesUnidadMedidaDimensiones();

    useEffect(() => {
        if (collapseSectionAfterSave === 'entrega') {
            setCollapsed(true);
            setCollapseSectionAfterSave(null);
        }
    }, [collapseSectionAfterSave, setCollapseSectionAfterSave]);

    // Limpiar timers al desmontar
    useEffect(() => {
        const currentTimers = timersRef.current;
        return () => {
            for (const timer of Object.values(currentTimers)) {
                clearTimeout(timer);
            }
        };
    }, []);

    /** Handler onKeyDown para campos numéricos: detecta letras y muestra alerta temporal */
    const handleKeyDownNumerico = useCallback((campo: string, ev: React.KeyboardEvent) => {
        if (ev.ctrlKey || ev.metaKey) return;
        if (!TECLAS_PERMITIDAS.has(ev.key) && ev.key.length === 1) {
            setAlertaNoNumerico((prev) => ({ ...prev, [campo]: true }));
            if (timersRef.current[campo]) {
                clearTimeout(timersRef.current[campo]);
            }
            timersRef.current[campo] = setTimeout(() => {
                setAlertaNoNumerico((prev) => {
                    const next = { ...prev };
                    delete next[campo];
                    return next;
                });
            }, 3000);
        }
    }, []);

    /** Validación inline por campo */
    const validarCampoInline = useCallback(
        (campo: string, valor: number | string | null | undefined) => {
            let error: string | undefined;
            switch (campo) {
                case 'unidadMedidaPallet':
                    if (!valor || (typeof valor === 'string' && !valor.trim())) {
                        error = 'validation.requiredField';
                    }
                    break;
                case 'layoutLargo':
                case 'layoutAncho':
                    error =
                        validarCampoNumericoPositivo(valor as number | null) ||
                        validarMaxDecimales(valor as number | null);
                    break;
                default:
                    break;
            }
            setErrors((prev: Record<string, string | undefined>) => {
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

    /** Al cambiar paletizable, limpiar errores de pallet */
    const handlePaletizableChange = useCallback(
        (value: boolean) => {
            setEntrega({ entregaPaletizable: value });
            setAlertaNoNumerico({});
            setErrors((prev: Record<string, string | undefined>) => {
                const next = { ...prev };
                delete next.entregaPaletizable;
                delete next.unidadMedidaPallet;
                delete next.layoutLargo;
                delete next.layoutAncho;
                return next;
            });
        },
        [setEntrega, setErrors]
    );

    /** Al cambiar acomodo, limpiar error de ese campo */
    const handleAcomodoChange = useCallback(
        (value: boolean) => {
            setEntrega({ puedeAcomodarseDistintasFormas: value });
            setErrors((prev: Record<string, string | undefined>) => {
                const next = { ...prev };
                delete next.puedeAcomodarseDistintasFormas;
                return next;
            });
        },
        [setEntrega, setErrors]
    );

    return (
        <div className="segmento-entrega-manipulacion">
            <div className="segmento-entrega-header">
                <div className="segmento-entrega-titulo">
                    <h3 className="segmento-titulo-texto">{t('datosLogisticos.segmento4.title')}</h3>
                    {saved && (
                        <span
                            className="sclt clt-check-mark text-3xl"
                            aria-hidden="true"
                            title={t('datosLogisticos.segmento4.completed')}
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
                <div className="segmento-entrega-body">
                    <p className="segmento-entrega-intro-texto">{t('datosLogisticos.segmento4.intro')}</p>

                    {/* Pallet */}
                    <h4 className="segmento-subtitulo">{t('datosLogisticos.segmento4.pallet')}</h4>
                    <div className="segmento-pregunta p-mb-2">
                        <label className="p-block segmento-label">
                            {t('datosLogisticos.segmento4.paletizable')} <span className="campo-requerido">*</span>
                        </label>
                        <div className="segmento-radios-fila my-3">
                            <div className="segmento-radio-opcion">
                                <RadioButton
                                    inputId="paletizable-si"
                                    name="entregaPaletizable"
                                    value={true}
                                    checked={en.entregaPaletizable === true}
                                    onChange={() => handlePaletizableChange(true)}
                                />
                                <label htmlFor="paletizable-si">{t('datosLogisticos.segmento4.yes')}</label>
                            </div>
                            <div className="segmento-radio-opcion">
                                <RadioButton
                                    inputId="paletizable-no"
                                    name="entregaPaletizable"
                                    value={false}
                                    checked={en.entregaPaletizable === false}
                                    onChange={() => handlePaletizableChange(false)}
                                />
                                <label htmlFor="paletizable-no">{t('datosLogisticos.segmento4.no')}</label>
                            </div>
                        </div>
                        {errors.entregaPaletizable && (
                            <div className="campo-error-inline">
                                <span>{t(errors.entregaPaletizable)}</span>
                            </div>
                        )}
                    </div>

                    {en.entregaPaletizable === true && (
                        <>
                            <br />
                            <div className="segmento-entrega-pallet-fila p-fluid p-mb-3">
                                <div className="segmento-entrega-campo">
                                    <label htmlFor="unidadMedidaPallet" className="p-block segmento-label">
                                        {t('datosLogisticos.segmento4.unidadMedida')}{' '}
                                        <span className="campo-requerido">*</span>
                                    </label>
                                    <Dropdown
                                        id="unidadMedidaPallet"
                                        value={en.unidadMedidaPallet || null}
                                        options={opcionesUnidadMedida}
                                        onChange={(ev) => {
                                            const v = ev.value ?? '';
                                            setEntrega({ unidadMedidaPallet: v });
                                            validarCampoInline('unidadMedidaPallet', v);
                                        }}
                                        placeholder={t('datosLogisticos.segmento2.placeholderUnidadMedida')}
                                        className={errors.unidadMedidaPallet ? 'p-invalid w-full' : 'w-full'}
                                    />
                                    {errors.unidadMedidaPallet && (
                                        <div className="campo-error-inline">
                                            <span>{t(errors.unidadMedidaPallet)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="segmento-entrega-campo">
                                    <label htmlFor="layoutLargo" className="p-block segmento-label">
                                        {t('datosLogisticos.segmento4.layoutLargo')}{' '}
                                        <span className="campo-requerido">*</span>
                                    </label>
                                    <div className="input-con-icono-error">
                                        <InputNumber
                                            id="layoutLargo"
                                            value={en.layoutLargo}
                                            onValueChange={(ev) => {
                                                const v = ev.value ?? null;
                                                setEntrega({ layoutLargo: v });
                                                validarCampoInline('layoutLargo', v);
                                            }}
                                            onKeyDown={(ev) => handleKeyDownNumerico('layoutLargo', ev)}
                                            min={0.01}
                                            minFractionDigits={0}
                                            maxFractionDigits={2}
                                            placeholder={t('datosLogisticos.segmento4.layoutLargo')}
                                            className={
                                                alertaNoNumerico.layoutLargo
                                                    ? 'campo-warning-input w-full'
                                                    : errors.layoutLargo
                                                    ? 'p-invalid w-full'
                                                    : 'w-full'
                                            }
                                        />
                                        {(errors.layoutLargo || alertaNoNumerico.layoutLargo) && (
                                            <span
                                                className={`icono-error-input${
                                                    alertaNoNumerico.layoutLargo ? ' icono-error-input-warning' : ''
                                                }`}
                                                aria-hidden="true"
                                            >
                                                !
                                            </span>
                                        )}
                                    </div>
                                    {alertaNoNumerico.layoutLargo && (
                                        <div className="campo-warning-inline">
                                            <span>{t('validation.numericOnly')}</span>
                                        </div>
                                    )}
                                    {errors.layoutLargo && !alertaNoNumerico.layoutLargo && (
                                        <div className="campo-error-inline">
                                            <span>{t(errors.layoutLargo)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="segmento-entrega-campo">
                                    <label htmlFor="layoutAncho" className="p-block segmento-label">
                                        {t('datosLogisticos.segmento4.layoutAncho')}{' '}
                                        <span className="campo-requerido">*</span>
                                    </label>
                                    <div className="input-con-icono-error">
                                        <InputNumber
                                            id="layoutAncho"
                                            value={en.layoutAncho}
                                            onValueChange={(ev) => {
                                                const v = ev.value ?? null;
                                                setEntrega({ layoutAncho: v });
                                                validarCampoInline('layoutAncho', v);
                                            }}
                                            onKeyDown={(ev) => handleKeyDownNumerico('layoutAncho', ev)}
                                            min={0.01}
                                            minFractionDigits={0}
                                            maxFractionDigits={2}
                                            placeholder={t('datosLogisticos.segmento4.layoutAncho')}
                                            className={
                                                alertaNoNumerico.layoutAncho
                                                    ? 'campo-warning-input w-full'
                                                    : errors.layoutAncho
                                                    ? 'p-invalid w-full'
                                                    : 'w-full'
                                            }
                                        />
                                        {(errors.layoutAncho || alertaNoNumerico.layoutAncho) && (
                                            <span
                                                className={`icono-error-input${
                                                    alertaNoNumerico.layoutAncho ? ' icono-error-input-warning' : ''
                                                }`}
                                                aria-hidden="true"
                                            >
                                                !
                                            </span>
                                        )}
                                    </div>
                                    {alertaNoNumerico.layoutAncho && (
                                        <div className="campo-warning-inline">
                                            <span>{t('validation.numericOnly')}</span>
                                        </div>
                                    )}
                                    {errors.layoutAncho && !alertaNoNumerico.layoutAncho && (
                                        <div className="campo-error-inline">
                                            <span>{t(errors.layoutAncho)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Acomodo */}
                    <h4 className="segmento-subtitulo">{t('datosLogisticos.segmento4.acomodo')}</h4>

                    <div className="segmento-pregunta p-mb-3">
                        <label className="p-block segmento-label">
                            {t('datosLogisticos.segmento4.acomodoLabel')} <span className="campo-requerido">*</span>
                        </label>
                        <div className="segmento-radios-fila my-3">
                            <div className="segmento-radio-opcion">
                                <RadioButton
                                    inputId="acomodo-si"
                                    name="acomodo"
                                    value={true}
                                    checked={en.puedeAcomodarseDistintasFormas === true}
                                    onChange={() => handleAcomodoChange(true)}
                                />
                                <label htmlFor="acomodo-si">{t('datosLogisticos.segmento4.yes')}</label>
                            </div>
                            <div className="segmento-radio-opcion">
                                <RadioButton
                                    inputId="acomodo-no"
                                    name="acomodo"
                                    value={false}
                                    checked={en.puedeAcomodarseDistintasFormas === false}
                                    onChange={() => handleAcomodoChange(false)}
                                />
                                <label htmlFor="acomodo-no">{t('datosLogisticos.segmento4.no')}</label>
                            </div>
                        </div>
                        {errors.puedeAcomodarseDistintasFormas && (
                            <div className="campo-error-inline">
                                <span>{t(errors.puedeAcomodarseDistintasFormas)}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer: Guardar (HU 049) */}
                    <div className="segmento-entrega-footer">{children}</div>
                </div>
            )}
        </div>
    );
};

export default TarjetaEntregaManipulacion;
