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

import { useTranslation } from '@/hooks/useTranslation'
import {
  datosLogisticosEmpaqueStateAtom,
  collapseSectionAfterSaveAtom,
  erroresEmpaquesAtom,
  setEmpaquesProductoAtom,
} from '../store/datosLogisticosEmpaqueAtoms'
import type { CualAplicaEmpaque } from '../types'
import { useOpcionesCualAplicaEmpaque, useOpcionesUnidadMedidaDimensiones, useOpcionesUnidadPeso } from '../hooks/useOpcionesSelect'
import { useAtomValue, useSetAtom } from 'jotai'
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'
import { RadioButton } from 'primereact/radiobutton'
import { Message } from 'primereact/message'
import { Dialog } from 'primereact/dialog'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import './TarjetaEmpaquesProducto.scss'

/** Teclas permitidas en un InputNumber (números, navegación, decimales, etc.) */
const TECLAS_PERMITIDAS = new Set([
  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Home', 'End',
  '.', ',', '-',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
])

/** Helpers de validación inline por campo */
function validarCampoNumericoPositivo(val: number | null | undefined): string | undefined {
  if (val === null || val === undefined) return undefined
  if (typeof val !== 'number' || Number.isNaN(val)) return 'validation.positiveNumber'
  if (val <= 0) return 'validation.positiveNumber'
  return undefined
}

function validarMaxDecimales(val: number | null | undefined, max = 2): string | undefined {
  if (val === null || val === undefined) return undefined
  const str = String(val)
  const decimal = str.split('.')[1]
  if (decimal && decimal.length > max) return 'validation.maxDecimals'
  return undefined
}

function validarEnteroMayorCero(val: number | null | undefined): string | undefined {
  if (val === null || val === undefined) return undefined
  if (typeof val !== 'number' || Number.isNaN(val) || val <= 0 || !Number.isInteger(val)) {
    return 'validation.integerGreaterThanZero'
  }
  return undefined
}

function validarAltoMax(val: number | null | undefined, maxVal = 500): string | undefined {
  if (val === null || val === undefined) return undefined
  if (val > maxVal) return 'validation.altoMax'
  return undefined
}

function validarFrenteMax(val: number | null | undefined, maxVal = 500): string | undefined {
  if (val === null || val === undefined) return undefined
  if (val > maxVal) return 'validation.frenteMax'
  return undefined
}

function validarFondoMax(val: number | null | undefined, maxVal = 500): string | undefined {
  if (val === null || val === undefined) return undefined
  if (val > maxVal) return 'validation.fondoMax'
  return undefined
}

interface TarjetaEmpaquesProductoProps {
  children?: React.ReactNode
  saved?: boolean
}

const camposVaciosEmpaques = {
  cantidadUdsCartonMaster: null as number | null,
  multiploCartonMaster: null as number | null,
  unidadPeso: '',
  peso: null as number | null,
  unidadMedida: '',
  alto: null as number | null,
  frente: null as number | null,
  fondo: null as number | null,
}

