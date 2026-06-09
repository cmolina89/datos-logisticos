/**
 * Segmento Cartón máster - Tal cual imagen de referencia
 *
 * HU 044 (Vista): El usuario ve el título, texto explicativo y los campos de captura
 *   (cantidad uds, múltiplo, unidad de peso, peso, unidad de medida, alto, frente, fondo).
 *
 * HU 045 (Func.): Dropdowns para Unidad de peso y Unidad de medida; campos numéricos
 *   con validación; iconos de información en los dos primeros campos.
 *
 * HU 046 (Guardado): Botón Guardar en el footer del segmento; validación de todos los campos requeridos.
 */

import { useTranslation } from '@/hooks/useTranslation';
import {
    datosLogisticosEmpaqueStateAtom,
    collapseSectionAfterSaveAtom,
    erroresEmpaquesAtom,
    setEmpaquesProductoAtom
} from '../store/datosLogisticosEmpaqueAtoms';
import type { CualAplicaEmpaque } from '../types';
import {
    useOpcionesCualAplicaEmpaque,
    useOpcionesUnidadMedidaDimensiones,
    useOpcionesUnidadPeso
} from '../hooks/useOpcionesSelect';
import { useAtomValue, useSetAtom } from 'jotai';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Dialog } from 'primereact/dialog';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import cartonMasterIllustration from '@/assets/images/carton-master-illustration.png';
import bultoIllustration from '@/assets/images/bulto-illustration.png';
import './TarjetaEmpaquesProducto.scss';

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

function validarEnteroMayorCero(val: number | null | undefined): string | undefined {
    if (val === null || val === undefined) return undefined;
    if (Number.isNaN(val) || val <= 0 || !Number.isInteger(val)) {
        return 'validation.integerGreaterThanZero';
    }
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

interface TarjetaEmpaquesProductoProps {
    children?: React.ReactNode;
    saved?: boolean;
}

type CampoEmpaques =
    | 'cantidadUdsCartonMaster'
    | 'multiploCartonMaster'
    | 'unidadPeso'
    | 'peso'
    | 'unidadMedida'
    | 'alto'
    | 'frente'
    | 'fondo';

type CampoNumericoEmpaques = Exclude<CampoEmpaques, 'unidadPeso' | 'unidadMedida'>;

type ErrorMap = Record<string, string | undefined>;
type AlertaMap = Record<string, boolean>;

type ValidadorCampo = (valor: number | string | null | undefined) => string | undefined;

const validarCampoRequeridoTexto: ValidadorCampo = (valor) => {
    if (!valor || (typeof valor === 'string' && !valor.trim())) {
        return 'validation.requiredField';
    }
    return undefined;
};

const VALIDADORES_INLINE: Record<CampoEmpaques, ValidadorCampo> = {
    unidadPeso: validarCampoRequeridoTexto,
    unidadMedida: validarCampoRequeridoTexto,
    cantidadUdsCartonMaster: (valor) => validarEnteroMayorCero(valor as number | null),
    multiploCartonMaster: (valor) => validarEnteroMayorCero(valor as number | null),
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
        validarMaxDecimales(valor as number | null)
};

const obtenerErrorCampoInline = (campo: CampoEmpaques, valor: number | string | null | undefined): string | undefined =>
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
    required?: boolean;
    options: Array<{ value: string; label: string }>;
    error?: string;
    onChange: (value: string) => void;
    t: (key: string) => string;
}

