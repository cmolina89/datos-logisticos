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

function mapOpciones(opciones: OpcionSelect[], t: (key: string) => string): OpcionDropdown[] {
  return opciones.map(o => ({
    label: o.label ?? (o.labelKey ? t(o.labelKey) : o.value),
    value: o.value,
  }))
}

export function useOpcionesEsquemaDistribucion(): OpcionDropdown[] {
  const { t } = useTranslation()
  const supplierId = useAtomValue(supplierIdAtom)
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    if (!supplierId) return

    let mounted = true

    getOpcionesEsquemaDistribucion(supplierId)
      .then((data) => {
        if (mounted) {
          setOpciones(data)
        }
      })
      .catch((error) => {
        console.error('Error cargando opciones de esquema de distribucion:', error)
        if (mounted) {
          setOpciones([])
        }
      })

    return () => {
      mounted = false
    }
  }, [supplierId])

  return mapOpciones(opciones, t)
}

export function useOpcionesUnidadPeso(): OpcionDropdown[] {
  const { t } = useTranslation()
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    let mounted = true

    getOpcionesUnidadPeso()
      .then((data) => {
        if (mounted) {
          setOpciones(data)
        }
      })
      .catch((error) => {
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
      .then((data) => {
        if (mounted) {
          setOpciones(data)
        }
      })
      .catch((error) => {
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
      .then((data) => {
        if (mounted) {
          setOpciones(data)
        }
      })
      .catch((error) => {
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
      .then((data) => {
        if (mounted) {
          setOpciones(data)
        }
      })
      .catch((error) => {
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
