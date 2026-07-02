/**
 * Segmento Datos logísticos - Tal cual imagen de referencia
 *
 * HU 038 (Vista):
 * - Criterio: El usuario consulta la configuración y los cobros logísticos asociados al producto.
 * - Implementación: Título "Datos logísticos", checkmark de éxito, texto informativo (solo visualización),
 *   subtítulo "Configuración logística", dropdown tipo de esquema, tabla CEDIS (Receptor, CEDIS, Frecuencia, Lead time, CEDIS destino).
 *
 * HU 039 (Func.):
 * - Criterio: Para realizar cambios se accede a la sección de configuración logística.
 * - Implementación: Dropdown "Tipo de esquema(s) de distribución" editable; link "Ir a la configuración logística";
 *   checkboxes Receptor (select all y por fila) para selección.
 *
 * HU 040 (Guardado):
 * - Criterio: El usuario puede guardar los datos logísticos.
 * - Implementación: Botón "Guardar" en el footer del segmento; validación de tipo de esquema requerido.
 */

import { useTranslation } from '@/hooks/useTranslation'
import {
  datosLogisticosEmpaqueStateAtom,
  collapseSectionAfterSaveAtom,
  proveedorAltaCompletaAtom,
  supplierIdAtom,
  erroresDatosLogisticosAtom,
  filasCedisLoadingAtom,
  filasCedisErrorAtom,
  setDatosLogisticosAtom,
} from '../store/datosLogisticosEmpaqueAtoms'
import { useOpcionesEsquemaDistribucion } from '../hooks/useOpcionesSelect'
import type { FilaCedis } from '../types'
import { useAtomValue, useSetAtom } from 'jotai'
import { Dropdown } from 'primereact/dropdown'
import { Checkbox } from 'primereact/checkbox'
import { Message } from 'primereact/message'
import { ProgressSpinner } from 'primereact/progressspinner'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'
import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useHostSharedStore } from '@/hooks/useHostSharedStore'
import './TarjetaDatosLogisticos.scss'

interface TarjetaDatosLogisticosProps {
  children?: React.ReactNode
  saved?: boolean
}

type CampoFiltro = 'cedis' | 'frecuencia' | 'leadTime' | 'cedisDestino'
type FiltroConstraint = { value?: unknown; matchMode?: string }
type FiltroCampo = {
  value?: unknown
  matchMode?: string
  operator?: string
  constraints?: FiltroConstraint[]
}
type FiltrosDataTable = Record<string, FiltroCampo> | null | undefined

const CAMPOS_FILTRABLES: CampoFiltro[] = ['cedis', 'frecuencia', 'leadTime', 'cedisDestino']

const normalizarValorFiltro = (value: unknown): string | null => {
  if (value == null || value === '') return null
  return String(value).toLowerCase()
}

const cumpleMatchMode = (valorFila: string, valorFiltro: string, matchMode?: string): boolean => {
  const mode = matchMode || FilterMatchMode.CONTAINS

  if (mode === FilterMatchMode.STARTS_WITH) {
    return valorFila.startsWith(valorFiltro)
  }

  if (mode === FilterMatchMode.EQUALS) {
    return valorFila === valorFiltro
  }

  return valorFila.includes(valorFiltro)
}

const cumpleFiltroCampo = (
  row: FilaCedis,
  campo: CampoFiltro,
  filtroCampo?: FiltroCampo
): boolean => {
  if (!filtroCampo) return true

  // Soporta filtros simples (value/matchMode) y filtros con constraints.
  const constraint = filtroCampo.constraints?.[0] ?? {
    value: filtroCampo.value,
    matchMode: filtroCampo.matchMode,
  }

  const valorFiltro = normalizarValorFiltro(constraint.value)
  if (valorFiltro == null) return true

  const valorFila = String(row[campo] ?? '').toLowerCase()
  return cumpleMatchMode(valorFila, valorFiltro, constraint.matchMode)
}