const CampoDropdown: React.FC<CampoDropdownProps> = ({
    id,
    label,
    placeholder,
    value,
    required = true,
    options,
    error,
    onChange,
    t
}) => (
    <div className="segmento-carton-campo">
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
    infoText?: string;
    min?: number;
    max?: number;
    maxFractionDigits?: number;
    useGrouping?: boolean;
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
    infoText,
    min,
    max,
    maxFractionDigits,
    useGrouping,
    onChange,
    onKeyDown,
    t
}) => (
    <div className="segmento-carton-campo">
        <label htmlFor={id} className={`p-block segmento-label${infoText ? ' segmento-label-with-info' : ''}`}>
            <span>{label}</span>
            <span className="campo-requerido">*</span>
            {infoText && (
                <span className="segmento-info-icon" title={infoText} aria-label={t('datosLogisticos.segmento3.info')}>
                    <i className="pi pi-info-circle" />
                </span>
            )}
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

const ModalIllustrationCartonMaster: React.FC = () => (
    <img
        src={cartonMasterIllustration}
        alt="Cartón master: caja con 12 juguetes"
        className="segmento-carton-modal-illustration"
    />
);

const ModalIllustrationBulto: React.FC = () => (
    <img
        src={bultoIllustration}
        alt="Bulto: 3 cajas que ensamblan un mueble"
        className="segmento-carton-modal-illustration"
    />
);

interface ModalCardProps {
    title: string;
    usesTitle: string;
    bullets: string[];
    exampleTitle: string;
    example: string;
    actionLabel: string;
    onSelect: () => void;
    illustration: React.ReactNode;
}

const ModalCard: React.FC<ModalCardProps> = ({
    title,
    usesTitle,
    bullets,
    exampleTitle,
    example,
    actionLabel,
    onSelect,
    illustration
}) => (
    <article className="segmento-carton-modal-card">
        <h3 className="segmento-carton-modal-card-title">{title}</h3>
        <div className="segmento-carton-modal-card-body">
            <div className="segmento-carton-modal-copy">
                <p className="segmento-carton-modal-uses-title">{usesTitle}</p>
                <ul className="segmento-carton-modal-bullets">
                    {bullets.map((bullet, index) => (
                        <li key={`${title}-${index}`}>{bullet}</li>
                    ))}
                </ul>
                <p className="segmento-carton-modal-example-title">{exampleTitle}</p>
                <p className="segmento-carton-modal-example-text">{example}</p>
            </div>
            <div className="segmento-carton-modal-illustration-wrap">{illustration}</div>
        </div>
        <div className="segmento-carton-modal-card-footer">
            <button type="button" className="segmento-carton-modal-action" onClick={onSelect}>
                {actionLabel}
            </button>
        </div>
    </article>
);

const camposVaciosEmpaques = {
    cantidadUdsCartonMaster: null as number | null,
    multiploCartonMaster: null as number | null,
    unidadPeso: '',
    peso: null as number | null,
    unidadMedida: '',
    alto: null as number | null,
    frente: null as number | null,
    fondo: null as number | null
};

const TarjetaEmpaquesProducto: React.FC<TarjetaEmpaquesProductoProps> = ({ children, saved }) => {
    const { t } = useTranslation();
    const state = useAtomValue(datosLogisticosEmpaqueStateAtom);
    const setEmpaques = useSetAtom(setEmpaquesProductoAtom);
    const collapseSectionAfterSave = useAtomValue(collapseSectionAfterSaveAtom);
    const setCollapseSectionAfterSave = useSetAtom(collapseSectionAfterSaveAtom);
    const errors = useAtomValue(erroresEmpaquesAtom);
    const setErrors = useSetAtom(erroresEmpaquesAtom);
    const [collapsed, setCollapsed] = useState(false);
    const [showModalCualAplica, setShowModalCualAplica] = useState(false);
    /** Mapa de campo → true cuando se debe mostrar alerta "solo numéricos" */
    const [alertaNoNumerico, setAlertaNoNumerico] = useState<AlertaMap>({});
    const timersRef = useRef<Record<CampoNumericoEmpaques, ReturnType<typeof setTimeout> | undefined>>(
        {} as Record<CampoNumericoEmpaques, ReturnType<typeof setTimeout> | undefined>
    );

    const e = state.empaquesProducto;

    useEffect(() => {
        if (collapseSectionAfterSave === 'empaques') {
            setCollapsed(true);
            setCollapseSectionAfterSave(null);
        }
    }, [collapseSectionAfterSave, setCollapseSectionAfterSave]);

    /** Al cambiar "¿Cuál aplica?", limpiar campos y errores */
    const handleCualAplicaChange = useCallback(
        (value: CualAplicaEmpaque) => {
            setEmpaques({ cualAplica: value, ...camposVaciosEmpaques });
            setErrors({});
            setAlertaNoNumerico({});
        },
        [setEmpaques, setErrors]
    );

    /** Handler onKeyDown para campos numéricos: detecta letras y muestra alerta temporal */
    const handleKeyDownNumerico = useCallback((campo: CampoNumericoEmpaques, ev: React.KeyboardEvent) => {
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

    // Limpiar timers al desmontar
    useEffect(() => {
        const currentTimers = timersRef.current;
        return () => {
            for (const timer of Object.values(currentTimers)) {
                clearTimeout(timer);
            }
        };
    }, []);

    /** Validación inline: valida un campo individual y actualiza errores en tiempo real */
    const validarCampoInline = useCallback(
        (campo: CampoEmpaques, valor: number | string | null | undefined) => {
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
        (campo: CampoEmpaques, valor: number | string | null) => {
            setEmpaques({ [campo]: valor });
            validarCampoInline(campo, valor);
        },
        [setEmpaques, validarCampoInline]
    );

    const handleNumeroChange = useCallback(
        (campo: CampoNumericoEmpaques) => (valor: number | null) => {
            actualizarCampo(campo, valor);
        },
        [actualizarCampo]
    );

    const handleTextoChange = useCallback(
        (campo: Extract<CampoEmpaques, 'unidadPeso' | 'unidadMedida'>) => (valor: string) => {
            actualizarCampo(campo, valor);
        },
        [actualizarCampo]
    );

    const handleNumeroKeyDown = useCallback(
        (campo: CampoNumericoEmpaques) => (ev: React.KeyboardEvent) => {
            handleKeyDownNumerico(campo, ev);
        },
        [handleKeyDownNumerico]
    );

    const opcionesUnidadPeso = useOpcionesUnidadPeso();
    const opcionesUnidadMedidaDimensiones = useOpcionesUnidadMedidaDimensiones();
    const opcionesCualAplicaRaw = useOpcionesCualAplicaEmpaque();
    const opcionesCualAplica: { value: CualAplicaEmpaque; label: string }[] = opcionesCualAplicaRaw.map((o) => ({
        value: o.value as CualAplicaEmpaque,
        label: o.label
    }));

    const mostrarFormulario = e.cualAplica === 'carton_master' || e.cualAplica === 'bulto';

    const abrirModalCualAplica = useCallback((ev: React.MouseEvent<HTMLAnchorElement>) => {
        ev.preventDefault();
        setShowModalCualAplica(true);
    }, []);

    const abrirModalCualAplicaTeclado = useCallback((ev: React.KeyboardEvent<HTMLAnchorElement>) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            setShowModalCualAplica(true);
        }
    }, []);

    const handleSeleccionModal = useCallback(
        (value: CualAplicaEmpaque) => {
            handleCualAplicaChange(value);
            setShowModalCualAplica(false);
        },
        [handleCualAplicaChange]
    );

    return (
        <div className="segmento-carton-master">
            <Dialog
                visible={showModalCualAplica}
                onHide={() => setShowModalCualAplica(false)}
                className="segmento-carton-modal-cual-aplica"
                contentClassName="segmento-carton-modal-content"
                dismissableMask
                modal
                closable={false}
                showHeader={false}
                draggable={false}
                blockScroll
                style={{ width: 'min(94vw, 53rem)' }}
            >
                <div className="segmento-carton-modal-shell">
                    <button
                        type="button"
                        className="segmento-carton-modal-close"
                        aria-label={t('common.close')}
                        onClick={() => setShowModalCualAplica(false)}
                    >
                        <i className="pi pi-times" aria-hidden="true" />
                    </button>

                    <div className="segmento-carton-modal-header">
                        <div className="segmento-carton-modal-icon" aria-hidden="true">
                            <i className="pi pi-info" />
                        </div>
                        <h2 className="segmento-carton-modal-title">
                            {t('datosLogisticos.segmento3.modalCualAplicaTitle')}
                        </h2>
                        <p className="segmento-carton-modal-subtitle">
                            {t('datosLogisticos.segmento3.modalCualAplicaSubtitle')}
                        </p>
                    </div>

                    <div className="segmento-carton-modal-grid">
                        <ModalCard
                            title={t('datosLogisticos.segmento3.cartonMaster')}
                            usesTitle={t('datosLogisticos.segmento3.modalCualAplicaUsesTitle')}
                            bullets={[
                                t('datosLogisticos.segmento3.modalCualAplicaCartonMasterBullet1'),
                                t('datosLogisticos.segmento3.modalCualAplicaCartonMasterBullet2'),
                                t('datosLogisticos.segmento3.modalCualAplicaCartonMasterBullet3')
                            ]}
                            exampleTitle={t('datosLogisticos.segmento3.modalCualAplicaExampleTitle')}
                            example={t('datosLogisticos.segmento3.modalCualAplicaCartonMasterExample')}
                            actionLabel={t('datosLogisticos.segmento3.modalCualAplicaCartonMasterAction')}
                            onSelect={() => handleSeleccionModal('carton_master')}
                            illustration={<ModalIllustrationCartonMaster />}
                        />

                        <ModalCard
                            title={t('datosLogisticos.segmento3.bulto')}
                            usesTitle={t('datosLogisticos.segmento3.modalCualAplicaUsesTitle')}
                            bullets={[
                                t('datosLogisticos.segmento3.modalCualAplicaBultoBullet1'),
                                t('datosLogisticos.segmento3.modalCualAplicaBultoBullet2'),
                                t('datosLogisticos.segmento3.modalCualAplicaBultoBullet3'),
                                t('datosLogisticos.segmento3.modalCualAplicaBultoBullet4')
                            ]}
                            exampleTitle={t('datosLogisticos.segmento3.modalCualAplicaExampleTitle')}
                            example={t('datosLogisticos.segmento3.modalCualAplicaBultoExample')}
                            actionLabel={t('datosLogisticos.segmento3.modalCualAplicaBultoAction')}
                            onSelect={() => handleSeleccionModal('bulto')}
                            illustration={<ModalIllustrationBulto />}
                        />
                    </div>
                </div>
            </Dialog>
            <div className="segmento-carton-header">
                <div className="segmento-carton-titulo">
                    <h3 className="segmento-titulo-texto">{t('datosLogisticos.segmento3.title')}</h3>
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
                    <p className="segmento-carton-intro">{t('datosLogisticos.segmento3.intro')}</p>

                    <div className="segmento-carton-pregunta p-mb-3">
                        <a
                            href="#cual-aplica"
                            className="segmento-pregunta-cual-aplica"
                            role="button"
                            onClick={abrirModalCualAplica}
                            onKeyDown={abrirModalCualAplicaTeclado}
                        >
                            {t('datosLogisticos.segmento3.cualAplica')} <span className="campo-requerido">*</span>
                        </a>
                        <div className="segmento-radios-cual-aplica">
                            {opcionesCualAplica.map((opt) => (
                                <div key={opt.value} className="segmento-radio-opcion-carton">
                                    <RadioButton
                                        inputId={`cual-aplica-${opt.value}`}
                                        name="cualAplica"
                                        value={opt.value}
                                        checked={e.cualAplica === opt.value}
                                        onChange={() => handleCualAplicaChange(opt.value)}
                                    />
                                    <label htmlFor={`cual-aplica-${opt.value}`}>{opt.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <br />
                    {e.cualAplica === 'ninguno' && (
                        <p className="segmento-carton-ninguno-msg">{t('datosLogisticos.segmento3.ningunoNoCampos')}</p>
                    )}
                    {mostrarFormulario && (
                        <>
                            <br />
                            <div className="segmento-carton-form p-fluid">
                                <div className="row pb-2">
                                    <div className="col-md-4">
                                        <CampoNumerico
                                            id="cantidadUdsCartonMaster"
                                            value={e.cantidadUdsCartonMaster}
                                            label={t('datosLogisticos.segmento3.cantidadUds')}
                                            infoText={t('datosLogisticos.segmento3.cantidadUdsInfo')}
                                            min={1}
                                            max={99999}
                                            useGrouping={false}
                                            maxFractionDigits={0}
                                            placeholder={t('datosLogisticos.segmento3.placeholderCantidadUds')}
                                            error={errors.cantidadUdsCartonMaster}
                                            warning={Boolean(alertaNoNumerico.cantidadUdsCartonMaster)}
                                            onChange={handleNumeroChange('cantidadUdsCartonMaster')}
                                            onKeyDown={handleNumeroKeyDown('cantidadUdsCartonMaster')}
                                            t={t}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <CampoNumerico
                                            id="multiploCartonMaster"
                                            value={e.multiploCartonMaster}
                                            label={t('datosLogisticos.segmento3.multiplo')}
                                            infoText={t('datosLogisticos.segmento3.multiploInfo')}
                                            min={1}
                                            max={99999}
                                            useGrouping={false}
                                            maxFractionDigits={0}
                                            placeholder={t('datosLogisticos.segmento3.placeholderMultiplo')}
                                            error={errors.multiploCartonMaster}
                                            warning={Boolean(alertaNoNumerico.multiploCartonMaster)}
                                            onChange={handleNumeroChange('multiploCartonMaster')}
                                            onKeyDown={handleNumeroKeyDown('multiploCartonMaster')}
                                            t={t}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        {e.cualAplica === 'bulto' ? (
                                            <div className="segmento-carton-campo">
                                                <label
                                                    htmlFor="empaques-numeroPiezas"
                                                    className="p-block segmento-label"
                                                >
                                                    <span className="flex">
                                                        {t('datosLogisticos.segmento3.numeroPiezas')}
                                                        <span className="campo-requerido">*</span>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
                                        ) : (
                                            <div
                                                className="segmento-carton-campo segmento-carton-campo-vacio"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="segmento-carton-fila segmento-carton-fila-3 p-mb-2">
                                    <CampoDropdown
                                        id="empaques-unidadPeso"
                                        value={e.unidadPeso}
                                        label={t('datosLogisticos.segmento2.unidadPeso')}
                                        placeholder={t('datosLogisticos.segmento2.placeholderUnidadPeso')}
                                        options={opcionesUnidadPeso as Array<{ value: string; label: string }>}
                                        error={errors.unidadPeso}
                                        onChange={handleTextoChange('unidadPeso')}
                                        t={t}
                                    />
                                    <CampoNumerico
                                        id="empaques-peso"
                                        value={e.peso}
                                        label={t('datosLogisticos.segmento2.peso')}
                                        min={0.01}
                                        maxFractionDigits={2}
                                        placeholder={t('datosLogisticos.segmento2.placeholderPeso')}
                                        error={errors.peso}
                                        warning={Boolean(alertaNoNumerico.peso)}
                                        onChange={handleNumeroChange('peso')}
                                        onKeyDown={handleNumeroKeyDown('peso')}
                                        t={t}
                                    />
                                    <div
                                        className="segmento-carton-campo segmento-carton-campo-vacio"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="segmento-carton-fila segmento-carton-fila-3 p-mb-2">
                                    <CampoDropdown
                                        id="empaques-unidadMedida"
                                        value={e.unidadMedida}
                                        label={t('datosLogisticos.segmento2.unidadMedida')}
                                        placeholder={t('datosLogisticos.segmento2.placeholderUnidadMedida')}
                                        options={
                                            opcionesUnidadMedidaDimensiones as Array<{ value: string; label: string }>
                                        }
                                        error={errors.unidadMedida}
                                        onChange={handleTextoChange('unidadMedida')}
                                        t={t}
                                    />
                                    <CampoNumerico
                                        id="empaques-alto"
                                        value={e.alto}
                                        label={t('datosLogisticos.segmento2.alto')}
                                        min={0.01}
                                        max={500}
                                        maxFractionDigits={2}
                                        placeholder={t('datosLogisticos.segmento2.placeholderAlto')}
                                        error={errors.alto}
                                        warning={Boolean(alertaNoNumerico.alto)}
                                        onChange={handleNumeroChange('alto')}
                                        onKeyDown={handleNumeroKeyDown('alto')}
                                        t={t}
                                    />
                                    <CampoNumerico
                                        id="empaques-frente"
                                        value={e.frente}
                                        label={t('datosLogisticos.segmento2.frente')}
                                        min={0.01}
                                        max={500}
                                        maxFractionDigits={2}
                                        placeholder={t('datosLogisticos.segmento2.placeholderFrente')}
                                        error={errors.frente}
                                        warning={Boolean(alertaNoNumerico.frente)}
                                        onChange={handleNumeroChange('frente')}
                                        onKeyDown={handleNumeroKeyDown('frente')}
                                        t={t}
                                    />
                                </div>

                                <div className="segmento-carton-fila segmento-carton-fila-3 p-mb-2">
                                    <CampoNumerico
                                        id="empaques-fondo"
                                        value={e.fondo}
                                        label={t('datosLogisticos.segmento2.fondo')}
                                        min={0.01}
                                        max={500}
                                        maxFractionDigits={2}
                                        placeholder={t('datosLogisticos.segmento2.placeholderFondo')}
                                        error={errors.fondo}
                                        warning={Boolean(alertaNoNumerico.fondo)}
                                        onChange={handleNumeroChange('fondo')}
                                        onKeyDown={handleNumeroKeyDown('fondo')}
                                        t={t}
                                    />
                                    <div
                                        className="segmento-carton-campo segmento-carton-campo-vacio"
                                        aria-hidden="true"
                                    />
                                    <div
                                        className="segmento-carton-campo segmento-carton-campo-vacio"
                                        aria-hidden="true"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer: botón Guardar (HU 046) - siempre visible */}
                    <div className="segmento-carton-footer">{children}</div>
                </>
            )}
        </div>
    );
};

export default TarjetaEmpaquesProducto;
