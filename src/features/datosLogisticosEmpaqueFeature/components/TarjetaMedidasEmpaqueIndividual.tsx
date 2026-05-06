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

import { useTranslation } from '@/hooks/useTranslation'
import {
  datosLogisticosEmpaqueStateAtom,
  collapseSectionAfterSaveAtom,
  erroresMedidasAtom,
  setMedidasEmpaqueIndividualAtom,
} from '../store/datosLogisticosEmpaqueAtoms'
import { useOpcionesUnidadMedidaDimensiones, useOpcionesUnidadPeso } from '../hooks/useOpcionesSelect'
import { useAtomValue, useSetAtom } from 'jotai'
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'
import { RadioButton } from 'primereact/radiobutton'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import './TarjetaMedidasEmpaqueIndividual.scss'

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
  if (val === null || val === undefined) return undefined // no mostrar error si está vacío (se valida al guardar)
  if (Number.isNaN(val)) return 'validation.positiveNumber'
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

function validarEntero(val: number | null | undefined): string | undefined {
  if (val === null || val === undefined) return undefined
  if (!Number.isInteger(val)) return 'validation.integerOnly'
  return undefined
}

function validarEstibaMaxima(val: number | null | undefined): string | undefined {
  if (val === null || val === undefined) return undefined
  const errPositivo = validarCampoNumericoPositivo(val)
  if (errPositivo) return errPositivo
  const errEntero = validarEntero(val)
  if (errEntero) return errEntero
  if (val > 999) return 'validation.estibaMax'
  return undefined
}

interface TarjetaMedidasEmpaqueIndividualProps {
  children?: React.ReactNode
  saved?: boolean
}

