/**
 * Hook que carga opciones de selects desde servicios de API/catálogo
 * y resuelve las etiquetas con i18n (t).
 */

import { useTranslation } from '@/hooks/useTranslation'
import { useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import type { OpcionSelect } from '../api/opcionesSelectService'
import {
  getOpcionesCualAplicaEmpaque,
  getOpcionesEsquemaDistribucion,
  getOpcionesOrientacion,
  getOpcionesUnidadMedidaDimensiones,
  getOpcionesUnidadPeso,
} from '../api/opcionesSelectService'
import { supplierIdAtom } from '../store/datosLogisticosEmpaqueAtoms'

export interface OpcionDropdown {
  label: string
  value: string
}

export interface OpcionesEsquemaState {
  options: OpcionDropdown[]
  loading: boolean
  error: string | null
}

function mapOpciones(opciones: OpcionSelect[], t: (key: string) => string): OpcionDropdown[] {
  return opciones.map(o => ({
    label: o.label ?? (o.labelKey ? t(o.labelKey) : o.value),
    value: o.value,
  }))
}

export function useOpcionesEsquemaDistribucion(): OpcionesEsquemaState {
  const { t } = useTranslation()
  const supplierId = useAtomValue(supplierIdAtom)
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supplierId) {
      setOpciones([])
      setError(
        'No se encontró supplierId del proveedor. Verifica que el host envíe supplierId (o aliases como supplier_id / idProveedor), o define MODERN_APP_DEFAULT_SUPPLIER_ID para pruebas locales.'
      )
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)
    setError(null)

    getOpcionesEsquemaDistribucion(supplierId)
      .then(data => {
        if (mounted) {
          if (data.length === 0) {
            console.warn(
              '[DatosLogisticos] No se recibieron esquemas logisticos para supplierId:',
              supplierId
            )
            setError('No se recibieron esquemas logísticos para el proveedor actual.')
          } else {
            setError(null)
          }
          setOpciones(data)
        }
      })
      .catch(error => {
        console.error(
          'Error cargando opciones de esquema de distribucion para supplierId:',
          supplierId,
          error
        )
        if (mounted) {
          setOpciones([])
          setError(
            'No fue posible cargar los esquemas logísticos. Verifica autenticación y endpoint.'
          )
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [supplierId])

  return {
    options: mapOpciones(opciones, t),
    loading,
    error,
  }
}

export function useOpcionesUnidadPeso(): OpcionDropdown[] {
  const { t } = useTranslation()
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    let mounted = true

    getOpcionesUnidadPeso()
      .then(data => {
        if (mounted) {
          setOpciones(data)
        }
      })
      .catch(error => {
        console.error('Error cargando opciones de unidad de peso:', error)
        if (mounted) {
          setOpciones([])
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return mapOpciones(opciones, t)
}

export function useOpcionesUnidadMedidaDimensiones(): OpcionDropdown[] {
  const { t } = useTranslation()
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    let mounted = true

    getOpcionesUnidadMedidaDimensiones()
      .then(data => {
        if (mounted) {
          setOpciones(data)
        }
      })
      .catch(error => {
        console.error('Error cargando opciones de unidad de medida:', error)
        if (mounted) {
          setOpciones([])
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return mapOpciones(opciones, t)
}

export function useOpcionesOrientacion(): OpcionDropdown[] {
  const { t } = useTranslation()
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    let mounted = true

    getOpcionesOrientacion()
      .then(data => {
        if (mounted) {
          setOpciones(data)
        }
      })
      .catch(error => {
        console.error('Error cargando opciones de orientacion:', error)
        if (mounted) {
          setOpciones([])
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return mapOpciones(opciones, t)
}

export function useOpcionesCualAplicaEmpaque(): OpcionDropdown[] {
  const { t } = useTranslation()
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    let mounted = true

    getOpcionesCualAplicaEmpaque()
      .then(data => {
        if (mounted) {
          setOpciones(data)
        }
      })
      .catch(error => {
        console.error('Error cargando opciones de empaque:', error)
        if (mounted) {
          setOpciones([])
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return mapOpciones(opciones, t)
}
