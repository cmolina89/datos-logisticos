# API Datos Logísticos

Origen de datos para la tabla CEDIS y para las opciones de los selects (dropdowns) del flujo "Datos logísticos y empaque".

## Opciones de selects (dropdowns)

Las opciones de todos los selects provienen de **mock JSON** en `mocks/` y se consumen vía `opcionesSelectService.ts` y el hook `useOpcionesSelect`.

| Archivo JSON | Uso |
|--------------|-----|
| `opcionesEsquemaDistribucion.json` | Tipo de esquema de distribución |
| `opcionesUnidadPeso.json` | Unidad de peso (KG, LB, G) |
| `opcionesUnidadMedidaDimensiones.json` | Unidad de medida (cm, m, in) |
| `opcionesOrientacion.json` | Orientación del producto |
| `opcionesCualAplicaEmpaque.json` | ¿Cuál aplica? (Cartón master, Bulto, Ninguno) |

Cada opción tiene `value` y `labelKey` (clave i18n). Para cambiar el origen a **REST o base de datos**, editar `opcionesSelectService.ts` y reemplazar el `import` + `Promise.resolve()` por `fetch('/api/opciones/...')` (o el cliente HTTP que use el proyecto). El formato de respuesta puede ser `{ value, labelKey }` o `{ value, label }`.

## Integración con servicio REST real (tabla CEDIS)

Para conectar con el backend real, modificar `datosLogisticosApi.ts`:

```ts
// Reemplazar getFilasCedis() por:
export async function getFilasCedis(): Promise<FilaCedis[]> {
  const response = await fetch('/api/datos-logisticos/cedis')
  if (!response.ok) throw new Error('Error al cargar CEDIS')
  return response.json()
}
```

O con axios:

```ts
import axios from 'axios'

export async function getFilasCedis(): Promise<FilaCedis[]> {
  const { data } = await axios.get<FilaCedis[]>('/api/datos-logisticos/cedis')
  return data
}
```

El formato esperado del JSON es un array de objetos `FilaCedis`.