const TarjetaMedidasEmpaqueIndividual: React.FC<TarjetaMedidasEmpaqueIndividualProps> = ({ children, saved }) => {
  const { t } = useTranslation()
  const state = useAtomValue(datosLogisticosEmpaqueStateAtom)
  const setMedidas = useSetAtom(setMedidasEmpaqueIndividualAtom)
  const collapseSectionAfterSave = useAtomValue(collapseSectionAfterSaveAtom)
  const setCollapseSectionAfterSave = useSetAtom(collapseSectionAfterSaveAtom)
  const errors = useAtomValue(erroresMedidasAtom)
  const setErrors = useSetAtom(erroresMedidasAtom)
  const [collapsed, setCollapsed] = useState(false)
  /** Mapa de campo → true cuando se debe mostrar alerta "solo numéricos" */
  const [alertaNoNumerico, setAlertaNoNumerico] = useState<Record<string, boolean>>({})
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  /** Handler onKeyDown para campos numéricos: detecta letras y muestra alerta temporal */
  const handleKeyDownNumerico = useCallback((campo: string, e: React.KeyboardEvent) => {
    // Permitir combinaciones con Ctrl/Cmd (copiar, pegar, seleccionar todo)
    if (e.ctrlKey || e.metaKey) return
    if (!TECLAS_PERMITIDAS.has(e.key) && e.key.length === 1) {
      // Es un carácter no numérico (letra u otro símbolo no permitido)
      setAlertaNoNumerico(prev => ({ ...prev, [campo]: true }))
      // Limpiar timer previo si existe
      if (timersRef.current[campo]) {
        clearTimeout(timersRef.current[campo])
      }
      // Auto-ocultar la alerta después de 3 segundos
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
      for (const t of Object.values(currentTimers)) {
        clearTimeout(t)
      }
    }
  }, [])

  const m = state.medidasEmpaqueIndividual

  useEffect(() => {
    if (collapseSectionAfterSave === 'medidas') {
      setCollapsed(true)
      setCollapseSectionAfterSave(null)
    }
  }, [collapseSectionAfterSave, setCollapseSectionAfterSave])

  /** Al cambiar el radio "¿Tiene empaque individual?", limpiar errores */
  const handleTieneEmpaqueChange = useCallback((value: boolean) => {
    setMedidas({ tieneEmpaqueIndividual: value })
    setErrors({})
  }, [setMedidas, setErrors])

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
      case 'estibaMaxima':
        if (valor === null || valor === undefined || valor === '') {
          error = 'validation.requiredField'
        } else {
          error = validarEstibaMaxima(valor as number | null)
        }
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

  const deshabilitado = !m.tieneEmpaqueIndividual

  const opcionesUnidadPeso = useOpcionesUnidadPeso()
  const opcionesUnidadMedidaDimensiones = useOpcionesUnidadMedidaDimensiones()

  // Mensajes de error generales (ejemplo, puedes adaptar la lógica según tu validación global)
  const mensajesErrorGenerales = [
    errors._global1 && t(errors._global1),
    errors._global2 && t(errors._global2)
  ].filter(Boolean)

  return (
      <div className="segmento-medidas-empaque-individual">
        <div className="segmento-medidas-header">
          <div className="segmento-medidas-titulo">
            <h3 className="segmento-titulo-texto">{t('datosLogisticos.segmento2.title')}</h3>
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
              <p className="segmento-medidas-intro">
                {t('datosLogisticos.segmento2.intro')}
              </p>

              <div className="segmento-medidas-pregunta p-mb-3">
                <label className="p-block segmento-label">
                  {t('datosLogisticos.segmento2.hasIndividualPackaging')}
                </label>
                <div className="segmento-medidas-radios-fila">
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

              <div className={`segmento-medidas-form p-fluid ${deshabilitado ? 'segmento-medidas-form-disabled' : ''}`}>
                {/* Fila 1: Unidad de peso, Peso, (vacío) — 3 columnas */}
                <div className="segmento-medidas-fila segmento-medidas-fila-3 p-mb-2">
                  <div className="segmento-medidas-campo">
                    <label htmlFor="unidadPeso" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.unidadPeso')} <span className="campo-requerido">*</span>
                    </label>
                    <Dropdown
                        id="unidadPeso"
                        value={m.unidadPeso}
                        options={opcionesUnidadPeso}
                        onChange={e => {
                          const v = e.value ?? ''
                          setMedidas({ unidadPeso: v })
                          validarCampoInline('unidadPeso', v)
                        }}
                        placeholder={t('datosLogisticos.segmento2.placeholderUnidadPeso')}
                        className={errors.unidadPeso ? 'p-invalid w-full' : 'w-full'}
                        disabled={deshabilitado}
                    />
                    {/* Mensaje de error inline con ícono para cada campo */}
                    {errors.unidadPeso && (
                      <div className="campo-error-inline">
                        <i className="pi pi-exclamation-circle campo-error-icon" />
                        <span>{t(errors.unidadPeso)}</span>
                      </div>
                    )}
                  </div>
                  <div className="segmento-medidas-campo">
                    <label htmlFor="peso" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.peso')} <span className="campo-requerido">*</span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="peso"
                          value={m.peso}
                          onValueChange={e => {
                            const v = e.value ?? null
                            setMedidas({ peso: v })
                            validarCampoInline('peso', v)
                          }}
                          onKeyDown={e => handleKeyDownNumerico('peso', e)}
                          min={0.01}
                          minFractionDigits={0}
                          maxFractionDigits={2}
                          placeholder={t('datosLogisticos.segmento2.placeholderPeso')}
                          className={alertaNoNumerico.peso ? 'campo-warning-input w-full' : errors.peso ? 'p-invalid w-full' : 'w-full'}
                          disabled={deshabilitado}
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
                  <div className="segmento-medidas-campo segmento-medidas-campo-vacio" />
                </div>

                {/* Fila 2: Unidad de medida, Alto, Frente — 3 columnas */}
                <div className="segmento-medidas-fila segmento-medidas-fila-3 p-mb-2">
                  <div className="segmento-medidas-campo">
                    <label htmlFor="unidadMedida" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.unidadMedida')} <span className="campo-requerido">*</span>
                    </label>
                    <Dropdown
                        id="unidadMedida"
                        value={m.unidadMedida}
                        options={opcionesUnidadMedidaDimensiones}
                        onChange={e => {
                          const v = e.value ?? ''
                          setMedidas({ unidadMedida: v })
                          validarCampoInline('unidadMedida', v)
                        }}
                        placeholder={t('datosLogisticos.segmento2.placeholderUnidadMedida')}
                        className={errors.unidadMedida ? 'p-invalid w-full' : 'w-full'}
                        disabled={deshabilitado}
                    />
                    {errors.unidadMedida && (
                      <div className="campo-error-inline">
                        <i className="pi pi-exclamation-circle campo-error-icon" />
                        <span>{t(errors.unidadMedida)}</span>
                      </div>
                    )}
                  </div>
                  <div className="segmento-medidas-campo">
                    <label htmlFor="alto" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.alto')} <span className="campo-requerido">*</span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="alto"
                          value={m.alto}
                          onValueChange={e => {
                            const v = e.value ?? null
                            setMedidas({ alto: v })
                            validarCampoInline('alto', v)
                          }}
                          onKeyDown={e => handleKeyDownNumerico('alto', e)}
                          min={0.01}
                          max={500}
                          minFractionDigits={0}
                          maxFractionDigits={2}
                          placeholder={t('datosLogisticos.segmento2.placeholderAlto')}
                          className={alertaNoNumerico.alto ? 'campo-warning-input w-full' : errors.alto ? 'p-invalid w-full' : 'w-full'}
                          disabled={deshabilitado}
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
                  <div className="segmento-medidas-campo">
                    <label htmlFor="frente" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.frente')} <span className="campo-requerido">*</span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="frente"
                          value={m.frente}
                          onValueChange={e => {
                            const v = e.value ?? null
                            setMedidas({ frente: v })
                            validarCampoInline('frente', v)
                          }}
                          onKeyDown={e => handleKeyDownNumerico('frente', e)}
                          min={0.01}
                          max={500}
                          minFractionDigits={0}
                          maxFractionDigits={2}
                          placeholder={t('datosLogisticos.segmento2.placeholderFrente')}
                          className={alertaNoNumerico.frente ? 'campo-warning-input w-full' : errors.frente ? 'p-invalid w-full' : 'w-full'}
                          disabled={deshabilitado}
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

                {/* Fila 3: Fondo, Estiba máxima, (vacío) — 3 columnas */}
                <div className="segmento-medidas-fila segmento-medidas-fila-3 p-mb-2">
                  <div className="segmento-medidas-campo">
                    <label htmlFor="fondo" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.fondo')} <span className="campo-requerido">*</span>
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="fondo"
                          value={m.fondo}
                          onValueChange={e => {
                            const v = e.value ?? null
                            setMedidas({ fondo: v })
                            validarCampoInline('fondo', v)
                          }}
                          onKeyDown={e => handleKeyDownNumerico('fondo', e)}
                          min={0.01}
                          max={500}
                          minFractionDigits={0}
                          maxFractionDigits={2}
                          placeholder={t('datosLogisticos.segmento2.placeholderFondo')}
                          className={alertaNoNumerico.fondo ? 'campo-warning-input w-full' : errors.fondo ? 'p-invalid w-full' : 'w-full'}
                          disabled={deshabilitado}
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
                  <div className="segmento-medidas-campo">
                    <label htmlFor="estibaMaxima" className="p-block segmento-label">
                      {t('datosLogisticos.segmento2.estibaMaxima')}
                    </label>
                    <div className="input-con-icono-error">
                      <InputNumber
                          id="estibaMaxima"
                          value={m.estibaMaxima}
                          onValueChange={e => {
                            const v = e.value ?? null
                            setMedidas({ estibaMaxima: v })
                            validarCampoInline('estibaMaxima', v)
                          }}
                          onKeyDown={e => handleKeyDownNumerico('estibaMaxima', e)}
                          min={1}
                          max={999}
                          useGrouping={false}
                          placeholder={t('datosLogisticos.segmento2.placeholderEstibaMaxima')}
                          className={alertaNoNumerico.estibaMaxima ? 'campo-warning-input w-full' : errors.estibaMaxima ? 'p-invalid w-full' : 'w-full'}
                          disabled={deshabilitado}
                      />
                      {(errors.estibaMaxima || alertaNoNumerico.estibaMaxima) && (
                        <i className={`pi pi-exclamation-circle icono-error-input${alertaNoNumerico.estibaMaxima ? ' icono-error-input-warning' : ''}`} />
                      )}
                    </div>
                    {alertaNoNumerico.estibaMaxima && (
                      <div className="campo-warning-inline">
                        <i className="pi pi-exclamation-triangle campo-warning-icon" />
                        <span>{t('validation.numericOnly')}</span>
                      </div>
                    )}
                    {errors.estibaMaxima && !alertaNoNumerico.estibaMaxima && (
                        <div className="campo-error-inline">
                          <i className="pi pi-exclamation-circle campo-error-icon" />
                          <span>{t(errors.estibaMaxima)}</span>
                        </div>
                     )}
                  </div>
                  <div className="segmento-medidas-campo segmento-medidas-campo-vacio" />
                </div>
              </div>

              {/* Mensajes de error generales al inicio del formulario */}
              {mensajesErrorGenerales.length > 0 && (
                <div className="alerta-formulario-error">
                  {mensajesErrorGenerales.map((msg, idx) => (
                    <div className="alerta-formulario-error-item" key={idx}>
                      <i className="pi pi-exclamation-circle alerta-formulario-error-icon" />
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer: botón Guardar (HU 043) */}
              <div className="segmento-medidas-footer">
                {children}
              </div>
            </>
        )}
      </div>
  )
}

export default TarjetaMedidasEmpaqueIndividual

