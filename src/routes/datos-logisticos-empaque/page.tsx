// src/routes/datos-logisticos-empaque/page.tsx
// Flujo: Datos logísticos y de empaque (4 tarjetas - HUs 038 a 049)

import DatosLogisticosEmpaquePage from '@/features/datosLogisticosEmpaqueFeature/pages/DatosLogisticosEmpaquePage'
import type { MetaData } from '@/types/globals'

export const meta = (): MetaData => ({
  title: 'Datos logísticos y de empaque - Alta SKU',
  description:
    'Captura de datos logísticos, medidas de empaque individual, empaques del producto y entrega y manipulación.',
  keywords: 'Alta SKU, datos logísticos, empaque, medidas, entrega, manipulación, vista proveedor',
})

export default function DatosLogisticosEmpaqueRoute() {
  return <DatosLogisticosEmpaquePage />
}
