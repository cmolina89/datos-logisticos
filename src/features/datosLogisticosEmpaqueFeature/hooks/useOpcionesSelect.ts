/**
 * Hook que carga opciones de selects desde el servicio (mock JSON o REST)
 * y resuelve las etiquetas con i18n (t).
 */

import { useTranslation } from '@/hooks/useTranslation'
import { useEffect, useState } from 'react'
import type { OpcionSelect } from '../api/opcionesSelectService'
import {
  getOpcionesCualAplicaEmpaque,
  getOpcionesEsquemaDistribucion,
  getOpcionesOrientacion,
  getOpcionesUnidadMedidaDimensiones,
  getOpcionesUnidadPeso,
} from '../api/opcionesSelectService'

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
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    getOpcionesEsquemaDistribucion().then(setOpciones)
  }, [])

  return mapOpciones(opciones, t)
}

export function useOpcionesUnidadPeso(): OpcionDropdown[] {
  const { t } = useTranslation()
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    getOpcionesUnidadPeso().then(setOpciones)
  }, [])

  return mapOpciones(opciones, t)
}

export function useOpcionesUnidadMedidaDimensiones(): OpcionDropdown[] {
  const { t } = useTranslation()
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    getOpcionesUnidadMedidaDimensiones().then(setOpciones)
  }, [])

  return mapOpciones(opciones, t)
}

export function useOpcionesOrientacion(): OpcionDropdown[] {
  const { t } = useTranslation()
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    getOpcionesOrientacion().then(setOpciones)
  }, [])

  return mapOpciones(opciones, t)
}

export function useOpcionesCualAplicaEmpaque(): OpcionDropdown[] {
  const { t } = useTranslation()
  const [opciones, setOpciones] = useState<OpcionSelect[]>([])

  useEffect(() => {
    getOpcionesCualAplicaEmpaque().then(setOpciones)
  }, [])

  return mapOpciones(opciones, t)
}