/** Aplica filtros al estilo PrimeReact DataTable para calcular filas visibles (para select all) */
function aplicarFiltrosDataTable(filas: FilaCedis[], filters: FiltrosDataTable): FilaCedis[] {
  if (!filters) return filas

  return filas.filter(row =>
    CAMPOS_FILTRABLES.every(campo => cumpleFiltroCampo(row, campo, filters[campo]))
  )
}

const TarjetaDatosLogisticos: React.FC<TarjetaDatosLogisticosProps> = ({ children, saved }) => {
  const { t } = useTranslation()
  const state = useAtomValue(datosLogisticosEmpaqueStateAtom)
  const setDatos = useSetAtom(setDatosLogisticosAtom)
  const collapseSectionAfterSave = useAtomValue(collapseSectionAfterSaveAtom)
  const setCollapseSectionAfterSave = useSetAtom(collapseSectionAfterSaveAtom)
  const proveedorAltaCompleta = useAtomValue(proveedorAltaCompletaAtom)
  const supplierId = useAtomValue(supplierIdAtom)
  const errors = useAtomValue(erroresDatosLogisticosAtom)
  const filasCedisLoading = useAtomValue(filasCedisLoadingAtom)
  const filasCedisError = useAtomValue(filasCedisErrorAtom)
  const hostSharedStore = useHostSharedStore()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (collapseSectionAfterSave === 'datos') {
      setCollapsed(true)
      setCollapseSectionAfterSave(null)
    }
  }, [collapseSectionAfterSave, setCollapseSectionAfterSave])

  const {
    options: opcionesEsquemaDistribucion,
    loading: esquemaOptionsLoading,
    error: esquemaOptionsError,
  } = useOpcionesEsquemaDistribucion()

  const d = state.datosLogisticos
  const filas: FilaCedis[] = d.filasCedis

  type FiltersType = React.ComponentProps<typeof DataTable>['filters']
  const [filters, setFilters] = useState<FiltersType | null>(null)

  const initFilters = useCallback(() => {
    const initial = {
      cedis: { value: null, matchMode: FilterMatchMode.CONTAINS },
      frecuencia: { value: null, matchMode: FilterMatchMode.CONTAINS },
      leadTime: { value: null, matchMode: FilterMatchMode.CONTAINS },
      cedisDestino: { value: null, matchMode: FilterMatchMode.CONTAINS },
    } as NonNullable<FiltersType>
    setFilters(initial)
  }, [])

  useEffect(() => {
    initFilters()
  }, [initFilters])

  const filasFiltradas = useMemo(
    () => aplicarFiltrosDataTable(filas, filters ?? null),
    [filas, filters]
  )

  const todosSeleccionados = filasFiltradas.length > 0 && filasFiltradas.every(f => f.receptor)

  const handleToggleTodosReceptores = useCallback(() => {
    const nuevoValor = !todosSeleccionados
    const idsFiltrados = new Set(filasFiltradas.map(f => f.id))
    setDatos({
      filasCedis: filas.map(f => (idsFiltrados.has(f.id) ? { ...f, receptor: nuevoValor } : f)),
    })
  }, [filas, filasFiltradas, todosSeleccionados, setDatos])

  const handleToggleReceptor = useCallback(
    (id: string) => {
      setDatos({
        filasCedis: filas.map(f => (f.id === id ? { ...f, receptor: !f.receptor } : f)),
      })
    },
    [filas, setDatos]
  )

  const filterClearTemplate = (options: { filterClearCallback: () => void }) => (
    <Button
      type="button"
      label={t('datosLogisticos.segmento1.filterClear')}
      outlined
      onClick={options.filterClearCallback}
    />
  )

  const filterApplyTemplate = (options: { filterApplyCallback: () => void }) => (
    <Button
      type="button"
      label={t('datosLogisticos.segmento1.filterApply')}
      onClick={options.filterApplyCallback}
    />
  )

  const receptorHeaderTemplate = () => (
    <div className="flex align-items-center justify-content-center gap-2">
      <Checkbox
        inputId="receptor-all"
        checked={todosSeleccionados}
        onChange={handleToggleTodosReceptores}
        aria-label={t('datosLogisticos.segmento1.selectAllReceptors')}
      />
      <span className="th-receptor-label">{t('datosLogisticos.segmento1.receptorLabel')}</span>
    </div>
  )

  const receptorBodyTemplate = (row: FilaCedis) => (
    <Checkbox
      inputId={`receptor-${row.id}`}
      checked={row.receptor}
      onChange={() => handleToggleReceptor(row.id)}
      aria-label={`${t('datosLogisticos.segmento1.receptorLabel')} ${row.cedis}`}
    />
  )

  const handleGoToLogisticsConfig = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      hostSharedStore.sendMessage('navigate-to-logistics-configuration', {
        source: 'datos-logisticos-empaque',
        supplierId: supplierId || null,
        breadcrumb: [
          'Inicio',
          'Proveedores y prospectos',
          'Proveedores',
          'Razón social',
          'Negociaciones',
          'Convenio logístico',
          'Configuración logística',
        ],
      })
    },
    [hostSharedStore, supplierId]
  )

  return (
    <div className="segmento-datos-logisticos-wrapper">
      <div className="segmento-datos-logisticos">
        {/* Header: título + checkmark (éxito) + collapse - HU 038 Vista */}
        <div className="segmento-datos-logisticos-header">
          <div className="segmento-datos-logisticos-titulo">
            <h3 className="segmento-titulo-texto">{t('datosLogisticos.segmento1.title')}</h3>
            {saved && (
              <span
                className="sclt clt-check-mark text-3xl"
                aria-hidden="true"
                title={t('datosLogisticos.segmento1.completed')}
                style={{ color: '#2e8a41' }}
              ></span>
            )}
          </div>
          <button
            type="button"
            className="segmento-collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            aria-label={
              collapsed
                ? t('datosLogisticos.aria.expandSection')
                : t('datosLogisticos.aria.collapseSection')
            }
          >
            <i className={collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'} />
          </button>
        </div>

        {!collapsed && (
          <>
            {!proveedorAltaCompleta ? (
              /* HU 038 CA3 Escenario 2: sin configuración de logística prellenada */
              <div className="segmento-datos-logisticos-aviso-incompleto">
                <p className="aviso-title">
                  {t('datosLogisticos.segmento1.proveedorAltaIncompletaTitle')}
                </p>
                <p className="aviso-message">
                  {t('datosLogisticos.segmento1.proveedorAltaIncompletaMessage')}
                </p>
              </div>
            ) : (
              <>
                {/* Texto informativo - HU 038: información solo de visualización */}
                <div className="row">
                  <div className="col-12">
                    <p className="segmento-datos-logisticos-intro">
                      {t('datosLogisticos.segmento1.intro')}
                    </p>
                  </div>
                </div>

                {/* Configuración logística - HU 039 Func. */}
                <div className="row">
                  <div className="col-12">
                    <h4 className="segmento-subtitulo">
                      {t('datosLogisticos.segmento1.configTitle')}
                    </h4>
                  </div>
                </div>

                <div className="row px-3">
                  <div className="col-md-6">
                    <label
                      htmlFor="tipoEsquemaDistribucion"
                      className="p-block segmento-label pb-2"
                    >
                      {t('datosLogisticos.segmento1.tipoEsquemaLabel')}
                    </label>
                    <Dropdown
                      id="tipoEsquemaDistribucion"
                      value={d.tipoEsquemaDistribucion}
                      options={opcionesEsquemaDistribucion}
                      onChange={e => setDatos({ tipoEsquemaDistribucion: e.value ?? '' })}
                      loading={esquemaOptionsLoading}
                      disabled={esquemaOptionsLoading || !supplierId}
                      placeholder={t('datosLogisticos.segmento1.selectPlaceholder')}
                      className={
                        errors.tipoEsquemaDistribucion
                          ? 'p-invalid segmento-select-esquema'
                          : 'segmento-select-esquema'
                      }
                    />
                    {esquemaOptionsError && (
                      <Message
                        severity="warn"
                        text={esquemaOptionsError}
                        className="p-mt-1 p-mb-0"
                      />
                    )}
                    {errors.tipoEsquemaDistribucion && (
                      <Message
                        severity="error"
                        text={t(errors.tipoEsquemaDistribucion)}
                        className="p-mt-1 p-mb-0"
                      />
                    )}
                  </div>
                </div>
                {/* Tabla CEDIS - HU 038 Vista con filtros tipo panel (Match All, operadores, Clear, Apply) */}
                <div className="segmento-tabla-cedis-wrapper">
                  {filasCedisError && (
                    <Message severity="error" text={filasCedisError} className="p-mb-2" />
                  )}
                  {filasCedisLoading && (
                    <div className="segmento-tabla-cedis-loading">
                      <ProgressSpinner style={{ width: '2rem', height: '2rem' }} />
                    </div>
                  )}
                  <DataTable
                    value={filas}
                    dataKey="id"
                    filters={filters ?? undefined}
                    onFilter={e => setFilters(e.filters)}
                    filterDisplay="menu"
                    emptyMessage="No hay datos."
                    className="segmento-tabla-cedis-datatable"
                  >
                    <Column
                      header={receptorHeaderTemplate}
                      body={receptorBodyTemplate}
                      className="col-receptor"
                      style={{ minWidth: '7rem' }}
                    />
                    <Column
                      field="cedis"
                      header={t('datosLogisticos.segmento1.cedis')}
                      filter
                      filterPlaceholder={t('datosLogisticos.segmento1.filterPlaceholder')}
                      showFilterMatchModes={false}
                      filterMenuStyle={{ minWidth: '14rem' }}
                      filterClear={filterClearTemplate}
                      filterApply={filterApplyTemplate}
                      style={{ minWidth: '12rem' }}
                    />
                    <Column
                      field="frecuencia"
                      header={t('datosLogisticos.segmento1.frecuencia')}
                      filter
                      filterPlaceholder={t('datosLogisticos.segmento1.filterPlaceholder')}
                      showFilterMatchModes={false}
                      filterMenuStyle={{ minWidth: '14rem' }}
                      filterClear={filterClearTemplate}
                      filterApply={filterApplyTemplate}
                      style={{ minWidth: '12rem' }}
                    />
                    <Column
                      field="leadTime"
                      header={t('datosLogisticos.segmento1.leadTime')}
                      filter
                      filterPlaceholder={t('datosLogisticos.segmento1.filterPlaceholder')}
                      showFilterMatchModes={false}
                      filterMenuStyle={{ minWidth: '14rem' }}
                      filterClear={filterClearTemplate}
                      filterApply={filterApplyTemplate}
                      style={{ minWidth: '12rem' }}
                    />
                    <Column
                      field="cedisDestino"
                      header={t('datosLogisticos.segmento1.cedisDestino')}
                      filter
                      filterPlaceholder={t('datosLogisticos.segmento1.filterPlaceholder')}
                      showFilterMatchModes={false}
                      filterMenuStyle={{ minWidth: '14rem' }}
                      filterClear={filterClearTemplate}
                      filterApply={filterApplyTemplate}
                      style={{ minWidth: '14rem' }}
                    />
                  </DataTable>
                </div>

                {/* Footer: link izquierda, botón Guardar derecha - HU 039 Func. / HU 040 Guardado */}
                <div className="segmento-datos-logisticos-footer">
                  <a
                    href="/proveedores-y-prospectos/proveedores"
                    className="segmento-link-config"
                    onClick={handleGoToLogisticsConfig}
                  >
                    {t('datosLogisticos.segmento1.goToConfig')}
                  </a>
                  {children}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TarjetaDatosLogisticos
