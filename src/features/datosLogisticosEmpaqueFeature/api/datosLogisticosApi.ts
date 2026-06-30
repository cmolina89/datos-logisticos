/**
 * API de Datos Logísticos
 *
 * Punto de entrada para datos de la tabla CEDIS.
 * Delega en:
 *   - supplierContractsApi  → filas CEDIS en base al esquema logístico seleccionado
 *   - productDraftsApi      → datos guardados (read) y guardado parcial (write)
 */

import type { FilaCedis } from '../types'
import { getFilasCedisBySchema } from './supplierContractsApi'

/**
 * Obtiene las filas CEDIS para el esquema logístico seleccionado.
 *
 * Llama a PS_SAP_PSUM_SUPPLIERCONTRACTS:
 *   GET /api/v2/suppliers/{supplierId}/logistics-agreements?schemaId={schemaId}
 *
 * @param supplierId    UUID del proveedor (viene del contexto del host)
 * @param schemaId      UUID del esquema seleccionado en el dropdown
 */
export async function getFilasCedis(
  supplierId: string,
  schemaId: string,
): Promise<FilaCedis[]> {
  return getFilasCedisBySchema(supplierId, schemaId)
}
