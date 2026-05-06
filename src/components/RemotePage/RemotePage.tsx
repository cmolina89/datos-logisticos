import React from 'react'
import DatosLogisticosEmpaquePage from '@/features/datosLogisticosEmpaqueFeature/pages/DatosLogisticosEmpaquePage'

export interface RemotePageProps {
  title?: string
}

type BoundaryState = { hasError: boolean }

class RemotePageBoundary extends React.Component<React.PropsWithChildren, BoundaryState> {
  state: BoundaryState = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[remote/RemotePage] Fallback activado por error en render federado:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <iframe
          title="Datos Logisticos y Empaque"
          src="http://localhost:3001/datos-logisticos-empaque"
          style={{ width: '100%', minHeight: '100vh', border: '0' }}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Página principal del microfrontend remoto
 * Este componente se renderiza cuando se accede a /remote en el host
 */
export default function RemotePage(_props: RemotePageProps) {
  return (
    <RemotePageBoundary>
      <DatosLogisticosEmpaquePage />
    </RemotePageBoundary>
  )
}