const TarjetaEmpaquesProducto: React.FC<TarjetaEmpaquesProductoProps> = ({ children, saved }) => {
  const { t } = useTranslation()
  const state = useAtomValue(datosLogisticosEmpaqueStateAtom)
  const setEmpaques = useSetAtom(setEmpaquesProductoAtom)
  const collapseSectionAfterSave = useAtomValue(collapseSectionAfterSaveAtom)
  const setCollapseSectionAfterSave = useSetAtom(collapseSectionAfterSaveAtom)
  const errors = useAtomValue(erroresEmpaquesAtom)
  const setErrors = useSetAtom(erroresEmpaquesAtom)
  const [collapsed, setCollapsed] = useState(false)
  const [showModalCualAplica, setShowModalCualAplica] = useState(false)
  /** Mapa de campo → true cuando se debe mostrar alerta "solo numéricos" */
  const [alertaNoNumerico, setAlertaNoNumerico] = useState<Record<string, boolean>>({})
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const e = state.empaquesProducto

  useEffect(() => {
    if (collapseSectionAfterSave === 'empaques') {
      setCollapsed(true)
      setCollapseSectionAfterSave(null)
    }
  }, [collapseSectionAfterSave, setCollapseSectionAfterSave])

  /** Al cambiar "¿Cuál aplica?", limpiar campos y errores */
  const handleCualAplicaChange = useCallback(
    (value: CualAplicaEmpaque) => {
      setEmpaques({ cualAplica: value, ...camposVaciosEmpaques })
      setErrors({})
      setAlertaNoNumerico({})
    },
    [setEmpaques, setErrors]
  )

  /** Handler onKeyDown para campos numéricos: detecta letras y muestra alerta temporal */
  const handleKeyDownNumerico = useCallback((campo: string, ev: React.KeyboardEvent) => {
    if (ev.ctrlKey || ev.metaKey) return
    if (!TECLAS_PERMITIDAS.has(ev.key) && ev.key.length === 1) {
      setAlertaNoNumerico(prev => ({ ...prev, [campo]: true }))
      if (timersRef.current[campo]) {
        clearTimeout(timersRef.current[campo])
      }
      timersRef.current[campo] = setTimeout(() => {
        setAlertaNoNumerico(prev => {
          const next = { ...prev }
          delete next[campo]
          return next
        })
      }, 3000)
    }
  }, [])

  // Limpiar timers al desmontar
  useEffect(() => {
    const currentTimers = timersRef.current
    return () => {
      for (const timer of Object.values(currentTimers)) {
        clearTimeout(timer)
      }
    }
  }, [])

  /** Validación inline: valida un campo individual y actualiza errores en tiempo real */
  const validarCampoInline = useCallback((campo: string, valor: number | string | null | undefined) => {
    let error: string | undefined
    switch (campo) {
      case 'unidadPeso':
      case 'unidadMedida':
        if (!valor || (typeof valor === 'string' && !valor.trim())) {
          error = 'validation.requiredField'
        }
        break
      case 'cantidadUdsCartonMaster':
      case 'multiploCartonMaster':
        error = validarEnteroMayorCero(valor as number | null)
        break
      case 'peso':
        error = validarCampoNumericoPositivo(valor as number | null) || validarMaxDecimales(valor as number | null)
        break
      case 'alto':
        error = validarCampoNumericoPositivo(valor as number | null) || validarAltoMax(valor as number | null) || validarMaxDecimales(valor as number | null)
        break
      case 'frente':
        error = validarCampoNumericoPositivo(valor as number | null) || validarFrenteMax(valor as number | null) || validarMaxDecimales(valor as number | null)
        break
      case 'fondo':
        error = validarCampoNumericoPositivo(valor as number | null) || validarFondoMax(valor as number | null) || validarMaxDecimales(valor as number | null)
        break
      default:
        break
    }
    setErrors((prev: Record<string, string | undefined>) => {
      const next = { ...prev }
      if (error) {
        next[campo] = error
      } else {
        delete next[campo]
      }
      return next
    })
  }, [setErrors])

  const opcionesUnidadPeso = useOpcionesUnidadPeso()
  const opcionesUnidadMedidaDimensiones = useOpcionesUnidadMedidaDimensiones()
  const opcionesCualAplicaRaw = useOpcionesCualAplicaEmpaque()
  const opcionesCualAplica: { value: CualAplicaEmpaque; label: string }[] = opcionesCualAplicaRaw.map(o => ({
    value: o.value as CualAplicaEmpaque,
    label: o.label,
  }))

  const mostrarFormulario = e.cualAplica === 'carton_master' || e.cualAplica === 'bulto'

  return (
      <div className="segmento-carton-master">
        <Dialog
          visible={showModalCualAplica}
          onHide={() => setShowModalCualAplica(false)}
          header={t('datosLogisticos.segmento3.modalCualAplicaTitle')}
          className="segmento-carton-modal-cual-aplica"
          dismissableMask
          modal
        >
          <p className="p-mb-2">{t('datosLogisticos.segmento3.modalCualAplicaIntro')}</p>
          <p><strong>{t('datosLogisticos.segmento3.cartonMaster')}:</strong> {t('datosLogisticos.segmento3.modalCualAplicaCartonMaster')}</p>
          <p><strong>{t('datosLogisticos.segmento3.bulto')}:</strong> {t('datosLogisticos.segmento3.modalCualAplicaBulto')}</p>
        </Dialog>
        <div className="segmento-carton-header">
          <div className="segmento-carton-titulo">
            <h3 className="segmento-titulo-texto">{t('datosLogisticos.segmento3.title')}</h3>
            {saved && (
              <span className="sclt clt-check-mark text-3xl" aria-hidden="true" title={t('datosLogisticos.segmento1.completed')} style={{ color: '#2e8a41' }} />
            )}
          </div>
          <button
              type="button"
              className="segmento-collapse"
              onClick={() => setCollapsed(!collapsed)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? t('datosLogisticos.aria.expandSection') : t('datosLogisticos.aria.collapseSection')}
          >
            <i className={collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'} />
          </button>
        </div>

        {!collapsed && (
            <>
              <p className="segmento-carton-intro">
                {t('datosLogisticos.segmento3.intro')}
              </p>

              <div className="segmento-carton-pregunta p-mb-3">
                <a
                    href="#cual-aplica"
                    className="segmento-pregunta-cual-aplica"
                    onClick={ev => { ev.preventDefault(); setShowModalCualAplica(true) }}
                >
                  {t('datosLogisticos.segmento3.cualAplica')} <span className="campo-requerido">*</span>
                </a>
                <br />
                <div className="segmento-radios-cual-aplica">
                  {opcionesCualAplica.map(opt => (
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
              {e.cualAplica === 'ninguno' && (
                <p className="segmento-carton-ninguno-msg">{t('datosLogisticos.segmento3.ningunoNoCampos')}</p>
              )}
              {mostrarFormulario && (
              <>
              <br />
              <div className="segmento-carton-form p-fluid">
                {/* Fila 1: Cantidad uds cartón máster, Múltiplo cartón máster, (vacío) — 3 columnas */}
                <div className="segmento-carton-fila segmento-carton-fila-3 p-mb-2">
                  <div className="segmento-carton-campo">
                    <label htmlFor="cantidadUdsCartonMaster" className="p-block segmento-label segmento-label-with-info">
                      <span>{t('datosLogisticos.segmento3.cantidadUds')}</span>
                      <span className="campo-requerido">*</span>
                      <span
                          className="segmento-info-icon"
                          title={t('datosLogisticos.segmento3.cantidadUdsInfo')}
                          aria-label={t('datosLogisticos.segmento3.info')}
                      >
                    <i className="pi pi-info-circle" />
                  </span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="cantidadUdsCartonMaster"
                          value={e.cantidadUdsCartonMaster}
                          onValueChange={ev => {
                            const v = ev.value ?? null
                            setEmpaques({ cantidadUdsCartonMaster: v })
                            validarCampoInline('cantidadUdsCartonMaster', v)
                          }}
                          onKeyDown={ev => handleKeyDownNumerico('cantidadUdsCartonMaster', ev)}
                          min={1}
                          max={99999}
                          useGrouping={false}
                          placeholder={t('datosLogisticos.segmento3.placeholderCantidadUds')}
                          className={alertaNoNumerico.cantidadUdsCartonMaster ? 'campo-warning-input w-full' : errors.cantidadUdsCartonMaster ? 'p-invalid w-full' : 'w-full'}
                      />
                      {(errors.cantidadUdsCartonMaster || alertaNoNumerico.cantidadUdsCartonMaster) && (
                        <i className={`pi pi-exclamation-circle icono-error-input${alertaNoNumerico.cantidadUdsCartonMaster ? ' icono-error-input-warning' : ''}`} />
                      )}
                    </div>
                    {alertaNoNumerico.cantidadUdsCartonMaster && (
                      <div className="campo-warning-inline">
                        <i className="pi pi-exclamation-triangle campo-warning-icon" />
                        <span>{t('validation.numericOnly')}</span>
                      </div>
                    )}
                    {errors.cantidadUdsCartonMaster && !alertaNoNumerico.cantidadUdsCartonMaster && (
                      <div className="campo-error-inline">
                        <i className="pi pi-exclamation-circle campo-error-icon" />
                        <span>{t(errors.cantidadUdsCartonMaster)}</span>
                      </div>
                    )}
                  </div>
                  <div className="segmento-carton-campo">
                    <label htmlFor="multiploCartonMaster" className="p-block segmento-label segmento-label-with-info">
                      <span>{t('datosLogisticos.segmento3.multiplo')}</span>
                      <span className="campo-requerido">*</span>
                      <span
                          className="segmento-info-icon"
                          title={t('datosLogisticos.segmento3.multiploInfo')}
                          aria-label={t('datosLogisticos.segmento3.info')}
                      >
                    <i className="pi pi-info-circle" />
                  </span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="multiploCartonMaster"
                          value={e.multiploCartonMaster}
                          onValueChange={ev => {
                            const v = ev.value ?? null
                            setEmpaques({ multiploCartonMaster: v })
                            validarCampoInline('multiploCartonMaster', v)
                          }}
                          onKeyDown={ev => handleKeyDownNumerico('multiploCartonMaster', ev)}
                          min={1}
                          max={99999}
                          useGrouping={false}
                          placeholder={t('datosLogisticos.segmento3.placeholderMultiplo')}
                          className={alertaNoNumerico.multiploCartonMaster ? 'campo-warning-input w-full' : errors.multiploCartonMaster ? 'p-invalid w-full' : 'w-full'}
                      />
                      {(errors.multiploCartonMaster || alertaNoNumerico.multiploCartonMaster) && (
                        <i className={`pi pi-exclamation-circle icono-error-input${alertaNoNumerico.multiploCartonMaster ? ' icono-error-input-warning' : ''}`} />
                      )}
                    </div>
                    {alertaNoNumerico.multiploCartonMaster && (
                      <div className="campo-warning-inline">
                        <i className="pi pi-exclamation-triangle campo-warning-icon" />
                        <span>{t('validation.numericOnly')}</span>
                      </div>
                    )}
                    {errors.multiploCartonMaster && !alertaNoNumerico.multiploCartonMaster && (
                      <div className="campo-error-inline">
                        <i className="pi pi-exclamation-circle campo-error-icon" />
                        <span>{t(errors.multiploCartonMaster)}</span>
                      </div>
                    )}
                  </div>
                  <div className="segmento-carton-campo segmento-carton-campo-vacio" aria-hidden="true" />
                </div>

                {/* Fila 2: Unidad de peso, Peso, (vacío) — 3 columnas */}
                <div className="segmento-carton-fila segmento-carton-fila-3 p-mb-2">
                  <div className="segmento-carton-campo">
                    <label htmlFor="empaques-unidadPeso" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.unidadPeso')} <span className="campo-requerido">*</span>
                    </label>
                    <Dropdown
                        id="empaques-unidadPeso"
                        value={e.unidadPeso}
                        options={opcionesUnidadPeso}
                        onChange={ev => {
                          const v = ev.value ?? ''
                          setEmpaques({ unidadPeso: v })
                          validarCampoInline('unidadPeso', v)
                        }}
                        placeholder={t('datosLogisticos.segmento2.placeholderUnidadPeso')}
                        className={errors.unidadPeso ? 'p-invalid w-full' : 'w-full'}
                    />
                    {errors.unidadPeso && (
                        <div className="campo-error-inline">
                          <i className="pi pi-exclamation-circle campo-error-icon" />
                          <span>{t(errors.unidadPeso)}</span>
                        </div>
                    )}
                  </div>
                  <div className="segmento-carton-campo">
                    <label htmlFor="empaques-peso" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.peso')} <span className="campo-requerido">*</span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="empaques-peso"
                          value={e.peso}
                          onValueChange={ev => {
                            const v = ev.value ?? null
                            setEmpaques({ peso: v })
                            validarCampoInline('peso', v)
                          }}
                          onKeyDown={ev => handleKeyDownNumerico('peso', ev)}
                          min={0.01}
                          minFractionDigits={0}
                          maxFractionDigits={2}
                          placeholder={t('datosLogisticos.segmento2.placeholderPeso')}
                          className={alertaNoNumerico.peso ? 'campo-warning-input w-full' : errors.peso ? 'p-invalid w-full' : 'w-full'}
                      />
                      {(errors.peso || alertaNoNumerico.peso) && (
                        <i className={`pi pi-exclamation-circle icono-error-input${alertaNoNumerico.peso ? ' icono-error-input-warning' : ''}`} />
                      )}
                    </div>
                    {alertaNoNumerico.peso && (
                      <div className="campo-warning-inline">
                        <i className="pi pi-exclamation-triangle campo-warning-icon" />
                        <span>{t('validation.numericOnly')}</span>
                      </div>
                    )}
                    {errors.peso && !alertaNoNumerico.peso && (
                        <div className="campo-error-inline">
                          <i className="pi pi-exclamation-circle campo-error-icon" />
                          <span>{t(errors.peso)}</span>
                        </div>
                    )}
                  </div>
                  <div className="segmento-carton-campo segmento-carton-campo-vacio" aria-hidden="true" />
                </div>

                {/* Fila 3: Unidad de medida, Alto, Frente — 3 columnas */}
                <div className="segmento-carton-fila segmento-carton-fila-3 p-mb-2">
                  <div className="segmento-carton-campo">
                    <label htmlFor="empaques-unidadMedida" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.unidadMedida')} <span className="campo-requerido">*</span>
                    </label>
                    <Dropdown
                        id="empaques-unidadMedida"
                        value={e.unidadMedida}
                        options={opcionesUnidadMedidaDimensiones}
                        onChange={ev => {
                          const v = ev.value ?? ''
                          setEmpaques({ unidadMedida: v })
                          validarCampoInline('unidadMedida', v)
                        }}
                        placeholder={t('datosLogisticos.segmento2.placeholderUnidadMedida')}
                        className={errors.unidadMedida ? 'p-invalid w-full' : 'w-full'}
                    />
                    {errors.unidadMedida && (
                        <div className="campo-error-inline">
                          <i className="pi pi-exclamation-circle campo-error-icon" />
                          <span>{t(errors.unidadMedida)}</span>
                        </div>
                    )}
                  </div>
                  <div className="segmento-carton-campo">
                    <label htmlFor="empaques-alto" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.alto')} <span className="campo-requerido">*</span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="empaques-alto"
                          value={e.alto}
                          onValueChange={ev => {
                            const v = ev.value ?? null
                            setEmpaques({ alto: v })
                            validarCampoInline('alto', v)
                          }}
                          onKeyDown={ev => handleKeyDownNumerico('alto', ev)}
                          min={0.01}
                          max={500}
                          minFractionDigits={0}
                          maxFractionDigits={2}
                          placeholder={t('datosLogisticos.segmento2.placeholderAlto')}
                          className={alertaNoNumerico.alto ? 'campo-warning-input w-full' : errors.alto ? 'p-invalid w-full' : 'w-full'}
                      />
                      {(errors.alto || alertaNoNumerico.alto) && (
                        <i className={`pi pi-exclamation-circle icono-error-input${alertaNoNumerico.alto ? ' icono-error-input-warning' : ''}`} />
                      )}
                    </div>
                    {alertaNoNumerico.alto && (
                      <div className="campo-warning-inline">
                        <i className="pi pi-exclamation-triangle campo-warning-icon" />
                        <span>{t('validation.numericOnly')}</span>
                      </div>
                    )}
                    {errors.alto && !alertaNoNumerico.alto && (
                        <div className="campo-error-inline">
                          <i className="pi pi-exclamation-circle campo-error-icon" />
                          <span>{t(errors.alto)}</span>
                        </div>
                    )}
                  </div>
                  <div className="segmento-carton-campo">
                    <label htmlFor="empaques-frente" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.frente')} <span className="campo-requerido">*</span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="empaques-frente"
                          value={e.frente}
                          onValueChange={ev => {
                            const v = ev.value ?? null
                            setEmpaques({ frente: v })
                            validarCampoInline('frente', v)
                          }}
                          onKeyDown={ev => handleKeyDownNumerico('frente', ev)}
                          min={0.01}
                          max={500}
                          minFractionDigits={0}
                          maxFractionDigits={2}
                          placeholder={t('datosLogisticos.segmento2.placeholderFrente')}
                          className={alertaNoNumerico.frente ? 'campo-warning-input w-full' : errors.frente ? 'p-invalid w-full' : 'w-full'}
                      />
                      {(errors.frente || alertaNoNumerico.frente) && (
                        <i className={`pi pi-exclamation-circle icono-error-input${alertaNoNumerico.frente ? ' icono-error-input-warning' : ''}`} />
                      )}
                    </div>
                    {alertaNoNumerico.frente && (
                      <div className="campo-warning-inline">
                        <i className="pi pi-exclamation-triangle campo-warning-icon" />
                        <span>{t('validation.numericOnly')}</span>
                      </div>
                    )}
                    {errors.frente && !alertaNoNumerico.frente && (
                        <div className="campo-error-inline">
                          <i className="pi pi-exclamation-circle campo-error-icon" />
                          <span>{t(errors.frente)}</span>
                        </div>
                    )}
                  </div>
                </div>

                {/* Fila 4: Fondo, (vacío), (vacío) — 3 columnas */}
                <div className="segmento-carton-fila segmento-carton-fila-3 p-mb-2">
                  <div className="segmento-carton-campo">
                    <label htmlFor="empaques-fondo" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.fondo')} <span className="campo-requerido">*</span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="empaques-fondo"
                          value={e.fondo}
                          onValueChange={ev => {
                            const v = ev.value ?? null
                            setEmpaques({ fondo: v })
                            validarCampoInline('fondo', v)
                          }}
                          onKeyDown={ev => handleKeyDownNumerico('fondo', ev)}
                          min={0.01}
                          max={500}
                          minFractionDigits={0}
                          maxFractionDigits={2}
                          placeholder={t('datosLogisticos.segmento2.placeholderFondo')}
                          className={alertaNoNumerico.fondo ? 'campo-warning-input w-full' : errors.fondo ? 'p-invalid w-full' : 'w-full'}
                      />
                      {(errors.fondo || alertaNoNumerico.fondo) && (
                        <i className={`pi pi-exclamation-circle icono-error-input${alertaNoNumerico.fondo ? ' icono-error-input-warning' : ''}`} />
                      )}
                    </div>
                    {alertaNoNumerico.fondo && (
                      <div className="campo-warning-inline">
                        <i className="pi pi-exclamation-triangle campo-warning-icon" />
                        <span>{t('validation.numericOnly')}</span>
                      </div>
                    )}
                    {errors.fondo && !alertaNoNumerico.fondo && (
                        <div className="campo-error-inline">
                          <i className="pi pi-exclamation-circle campo-error-icon" />
                          <span>{t(errors.fondo)}</span>
                        </div>
                    )}
                  </div>
                  <div className="segmento-carton-campo segmento-carton-campo-vacio" aria-hidden="true" />
                  <div className="segmento-carton-campo segmento-carton-campo-vacio" aria-hidden="true" />
                </div>
              </div>
              </>
              )}
              {/* Footer: botón Guardar (HU 046) - siempre visible */}
              <div className="segmento-carton-footer">
                {children}
              </div>
            </>
        )}
      </div>
  )
}

export default TarjetaEmpaquesProducto

